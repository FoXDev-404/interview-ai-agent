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

  const toggleRecording = () => {
    if (!voiceRecorder || !speechSupported) {
      toast.error('Voice recording is not available. Please type your answer.');
      return;
    }

    voiceRecorder.toggle();
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

  return (
    <div className="interview-live-shell min-h-[82vh] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="interview-glass rounded-b-none p-5 md:p-6 mb-4">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-white">{interview.role} Interview</h1>
              <p className="text-light-400 text-sm mt-0.5">Question {currentQuestionIndex + 1} of {interview.questions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Question dots */}
              <div className="hidden md:flex items-center gap-1.5">
                {interview.questions.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: i < currentQuestionIndex ? '#cac5fe' : i === currentQuestionIndex ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                      boxShadow: i === currentQuestionIndex ? '0 0 8px 2px rgba(167, 139, 250, 0.3)' : 'none'
                    }}
                  ></div>
                ))}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs text-light-400 font-medium">{Math.round(progressPct)}%</span>
                <div className="interview-progress-track">
                  <div className="interview-progress-fill" style={{ width: `${progressPct}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[minmax(0,1fr)_290px] gap-4">
          {/* Main Content */}
          <div className="interview-glass rounded-xl p-6 md:p-8">
            {/* AI Question Bubble */}
            <div className="flex items-start gap-4 mb-6">
              <Image src="/ai-avatar.png" alt="AI Interviewer" width={44} height={44} className="rounded-full flex-shrink-0 border border-primary-200/20 shadow-md shadow-primary-200/5" />
              <div className="flex-1">
                <p className="text-xs text-primary-200/60 font-semibold uppercase tracking-wider mb-2">AI Interviewer</p>
                <div className="interview-ai-bubble">
                  <p className="text-light-100 text-[15px] leading-relaxed">{currentQuestion}</p>
                </div>
              </div>
            </div>

            {/* Voice Mode Bar */}
            <div className="interview-instruction-card mb-5 flex items-center gap-3 p-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
              <div>
                <p className="text-xs text-primary-100 font-medium">Voice Mode Active</p>
                <p className="text-[11px] text-light-400">The AI speaks questions automatically. Use the button below to record your voice answer.</p>
              </div>
            </div>

            {/* Response Area */}
            <div className="flex items-start gap-4 mb-4">
              <Image src="/user-avatar.png" alt="You" width={44} height={44} className="rounded-full flex-shrink-0 border border-white/10" />
              <div className="flex-1 space-y-3">
                <p className="text-xs text-light-400 font-semibold uppercase tracking-wider">Your Answer</p>
                <textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder={isRecording ? "Listening... Speak your answer now" : "Type your answer here or use voice recording"}
                  className={`interview-textarea ${isRecording ? "interview-textarea-recording" : ""}`}
                  disabled={isRecording}
                />
                <div className="flex justify-center">
                  <button
                    onClick={toggleRecording}
                    disabled={isSpeaking || !speechSupported}
                    className={`interview-voice-btn ${isRecording ? "interview-voice-btn-recording" : ""}`}
                  >
                    {!speechSupported ? (
                      <>Voice Unavailable</>
                    ) : isRecording ? (
                      <><div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>Stop Recording</>
                    ) : (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>Start Voice Recording</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-light-600/15 to-transparent my-5" />
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                {isSpeaking && (
                  <div className="interview-speaking-indicator">
                    <div className="w-2 h-2 bg-primary-200 rounded-full animate-pulse"></div>
                    AI is speaking...
                  </div>
                )}
                {currentResponse && (
                  <button onClick={() => setCurrentResponse("")} className="interview-outline-btn !py-1.5 !px-3 text-xs">Clear</button>
                )}
              </div>
              <div className="flex gap-3">
                {currentQuestionIndex > 0 && (
                  <button onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="interview-outline-btn">Previous</button>
                )}
                <button onClick={handleNextQuestion} disabled={isLoading} className="interview-primary-btn">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      Completing...
                    </span>
                  ) : isLastQuestion ? "Complete Interview" : "Next Question"}
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <aside className="interview-glass rounded-xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Session Snapshot</h2>
            <div className="interview-side-grid">
              <div className="interview-side-card">
                <p className="interview-side-label">Answered</p>
                <p className="interview-side-value">{answeredCount}</p>
              </div>
              <div className="interview-side-card">
                <p className="interview-side-label">Remaining</p>
                <p className="interview-side-value">{remainingCount}</p>
              </div>
              <div className="interview-side-card">
                <p className="interview-side-label">Words</p>
                <p className="interview-side-value">{responseWordCount}</p>
              </div>
            </div>

            <div className="interview-side-note">
              <p className="interview-side-note-title">Response tip</p>
              <p className="interview-side-note-text">
                Keep each answer focused on one challenge, one decision, and one measurable outcome.
              </p>
            </div>

            <div className="interview-side-note">
              <p className="interview-side-note-title">Current mode</p>
              <p className="interview-side-note-text">{interview.type} interview · {interview.level} level</p>
            </div>

            <div className="interview-side-framework">
              <p className="interview-side-note-title">Quick Framework</p>
              <div className="interview-framework-list">
                <div className="interview-framework-item">
                  <span className="interview-framework-step">1</span>
                  <p>State the context in one line.</p>
                </div>
                <div className="interview-framework-item">
                  <span className="interview-framework-step">2</span>
                  <p>Explain your decision and tradeoff.</p>
                </div>
                <div className="interview-framework-item">
                  <span className="interview-framework-step">3</span>
                  <p>Close with measurable impact.</p>
                </div>
              </div>
            </div>

            <div className="interview-side-note">
              <p className="interview-side-note-title">Confidence Cue</p>
              <p className="interview-side-note-text">
                Pause for one second before answering. Calm, structured delivery usually scores better than rushing.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="interview-glass rounded-t-xl p-4 text-center mt-4">
          <p className="text-xs text-light-400">Take your time. You can revise answers before moving to the next question.</p>
        </div>
      </div>
    </div>
  );
};

export default InterviewInterface;
