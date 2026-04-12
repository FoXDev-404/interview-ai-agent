import { notFound } from 'next/navigation';
import CodingInterviewTopicGate from '@/components/coding/CodingInterviewTopicGate';
import { getInterview } from '@/lib/actions/interview.action';
import { requireAuth } from '@/lib/auth';
import type { CodingLanguage, CodingQuestion } from '@/lib/codingInterview';

export const dynamic = 'force-dynamic';

const ALLOWED_LANGUAGES = new Set(['javascript', 'typescript', 'python', 'java', 'cpp', 'c']);

export default async function CodingInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();

  const { id } = await params;
  const response = await getInterview(id);

  if (!response.success || !response.interview) {
    notFound();
  }

  const interview = response.interview as Interview & {
    codingLanguage?: string;
    codingTopic?: string | null;
    codingQuestions?: CodingQuestion[];
  };

  if (interview.type !== 'Coding') {
    notFound();
  }

  const questions = Array.isArray(interview.codingQuestions) ? interview.codingQuestions : [];
  const language = ALLOWED_LANGUAGES.has(interview.codingLanguage ?? '')
    ? (interview.codingLanguage as CodingLanguage)
    : 'javascript';

  return (
    <CodingInterviewTopicGate
      interviewId={interview.id}
      role={interview.role}
      level={interview.level}
      initialLanguage={language}
      questions={questions}
      initialTopic={interview.codingTopic ?? null}
    />
  );
}
