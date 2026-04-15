import { getFeedbackByInterview } from "@/lib/actions/feedback.action";
import { getInterview } from "@/lib/actions/interview.action";
import { notFound } from "next/navigation";
import FeedbackDisplay from "@/components/FeedbackDisplay";
import { requireAuth } from "@/lib/auth";
import GenerateFeedbackButton from "@/components/GenerateFeedbackButton";
import Image from "next/image";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const FeedbackPage = async ({ params }: Props) => {
  const user = await requireAuth();

  const resolvedParams = await params;
  const [interviewResult, feedbackResult] = await Promise.all([
    getInterview(resolvedParams.id, user.uid),
    getFeedbackByInterview(resolvedParams.id, user.uid),
  ]);

  if (!interviewResult.success || !interviewResult.interview) {
    notFound();
  }

  if (!feedbackResult.success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="interview-glass p-10 md:p-12 max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "rgba(202, 197, 254, 0.08)",
              border: "1px solid rgba(202, 197, 254, 0.12)",
            }}
          >
            <Image
              src="/ai-avatar.png"
              alt="AI"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.15)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-[11px] font-medium text-amber-400/90 tracking-wide">
              Pending Analysis
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Interview Completed
          </h2>
          <p className="text-sm text-light-400 mb-8 leading-relaxed max-w-xs mx-auto">
            Your interview session is complete. Generate your AI-powered
            feedback to see detailed performance insights.
          </p>
          <GenerateFeedbackButton
            interviewId={resolvedParams.id}
            userId={user.uid}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FeedbackDisplay
        interview={interviewResult.interview}
        feedback={feedbackResult.feedback!}
      />
    </div>
  );
};

export default FeedbackPage;
