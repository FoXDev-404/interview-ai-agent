import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireApiAuth, toApiAuthErrorResponse } from "@/lib/apiAuth";
import { z } from "zod";
import {
  enforceComputePayloadLimit,
  enforceComputeRateLimit,
  getComputePolicy,
  isOperationTimeoutError,
  withOperationTimeout,
  type ComputeRouteId,
} from "@/lib/security/computeProtection";

const HF_MODEL =
  process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct";

const ROUTE_ID: ComputeRouteId = "resume.analyze";

const GEMINI_MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-3-flash-preview",
];

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "into",
  "onto",
  "over",
  "under",
  "very",
  "also",
  "their",
  "them",
  "our",
  "out",
  "all",
  "any",
  "its",
  "not",
  "but",
  "can",
  "will",
  "about",
  "after",
  "before",
  "while",
  "when",
  "where",
  "who",
  "why",
  "how",
  "using",
  "used",
  "use",
  "job",
  "role",
  "resume",
  "description",
  "required",
  "preferred",
  "requirements",
  "responsibilities",
  "experience",
  "years",
  "year",
  "work",
  "working",
  "team",
  "across",
  "through",
  "including",
  "ability",
  "strong",
  "excellent",
  "good",
  "other",
  "etc",
]);

const TECH_TERMS = new Set([
  "javascript",
  "typescript",
  "react",
  "next",
  "nextjs",
  "node",
  "nodejs",
  "python",
  "java",
  "sql",
  "nosql",
  "mongodb",
  "postgresql",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "graphql",
  "rest",
  "api",
  "redis",
  "firebase",
  "cicd",
  "devops",
  "microservices",
  "testing",
  "jest",
  "playwright",
  "tailwind",
  "css",
  "html",
  "angular",
  "vue",
  "nlp",
  "ml",
  "ai",
]);

const TOOL_TERMS = new Set([
  "jira",
  "confluence",
  "figma",
  "postman",
  "github",
  "gitlab",
  "bitbucket",
  "notion",
  "slack",
  "webpack",
  "babel",
  "vite",
  "storybook",
  "linux",
  "windows",
  "macos",
  "selenium",
  "cypress",
]);

const SOFT_TERMS = new Set([
  "leadership",
  "communication",
  "collaboration",
  "mentoring",
  "ownership",
  "stakeholder",
  "problem",
  "adaptability",
  "initiative",
  "planning",
  "strategy",
  "teamwork",
  "presentation",
]);

const CERTIFICATION_PATTERNS = [
  /aws certified/i,
  /certified kubernetes/i,
  /pmp/i,
  /scrum master/i,
  /azure certified/i,
  /google cloud certified/i,
];

const BULLET_PREFIX = /^\s*(?:[-*\u2022]|\d+\.)\s+/;

type PlainObject = Record<string, unknown>;

type RewriteSuggestion = {
  original: string;
  improved: string;
  explanation: string;
};

type ResumeAnalysisPayload = {
  keyword_analysis: {
    matched: string[];
    missing: string[];
    partial: string[];
    categorized: {
      technical: string[];
      soft: string[];
      tools: string[];
      certifications: string[];
    };
    keyword_score: number;
  };
  semantic_analysis: {
    semantic_score: number;
    explanation: string;
  };
  impact_analysis: {
    impact_score: number;
    weak_bullets: string[];
    issues: string[];
  };
  rewrites: RewriteSuggestion[];
  projected_score: number;
  final_score: number;
  skills_alignment: number;
  experience_alignment: number;
  format_compliance: number;
};

type GeminiAttemptResult = {
  analysis: PlainObject | null;
  modelUsed?: string;
  retryAfterSeconds?: number;
  diagnostic?: string;
};

const resumeAnalyzeSchema = z
  .object({
    resumeText: z.string().trim().min(1).max(20000),
    jobDescription: z.string().trim().min(1).max(10000),
  })
  .strict();

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asStringArray(value: unknown, limit = 20): string[] {
  if (!Array.isArray(value)) return [];

  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") continue;
    const text = item.replace(/\s+/g, " ").trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(text);
    if (deduped.length >= limit) break;
  }

  return deduped;
}

