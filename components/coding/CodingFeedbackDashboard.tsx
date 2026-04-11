'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    CheckCircle2,
    Clock3,
    TrendingUp,
    Target,
    BookOpen,
    RotateCcw,
    Home,
    Zap,
    Brain,
    Code2,
    Bug,
    Sparkles,
    Medal,
    BarChart3,
    Circle,
    ChevronRight,
    AlertTriangle,
} from 'lucide-react';
import type { CodingLanguage, CodingQuestion } from '@/lib/codingInterview';

type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded';

interface SubmissionHistoryItem {
  id: string;
  questionId: string;
  questionTitle: string;
  timestamp: string;
  language: CodingLanguage;
  status: SubmissionStatus;
  runtimeMs: number;
  passed: number;
  total: number;
}

interface QuestionStatus {
  attempted: boolean;
  solved: boolean;
}

interface QuestionSummary {
  bestSubmission: SubmissionHistoryItem | null;
  attempts: number;
  solved: boolean;
  attempted: boolean;
}

interface CodingFeedbackDashboardProps {
  interviewId: string;
  role: string;
  level: string;
  questions: CodingQuestion[];
}

// ---- Sub-components ----

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const progress = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90">
          <circle cx="74" cy="74" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
          <circle
            cx="74"
            cy="74"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-xs text-light-400">/ 100</span>
        </div>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${color}25`, color }}
      >
        {label}
      </span>
    </div>
  );
}

function SkillBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
}) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const colorClass =
    clampedScore >= 75
      ? 'bg-emerald-500'
      : clampedScore >= 50
      ? 'bg-amber-500'
      : 'bg-red-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-light-300">
          {icon}
          {label}
        </div>
        <span className="font-semibold text-white">{clampedScore}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full ${colorClass} transition-all duration-700`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/5 p-4">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${accent ?? 'bg-primary-200/15'}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-light-400">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-light-400/70">{sub}</p>}
    </div>
  );
}

// ---- Main component ----

