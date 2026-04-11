"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { finalizeInterview } from "@/lib/actions/interview.action";
import { createFeedback } from "@/lib/actions/feedback.action";
import { toast } from "sonner";
import Image from "next/image";
import { speechSynthesizer } from "@/lib/speechSynthesis";
import { realTimeAnalysisService } from "@/lib/realTimeAnalysis";
import { VoiceRecorder } from "@/lib/voiceRecorder";
import {
  analyzeSpeechCoachResponse,
  summarizeSpeechCoachResponses,
  type SpeechCoachResponseInsight,
} from "@/lib/speechCoach";

interface Props {
  interview: Interview;
  userId: string;
}

interface InterviewResponse {
  question: string;
  answer: string;
  speechCoach?: SpeechCoachResponseInsight;
}

const InterviewInterface = ({ interview, userId }: Props) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [voiceRecorder, setVoiceRecorder] = useState<VoiceRecorder | null>(null);
  const [currentVoiceDurationSeconds, setCurrentVoiceDurationSeconds] = useState(0);
  const [isLoadingReferenceAnswer, setIsLoadingReferenceAnswer] = useState(false);
  const [referenceAnswer, setReferenceAnswer] = useState<string | null>(null);
  const [showReferenceAnswer, setShowReferenceAnswer] = useState(false);
  const recordingStartedAtRef = useRef<number | null>(null);

  const currentQuestion = interview.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === interview.questions.length - 1;
  const responseWordCount = currentResponse.trim() ? currentResponse.trim().split(/\s+/).length : 0;
  const answeredCount = responses.length;
  const remainingCount = interview.questions.length - currentQuestionIndex - 1;

  useEffect(() => {
    const recorder = new VoiceRecorder(
      (transcript: string) => { setCurrentResponse(transcript); },
      (recording: boolean) => {
        setIsRecording(recording);

        if (recording) {
          recordingStartedAtRef.current = Date.now();
          return;
        }

        if (recordingStartedAtRef.current) {
          const elapsedMs = Date.now() - recordingStartedAtRef.current;
          const elapsedSeconds = Math.max(0, Math.round(elapsedMs / 1000));
          setCurrentVoiceDurationSeconds((prev) => prev + elapsedSeconds);
        }
        recordingStartedAtRef.current = null;
      },
      (message: string) => { toast.error(message); }
    );
    setVoiceRecorder(recorder);
    setSpeechSupported(recorder.isSupported());
    return () => {
      if (speechSynthesizer) speechSynthesizer.stop();
      if (recorder) recorder.stop();
    };
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      if (!speechSynthesizer.isSupported()) {
        setIsSpeaking(false);
        return;
      }
      speechSynthesizer.speak(currentQuestion, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [currentQuestionIndex, currentQuestion]);

  useEffect(() => {
    setShowReferenceAnswer(false);
    setReferenceAnswer(null);
  }, [currentQuestionIndex]);

  const toggleRecording = () => {
    if (!voiceRecorder || !speechSupported) {
      toast.error('Voice recording is not available. Please type your answer.');
      return;
    }

    voiceRecorder.toggle();
  };

  const toggleReferenceAnswer = async () => {
    if (!referenceAnswer) {
      setIsLoadingReferenceAnswer(true);
      try {
        const answer = await realTimeAnalysisService.generateReferenceAnswer(
          currentQuestion,
          interview.role,
          interview.techstack || [],
          interview.level
        );
        setReferenceAnswer(answer);
      } catch (error) {
        console.error('Reference answer generation failed:', error);
        toast.error('Could not generate the reference answer right now.');
        return;
      } finally {
        setIsLoadingReferenceAnswer(false);
      }
    }

    setShowReferenceAnswer((prev) => !prev);
  };

  const handleNextQuestion = async () => {
    if (!currentResponse.trim()) {
      toast.error("Please provide an answer before proceeding");
      return;
    }
    speechSynthesizer.stop();
    const speechCoach = currentVoiceDurationSeconds > 0
      ? analyzeSpeechCoachResponse(currentQuestion, currentResponse.trim(), currentVoiceDurationSeconds)
      : undefined;

    const updatedResponses = [
      ...responses,
      {
        question: currentQuestion,
        answer: currentResponse.trim(),
        speechCoach,
      },
    ];

    setResponses(updatedResponses);
    setCurrentResponse("");
    setShowAnswerPreview(false);
    setCurrentVoiceDurationSeconds(0);
    if (isLastQuestion) handleCompleteInterview(updatedResponses);
    else setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleCompleteInterview = async (allResponses: InterviewResponse[] = responses) => {
    setIsLoading(true);
    try {
      const scoredResponses = await Promise.all(
        allResponses.map(async (response) => {
          const analysis = await realTimeAnalysisService.analyzeAnswer(
            response.question,
            response.answer,
            interview.role,
            interview.techstack || [],
            interview.level
          );

          return {
            question: response.question,
            answer: response.answer,
            score: analysis.score,
            feedback: analysis.feedback,
            rubric: analysis.rubric,
          };
        })
      );

      const finalAnalysis = await realTimeAnalysisService.generateFinalAnalysis(
        scoredResponses,
        interview.role, interview.techstack || [], interview.level
      );
      const transcript: { role: string; content: string }[] = [];
      allResponses.forEach((r) => {
        transcript.push({ role: 'assistant', content: r.question });
        transcript.push({ role: 'user', content: r.answer });
      });
      transcript.push({ role: 'assistant', content: `FINAL ANALYSIS: Overall Score: ${finalAnalysis.overallScore}/100, Performance: ${finalAnalysis.performanceLevel}, Hiring Recommendation: ${finalAnalysis.hiringRecommendation}` });
      transcript.push({ role: 'assistant', content: `Final Feedback: ${finalAnalysis.finalFeedback}` });

      const speechCoachAnalyses = allResponses
        .map((response) => response.speechCoach)
        .filter((analysis): analysis is SpeechCoachResponseInsight => Boolean(analysis));

      const speechCoachSummary = speechCoachAnalyses.length > 0
        ? summarizeSpeechCoachResponses(speechCoachAnalyses)
        : undefined;

      await finalizeInterview(interview.id);
      const feedbackResult = await createFeedback({
        interviewId: interview.id,
        userId,
        transcript,
        finalAnalysis,
        speechCoachSummary,
      });
      if (!feedbackResult.success) throw new Error('Failed to generate feedback');
      speechSynthesizer.speak(
        `Interview completed! Your overall score is ${finalAnalysis.overallScore} out of 100. Performance level: ${finalAnalysis.performanceLevel}. Hiring recommendation: ${finalAnalysis.hiringRecommendation}. You can view your comprehensive detailed feedback now.`,
        { onEnd: () => { toast.success(`Interview completed! Score: ${finalAnalysis.overallScore}/100 - ${finalAnalysis.performanceLevel}`); router.push(`/interview/${interview.id}/feedback`); } }
      );
    } catch (error) {
      console.error('Interview completion error:', error);
      toast.error("Failed to complete interview");
      setTimeout(() => { router.push(`/interview/${interview.id}/feedback`); }, 2000);
    } finally { setIsLoading(false); }
  };

  /* ── Active Interview Screen ───────────────────── */
  const progressPct = ((currentQuestionIndex + 1) / interview.questions.length) * 100;
  const completion = Math.round(progressPct);
  const avgWordsPerAnswer = answeredCount > 0
    ? Math.round(
        responses.reduce((sum, response) => sum + response.answer.split(/\s+/).filter(Boolean).length, 0) /
          answeredCount
      )
    : 0;
  const readinessScore = Math.min(
    100,
    Math.round(
      (Math.min(responseWordCount, 60) / 60) * 70 +
        (currentResponse.trim() ? 20 : 0) +
        (!isSpeaking ? 10 : 0)
    )
  );

  return (
    <div className="interview-live-shell h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(139,92,246,0.16),transparent_28%),linear-gradient(180deg,#070b16_0%,#0b1020_100%)] p-3 md:p-4">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3">
        <section className="shrink-0 rounded-[28px] border border-white/12 bg-white/[0.04] px-4 py-3 backdrop-blur-xl shadow-[0_20px_60px_-36px_rgba(0,0,0,0.75)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary-200/90">Interview Command Deck</p>
              <h1 className="truncate text-[1.55rem] font-semibold tracking-tight text-white md:text-[2rem]">{interview.role}</h1>
              <p className="mt-1 text-xs text-light-400">{interview.type} interview · {interview.level} level · no-scroll layout</p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.12em] text-light-400">Stage</p>
                <p className="text-sm font-semibold text-white">{interview.type}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.12em] text-light-400">Level</p>
                <p className="text-sm font-semibold text-white">{interview.level}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.12em] text-light-400">Answered</p>
                <p className="text-sm font-semibold text-white">{answeredCount}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.12em] text-light-400">Progress</p>
                <p className="text-sm font-semibold text-white">{completion}%</p>
              </div>
            </div>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-primary-200 to-violet-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </section>

        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_270px] xl:items-stretch">
          <section className="grid h-full min-h-0 gap-3">
            <article className="interview-glass rounded-[28px] p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image src="/ai-avatar.png" alt="AI Interviewer" width={38} height={38} className="rounded-full border border-primary-200/30" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-primary-200">Current Prompt</p>
                    <p className="text-[11px] text-light-400">Question {currentQuestionIndex + 1} of {interview.questions.length}</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] ${isSpeaking ? 'border-amber-300/35 bg-amber-300/12 text-amber-200' : 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'}`}>
                  <span className={`h-2 w-2 rounded-full ${isSpeaking ? 'bg-amber-300 animate-pulse' : 'bg-emerald-300'}`} />
                  {isSpeaking ? 'AI Speaking' : 'Ready'}
                </span>
              </div>

              <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-[15px] leading-relaxed text-light-100 md:text-[16px]">
                {currentQuestion}
              </p>
            </article>

            <article className="interview-glass rounded-[28px] p-2.5 md:p-3">
              <div className="mb-1 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <Image src="/user-avatar.png" alt="You" width={30} height={30} className="rounded-full border border-white/10" />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-light-300">Your Response</p>
                    <p className="text-[10px] text-light-400">Concise, specific, measurable.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 text-[9px] text-light-400">
                  <span className="rounded-full border border-white/10 bg-black/20 px-1.5 py-0.5">Words {responseWordCount}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-1.5 py-0.5">Avg {avgWordsPerAnswer}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-1.5 py-0.5">Left {remainingCount}</span>
                </div>
              </div>

              <textarea
                value={currentResponse}
                onChange={(e) => {
                  setCurrentResponse(e.target.value);
                }}
                placeholder={isRecording ? 'Listening... speak your answer now' : 'Type or record your response'}
                className={`interview-textarea min-h-[3.25rem] md:min-h-[3.75rem] ${isRecording ? 'interview-textarea-recording' : ''}`}
                disabled={isRecording}
              />

              <div className="mt-1 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={toggleRecording}
                    disabled={isSpeaking || !speechSupported}
                    className={`interview-voice-btn ${isRecording ? 'interview-voice-btn-recording' : ''}`}
                  >
                    {!speechSupported ? (
                      <>Voice Unavailable</>
                    ) : isRecording ? (
                      <>
                        <div className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Record Voice
                      </>
                    )}
                  </button>

                  {isSpeaking && (
                    <div className="interview-speaking-indicator ml-1">
                      <div className="h-2 w-2 rounded-full bg-primary-200 animate-pulse" />
                      AI is speaking...
                    </div>
                  )}

                  {currentResponse && (
                    <button
                      onClick={() => {
                        setCurrentResponse("");
                      }}
                      className="interview-outline-btn !px-2 !py-0.5 text-[10px]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1 md:justify-end">
                  {currentQuestionIndex > 0 && (
                    <button onClick={() => setCurrentQuestionIndex((prev) => prev - 1)} className="interview-outline-btn !px-2 !py-0.5 text-[10px]">
                      Previous
                    </button>
                  )}
                  <button onClick={handleNextQuestion} disabled={isLoading} className="interview-primary-btn">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Completing...
                      </span>
                    ) : isLastQuestion ? 'Complete Interview' : 'Next Question'}
                  </button>
                </div>
              </div>
            </article>
          </section>

          <aside className="grid h-full min-h-0 gap-2 xl:grid-rows-[auto_1fr]">
            <article className="interview-glass rounded-[28px] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-200">Session Focus</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-light-100">Use one sharp example, one decision, and one measurable result.</p>
            </article>

            <article className="interview-glass flex h-full flex-col rounded-[28px] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-light-300">Answer Coach</p>
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-200">What to include</p>
                <div className="mt-1.5 space-y-1.5 text-[13px] text-light-100">
                  <p>1. State the main concept directly.</p>
                  <p>2. Add one short explanation or example.</p>
                  <p>3. End with impact, tradeoff, or result.</p>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] text-light-400">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 text-center">
                  <p className="uppercase tracking-[0.12em] text-light-400">Words</p>
                  <p className="mt-1 text-sm font-semibold text-white">{responseWordCount}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 text-center">
                  <p className="uppercase tracking-[0.12em] text-light-400">Avg</p>
                  <p className="mt-1 text-sm font-semibold text-white">{avgWordsPerAnswer}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-2.5 text-center">
                  <p className="uppercase tracking-[0.12em] text-light-400">Left</p>
                  <p className="mt-1 text-sm font-semibold text-white">{remainingCount}</p>
                </div>
              </div>

              <div className="mt-2 flex-1 rounded-2xl border border-white/10 bg-black/20 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-200">Live Readiness</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-primary-200 to-violet-400 transition-all duration-300"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-light-400">Readiness {readinessScore}%</p>

                <div className="mt-2 space-y-1.5 text-[11px] text-light-100">
                  <p className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${responseWordCount >= 20 ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                    {responseWordCount >= 20 ? 'Answer has enough detail' : 'Add a bit more detail'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isSpeaking ? 'bg-amber-300' : 'bg-emerald-300'}`} />
                    {isSpeaking ? 'Wait for AI to finish speaking' : 'Good timing to respond'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-primary-200 animate-pulse' : 'bg-white/40'}`} />
                    {isRecording ? 'Recording in progress' : 'Recording idle'}
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