function getObject(value: unknown): PlainObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as PlainObject;
}

function extractFirstJson(text: string): PlainObject | null {
  const raw = text.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return getObject(parsed);
  } catch {
    // Fall through.
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      const parsed = JSON.parse(fenced[1].trim());
      return getObject(parsed);
    } catch {
      // Fall through.
    }
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(raw.slice(firstBrace, lastBrace + 1));
      return getObject(parsed);
    } catch {
      return null;
    }
  }

  return null;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function topTerms(text: string, limit: number): string[] {
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, limit)
    .map(([token]) => token);
}

function hasPartialMatch(jdTerm: string, resumeTerms: string[]): boolean {
  if (jdTerm.length < 5) return false;
  const jdStem = jdTerm.slice(0, 5);

  return resumeTerms.some((resumeTerm) => {
    if (resumeTerm.length < 5) return false;
    const resumeStem = resumeTerm.slice(0, 5);
    return (
      jdStem === resumeStem ||
      jdTerm.includes(resumeStem) ||
      resumeTerm.includes(jdStem)
    );
  });
}

function toDisplayKeyword(token: string): string {
  const map: Record<string, string> = {
    ai: "AI",
    api: "API",
    aws: "AWS",
    gcp: "GCP",
    ml: "ML",
    nlp: "NLP",
    sql: "SQL",
    css: "CSS",
    html: "HTML",
    cicd: "CI/CD",
    nodejs: "Node.js",
    nextjs: "Next.js",
    javascript: "JavaScript",
    typescript: "TypeScript",
    postgresql: "PostgreSQL",
    mongodb: "MongoDB",
    firebase: "Firebase",
  };

  if (map[token]) return map[token];
  if (token.length <= 3) return token.toUpperCase();
  return token.charAt(0).toUpperCase() + token.slice(1);
}

function uniqueDisplayKeywords(tokens: string[], limit = 20): string[] {
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const keyword = toDisplayKeyword(token);
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(keyword);
    if (deduped.length >= limit) break;
  }

  return deduped;
}

function categorizeTerms(tokens: string[]) {
  const categorized = {
    technical: [] as string[],
    soft: [] as string[],
    tools: [] as string[],
    certifications: [] as string[],
  };

  for (const token of tokens) {
    const keyword = toDisplayKeyword(token);
    const lower = token.toLowerCase();

    if (CERTIFICATION_PATTERNS.some((pattern) => pattern.test(keyword))) {
      categorized.certifications.push(keyword);
      continue;
    }

    if (SOFT_TERMS.has(lower)) {
      categorized.soft.push(keyword);
      continue;
    }

    if (TOOL_TERMS.has(lower)) {
      categorized.tools.push(keyword);
      continue;
    }

    if (
      TECH_TERMS.has(lower) ||
      /(cloud|frontend|backend|fullstack|database|analytics|security)/.test(
        lower,
      )
    ) {
      categorized.technical.push(keyword);
      continue;
    }

    if (categorized.technical.length <= categorized.tools.length) {
      categorized.technical.push(keyword);
    } else {
      categorized.tools.push(keyword);
    }
  }

  return {
    technical: asStringArray(categorized.technical, 14),
    soft: asStringArray(categorized.soft, 10),
    tools: asStringArray(categorized.tools, 12),
    certifications: asStringArray(categorized.certifications, 8),
  };
}

function extractResumeBullets(resumeText: string): string[] {
  return resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => BULLET_PREFIX.test(line) || line.length > 55)
    .map((line) => line.replace(BULLET_PREFIX, "").replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 24)
    .slice(0, 20);
}

function hasImpactMetric(text: string): boolean {
  return /\d/.test(text) || /[%$]|\b(k|m|b)\b/i.test(text);
}

function hasWeakVerb(text: string): boolean {
  return /\b(worked on|helped with|responsible for|assisted with|participated in)\b/i.test(
    text,
  );
}

