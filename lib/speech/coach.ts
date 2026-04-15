export interface SpeechCoachResponseInsight {
  question: string;
  answer: string;
  durationSeconds: number;
  confidence: number;
  tone: number;
  clarity: number;
  pacing: number;
  fillerControl: number;
  overall: number;
  fillerCount: number;
  fillerHits: Record<string, number>;
  wpm: number;
}

const SINGLE_FILLERS = ["um", "uh", "basically", "actually", "literally"];
const PHRASE_FILLERS = ["you know", "kind of", "sort of", "i mean"];

const ASSERTIVE_PATTERNS = [
  /\bi (led|built|designed|implemented|owned|delivered|improved|optimized|solved)\b/gi,
  /\b(i am|i'm) confident\b/gi,
  /\bdefinitely\b/gi,
  /\bclearly\b/gi,
];

const HEDGING_PATTERNS = [
  /\bi think\b/gi,
  /\bmaybe\b/gi,
  /\bprobably\b/gi,
  /\bperhaps\b/gi,
  /\bmight\b/gi,
  /\bnot sure\b/gi,
  /\bkind of\b/gi,
  /\bsort of\b/gi,
];

const POSITIVE_TONE_PATTERNS = [
  /\bexcited\b/gi,
  /\benhanced\b/gi,
  /\bimproved\b/gi,
  /\bsuccess\b/gi,
  /\bcollaborat(ed|ion)\b/gi,
  /\bimpact\b/gi,
  /\bresult\b/gi,
];

const NEGATIVE_TONE_PATTERNS = [
  /\bfrustrated\b/gi,
  /\bconfused\b/gi,
  /\bfailed\b/gi,
  /\bpanic\b/gi,
  /\bterrible\b/gi,
  /\bhard\b/gi,
];

const STRUCTURE_CUES = [
  "first",
  "second",
  "then",
  "because",
  "therefore",
  "for example",
  "as a result",
  "in summary",
  "finally",
];

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const countPatternMatches = (text: string, patterns: RegExp[]): number =>
  patterns.reduce((count, pattern) => count + (text.match(pattern)?.length ?? 0), 0);

const countFillerHits = (answer: string): Record<string, number> => {
  const normalized = answer.toLowerCase();
  const hits: Record<string, number> = {};

  for (const filler of SINGLE_FILLERS) {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matchCount = normalized.match(new RegExp(`\\b${escaped}\\b`, "g"))?.length ?? 0;
    if (matchCount > 0) hits[filler] = matchCount;
  }

  for (const phrase of PHRASE_FILLERS) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matchCount = normalized.match(new RegExp(`\\b${escaped}\\b`, "g"))?.length ?? 0;
    if (matchCount > 0) hits[phrase] = matchCount;
  }

  return hits;
};

export const analyzeSpeechCoachResponse = (
  question: string,
  answer: string,
  durationSeconds: number
): SpeechCoachResponseInsight => {
  const trimmed = answer.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const safeDuration = durationSeconds > 0 ? durationSeconds : Math.max(8, Math.round(wordCount / 2.2));
  const wpm = safeDuration > 0 ? Math.round((wordCount / safeDuration) * 60) : 0;

  const fillerHits = countFillerHits(answer);
  const fillerCount = Object.values(fillerHits).reduce((sum, count) => sum + count, 0);
  const fillerPer100Words = wordCount > 0 ? (fillerCount / wordCount) * 100 : 0;

  const assertiveCount = countPatternMatches(answer, ASSERTIVE_PATTERNS);
  const hedgingCount = countPatternMatches(answer, HEDGING_PATTERNS);
  const confidence = clamp(60 + assertiveCount * 10 - hedgingCount * 8);

  const positiveCount = countPatternMatches(answer, POSITIVE_TONE_PATTERNS);
  const negativeCount = countPatternMatches(answer, NEGATIVE_TONE_PATTERNS);
  const tone = clamp(60 + positiveCount * 8 - negativeCount * 10);

  const sentenceCount = Math.max(1, trimmed.split(/[.!?]+/).filter((part) => part.trim().length > 0).length);
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  const structureCueCount = STRUCTURE_CUES.reduce((count, cue) => {
    const escaped = cue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return count + (answer.toLowerCase().match(new RegExp(`\\b${escaped}\\b`, "g"))?.length ?? 0);
  }, 0);

  const sentenceLengthScore = clamp(100 - Math.abs(avgSentenceLength - 17) * 4);
  const structureScore = clamp(45 + structureCueCount * 10);
  const clarity = clamp(sentenceLengthScore * 0.55 + structureScore * 0.45);

  const pacing = clamp(100 - Math.abs(wpm - 145) * 1.1);
  const fillerControl = clamp(100 - fillerPer100Words * 9);

  const overall = clamp(
    confidence * 0.24 +
      tone * 0.16 +
      clarity * 0.24 +
      pacing * 0.2 +
      fillerControl * 0.16
  );

  return {
    question,
    answer,
    durationSeconds: safeDuration,
    confidence,
    tone,
    clarity,
    pacing,
    fillerControl,
    overall,
    fillerCount,
    fillerHits,
    wpm,
  };
};

