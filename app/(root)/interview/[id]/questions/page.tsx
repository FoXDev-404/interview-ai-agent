import { getInterview } from "@/lib/actions/interview.action";
import { notFound } from "next/navigation";
import InterviewQuestions from "@/components/InterviewQuestions";
import { requireAuth } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const InterviewQuestionsPage = async ({ params }: Props) => {
  const user = await requireAuth();
  const resolvedParams = await params;
  const result = await getInterview(resolvedParams.id, user.uid);

  if (!result.success || !result.interview) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <InterviewQuestions interview={result.interview} />
    </div>
  );
};

export default InterviewQuestionsPage;