function rewriteBullet(original: string): RewriteSuggestion {
  const compact = original.replace(/\s+/g, " ").trim();
  const normalized = compact.replace(/[.]+$/, "");
  const truncated =
    normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;

  if (hasImpactMetric(compact)) {
    return {
      original: compact,
      improved: `${truncated}, with clear ownership and explicit business impact.`,
      explanation:
        "Clarified scope and ownership so ATS and recruiters can quickly identify value.",
    };
  }

  if (hasWeakVerb(compact)) {
    return {
      original: compact,
      improved: `${truncated.replace(/\b(worked on|helped with|responsible for|assisted with|participated in)\b/i, "Led")}, resulting in a 20% improvement in delivery efficiency.`,
      explanation: "Replaced weak phrasing and added measurable impact.",
    };
  }

  return {
    original: compact,
    improved: `${truncated}, resulting in a 20% improvement in process quality and cross-team execution speed.`,
    explanation:
      "Added a concrete outcome metric to strengthen impact language.",
  };
}

function computeFinalScore(data: ResumeAnalysisPayload): number {
  return clampScore(
    data.keyword_analysis.keyword_score * 0.3 +
      data.semantic_analysis.semantic_score * 0.25 +
      data.impact_analysis.impact_score * 0.15 +
      data.skills_alignment * 0.1 +
      data.experience_alignment * 0.1 +
      data.format_compliance * 0.1,
  );
}

function buildHeuristicAnalysis(
  resumeText: string,
  jobDescription: string,
): ResumeAnalysisPayload {
  const resumeTerms = topTerms(resumeText, 80);
  const jdTerms = topTerms(jobDescription, 40);
  const resumeSet = new Set(resumeTerms);

  const matched = jdTerms.filter((term) => resumeSet.has(term)).slice(0, 18);
  const partial = jdTerms
    .filter(
      (term) => !resumeSet.has(term) && hasPartialMatch(term, resumeTerms),
    )
    .slice(0, 12);
  const partialSet = new Set(partial);
  const missing = jdTerms
    .filter((term) => !resumeSet.has(term) && !partialSet.has(term))
    .slice(0, 18);

  const denominator = Math.max(
    1,
    matched.length + partial.length + missing.length,
  );
  const keywordScore = clampScore(
    ((matched.length + partial.length * 0.5) / denominator) * 100,
  );

  const bullets = extractResumeBullets(resumeText);
  const weakBullets = bullets
    .filter((line) => !hasImpactMetric(line) || hasWeakVerb(line))
    .slice(0, 4);

  const issueSet = new Set<string>();
  if (weakBullets.some((line) => !hasImpactMetric(line)))
    issueSet.add("No Metrics");
  if (weakBullets.some((line) => hasWeakVerb(line))) issueSet.add("Weak Verb");
  if (bullets.length < 4) issueSet.add("Sparse Experience Detail");

  const impactRatio =
    bullets.length === 0
      ? 0.45
      : (bullets.length - weakBullets.length) / bullets.length;
  const impactScore = clampScore(45 + impactRatio * 50);

  const sectionMatches = [
    "experience",
    "skills",
    "education",
    "projects",
    "summary",
    "certification",
  ]
    .map((section) => new RegExp(`\\b${section}\\b`, "i"))
    .filter((pattern) => pattern.test(resumeText)).length;

  const formatCompliance = clampScore(
    45 + sectionMatches * 8 + Math.min(16, bullets.length * 2),
  );

  const yearsMatches = Array.from(
    resumeText.matchAll(/(\d{1,2})\+?\s+years?/gi),
  );
  const years = yearsMatches.length
    ? Math.max(...yearsMatches.map((match) => Number(match[1]).valueOf()))
    : 0;

  const leadershipSignal =
    /\b(lead|mentor|architect|ownership|managed)\b/i.test(resumeText) ? 6 : 0;
  const experienceAlignment = clampScore(
    55 + Math.min(24, years * 4) + leadershipSignal,
  );
  const skillsAlignment = clampScore(
    keywordScore * 0.9 + (matched.length >= 8 ? 8 : 0),
  );
  const semanticScore = clampScore(
    keywordScore * 0.75 + skillsAlignment * 0.25,
  );

  const categorized = categorizeTerms([...matched, ...partial, ...missing]);

  const rewrites = weakBullets.length > 0 ? weakBullets.map(rewriteBullet) : [];

  const baseResult: ResumeAnalysisPayload = {
    keyword_analysis: {
      matched: uniqueDisplayKeywords(matched, 18),
      missing: uniqueDisplayKeywords(missing, 18),
      partial: uniqueDisplayKeywords(partial, 12),
      categorized,
      keyword_score: keywordScore,
    },
    semantic_analysis: {
      semantic_score: semanticScore,
      explanation:
        keywordScore >= 75
          ? "The resume aligns well with the role intent and required competencies. Focus on sharpening impact statements for maximum score lift."
          : keywordScore >= 50
            ? "The resume shows moderate alignment. Prioritize role-specific terminology and measurable outcomes to close key gaps."
            : "Core role alignment is currently limited. Add missing role keywords and quantifiable achievements in recent experience bullets.",
    },
    impact_analysis: {
      impact_score: impactScore,
      weak_bullets: weakBullets,
      issues: [...issueSet],
    },
    rewrites,
    projected_score: 0,
    final_score: 0,
    skills_alignment: skillsAlignment,
    experience_alignment: experienceAlignment,
    format_compliance: formatCompliance,
  };

  const finalScore = computeFinalScore(baseResult);
  const projectedLift = Math.max(
    5,
    Math.round((missing.length + partial.length) * 0.45),
  );
  baseResult.final_score = finalScore;
  baseResult.projected_score = clampScore(
    Math.max(finalScore + projectedLift, finalScore + 4),
  );

  return baseResult;
}