export const summarizeSpeechCoachResponses = (
  analyses: SpeechCoachResponseInsight[]
): InterviewSpeechCoachSummary => {
  if (analyses.length === 0) {
    return {
      analyzedResponses: 0,
      confidence: 0,
      tone: 0,
      clarity: 0,
      pacing: 0,
      fillerControl: 0,
      overall: 0,
      totalFillerWords: 0,
      topFillerWords: [],
      averageWpm: 0,
      insights: ["No voice responses were analyzed in this session."],
      recommendations: ["Use voice recording on at least one answer to unlock Speech Coach insights."],
    };
  }

  const average = (selector: (item: SpeechCoachResponseInsight) => number) =>
    Math.round(analyses.reduce((sum, item) => sum + selector(item), 0) / analyses.length);

  const fillerMap: Record<string, number> = {};
  for (const analysis of analyses) {
    for (const [word, count] of Object.entries(analysis.fillerHits)) {
      fillerMap[word] = (fillerMap[word] ?? 0) + count;
    }
  }

  const topFillerWords = Object.entries(fillerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  const summary: InterviewSpeechCoachSummary = {
    analyzedResponses: analyses.length,
    confidence: average((item) => item.confidence),
    tone: average((item) => item.tone),
    clarity: average((item) => item.clarity),
    pacing: average((item) => item.pacing),
    fillerControl: average((item) => item.fillerControl),
    overall: average((item) => item.overall),
    totalFillerWords: analyses.reduce((sum, item) => sum + item.fillerCount, 0),
    topFillerWords,
    averageWpm: average((item) => item.wpm),
    insights: [],
    recommendations: [],
  };

  const insights: string[] = [];
  if (summary.confidence >= 75) insights.push("Strong confidence language in your spoken responses.");
  if (summary.clarity >= 75) insights.push("Clear structure and flow across your answers.");
  if (summary.pacing >= 75) insights.push("Consistent pacing helped your answers sound controlled and easy to follow.");
  if (summary.fillerControl >= 75) insights.push("Low filler-word frequency improved delivery quality.");
  if (insights.length === 0) insights.push("Your delivery showed potential, with a few communication habits still affecting interview impact.");

  const recommendations: string[] = [];
  if (summary.confidence < 70) recommendations.push("Use ownership statements like 'I designed' or 'I implemented' to sound more decisive.");
  if (summary.clarity < 70) recommendations.push("Answer using a simple structure: context, action, and measurable result.");
  if (summary.pacing < 70) recommendations.push("Aim for a steadier pace around 120-170 words per minute with short intentional pauses.");
  if (summary.fillerControl < 70) recommendations.push("Replace filler words with a brief pause to keep delivery crisp.");
  if (summary.tone < 70) recommendations.push("Keep tone professional and outcome-focused by highlighting collaboration and impact.");
  if (recommendations.length === 0) recommendations.push("Keep practicing with timed voice answers to maintain this communication quality under pressure.");

  summary.insights = insights.slice(0, 4);
  summary.recommendations = recommendations.slice(0, 4);

  return summary;
};
