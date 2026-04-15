import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import { generateCoachingFeedback } from "@/lib/speech/coachingFeedback";
import { requireApiAuth, toApiAuthErrorResponse } from "@/lib/apiAuth";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

// ---------------------------------------------------------------------------
// Filler word configuration (separated for precise detection)
// ---------------------------------------------------------------------------

/** Single-word fillers that are always fillers regardless of context. */
const SINGLE_FILLERS = ["um", "uh", "basically", "actually"];

/** Words that are fillers only in certain contexts (require heuristic check). */
const CONTEXT_FILLERS = ["like"];

/** Multi-word filler phrases (checked first, constituent words are consumed). */
const MULTI_FILLERS = ["you know", "sort of", "kind of", "i mean"];

/**
 * Words that, when appearing immediately before "like", indicate "like" is used
 * as a verb (e.g., "I like coding") rather than a filler.
 */
const LIKE_VERB_PREDECESSORS = new Set([
  // Subject pronouns
  "i",
  "we",
  "they",
  "you",
  "he",
  "she",
  "it",
  // Modal / auxiliary verbs
  "would",
  "wouldn't",
  "do",
  "don't",
  "did",
  "didn't",
  "will",
  "won't",
  "could",
  "couldn't",
  "should",
  "may",
  "might",
  "must",
  "have",
  "has",
  "can",
  "can't",
  "doesn't",
  // Common subjects
  "people",
  "kids",
  "everyone",
  "somebody",
  "nobody",
  // Adverbs that modify "like" as a verb
  "really",
  "also",
  "always",
  "never",
]);

/** Subject pronouns used for the 2-word lookback heuristic. */
const SUBJECT_PRONOUNS = new Set(["i", "we", "they", "you", "he", "she", "it"]);

/** Adverbs / modifiers that can appear between a subject and "like". */
const ADVERB_MODIFIERS = new Set([
  "really",
  "also",
  "always",
  "never",
  "actually",
  "definitely",
  "certainly",
  "honestly",
  "truly",
  "totally",
  "absolutely",
]);