function normalizeAnalysis(
  analysis: unknown,
  resumeText: string,
  jobDescription: string,
): ResumeAnalysisPayload {
  const fallback = buildHeuristicAnalysis(resumeText, jobDescription);
  const root = getObject(analysis);
  if (!root) return fallback;

  const keywordRoot = getObject(root.keyword_analysis);
  const semanticRoot = getObject(root.semantic_analysis);
  const impactRoot = getObject(root.impact_analysis);
  const categorizedRoot = getObject(keywordRoot?.categorized);

  const matched = asStringArray(keywordRoot?.matched, 20);
  const missing = asStringArray(keywordRoot?.missing, 20);
  const partial = asStringArray(keywordRoot?.partial, 14);

  const technical = asStringArray(categorizedRoot?.technical, 14);
  const soft = asStringArray(categorizedRoot?.soft, 10);
  const tools = asStringArray(categorizedRoot?.tools, 12);
  const certifications = asStringArray(categorizedRoot?.certifications, 8);

  const fallbackCategoryFromKeywords = categorizeTerms(
    [...matched, ...partial, ...missing]
      .map((item) => item.toLowerCase())
      .filter(Boolean),
  );

  const safeDerivedCategories = {
    technical:
      fallbackCategoryFromKeywords.technical.length > 0
        ? fallbackCategoryFromKeywords.technical
        : fallback.keyword_analysis.categorized.technical,
    soft:
      fallbackCategoryFromKeywords.soft.length > 0
        ? fallbackCategoryFromKeywords.soft
        : fallback.keyword_analysis.categorized.soft,
    tools:
      fallbackCategoryFromKeywords.tools.length > 0
        ? fallbackCategoryFromKeywords.tools
        : fallback.keyword_analysis.categorized.tools,
    certifications:
      fallbackCategoryFromKeywords.certifications.length > 0
        ? fallbackCategoryFromKeywords.certifications
        : fallback.keyword_analysis.categorized.certifications,
  };

  const rewrites: RewriteSuggestion[] = Array.isArray(root.rewrites)
    ? root.rewrites
        .map((item) => {
          const rewriteItem = getObject(item);
          if (!rewriteItem) return null;
          const original =
            typeof rewriteItem.original === "string"
              ? rewriteItem.original.trim()
              : "";
          const improved =
            typeof rewriteItem.improved === "string"
              ? rewriteItem.improved.trim()
              : "";
          const explanation =
            typeof rewriteItem.explanation === "string"
              ? rewriteItem.explanation.trim()
              : "";
          if (!original || !improved || !explanation) return null;
          return { original, improved, explanation };
        })
        .filter((item): item is RewriteSuggestion => Boolean(item))
        .slice(0, 4)
    : [];

  const data: ResumeAnalysisPayload = {
    keyword_analysis: {
      matched: matched.length > 0 ? matched : fallback.keyword_analysis.matched,
      missing: missing.length > 0 ? missing : fallback.keyword_analysis.missing,
      partial: partial.length > 0 ? partial : fallback.keyword_analysis.partial,
      categorized: {
        technical:
          technical.length > 0 ? technical : safeDerivedCategories.technical,
        soft: soft.length > 0 ? soft : safeDerivedCategories.soft,
        tools: tools.length > 0 ? tools : safeDerivedCategories.tools,
        certifications:
          certifications.length > 0
            ? certifications
            : safeDerivedCategories.certifications,
      },
      keyword_score: clampScore(
        toNumber(
          keywordRoot?.keyword_score,
          fallback.keyword_analysis.keyword_score,
        ),
      ),
    },
    semantic_analysis: {
      semantic_score: clampScore(
        toNumber(
          semanticRoot?.semantic_score,
          fallback.semantic_analysis.semantic_score,
        ),
      ),
      explanation:
        typeof semanticRoot?.explanation === "string" &&
        semanticRoot.explanation.trim()
          ? semanticRoot.explanation.trim()
          : fallback.semantic_analysis.explanation,
    },
    impact_analysis: {
      impact_score: clampScore(
        toNumber(
          impactRoot?.impact_score,
          fallback.impact_analysis.impact_score,
        ),
      ),
      weak_bullets: Array.isArray(impactRoot?.weak_bullets)
        ? asStringArray(impactRoot.weak_bullets, 6)
        : fallback.impact_analysis.weak_bullets,
      issues: Array.isArray(impactRoot?.issues)
        ? asStringArray(impactRoot.issues, 6)
        : fallback.impact_analysis.issues,
    },
    rewrites: rewrites.length > 0 ? rewrites : fallback.rewrites,
    projected_score: clampScore(
      toNumber(root.projected_score, fallback.projected_score),
    ),
    final_score: 0,
    skills_alignment: clampScore(
      toNumber(root.skills_alignment, fallback.skills_alignment),
    ),
    experience_alignment: clampScore(
      toNumber(root.experience_alignment, fallback.experience_alignment),
    ),
    format_compliance: clampScore(
      toNumber(root.format_compliance, fallback.format_compliance),
    ),
  };

  data.final_score = computeFinalScore(data);
  if (data.projected_score < data.final_score) {
    data.projected_score = clampScore(data.final_score + 4);
  }

  return data;
}

