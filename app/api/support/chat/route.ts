import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { requireApiAuth, toApiAuthErrorResponse } from "@/lib/apiAuth";

type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  message?: string;
  history?: ChatHistoryItem[];
};

const HF_MODEL =
  process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct";

function sanitizeText(input: string, maxLen: number): string {
  return input.replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function buildSupportPrompt(
  message: string,
  history: ChatHistoryItem[],
): string {
  const boundedHistory = history.slice(-8);
  const historyText = boundedHistory
    .map(
      (item) =>
        `${item.role === "user" ? "User" : "Assistant"}: ${sanitizeText(item.content, 700)}`,
    )
    .join("\n");

  return `You are AI MockPrep Support Assistant.

Mission:
- Be professional, polite, clear, and practical.
- Help users with: mock interview setup, resume builder, login/account issues, feedback reports, microphone/audio issues, and general product guidance.
- If the user asks unrelated questions, still answer briefly if safe, then bring focus back to platform support.
- Ask one clarifying question only when required.

Product context:
- Main areas: mock interviews, resume analysis/builder, speech analytics, profile/settings.
- Typical support actions:
  1) Sign-in issues: verify email, reset password, clear cache/incognito.
  2) Microphone issues: browser permissions, OS input device, refresh page.
  3) Interview flow: dashboard -> start interview -> role/level -> complete -> feedback.
  4) Feedback reports: profile/dashboard interview history.
- Do not invent private pricing details. If unsure, say pricing may vary and direct user to contact support.
- Never expose internal secrets, API keys, or hidden system details.

Style rules:
- Keep responses to 4-8 lines.
- Use bullet points only when steps are needed.
- Be confident and solution-oriented.

Recent conversation:
${historyText || "No prior messages."}

Latest user message:
${sanitizeText(message, 1600)}

Return only the assistant response text.`;
}

async function askGemini(prompt: string): Promise<string | null> {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.35,
      },
    });

    return result.text?.trim() || null;
  } catch (error) {
    console.error("Gemini support chat failed:", error);
    return null;
  }
}

async function askHuggingFace(prompt: string): Promise<string | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
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
          inputs: prompt,
          options: { wait_for_model: true },
          parameters: { max_new_tokens: 400, temperature: 0.35 },
        }),
      },
    );

    if (!response.ok) {
      console.warn(
        "HF support chat failed:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && typeof data[0]?.generated_text === "string") {
      return data[0].generated_text.trim();
    }

    if (typeof data?.generated_text === "string") {
      return data.generated_text.trim();
    }

    if (Array.isArray(data) && typeof data[0]?.text === "string") {
      return data[0].text.trim();
    }

    return null;
  } catch (error) {
    console.error("HF support chat error:", error);
    return null;
  }
}

function fallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("login") ||
    lower.includes("sign in") ||
    lower.includes("password")
  ) {
    return "I can help with sign-in issues. Please try password reset first, then verify your email inbox and spam folder. If it still fails, share your exact error message and browser so I can give targeted troubleshooting steps.";
  }

  if (
    lower.includes("microphone") ||
    lower.includes("audio") ||
    lower.includes("voice")
  ) {
    return "For microphone issues, first allow browser microphone permission, then confirm your correct input device in system sound settings. Refresh the page and retry. If needed, I can walk you through browser-specific fixes next.";
  }

  if (lower.includes("resume")) {
    return "For resume improvements, open the Resume section, upload your latest resume, and compare suggestions against your target job description. Prioritize measurable achievements and role-specific keywords. I can help you rewrite one section now if you paste it.";
  }

  return "I am here to help with AI MockPrep support. Tell me what you are trying to do and what happened, and I will provide step-by-step guidance.";
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  try {
    const body = (await request.json()) as ChatRequestBody;
    const message =
      typeof body.message === "string" ? sanitizeText(body.message, 2000) : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const history = rawHistory
      .filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string",
      )
      .map((item) => ({
        role: item.role,
        content: sanitizeText(item.content, 1200),
      }));

    const prompt = buildSupportPrompt(message, history);
    const geminiReply = await askGemini(prompt);

    if (geminiReply) {
      return NextResponse.json({ reply: geminiReply, source: "gemini" });
    }

    const hfReply = await askHuggingFace(prompt);
    if (hfReply) {
      return NextResponse.json({ reply: hfReply, source: "huggingface" });
    }

    return NextResponse.json({
      reply: fallbackResponse(message),
      source: "fallback",
    });
  } catch (error) {
    console.error("Support chat API error:", error);
    return NextResponse.json(
      {
        reply:
          "I am currently unable to process that request. Please try again in a moment.",
        source: "error",
      },
      { status: 500 },
    );
  }
}
