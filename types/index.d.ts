interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  // Enhanced feedback from real-time analysis
  performanceLevel?: string;
  hiringRecommendation?: string;
  keyStrengths?: string[];
  improvementAreas?: string[];
  nextSteps?: string[];
  interviewerNotes?: string;
  detailedAnalysis?: {
    technical: number;
    communication: number;
    problemSolving: number;
    overallKnowledge: number;
  };
  rubricSummary?: {
    technical_accuracy: number;
    clarity_structure: number;
    problem_solving: number;
    depth_of_knowledge: number;
    keyword_match_score: number;
    penalties_applied: number;
    difficulty_adjustment: number;
    total_score: number;
  };
  speechCoach?: InterviewSpeechCoachSummary;
}

interface InterviewSpeechCoachSummary {
  analyzedResponses: number;
  confidence: number;
  tone: number;
  clarity: number;
  pacing: number;
  fillerControl: number;
  overall: number;
  totalFillerWords: number;
  topFillerWords: string[];
  averageWpm: number;
  insights: string[];
  recommendations: string[];
}

interface Interview {
  id: string;
  company?: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  codingLanguage?: string;
  codingTopic?: string;
  codingQuestions?: unknown[];
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
  speechCoachSummary?: InterviewSpeechCoachSummary;
  finalAnalysis?: {
    overallScore: number;
    totalQuestions: number;
    answeredQuestions: number;
    averageScore: number;
    finalFeedback: string;
    performanceLevel: string;
    detailedAnalysis: {
      technical: number;
      communication: number;
      problemSolving: number;
      overallKnowledge: number;
    };
    keyStrengths: string[];
    improvementAreas: string[];
    hiringRecommendation: string;
    nextSteps: string[];
    interviewerNotes: string;
    rubricSummary?: {
      technical_accuracy: number;
      clarity_structure: number;
      problem_solving: number;
      depth_of_knowledge: number;
      keyword_match_score: number;
      penalties_applied: number;
      difficulty_adjustment: number;
      total_score: number;
    };
  };
}

interface User {
  name: string;
  email: string;
  id: string;
  avatar?: string | null;
  interviewsCompleted?: number;
  totalScore?: number;
  averageScore?: number;
  leaderboardScore?: number;
  streak?: number;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  email: string;
  avatar?: string | null;
  interviewsCompleted: number;
  totalScore: number;
  averageScore: number;
  leaderboardScore: number;
  streak: number;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password?: string; // Make password optional for verified email sign-up
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}