function parseProviderError(error: unknown): {
  status?: number;
  isQuotaExceeded: boolean;
  retryAfterSeconds?: number;
} {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const directStatus =
    typeof (error as { status?: unknown })?.status === "number"
      ? Number((error as { status?: unknown }).status)
      : undefined;

  const statusFromCode = Number(
    message.match(/"code"\s*:\s*(\d{3})/)?.[1] || "",
  );
  const statusFromText = Number(
    message.match(/\bstatus\s*[:=]\s*(\d{3})/i)?.[1] || "",
  );

  const status =
    directStatus ||
    (Number.isFinite(statusFromCode) ? statusFromCode : undefined) ||
    (Number.isFinite(statusFromText) ? statusFromText : undefined);

  const retryToken =
    message.match(/retry in\s*([\d.]+)s/i)?.[1] ||
    message.match(/"retryDelay":"(\d+)s"/i)?.[1];
  const retryAfterSeconds = retryToken
    ? Math.max(1, Math.ceil(Number(retryToken)))
    : undefined;

  return {
    status,
    isQuotaExceeded:
      status === 429 || /quota|resource_exhausted/i.test(message),
    retryAfterSeconds,
  };
}

function getGeminiApiKeys(): string[] {
  const combined =
    process.env.GEMINI_API_KEYS || process.env.GOOGLE_GEMINI_API_KEYS || "";

  const list = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10,
    ...combined
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  ]
    .map((entry) => (entry || "").trim())
    .filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const key of list) {
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(key);
  }

  return unique;
}

