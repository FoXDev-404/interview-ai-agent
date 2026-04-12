'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, ChevronRight, Clock3, Flag, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';
import CodingInterviewWorkspace from '@/components/coding/CodingInterviewWorkspace';
import { setCodingInterviewTopic } from '@/lib/actions/interview.action';
import {
  filterCodingQuestionsByTopic,
  getCodingTopicsWithCounts,
  type CodingLanguage,
  type CodingQuestion,
} from '@/lib/codingInterview';

interface CodingInterviewTopicGateProps {
  interviewId: string;
  role: string;
  level: string;
  initialLanguage: CodingLanguage;
  questions: CodingQuestion[];
  initialTopic?: string | null;
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

export default function CodingInterviewTopicGate({
  interviewId,
  role,
  level,
  initialLanguage,
  questions,
  initialTopic = null,
}: CodingInterviewTopicGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialTopic);
  const [savingTopicId, setSavingTopicId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string; photoURL?: string } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(75 * 60);

  const topics = useMemo(() => getCodingTopicsWithCounts(questions), [questions]);
  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? null,
    [selectedTopicId, topics]
  );

  const selectedQuestions = useMemo(
    () => (selectedTopicId ? filterCodingQuestionsByTopic(questions, selectedTopicId, Number.POSITIVE_INFINITY) : []),
    [questions, selectedTopicId]
  );

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const savedTimer = localStorage.getItem(`coding-timer-${interviewId}`);
    if (savedTimer) {
      setRemainingSeconds(Math.max(0, Number(savedTimer)));
    }
  }, [interviewId]);

  const renderCodingNavbar = () => (
    <div className="fixed left-0 right-0 top-0 z-50 px-4 pt-2 sm:px-6 lg:px-8">
      <div className="h-12 rounded-xl border border-white/8 bg-dark-100/95 px-3 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={26} height={22} />
            <span className="text-sm font-bold text-primary-100">AI MockPrep</span>
          </Link>
          <span className="hidden sm:inline rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-light-300">
            Topic Selection
          </span>
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
    </div>
  );

  const persistTopic = async (topicId: string | null) => {
    const result = await setCodingInterviewTopic(interviewId, topicId);
    if (!result.success) {
      throw new Error(result.message);
    }
  };

  const handleSelectTopic = async (topicId: string) => {
    if (savingTopicId) return;

    const topic = topics.find((item) => item.id === topicId);
    if (!topic || topic.questionCount === 0) {
      toast.info('Questions for this topic are coming soon.');
      return;
    }

    setSavingTopicId(topicId);
    try {
      await persistTopic(topicId);
      setSelectedTopicId(topicId);
      router.replace(`${pathname}?topic=${topicId}`, { scroll: false });
      toast.success(`Loaded ${topic.label} interview set`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save topic');
    } finally {
      setSavingTopicId(null);
    }
  };

  const handleClearTopic = async () => {
    if (savingTopicId) return;

    setSavingTopicId('clearing');
    try {
      await persistTopic(null);
      setSelectedTopicId(null);
      router.replace(pathname, { scroll: false });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset topic');
    } finally {
      setSavingTopicId(null);
    }
  };

  if (selectedTopic && selectedQuestions.length > 0) {
    return (
      <div className="space-y-4 px-4 pb-6 pt-0 sm:px-6 lg:px-8">
        <CodingInterviewWorkspace
          interviewId={interviewId}
          role={role}
          level={level}
          initialLanguage={initialLanguage}
          questions={selectedQuestions}
          selectedTopicLabel={selectedTopic.label}
          onChangeTopic={handleClearTopic}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-16 sm:px-6 lg:px-8">
      {renderCodingNavbar()}

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-indigo-900/40 p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-0 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
              <Target className="h-3.5 w-3.5" />
              Choose a LeetCode-style topic
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-5xl">
              Pick a topic first, then solve a focused coding set.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-light-300 md:text-lg">
              Topics are grouped like LeetCode so you can practice exactly the pattern you want, from arrays and strings
              to dynamic programming, graphs, stacks, trees, and design problems.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-blue-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              Session snapshot
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <span className="text-sm text-light-400">Role</span>
                <span className="text-sm font-semibold text-white">{role}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <span className="text-sm text-light-400">Level</span>
                <span className="text-sm font-semibold text-white">{level}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-light-400">Curated question cap</span>
                <span className="text-sm font-semibold text-white">All available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-300" />
          <h2 className="text-xl font-bold text-white">Topic list</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {topics.map((topic) => {
            const isDisabled = topic.questionCount === 0;
            const isLoading = savingTopicId === topic.id;

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectTopic(topic.id)}
                disabled={isDisabled || savingTopicId !== null}
                className={`group rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-1 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                  isDisabled
                    ? 'border-white/8 bg-white/5 opacity-55'
                    : 'border-white/10 bg-gray-900/55 hover:border-blue-400/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-light-400">
                      Topic
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{topic.label}</h3>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                    <p className="text-xl font-bold text-white">{topic.questionCount}</p>
                    <p className="text-[11px] text-light-400">questions</p>
                  </div>
                </div>

                <p className="mt-4 min-h-[3.5rem] text-sm leading-6 text-light-400">{topic.description}</p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-light-400">
                    {isDisabled ? 'Coming soon' : `Ready to solve ${topic.questionCount} questions`}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5">
                    {isLoading ? 'Loading' : isDisabled ? 'Locked' : 'Start'}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}