/** Heuristic: is "like" at this index used as a filler? */
function isLikeAFiller(words: Array<{ text: string }>, index: number): boolean {
  // Sentence-initial "like": check if next word is a pronoun
  // ("Like I said" is valid speech, not a filler)
  if (index === 0) {
    if (index + 1 < words.length) {
      const nextWord = words[index + 1].text
        .toLowerCase()
        .replace(/[.,!?]/g, "");
      if (SUBJECT_PRONOUNS.has(nextWord)) return false;
    }
    return true;
  }

  const prevWord = words[index - 1].text.toLowerCase().replace(/[.,!?]/g, "");

  // 1-word lookback: predecessor is a known verb-indicator
  if (LIKE_VERB_PREDECESSORS.has(prevWord)) return false;

  // 2-word lookback: "I really like", "She always like(s)"
  if (index >= 2) {
    const twoBack = words[index - 2].text.toLowerCase().replace(/[.,!?]/g, "");
    if (SUBJECT_PRONOUNS.has(twoBack) && ADVERB_MODIFIERS.has(prevWord)) {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Pace analysis constants
// ---------------------------------------------------------------------------
const WPM_WINDOW_SIZE_SEC = 15;

/**
 * POST /api/speech/analyze
 * Accepts an audio file via multipart/form-data, transcribes it with word-level
 * timestamps, computes advanced speech metrics, and returns AI coaching feedback.
 */
export async function POST(request: NextRequest) {
  try {
    await requireApiAuth();
  } catch (error) {
    return toApiAuthErrorResponse(error);
  }

  try {
    // 1. Parse form data
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const confidenceScore = Number(formData.get("confidenceScore") ?? 0);
    const question =
      (formData.get("question") as string) || "General interview question";

    // 2. Validate file
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 },
      );
    }

    if (
      !audioFile.type.startsWith("audio/") &&
      audioFile.type !== "application/octet-stream"
    ) {
      return NextResponse.json(
        { error: "File must be an audio format" },
        { status: 400 },
      );
    }

    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB limit`,
        },
        { status: 400 },
      );
    }

    // 3. Initialize AssemblyAI
    const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!assemblyApiKey) {
      return NextResponse.json(
        {
          error:
            "AssemblyAI API key not configured. Set ASSEMBLYAI_API_KEY in environment variables.",
        },
        { status: 500 },
      );
    }

    const client = new AssemblyAI({ apiKey: assemblyApiKey });

    // 4. Upload and transcribe with word-level timestamps
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const transcript = await client.transcripts.transcribe({
      audio: audioBuffer,
      speech_models: ["universal-3-pro", "universal-2"],
    });

    if (transcript.status === "error") {
      return NextResponse.json(
        { error: transcript.error || "Transcription failed" },
        { status: 500 },
      );
    }

    const transcriptText = transcript.text || "";
    const words = transcript.words || [];
    const durationSeconds = transcript.audio_duration ?? 0;

    // -----------------------------------------------------------------------
    // 4a. Minimum recording duration validation
    // -----------------------------------------------------------------------
    if (durationSeconds < 3) {
      return NextResponse.json(
        {
          error:
            "Recording too short. Please record for at least 5 seconds for meaningful analysis.",
        },
        { status: 400 },
      );
    }

    const metricsReliability: "high" | "medium" | "low" =
      durationSeconds >= 30 ? "high" : durationSeconds >= 10 ? "medium" : "low";

    // -----------------------------------------------------------------------
    // 5. Compute segmented WPM and pace analysis
    // -----------------------------------------------------------------------
    const totalWords = words.length;
    const wpm =
      durationSeconds > 0 ? Math.round((totalWords / durationSeconds) * 60) : 0;

    const segmentedWpm: WpmSegment[] = [];

    if (durationSeconds > 0 && words.length > 0) {
      const firstWordStart = (words[0].start ?? 0) / 1000;
      const lastWordEnd = (words[words.length - 1].end ?? 0) / 1000;

      for (
        let winStart = firstWordStart;
        winStart < lastWordEnd;
        winStart += WPM_WINDOW_SIZE_SEC
      ) {
        const winEnd = Math.min(winStart + WPM_WINDOW_SIZE_SEC, lastWordEnd);
        const wordsInWindow = words.filter((w) => {
          const wStart = (w.start ?? 0) / 1000;
          return wStart >= winStart && wStart < winEnd;
        });
        const windowDuration = winEnd - winStart;
        const windowWpm =
          windowDuration > 0
            ? Math.round((wordsInWindow.length / windowDuration) * 60)
            : 0;
        segmentedWpm.push({
          windowStartSec: Number(winStart.toFixed(2)),
          windowEndSec: Number(winEnd.toFixed(2)),
          wpm: windowWpm,
          wordCount: wordsInWindow.length,
        });
      }
    }

    // Pace consistency (coefficient of variation of window WPMs)
    let paceConsistencyScore = 100;
    const rushingSegments: PaceSegment[] = [];
    const draggingSegments: PaceSegment[] = [];

    if (segmentedWpm.length >= 2) {
      const wpmValues = segmentedWpm.map((s) => s.wpm).filter((v) => v > 0);
      if (wpmValues.length >= 2) {
        const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
        const variance =
          wpmValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
          wpmValues.length;
        const stdDev = Math.sqrt(variance);
        const cv = mean > 0 ? stdDev / mean : 0;
        // CV of 0 = perfect consistency (100), CV of 0.5+ = poor (0)
        paceConsistencyScore = Math.round(
          Math.max(0, Math.min(100, 100 - cv * 200)),
        );

        const rushThreshold = mean + 1.5 * stdDev;
        const dragThreshold = mean - 1.5 * stdDev;
        for (const seg of segmentedWpm) {
          if (seg.wpm > rushThreshold) {
            rushingSegments.push({ ...seg, deviationType: "rushing" });
          } else if (seg.wpm > 0 && seg.wpm < dragThreshold) {
            draggingSegments.push({ ...seg, deviationType: "dragging" });
          }
        }
      }
    }

    // -----------------------------------------------------------------------
    // 6. Vocabulary diversity (Guiraud's index, length-normalized)
    // -----------------------------------------------------------------------
    const allWordsLower = words.map((w) =>
      w.text.toLowerCase().replace(/[.,!?]/g, ""),
    );
    const uniqueWords = new Set(allWordsLower);
    // Guiraud's index: uniqueWords / sqrt(totalWords), normalized to 0-1.
    // Typical English speech Guiraud range is 4-12.
    let vocabularyDiversityRatio = 0;
    if (totalWords > 0) {
      const guiraud = uniqueWords.size / Math.sqrt(totalWords);
      vocabularyDiversityRatio = Number(
        Math.max(0, Math.min(1, (guiraud - 4) / 8)).toFixed(3),
      );
    }

    // -----------------------------------------------------------------------
    // 7. Filler word detection (multi-word first, then single with context)
    // -----------------------------------------------------------------------
    const consumedIndices = new Set<number>();
    const fillers: SpeechFiller[] = [];

    // Pass 1: Multi-word fillers (consume both indices)
    for (let i = 0; i < words.length - 1; i++) {
      const twoWordPhrase = `${words[i].text} ${words[i + 1].text}`
        .toLowerCase()
        .replace(/[.,!?]/g, "");
      if (MULTI_FILLERS.includes(twoWordPhrase)) {
        fillers.push({
          word: `${words[i].text} ${words[i + 1].text}`,
          timestamp: (words[i].start ?? 0) / 1000,
        });
        consumedIndices.add(i);
        consumedIndices.add(i + 1);
      }
    }

    // Pass 2: Single-word fillers (skip consumed indices, apply context checks)
    for (let i = 0; i < words.length; i++) {
      if (consumedIndices.has(i)) continue;
      const lower = words[i].text.toLowerCase().replace(/[.,!?]/g, "");

      if (SINGLE_FILLERS.includes(lower)) {
        fillers.push({
          word: words[i].text,
          timestamp: (words[i].start ?? 0) / 1000,
        });
      } else if (CONTEXT_FILLERS.includes(lower) && isLikeAFiller(words, i)) {
        fillers.push({
          word: words[i].text,
          timestamp: (words[i].start ?? 0) / 1000,
        });
      }
    }

    // -----------------------------------------------------------------------
    // 8. Hesitation pauses (adaptive threshold)
    // -----------------------------------------------------------------------
    const gaps: number[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const endCurrent = (words[i].end ?? 0) / 1000;
      const startNext = (words[i + 1].start ?? 0) / 1000;
      const gap = startNext - endCurrent;
      if (gap > 0) gaps.push(gap);
    }

    const averageGap =
      gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0.3;

    // Threshold: 3x average gap, clamped between 0.8s and 3.0s
    const adaptiveHesitationThreshold = Math.min(
      3.0,
      Math.max(0.8, averageGap * 3),
    );

    const hesitations: SpeechHesitation[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      const endCurrent = (words[i].end ?? 0) / 1000;
      const startNext = (words[i + 1].start ?? 0) / 1000;
      const gap = startNext - endCurrent;
      if (gap > adaptiveHesitationThreshold) {
        hesitations.push({
          startSec: Number(endCurrent.toFixed(2)),
          endSec: Number(startNext.toFixed(2)),
        });
      }
    }

    // -----------------------------------------------------------------------
    // 9. Build metrics object
    // -----------------------------------------------------------------------
    const metrics: SpeechMetrics = {
      transcript: transcriptText,
      durationSeconds,
      wpm,
      fillerCount: fillers.length,
      fillers,
      hesitationCount: hesitations.length,
      hesitations,
      segmentedWpm,
      paceConsistencyScore,
      rushingSegments,
      draggingSegments,
      vocabularyDiversityRatio,
      averageGap: Number(averageGap.toFixed(3)),
      adaptiveHesitationThreshold: Number(
        adaptiveHesitationThreshold.toFixed(3),
      ),
    };

    // 10. Compute filler frequency (fillers per minute)
    const fillerFrequency =
      durationSeconds > 0
        ? Number(((fillers.length / durationSeconds) * 60).toFixed(2))
        : 0;

    // 11. Generate AI coaching feedback
    const coaching = await generateCoachingFeedback(
      transcriptText,
      metrics,
      question,
      fillerFrequency,
    );

    // 12. Return merged response
    const response: SpeechAnalysisResponse = {
      ...metrics,
      ...coaching,
      speechEnergyScore: Math.max(
        0,
        Math.min(100, Math.round(confidenceScore)),
      ),
      fillerFrequency,
      question,
      isFallback: coaching.isFallback,
      metricsReliability,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Speech analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