function getGeminiModels(): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const model of GEMINI_MODEL_CANDIDATES) {
    const normalized = (model || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

async function askGeminiForAnalysis(
  prompt: string,
  systemInstruction: string,
): Promise<GeminiAttemptResult> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    return { analysis: null, diagnostic: "no-gemini-keys" };
  }

  const models = getGeminiModels();
  let retryAfterSeconds: number | undefined;
  let sawQuotaError = false;
  let sawAuthError = false;

  for (const key of keys) {
    const ai = new GoogleGenAI({ apiKey: key });

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const parsed = extractFirstJson(response.text || "");
        if (parsed) {
          return { analysis: parsed, modelUsed: model, retryAfterSeconds };
        }
      } catch (error) {
        const providerError = parseProviderError(error);
        if (providerError.retryAfterSeconds) {
          retryAfterSeconds = Math.max(
            retryAfterSeconds || 0,
            providerError.retryAfterSeconds,
          );
        }

        const status = providerError.status;
        if (providerError.isQuotaExceeded) {
          sawQuotaError = true;
        }
        if (status === 401 || status === 403) {
          sawAuthError = true;
        }

        const shouldTryNextKey =
          providerError.isQuotaExceeded ||
          status === 401 ||
          status === 403 ||
          status === 429;

        const canTryNextModel = status === 400 || status === 404;

        if (canTryNextModel) {
          continue;
        }

        if (shouldTryNextKey) {
          break;
        }

        console.error("Gemini resume analysis model attempt failed", {
          model,
          status: providerError.status,
        });
      }
    }
  }

  let diagnostic = "gemini-unavailable";
  if (sawQuotaError) {
    diagnostic = "gemini-quota-exhausted";
  } else if (sawAuthError) {
    diagnostic = "gemini-auth-failed";
  }

  return { analysis: null, retryAfterSeconds, diagnostic };
}