export default function CodingFeedbackDashboard({
  interviewId,
  role,
  level,
  questions,
}: CodingFeedbackDashboardProps) {
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistoryItem[]>([]);
  const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>({});
  const [timerSecondsElapsed, setTimerSecondsElapsed] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem(`coding-submission-history-${interviewId}`);
    const status = localStorage.getItem(`coding-status-${interviewId}`);
    const timerRaw = localStorage.getItem(`coding-timer-${interviewId}`);

    if (history) setSubmissionHistory(JSON.parse(history));
    if (status) setQuestionStatus(JSON.parse(status));
    if (timerRaw) {
      const remaining = Number(timerRaw);
      const totalAllotted = 75 * 60;
      setTimerSecondsElapsed(Math.max(0, totalAllotted - remaining));
    }
    setLoaded(true);
  }, [interviewId]);

  // ---- Derived data ----

  const totalQuestions = questions.length;

  const questionSummaries = questions.reduce<Record<string, QuestionSummary>>((acc, question) => {
    const qSubs = submissionHistory.filter((submission) => submission.questionId === question.id);
    const attempts = qSubs.length;

    if (qSubs.length === 0) {
      acc[question.id] = {
        bestSubmission: null,
        attempts: 0,
        solved: false,
        attempted: false,
      };
      return acc;
    }

    const ranked = [...qSubs].sort((a, b) => {
      const statusRank = (status: SubmissionStatus) => (status === 'Accepted' ? 4 : status === 'Wrong Answer' ? 3 : status === 'Time Limit Exceeded' ? 2 : 1);
      const aRatio = a.total > 0 ? a.passed / a.total : 0;
      const bRatio = b.total > 0 ? b.passed / b.total : 0;

      return (
        statusRank(b.status) - statusRank(a.status) ||
        b.passed - a.passed ||
        bRatio - aRatio ||
        b.runtimeMs - a.runtimeMs ||
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });

    const bestSubmission = ranked[0] ?? null;
    const solved = Boolean(bestSubmission && bestSubmission.status === 'Accepted');

    acc[question.id] = {
      bestSubmission,
      attempts,
      solved,
      attempted: attempts > 0,
    };

    return acc;
  }, {});

  const attemptsPerQuestion = questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.id] = questionSummaries[question.id]?.attempts ?? 0;
    return acc;
  }, {});

  const solvedCount = Object.values(questionSummaries).filter((summary) => summary.solved).length;
  const attemptedCount = Object.values(questionSummaries).filter((summary) => summary.attempted).length;

  const bestSubmissions = questions.reduce<Record<string, SubmissionHistoryItem | null>>((acc, question) => {
    acc[question.id] = questionSummaries[question.id]?.bestSubmission ?? null;
    return acc;
  }, {});

  const bestRatedQuestions = Object.values(questionSummaries).filter((summary) => summary.bestSubmission !== null);
  const acceptedSubs = bestRatedQuestions
    .map((summary) => summary.bestSubmission)
    .filter((submission): submission is SubmissionHistoryItem => Boolean(submission && submission.status === 'Accepted'));
  const avgRuntime =
    acceptedSubs.length > 0
      ? Math.round(acceptedSubs.reduce((sum, submission) => sum + submission.runtimeMs, 0) / acceptedSubs.length)
      : 0;
  const bestRuntime = acceptedSubs.length > 0 ? Math.min(...acceptedSubs.map((submission) => submission.runtimeMs)) : 0;
  const totalPassed = bestRatedQuestions.reduce((sum, summary) => sum + (summary.bestSubmission?.passed ?? 0), 0);
  const totalTestCases = bestRatedQuestions.reduce((sum, summary) => sum + (summary.bestSubmission?.total ?? 0), 0);

  // Difficulty breakdown
  type DiffGroup = { total: number; solved: number };
  const difficultyGroups = questions.reduce<Record<string, DiffGroup>>((acc, q) => {
    if (!acc[q.difficulty]) acc[q.difficulty] = { total: 0, solved: 0 };
    acc[q.difficulty].total += 1;
    if (questionSummaries[q.id]?.solved) acc[q.difficulty].solved += 1;
    return acc;
  }, {});

  // Overall score
  const solveRatio = totalQuestions > 0 ? solvedCount / totalQuestions : 0;
  const passRate = totalTestCases > 0 ? totalPassed / totalTestCases : 0;
  const consistencyRate = totalQuestions > 0 ? attemptedCount / totalQuestions : 0;

  // Prevent inflated scores when only a small subset of questions is solved.
  const effectivePassRate = passRate * solveRatio;
  const overallScore = Math.min(
    100,
    Math.round(solveRatio * 70 + effectivePassRate * 20 + consistencyRate * 10)
  );

  // Skill scores
  const problemSolvingScore = Math.round(solveRatio * 100);

  const dsTagSet = new Set([
    'Array',
    'Hash Table',
    'Binary Tree',
    'Tree',
    'Linked List',
    'Stack',
    'Queue',
    'Heap',
    'Graph',
    'Matrix',
  ]);
  const dsQuestions = questions.filter((q) => q.tags.some((t) => dsTagSet.has(t)));
  const dsSolved = dsQuestions.filter((q) => questionSummaries[q.id]?.solved).length;
  const dataStructuresScore =
    dsQuestions.length > 0
      ? Math.round((dsSolved / dsQuestions.length) * 100)
      : Math.round(solveRatio * 100);

  const algoEfficiencyScore = Math.round(effectivePassRate * 100);

  const activeAttemptCounts = Object.values(attemptsPerQuestion).filter((n) => n > 0);
  const avgAttempts =
    activeAttemptCounts.length > 0
      ? activeAttemptCounts.reduce((a, b) => a + b, 0) / activeAttemptCounts.length
      : 1;
  const debuggingScore = Math.min(100, Math.max(30, Math.round(100 - Math.max(0, avgAttempts - 1) * 18)));

  const codeQualityScore =
    acceptedSubs.length > 0
      ? Math.min(
          100,
          Math.round(
            45 + solveRatio * 40 + (acceptedSubs.length / Math.max(1, activeAttemptCounts.length)) * 15
          )
        )
      : Math.round(solveRatio * 55);

  // Recommended topics from unsolved questions
  const unsolvedTags = questions
    .filter((q) => !questionStatus[q.id]?.solved)
    .filter((q) => !questionSummaries[q.id]?.solved)
    .flatMap((q) => q.tags);
  const topicFreq = unsolvedTags.reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});
  const recommendedTopics = Object.entries(topicFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([tag]) => tag);

  // AI-derived strengths + improvements
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (solveRatio >= 0.8) {
    strengths.push('Exceptional problem-solving — solved the vast majority of questions under time pressure');
  } else if (solveRatio >= 0.5) {
    strengths.push('Solid fundamentals with a good overall problem-solving approach');
  }
  if (acceptedSubs.length > 0 && avgRuntime < 150) {
    strengths.push('Efficient algorithm choices — consistently fast execution times across accepted solutions');
  }
  if (debuggingScore >= 75) {
    strengths.push('Clean, minimal-attempt solutions — demonstrates strong initial reasoning before coding');
  }
  if (dsSolved > 0) {
    strengths.push('Comfortable applying core data structures (arrays, hash maps, stacks, trees) in context');
  }
  if (strengths.length === 0) {
    strengths.push('Shows persistence and willingness to tackle challenging algorithmic problems');
  }

  if (solveRatio < 0.5) {
    improvements.push('Deepen foundation skills: practice two-pointer, sliding window, and recursion patterns');
  }
  if (algoEfficiencyScore < 60) {
    improvements.push('Study time and space complexity: practice optimising brute-force solutions iteratively');
  }
  if (recommendedTopics.length > 0) {
    improvements.push(
      `Targeted practice in: ${recommendedTopics.slice(0, 3).join(', ')} — these appeared in unsolved questions`
    );
  }
  improvements.push('Study LeetCode problem patterns: identify recurring structures (BFS/DFS, DP, divide & conquer)');
  if (avgAttempts > 2.5) {
    improvements.push('Practice planning and tracing through edge cases before writing code to reduce re-submissions');
  }

  // Time formatting
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const avgTimePerAttempted = attemptedCount > 0 ? Math.round(timerSecondsElapsed / attemptedCount) : 0;

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-transparent" />
      </div>
    );
  }

  const difficultyOrder = ['Easy', 'Medium', 'Hard'] as const;
  const difficultyColors: Record<string, string> = {
    Easy: 'text-emerald-300',
    Medium: 'text-amber-300',
    Hard: 'text-red-300',
  };
  const difficultyBg: Record<string, string> = {
    Easy: 'bg-emerald-500',
    Medium: 'bg-amber-500',
    Hard: 'bg-red-500',
  };

  return (
    <div className="min-h-screen w-full">
      {/* ---- Navbar ---- */}
      <div className="sticky top-0 z-10 border-b border-white/8 bg-dark-100/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={26} height={22} />
            <span className="text-sm font-bold text-primary-100">AI MockPrep</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/coding-interview/${interviewId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-light-300 transition hover:bg-white/5"
            >
              Review Solutions
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200/40 bg-primary-200/10 px-3 py-1.5 text-xs text-primary-200 transition hover:bg-primary-200/20"
            >
              <Home className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* ---- Hero / Score ---- */}
        <div className="interview-glass overflow-hidden">
          <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:gap-8">
            <ScoreRing score={overallScore} />

            <div className="flex-1 text-center sm:text-left">
              <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                <Medal className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Interview Complete</span>
              </div>
              <h1 className="text-3xl font-bold text-white">{role}</h1>
              <p className="mt-1 text-sm text-light-400">
                {level} level · {totalQuestions} questions · Coding round
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{solvedCount}</p>
                  <p className="text-[11px] text-light-400">Solved</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xl font-bold text-amber-400">{attemptedCount}</p>
                  <p className="text-[11px] text-light-400">Attempted</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xl font-bold text-blue-400">{formatTime(timerSecondsElapsed)}</p>
                  <p className="text-[11px] text-light-400">Time Used</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Question-wise table ---- */}
        <div className="interview-glass p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-200" />
            <h2 className="text-lg font-semibold text-white">Question Performance</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/5">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-light-400">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-light-400">Question</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-light-400">Difficulty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-light-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-light-400">Tests</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-light-400">Attempts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-light-400">Runtime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {questions.map((q, idx) => {
                  const best = bestSubmissions[q.id];
                  const status = questionSummaries[q.id];
                  const attempts = attemptsPerQuestion[q.id] ?? 0;
                  const isSolved = status?.solved;
                  const isAttempted = status?.attempted;

                  return (
                    <tr key={q.id} className="transition hover:bg-white/3">
                      <td className="px-4 py-3 text-xs text-light-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-white">{q.title}</p>
                          <p className="text-[11px] text-light-400">{q.tags.slice(0, 2).join(', ')}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${difficultyColors[q.difficulty] ?? 'text-light-400'}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isSolved ? (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Accepted</span>
                          </div>
                        ) : isAttempted ? (
                          <div className="flex items-center gap-1 text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs font-medium">{best?.status ?? 'Attempted'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-light-400">
                            <Circle className="h-4 w-4" />
                            <span className="text-xs font-medium">Not Attempted</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-light-300">
                        {best ? `${best.passed}/${best.total}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-light-300">
                        {attempts > 0 ? attempts : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-light-300">
                        {best ? `${best.runtimeMs}ms` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- Metrics row ---- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Avg Runtime"
            value={acceptedSubs.length > 0 ? `${avgRuntime}ms` : '—'}
            sub="across accepted submissions"
            icon={<Zap className="h-4 w-4 text-yellow-300" />}
            accent="bg-yellow-400/15"
          />
          <StatCard
            label="Best Runtime"
            value={acceptedSubs.length > 0 ? `${bestRuntime}ms` : '—'}
            sub="single fastest execution"
            icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
            accent="bg-emerald-500/15"
          />
          <StatCard
            label="Test Cases Passed"
            value={totalTestCases > 0 ? `${totalPassed}/${totalTestCases}` : '0/0'}
            sub={totalTestCases > 0 ? `${Math.round((totalPassed / totalTestCases) * 100)}% pass rate` : 'no submissions'}
            icon={<Target className="h-4 w-4 text-blue-400" />}
            accent="bg-blue-500/15"
          />
          <StatCard
            label="Total Submissions"
            value={submissionHistory.length}
            sub={`${acceptedSubs.length} accepted`}
            icon={<Code2 className="h-4 w-4 text-purple-400" />}
            accent="bg-purple-500/15"
          />
        </div>

        {/* ---- AI Feedback ---- */}
        <div className="interview-glass p-6">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-200" />
            <h2 className="text-lg font-semibold text-white">AI Performance Analysis</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-emerald-400">Strengths</p>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-light-100">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-400">Areas for Improvement</p>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-light-100">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ---- Skill breakdown + Time management row ---- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Skill Breakdown */}
          <div className="interview-glass p-6">
            <div className="mb-5 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary-200" />
              <h2 className="text-lg font-semibold text-white">Skill Breakdown</h2>
            </div>
            <div className="space-y-4">
              <SkillBar
                label="Problem Solving"
                score={problemSolvingScore}
                icon={<Target className="h-3.5 w-3.5" />}
              />
              <SkillBar
                label="Data Structures"
                score={dataStructuresScore}
                icon={<Code2 className="h-3.5 w-3.5" />}
              />
              <SkillBar
                label="Algorithm Efficiency"
                score={algoEfficiencyScore}
                icon={<Zap className="h-3.5 w-3.5" />}
              />
              <SkillBar
                label="Debugging"
                score={debuggingScore}
                icon={<Bug className="h-3.5 w-3.5" />}
              />
              <SkillBar
                label="Code Quality"
                score={codeQualityScore}
                icon={<Sparkles className="h-3.5 w-3.5" />}
              />
            </div>
          </div>

          {/* Difficulty + Time */}
          <div className="space-y-6">
            {/* Difficulty Breakdown */}
            <div className="interview-glass p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-200" />
                <h2 className="text-base font-semibold text-white">Difficulty Breakdown</h2>
              </div>
              <div className="space-y-3">
                {difficultyOrder.map((diff) => {
                  const group = difficultyGroups[diff];
                  if (!group) return null;
                  const pct = Math.round((group.solved / group.total) * 100);
                  return (
                    <div key={diff} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${difficultyColors[diff]}`}>{diff}</span>
                        <span className="text-light-400">
                          {group.solved}/{group.total} solved ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full ${difficultyBg[diff]} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Management */}
            <div className="interview-glass p-6">
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-primary-200" />
                <h2 className="text-base font-semibold text-white">Time Management</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">{formatTime(timerSecondsElapsed)}</p>
                  <p className="text-[11px] text-light-400">Total time used</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {attemptedCount > 0 ? formatTime(avgTimePerAttempted) : '—'}
                  </p>
                  <p className="text-[11px] text-light-400">Avg per question</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">{formatTime(75 * 60)}</p>
                  <p className="text-[11px] text-light-400">Total allotted</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {Math.round((timerSecondsElapsed / (75 * 60)) * 100)}%
                  </p>
                  <p className="text-[11px] text-light-400">Time used</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Recommended topics ---- */}
        {recommendedTopics.length > 0 && (
          <div className="interview-glass p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-200" />
              <h2 className="text-lg font-semibold text-white">Recommended Practice Topics</h2>
            </div>
            <p className="mb-4 text-sm text-light-400">
              Based on unsolved questions, focus your practice on these areas:
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendedTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-primary-200/30 bg-primary-200/10 px-3 py-1.5 text-sm font-medium text-primary-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ---- Action buttons ---- */}
        <div className="interview-glass p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">What&apos;s Next?</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/coding-interview/${interviewId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200/40 bg-primary-200/10 px-5 py-2.5 text-sm font-semibold text-primary-200 transition hover:bg-primary-200/20"
            >
              <Code2 className="h-4 w-4" />
              Review Solutions
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-light-300 transition hover:bg-white/10"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <Link
              href="/interview"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
            >
              <RotateCcw className="h-4 w-4" />
              New Interview
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
