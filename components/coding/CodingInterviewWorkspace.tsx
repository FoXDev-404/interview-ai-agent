'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  Clock3,
  Code2,
  Loader2,
  Play,
  RotateCcw,
  Send,
  TerminalSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flag,
} from 'lucide-react';
import {
  CODING_LANGUAGES,
  type CodingExecuteResult,
  type CodingLanguage,
  type CodingQuestion,
  isDesignTestCase,
} from '@/lib/codingInterview';

type LeftTab = 'description' | 'hints' | 'editorial';
type BottomTab = 'tests' | 'console' | 'history';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-light-400">
      Loading editor...
    </div>
  ),
});

interface CodingInterviewWorkspaceProps {
  interviewId: string;
  role: string;
  level: string;
  initialLanguage: CodingLanguage;
  questions: CodingQuestion[];
}

interface QuestionStatus {
  attempted: boolean;
  solved: boolean;
}

interface SubmissionHistoryItem {
  id: string;
  questionId: string;
  questionTitle: string;
  timestamp: string;
  language: CodingLanguage;
  status: CodingExecuteResult['status'];
  runtimeMs: number;
  passed: number;
  total: number;
}

function getStatusClasses(status: CodingExecuteResult['status']) {
  if (status === 'Accepted') return 'bg-emerald-500/15 text-emerald-300';
  if (status === 'Wrong Answer') return 'bg-amber-500/15 text-amber-300';
  if (status === 'Time Limit Exceeded') return 'bg-orange-500/15 text-orange-300';
  if (status === 'Memory Limit Exceeded') return 'bg-fuchsia-500/15 text-fuchsia-300';
  return 'bg-red-500/15 text-red-300';
}

function formatRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function CodingInterviewWorkspace({
  interviewId,
  role,
  level,
  initialLanguage,
  questions,
}: CodingInterviewWorkspaceProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string; photoURL?: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>('description');
  const [bottomTab, setBottomTab] = useState<BottomTab>('tests');
  const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage>(initialLanguage);
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState<CodingExecuteResult | null>(null);
  const [runningMode, setRunningMode] = useState<'run' | 'submit' | null>(null);
  const isRunning = runningMode !== null;
  const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(75 * 60);
  const [code, setCode] = useState('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(40);
  const [isResizing, setIsResizing] = useState(false);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistoryItem[]>([]);

  const activeQuestion = activeIndex !== null ? questions[activeIndex] : null;

  const progressPercent = useMemo(() => {
    const solvedCount = Object.values(questionStatus).filter((status) => status.solved).length;
    return Math.round((solvedCount / Math.max(1, questions.length)) * 100);
  }, [questionStatus, questions.length]);

  const solvedCount = useMemo(
    () => Object.values(questionStatus).filter((status) => status.solved).length,
    [questionStatus]
  );

  const attemptedCount = useMemo(
    () => Object.values(questionStatus).filter((status) => status.attempted).length,
    [questionStatus]
  );

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const savedStatuses = localStorage.getItem(`coding-status-${interviewId}`);
    const savedTimer = localStorage.getItem(`coding-timer-${interviewId}`);
    const savedHistory = localStorage.getItem(`coding-submission-history-${interviewId}`);

    if (savedStatuses) {
      setQuestionStatus(JSON.parse(savedStatuses));
    }
    if (savedTimer) {
      setRemainingSeconds(Math.max(0, Number(savedTimer)));
    }
    if (savedHistory) {
      setSubmissionHistory(JSON.parse(savedHistory));
    }
  }, [interviewId]);

  useEffect(() => {
    localStorage.setItem(`coding-status-${interviewId}`, JSON.stringify(questionStatus));
  }, [interviewId, questionStatus]);

  useEffect(() => {
    localStorage.setItem(`coding-timer-${interviewId}`, String(remainingSeconds));
  }, [interviewId, remainingSeconds]);

  useEffect(() => {
    localStorage.setItem(`coding-submission-history-${interviewId}`, JSON.stringify(submissionHistory));
  }, [interviewId, submissionHistory]);

  useEffect(() => {
    if (activeIndex === null) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeIndex]);

  useEffect(() => {
    if (!activeQuestion) return;

    const key = `coding-code-${interviewId}-${activeQuestion.id}-${selectedLanguage}`;
    const saved = localStorage.getItem(key);

    if (saved) {
      setCode(saved);
      return;
    }

    setCode(activeQuestion.starterCode[selectedLanguage] ?? activeQuestion.starterCode.javascript ?? '');
  }, [activeQuestion, interviewId, selectedLanguage]);

  useEffect(() => {
    if (!activeQuestion) return;

    const key = `coding-code-${interviewId}-${activeQuestion.id}-${selectedLanguage}`;
    localStorage.setItem(key, code);
  }, [activeQuestion, code, interviewId, selectedLanguage]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = (event.clientX / window.innerWidth) * 100;
      setLeftPanelWidth(Math.max(25, Math.min(65, nextWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const resetCode = () => {
    if (!activeQuestion) return;
    const starter = activeQuestion.starterCode[selectedLanguage] ?? activeQuestion.starterCode.javascript ?? '';
    setCode(starter);
  };

  const setAttempted = (questionId: string, solved: boolean) => {
    setQuestionStatus((prev) => ({
      ...prev,
      [questionId]: {
        attempted: true,
        solved,
      },
    }));
  };

  const execute = async (mode: 'run' | 'submit') => {
    if (!activeQuestion) return;

    setRunningMode(mode);
    setBottomTab('console');
    setIsBottomOpen(true);

    try {
      const response = await fetch('/api/coding/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          questionId: activeQuestion.id,
          mode,
          customInput,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload?.message ?? 'Execution failed');
      }

      const result = payload.result as CodingExecuteResult;
      setOutput(result);
      setAttempted(activeQuestion.id, result.status === 'Accepted' && mode === 'submit');

      if (mode === 'submit') {
        const item: SubmissionHistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          questionId: activeQuestion.id,
          questionTitle: activeQuestion.title,
          timestamp: new Date().toISOString(),
          language: selectedLanguage,
          status: result.status,
          runtimeMs: result.executionTimeMs,
          passed: result.passed,
          total: result.total,
        };

        setSubmissionHistory((prev) => [item, ...prev].slice(0, 50));
      }
    } catch (error) {
      setOutput({
        status: 'Runtime Error',
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: 0,
        memoryMB: 0,
        passed: 0,
        total: 0,
        aiFeedback: {
          summary: 'Execution service unavailable.',
          timeComplexity: 'N/A',
          spaceComplexity: 'N/A',
          bestPractices: [],
          optimizationSuggestions: ['Retry in a moment or refresh the page.'],
          explanation: 'Could not evaluate this submission due to an API error.',
        },
      });
    } finally {
      setRunningMode(null);
    }
  };

  const renderCodingNavbar = () => (
    <div className="h-12 rounded-xl border border-white/8 bg-dark-100/85 px-3 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={26} height={22} />
            <span className="text-sm font-bold text-primary-100">AI MockPrep</span>
          </Link>
          <button
            onClick={() => setActiveIndex(null)}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-light-300 transition hover:bg-white/5"
          >
            Question List
          </button>
          {activeIndex !== null && (
            <>
              <span className="hidden sm:inline text-light-400/60">|</span>
              <span className="text-xs text-light-300">Question {activeIndex + 1} of {questions.length}</span>
              <span className="hidden md:inline rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-light-300">
                Solved {solvedCount}/{questions.length}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push(`/coding-interview/${interviewId}/feedback`)}
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/22"
          >
            <Flag className="h-3.5 w-3.5" />
            Finish
          </button>
          <div className="flex items-center gap-1 rounded-md border border-primary-200/25 bg-primary-200/10 px-2.5 py-1 text-xs text-primary-200">
            <Clock3 className="h-3.5 w-3.5" />
            {formatRemaining(remainingSeconds)}
          </div>

          {isLoadingUser ? (
            <div className="h-7 w-7 rounded-full bg-white/10 animate-pulse" />
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1">
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-semibold text-white">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <span className="hidden sm:block max-w-[120px] truncate text-xs text-light-300">
                {currentUser?.name || 'Profile'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (questions.length === 0) {
    return (
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-x-hidden py-16 px-4 sm:px-6 lg:px-8">
        {renderCodingNavbar()}
        <div className="interview-glass p-8 text-center">
          <h2 className="text-2xl font-bold text-white">No coding questions available</h2>
          <p className="mt-2 text-light-400">Create a new coding interview to begin a coding session.</p>
        </div>
      </div>
    );
  }

  if (activeQuestion === null) {
    return (
      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-x-hidden space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {renderCodingNavbar()}
        <div className="interview-glass p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-label">Coding Interview Session</p>
              <h1 className="mt-1 text-3xl font-bold text-white">{role}</h1>
              <p className="mt-2 text-sm text-light-400">
                {level} level · {questions.length} questions · {CODING_LANGUAGES.find((lang) => lang.value === selectedLanguage)?.label}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-light-300">
              Coding session ready
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-light-400">
              <span>Session Progress</span>
              <span>{progressPercent}% solved</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary-200 to-blue-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-light-400">Attempted {attemptedCount}/{questions.length} questions</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {questions.map((question, index) => {
            const status = questionStatus[question.id];
            const difficultyClasses =
              question.difficulty === 'Easy'
                ? 'bg-emerald-500/15 text-emerald-300'
                : question.difficulty === 'Medium'
                  ? 'bg-amber-500/15 text-amber-300'
                  : 'bg-red-500/15 text-red-300';

            return (
              <button
                key={question.id}
                onClick={() => setActiveIndex(index)}
                className="interview-glass group p-5 text-left transition-all duration-200 hover:-translate-y-1"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-light-400">Question {index + 1}</span>
                  {status?.solved ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : status?.attempted ? (
                    <Circle className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-light-400/60" />
                  )}
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold text-white">{question.title}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${difficultyClasses}`}>{question.difficulty}</span>
                  <span className="text-xs text-light-400">{question.tags[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const safeActiveIndex = activeIndex ?? 0;
  const languageMonaco = CODING_LANGUAGES.find((lang) => lang.value === selectedLanguage)?.monaco ?? 'javascript';
  const outputLineCount = (output?.output ?? '').split('\n').length;
  const shouldScrollOutput = outputLineCount > 5;

  return (
    <div className="relative left-1/2 right-1/2 h-screen w-screen -translate-x-1/2 overflow-x-hidden px-2 pb-3 sm:px-3 lg:px-4 flex min-h-0 flex-col">
      {renderCodingNavbar()}

      <div
        className="mt-2 flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-0"
        style={{
          ['--left-panel-width' as string]: `${leftPanelWidth}%`,
        }}
      >
        {/* Left panel */}
        <section className="interview-glass flex min-h-0 flex-col w-full lg:w-[var(--left-panel-width)]">
          <div className="border-b border-white/8 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{activeQuestion.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeQuestion.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : activeQuestion.difficulty === 'Medium'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-red-500/15 text-red-300'
                    }`}
                  >
                    {activeQuestion.difficulty}
                  </span>
                  {activeQuestion.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-light-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {(['description', 'hints', 'editorial'] as LeftTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeftTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition ${
                    leftTab === tab
                      ? 'bg-primary-200/20 text-primary-200'
                      : 'bg-white/5 text-light-400 hover:bg-white/10 hover:text-light-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm text-light-100">
            {leftTab === 'description' && (
              <div className="space-y-5">
                <div>
                  <h3 className="section-label mb-2">Problem Description</h3>
                  <p className="leading-6 text-light-100">{activeQuestion.description}</p>
                </div>

                <div>
                  <h3 className="section-label mb-2">Example Input / Output</h3>
                  <div className="space-y-3">
                    {activeQuestion.examples.map((example, idx) => (
                      <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="mb-1 text-xs text-light-400">Example {idx + 1}</p>
                        {isDesignTestCase(example) ? (
                          <>
                            <p className="font-mono text-xs text-light-100">
                              Operations: {JSON.stringify(example.operations)}
                            </p>
                            <p className="mt-1 font-mono text-xs text-light-100">
                              Values: {JSON.stringify(example.parameters)}
                            </p>
                            <p className="mt-1 font-mono text-xs text-light-100">
                              Expected: {JSON.stringify(example.expected)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-mono text-xs text-light-100">Input: {example.input}</p>
                            <p className="mt-1 font-mono text-xs text-light-100">Output: {example.output}</p>
                          </>
                        )}
                        {example.explanation && (
                          <p className="mt-1 text-xs text-light-400">{example.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="section-label mb-2">Constraints</h3>
                  <ul className="space-y-2">
                    {activeQuestion.constraints.map((constraint) => (
                      <li key={constraint} className="rounded-lg bg-white/5 px-3 py-2 text-xs text-light-300">
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                {activeQuestion.hints.map((hint, idx) => (
                  <div key={hint} className="rounded-xl border border-primary-200/20 bg-primary-200/10 p-3">
                    <p className="text-xs font-semibold text-primary-200">Hint {idx + 1}</p>
                    <p className="mt-1 text-sm text-light-100">{hint}</p>
                  </div>
                ))}
              </div>
            )}

            {leftTab === 'editorial' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="section-label mb-2">Editorial</h3>
                  <p className="leading-6 text-light-100">{activeQuestion.editorial}</p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <h3 className="section-label mb-2">Complexity</h3>
                  <p className="text-sm text-light-100">Time: {activeQuestion.timeComplexity}</p>
                  <p className="text-sm text-light-100">Space: {activeQuestion.spaceComplexity}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/8 p-3">
            <button
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : prev))}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-light-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <p className="text-xs text-light-400">
              Question {safeActiveIndex + 1} of {questions.length}
            </p>
            <button
              disabled={safeActiveIndex >= questions.length - 1}
              onClick={() =>
                setActiveIndex((prev) => (prev !== null ? Math.min(questions.length - 1, prev + 1) : prev))
              }
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-light-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <button
          onMouseDown={() => setIsResizing(true)}
          className={`hidden lg:flex w-2 shrink-0 cursor-col-resize items-center justify-center rounded-full border border-white/10 bg-white/5 transition ${
            isResizing ? 'bg-primary-200/25 border-primary-200/40' : 'hover:bg-white/10'
          }`}
          title="Drag to resize panels"
          aria-label="Resize panels"
        >
          <span className="h-10 w-1 rounded-full bg-white/25" />
        </button>

        {/* Right panel */}
        <section className="interview-glass flex min-h-0 flex-col overflow-hidden w-full lg:w-[calc(100%-var(--left-panel-width)-0.5rem)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 p-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary-200" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as CodingLanguage)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-light-100 focus:border-primary-200/40 focus:outline-none"
              >
                {CODING_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-dark-200">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetCode}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-light-300 hover:bg-white/5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                onClick={() => execute('run')}
                disabled={isRunning}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-400/30 bg-blue-500/15 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-500/25 disabled:opacity-60"
              >
                {runningMode === 'run' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Run Code
              </button>
              <button
                onClick={() => execute('submit')}
                disabled={isRunning}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60"
              >
                {runningMode === 'submit' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Submit Solution
              </button>
            </div>
          </div>

          <div className={`min-h-0 flex-1 ${isBottomOpen ? 'border-b border-white/8' : ''}`}>
            <MonacoEditor
              height="100%"
              language={languageMonaco}
              value={code}
              onChange={(value) => setCode(value ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                lineNumbers: 'on',
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>

          <div className={isBottomOpen ? 'h-[250px] md:h-[280px] lg:h-[300px] overflow-hidden' : 'h-auto'}>
            <div className={`flex items-center gap-2 px-3 py-2 ${isBottomOpen ? 'border-b border-white/8' : ''}`}>
              <button
                onClick={() => {
                  setBottomTab('tests');
                  setIsBottomOpen(true);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  bottomTab === 'tests' ? 'bg-primary-200/20 text-primary-200' : 'text-light-400 hover:bg-white/5'
                }`}
              >
                Test Cases
              </button>
              <button
                onClick={() => {
                  setBottomTab('console');
                  setIsBottomOpen(true);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  bottomTab === 'console' ? 'bg-primary-200/20 text-primary-200' : 'text-light-400 hover:bg-white/5'
                }`}
              >
                Output Console
              </button>
              <button
                onClick={() => {
                  setBottomTab('history');
                  setIsBottomOpen(true);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  bottomTab === 'history' ? 'bg-primary-200/20 text-primary-200' : 'text-light-400 hover:bg-white/5'
                }`}
              >
                Submissions
              </button>
              <button
                onClick={() => setIsBottomOpen((prev) => !prev)}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-light-400 hover:bg-white/5"
              >
                {isBottomOpen ? 'Hide' : 'Open'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isBottomOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isBottomOpen && bottomTab === 'tests' && (
              <div className="h-[calc(100%-43px)] overflow-y-auto">
              <div className="grid gap-3 p-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-light-400">Default Test Cases</p>
                  <div className="space-y-2">
                    {activeQuestion.examples.map((example, index) => (
                      <div key={index} className="rounded-lg border border-white/8 bg-dark-200/70 p-2">
                        <p className="text-[11px] text-light-400">Case {index + 1}</p>
                        {isDesignTestCase(example) ? (
                          <>
                            <p className="mt-1 font-mono text-[11px] text-light-100">
                              Ops: {JSON.stringify(example.operations)}
                            </p>
                            <p className="font-mono text-[11px] text-light-100">
                              Values: {JSON.stringify(example.parameters)}
                            </p>
                            <p className="font-mono text-[11px] text-light-100">
                              Expected: {JSON.stringify(example.expected)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="mt-1 font-mono text-[11px] text-light-100">Input: {example.input}</p>
                            <p className="font-mono text-[11px] text-light-100">Expected: {example.output}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-light-400">Custom Input</p>
                  {activeQuestion.problemType === 'DESIGN' ? (
                    <p className="text-[11px] text-light-400 italic">
                      Custom input is not available for design problems. Use the default test cases above.
                    </p>
                  ) : (
                    <>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Example: nums = [2,7,11,15], target = 9"
                        className="h-28 w-full resize-none rounded-lg border border-white/10 bg-dark-200/70 p-2 font-mono text-xs text-light-100 placeholder:text-light-400 focus:border-primary-200/40 focus:outline-none"
                      />
                      <p className="mt-2 text-[11px] text-light-400">
                        Tip: For exact output matching in demo mode, provide input in the same format as examples.
                      </p>
                    </>
                  )}
                </div>
              </div>
              </div>
            )}

            {isBottomOpen && bottomTab === 'console' && (
              <div className="h-[calc(100%-43px)] overflow-y-auto">
              <div className="grid gap-3 p-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-dark-200/70 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs text-light-400">
                    <TerminalSquare className="h-4 w-4" />
                    Execution Result
                  </div>

                  {output ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-light-400">Status:</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${getStatusClasses(output.status)}`}
                        >
                          {output.status}
                        </span>
                      </div>
                      <p className="text-light-400">Output:</p>
                      <pre
                        className={`max-h-24 overflow-x-hidden whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-[11px] text-light-100 ${
                          shouldScrollOutput ? 'overflow-y-auto' : 'overflow-y-hidden'
                        }`}
                      >
                        {output.output || '(no output)'}
                      </pre>
                      {output.error && (
                        <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300">
                          {output.error}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-[11px] text-light-400">
                        <span>Exec: {output.executionTimeMs}ms</span>
                        <span>Memory: {output.memoryMB}MB</span>
                        <span>
                          Passed: {output.passed}/{output.total}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-light-400">Run your code to view output.</p>
                  )}
                </div>

                <div className="rounded-xl border border-primary-200/20 bg-primary-200/8 p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                    <Sparkles className="h-4 w-4" />
                    AI Feedback Panel
                  </div>

                  {output ? (
                    <div className="space-y-3 text-xs text-light-100">
                      <p className="leading-5 text-light-100">{output.aiFeedback.summary}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                          <p className="text-light-400">Time Complexity</p>
                          <p className="mt-1 font-semibold text-white">{output.aiFeedback.timeComplexity}</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                          <p className="text-light-400">Space Complexity</p>
                          <p className="mt-1 font-semibold text-white">{output.aiFeedback.spaceComplexity}</p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-light-400">Best Practices</p>
                        <ul className="space-y-1">
                          {output.aiFeedback.bestPractices.map((practice) => (
                            <li key={practice} className="rounded-lg bg-white/5 px-2 py-1">
                              {practice}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="mb-1 text-light-400">Optimization Suggestions</p>
                        <ul className="space-y-1">
                          {output.aiFeedback.optimizationSuggestions.map((suggestion) => (
                            <li key={suggestion} className="rounded-lg bg-white/5 px-2 py-1">
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                        <p className="text-light-400">Solution Explanation</p>
                        <p className="mt-1 leading-5 text-light-100">{output.aiFeedback.explanation}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-light-300">
                      Submit your solution to receive complexity analysis, optimization advice, and best-practice feedback.
                    </p>
                  )}
                </div>
              </div>
              </div>
            )}

            {isBottomOpen && bottomTab === 'history' && (
              <div className="h-[calc(100%-43px)] overflow-y-auto p-3">
                <div className="rounded-xl border border-white/10 bg-dark-200/70 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-light-300">Submission History</p>
                    <p className="text-[11px] text-light-400">Latest 50 attempts</p>
                  </div>

                  {submissionHistory.length === 0 ? (
                    <p className="text-xs text-light-400">No submissions yet. Submit a solution to start tracking attempts.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead className="text-light-400">
                          <tr className="border-b border-white/10">
                            <th className="px-2 py-2 font-medium">Time</th>
                            <th className="px-2 py-2 font-medium">Question</th>
                            <th className="px-2 py-2 font-medium">Language</th>
                            <th className="px-2 py-2 font-medium">Status</th>
                            <th className="px-2 py-2 font-medium">Runtime</th>
                            <th className="px-2 py-2 font-medium">Passed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissionHistory.map((item) => (
                            <tr key={item.id} className="border-b border-white/5 text-light-200">
                              <td className="px-2 py-2 whitespace-nowrap">{new Date(item.timestamp).toLocaleTimeString()}</td>
                              <td className="px-2 py-2">{item.questionTitle}</td>
                              <td className="px-2 py-2">{CODING_LANGUAGES.find((lang) => lang.value === item.language)?.label ?? item.language}</td>
                              <td className="px-2 py-2">
                                <span className={`rounded-full px-2 py-0.5 text-[11px] ${getStatusClasses(item.status)}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">{item.runtimeMs} ms</td>
                              <td className="px-2 py-2 whitespace-nowrap">{item.passed}/{item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
