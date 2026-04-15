'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft, Mic, Type, Shuffle, MessageSquareQuote,
  Brain, Shield, MessageCircle, Activity,
} from 'lucide-react';
import AudioRecorder from '@/components/speech/AudioRecorder';
import SpeechDashboard from '@/components/speech/SpeechDashboard';
import {
  PRACTICE_QUESTIONS,
  CATEGORY_LABELS,
  getRandomQuestion,
  type QuestionCategory,
} from '@/lib/speech/practiceQuestions';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as QuestionCategory[];

const FEATURE_PILLARS = [
  { icon: Shield, label: 'Confidence' },
  { icon: Brain, label: 'Clarity' },
  { icon: MessageCircle, label: 'Filler Words' },
  { icon: Activity, label: 'Pacing' },
] as const;

/**
 * Orchestrates the speech analysis flow: record → analyze → display results.
 */
export default function SpeechAnalyzer() {
  const [view, setView] = useState<'input' | 'analyzing' | 'dashboard'>('input');
  const [result, setResult] = useState<SpeechAnalysisResponse | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [category, setCategory] = useState<QuestionCategory>('all');
  const [currentQuestion, setCurrentQuestion] = useState(PRACTICE_QUESTIONS[0].question);

  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Pick a random question on mount (client-only) to avoid hydration mismatch
  useEffect(() => {
    setCurrentQuestion(getRandomQuestion());
  }, []);

  // Auto-scroll only the transcript container
  useEffect(() => {
    const container = transcriptContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [liveTranscript, interimText]);

  const handleAnalysisComplete = (data: SpeechAnalysisResponse) => {
    setResult(data);
    setView('dashboard');
  };

  const handleError = (error: string) => {
    toast.error(error);
    setView('input');
  };

  const handleStateChange = (state: 'idle' | 'recording' | 'analyzing') => {
    setIsRecording(state === 'recording');
    if (state === 'analyzing') setView('analyzing');
    if (state === 'idle') {
      setLiveTranscript('');
      setInterimText('');
    }
  };

  const handleTranscriptUpdate = useCallback((text: string, isInterim: boolean) => {
    if (isInterim) {
      setInterimText(text);
    } else {
      setLiveTranscript(text);
      setInterimText('');
    }
  }, []);

  const handleCategoryChange = (newCategory: QuestionCategory) => {
    setCategory(newCategory);
    setCurrentQuestion(getRandomQuestion(currentQuestion, newCategory));
  };

  const isIdle = view === 'input' && !isRecording;
  const isActive = isRecording || view === 'analyzing';

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input / Analyzing View ── */}
      {(view === 'input' || view === 'analyzing') && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">

          {/* Hero */}
          {isIdle && (
            <section className="hero-section relative overflow-hidden rounded-3xl">
              <div className="hero-orb hero-orb-1" />
              <div className="hero-orb hero-orb-2" />
              <div className="hero-orb hero-orb-3" />
              <div className="relative z-10 flex items-center justify-between gap-8 px-10 py-14 max-sm:px-5 max-sm:py-10">
                <div className="flex flex-col gap-5 max-w-2xl">
                  <span className="hero-pill">
                    <span className="hero-pill-dot" />
                    AI-Powered Speech Coaching
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.12] tracking-tight">
                    Master Your
                    <span className="hero-gradient-text"> Interview </span>
                    Voice
                  </h1>
                  <p className="text-base sm:text-lg text-light-100/80 leading-relaxed max-w-xl">
                    Record yourself answering interview questions and receive instant AI&#8209;powered feedback on confidence, clarity, filler words, and pacing.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {FEATURE_PILLARS.map(({ icon: Icon, label }) => (
                      <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-xs text-foreground/70">
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <Mic className="w-40 h-40 text-primary-200/30 max-lg:hidden hero-float shrink-0" />
              </div>
            </section>
          )}

          {/* ── Category + Question (idle) ── */}
          {isIdle && (
            <section className="interview-glass p-6 sm:p-8 flex flex-col gap-6">
              {/* Section label */}
              <div>
                <p className="section-label">Practice Question</p>
                <p className="text-sm text-light-400 mt-1">Choose a category, then answer the question below out loud.</p>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 whitespace-nowrap ${
                      category === cat
                        ? 'bg-primary-200/20 border-primary-200/40 text-primary-200'
                        : 'border-border/50 bg-muted/20 text-foreground/60 hover:text-foreground hover:border-border hover:bg-muted/30'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Question card */}
              <div className="relative rounded-2xl border border-primary-200/15 bg-primary-200/5 p-5">
                <div className="step-card-number">Q</div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="step-card-icon w-9 h-9 shrink-0 mt-0.5">
                      <MessageSquareQuote className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-light-100 leading-relaxed pt-1.5">
                      {currentQuestion}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentQuestion(getRandomQuestion(currentQuestion, category))}
                    className="shrink-0 p-2 rounded-xl border border-border/50 bg-muted/20 text-foreground/60 hover:text-primary-200 hover:border-primary-200/30 hover:bg-primary-200/10 transition-all"
                    title="Get another question"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── Active: compact question banner ── */}
          {isActive && (
            <div className="interview-glass flex items-start gap-3 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="step-card-icon w-8 h-8 shrink-0 mt-0.5">
                <MessageSquareQuote className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="section-label text-[0.65rem] mb-0.5">Question</p>
                <p className="text-sm text-light-100 leading-snug">{currentQuestion}</p>
              </div>
            </div>
          )}

          {/* ── Recorder + Live Transcript ── */}
          <div className={`transition-all duration-500 ${isActive ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'max-w-md mx-auto w-full'}`}>

            {/* Recorder card */}
            <div className="interview-glass p-8">
              <AudioRecorder
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleError}
                onStateChange={handleStateChange}
                onTranscriptUpdate={handleTranscriptUpdate}
                question={currentQuestion}
              />
            </div>

            {/* Live Transcript panel */}
            {isActive && (
              <div className="interview-glass p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="step-card-icon w-7 h-7">
                      <Type className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Live Transcript</h3>
                  </div>
                  {isRecording && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                      LIVE
                    </span>
                  )}
                </div>
                <div
                  ref={transcriptContainerRef}
                  className="flex-1 min-h-[200px] max-h-[320px] overflow-y-auto rounded-xl bg-light-800/60 border border-white/5 p-4"
                >
                  {!liveTranscript && !interimText ? (
                    <p className="text-sm text-light-400 italic">Start speaking to see live transcription…</p>
                  ) : (
                    <p className="text-sm leading-relaxed">
                      <span className="text-light-100">{liveTranscript}</span>
                      {interimText && interimText.length > liveTranscript.length && (
                        <span className="text-light-400 italic">{interimText.slice(liveTranscript.length)}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Analyzing state */}
          {view === 'analyzing' && (
            <div className="text-center py-8 animate-in fade-in duration-500">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary-200/30 border-t-primary-200 animate-spin" />
                <p className="text-sm font-medium text-light-400">Transcribing and analyzing your speech…</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dashboard View ── */}
      {view === 'dashboard' && result && (
        <div className="animate-in fade-in duration-700">
          {/* Dashboard header bar */}
          <div className="border-b border-border/30 bg-background/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setResult(null);
                    setLiveTranscript('');
                    setInterimText('');
                    setView('input');
                  }}
                  className="flex items-center gap-2 text-light-400 hover:text-white transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={16} />
                  Record Again
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">Speech Analysis Results</h2>
                  <p className="text-xs text-light-400 mt-0.5">Powered by AI</p>
                </div>
                <div className="w-28" />
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SpeechDashboard data={result} />
          </div>
        </div>
      )}
    </div>
  );
}