async function askHuggingFaceForAnalysis(
  prompt: string,
): Promise<PlainObject | null> {
  const apiKey =
    process.env.HUGGINGFACE_API_KEY ||
    process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `${prompt}\n\nReturn only valid JSON.`,
          options: { wait_for_model: true },
          parameters: { max_new_tokens: 1100, temperature: 0.2 },
        }),
      },
    );

    if (!response.ok) {
      console.warn(
        "Hugging Face resume analysis failed:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const payload = (await response.json()) as unknown;
    let text = "";

    if (Array.isArray(payload)) {
      const first = payload[0] as PlainObject | undefined;
      if (first && typeof first.generated_text === "string") {
        text = first.generated_text;
      } else if (first && typeof first.text === "string") {
        text = first.text;
      }
    } else {
      const obj = getObject(payload);
      if (obj && typeof obj.generated_text === "string") {
        text = obj.generated_text;
      }
    }

    if (!text) return null;
    return extractFirstJson(text);
  } catch (error) {
    console.error("Hugging Face resume analysis error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const payloadLimitResponse = enforceComputePayloadLimit(request, ROUTE_ID);
  if (payloadLimitResponse) {
    return payloadLimitResponse;
  }

  const policy = getComputePolicy(ROUTE_ID);

  let authContext: Awaited<ReturnType<typeof requireApiAuth>>;
  try {
    authContext = await requireApiAuth({ request, routeId: ROUTE_ID });
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  const rateLimitResponse = await enforceComputeRateLimit(
    request,
    ROUTE_ID,
    authContext.uid,
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await request.json();
    const parsedBody = resumeAnalyzeSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const { resumeText, jobDescription } = parsedBody.data;

    // 3. Prompt Engineering
    const systemInstruction = `
      You are an expert ATS (Applicant Tracking System) simulator and elite resume coach.
      Analyze the provided Resume against the Job Description.
      Be critical but constructive.
      Return purely JSON data. No markdown formatting.
    `;

    const prompt = `
      RESUME:
      ${resumeText.slice(0, 15000)}

      JOB DESCRIPTION:
      ${jobDescription.slice(0, 5000)}

      Analyze the resume against the job description and return a JSON object with this exact schema:
      {
        "keyword_analysis": {
          "matched": ["string"],
          "missing": ["string"],
          "partial": ["string"],
          "categorized": {
            "technical": ["string"],
            "soft": ["string"],
            "tools": ["string"],
            "certifications": ["string"]
          },
          "keyword_score": number (0-100)
        },
        "semantic_analysis": {
          "semantic_score": number (0-100),
          "explanation": "string (max 2 sentences summary)"
        },
        "impact_analysis": {
          "impact_score": number (0-100),
          "weak_bullets": ["string (exact bullet text from resume)"],
          "issues": ["string (e.g., 'No Metrics', 'Passive Voice')"]
        },
        "rewrites": [
          {
            "original": "string",
            "improved": "string",
            "explanation": "string"
          }
        ],
        "projected_score": number (expected score after fixes),
        "skills_alignment": number (0-100),
        "experience_alignment": number (0-100),
        "format_compliance": number (0-100)
      }
    `;

    // 4. Try Gemini first.
    let rawAnalysis: unknown = null;
    let source: "gemini" | "huggingface" | "heuristic" = "heuristic";
    let retryAfterSeconds: number | undefined;
    let modelUsed: string | undefined;

    let geminiResult: GeminiAttemptResult = { analysis: null };
    try {
      geminiResult = await withOperationTimeout(
        () => askGeminiForAnalysis(prompt, systemInstruction),
        policy.timeoutMs,
        `${ROUTE_ID}.gemini`,
      );
    } catch (error) {
      if (isOperationTimeoutError(error)) {
        console.warn("resume_analysis_provider_timeout", {
          provider: "gemini",
          timeoutMs: policy.timeoutMs,
        });
      } else {
        console.error("resume_analysis_provider_failure", {
          provider: "gemini",
        });
      }
    }

    if (geminiResult.analysis) {
      rawAnalysis = geminiResult.analysis;
      source = "gemini";
      retryAfterSeconds = geminiResult.retryAfterSeconds;
      modelUsed = geminiResult.modelUsed;
      if (geminiResult.modelUsed) {
        console.info("Resume analysis used Gemini model", {
          model: geminiResult.modelUsed,
        });
      }
    } else {
      retryAfterSeconds = geminiResult.retryAfterSeconds;
    }

    // 5. Try Hugging Face if Gemini is unavailable or exhausted.
    if (!rawAnalysis) {
      let hfAnalysis: PlainObject | null = null;
      try {
        hfAnalysis = await withOperationTimeout(
          () => askHuggingFaceForAnalysis(prompt),
          policy.timeoutMs,
          `${ROUTE_ID}.huggingface`,
        );
      } catch (error) {
        if (isOperationTimeoutError(error)) {
          console.warn("resume_analysis_provider_timeout", {
            provider: "huggingface",
            timeoutMs: policy.timeoutMs,
          });
        } else {
          console.error("resume_analysis_provider_failure", {
            provider: "huggingface",
          });
        }
      }

      if (hfAnalysis) {
        rawAnalysis = hfAnalysis;
        source = "huggingface";
        modelUsed = HF_MODEL;
      }
    }

    // 6. Final deterministic fallback to keep UX working.
    if (!rawAnalysis) {
      rawAnalysis = buildHeuristicAnalysis(resumeText, jobDescription);
      source = "heuristic";
    }

    const requireRealAi = process.env.REQUIRE_RESUME_AI === "true";
    if (requireRealAi && source === "heuristic") {
      return NextResponse.json(
        {
          error: "Resume analysis service is temporarily unavailable",
        },
        { status: 503 },
      );
    }

    // 7. Normalize shape for safe UI rendering.
    const data = normalizeAnalysis(rawAnalysis, resumeText, jobDescription);
    const payloadBase = {
      ...data,
      source,
      ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
      ...(modelUsed ? { modelUsed } : {}),
    };

    const payload = payloadBase;

    return NextResponse.json(payload);
  } catch (error: unknown) {
    console.error("Resume analysis API error:", error);
    return NextResponse.json(
      {
        error:
          "Unable to analyze the resume at the moment. Please verify your inputs and try again.",
      },
      { status: 500 },
    );
  }
}
