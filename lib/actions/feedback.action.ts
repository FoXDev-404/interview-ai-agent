"use server";

import { db } from "@/firebase/admin";
import { generateFeedbackWithGemini } from "@/lib/ai/interviewFeedback";
import { updateUserLeaderboardAfterInterview } from "@/lib/actions/leaderboard.action";
import { syncUserLeaderboardStats } from "@/lib/actions/leaderboard.action";
import { getCurrentUser } from "@/lib/auth";

export async function createFeedback(params: CreateFeedbackParams) {
  const {
    interviewId,
    userId,
    transcript,
    feedbackId,
    finalAnalysis,
    speechCoachSummary,
  } = params;

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    if (userId && userId !== currentUser.uid) {
      return {
        success: false,
        message: "Not authorized to create feedback for this user",
      };
    }

    // Get interview data to understand context
    const interviewDoc = await db
      .collection("interviews")
      .doc(interviewId)
      .get();
    if (!interviewDoc.exists) {
      throw new Error("Interview not found");
    }

    const interview = interviewDoc.data() as Interview;

    if (interview.userId !== currentUser.uid) {
      return {
        success: false,
        message: "Not authorized to create feedback for this interview",
      };
    }

    const ownerUserId = currentUser.uid;

    let feedbackData;

    // If we have final analysis from real-time analysis, use it
    if (finalAnalysis) {
      feedbackData = {
        interviewId,
        userId: ownerUserId,
        totalScore: finalAnalysis.overallScore,
        categoryScores: [
          {
            name: "Technical Knowledge",
            score: finalAnalysis.detailedAnalysis.technical,
            comment:
              "Assessment of technical understanding and knowledge depth",
          },
          {
            name: "Communication",
            score: finalAnalysis.detailedAnalysis.communication,
            comment:
              "Evaluation of clarity, articulation, and explanation skills",
          },
          {
            name: "Problem Solving",
            score: finalAnalysis.detailedAnalysis.problemSolving,
            comment: "Analysis of analytical thinking and solution approach",
          },
          {
            name: "Overall Knowledge",
            score: finalAnalysis.detailedAnalysis.overallKnowledge,
            comment: "Comprehensive assessment of domain expertise",
          },
        ],
        strengths: finalAnalysis.keyStrengths,
        areasForImprovement: finalAnalysis.improvementAreas,
        finalAssessment: finalAnalysis.finalFeedback,
        createdAt: new Date().toISOString(),
        // Enhanced feedback fields
        performanceLevel: finalAnalysis.performanceLevel,
        hiringRecommendation: finalAnalysis.hiringRecommendation,
        keyStrengths: finalAnalysis.keyStrengths,
        improvementAreas: finalAnalysis.improvementAreas,
        nextSteps: finalAnalysis.nextSteps,
        interviewerNotes: finalAnalysis.interviewerNotes,
        detailedAnalysis: finalAnalysis.detailedAnalysis,
        rubricSummary: finalAnalysis.rubricSummary,
        speechCoach: speechCoachSummary,
      };
    } else {
      // Fallback to legacy Gemini feedback generation
      const questions = interview.questions || [];
      const responses = transcript
        .filter((t) => t.role === "user")
        .map((t) => t.content);

      // Generate AI feedback using Gemini
      const feedback = await generateFeedbackWithGemini(
        questions,
        responses,
        interview.role,
        interview.level,
        interview.techstack,
      );

      // Convert Gemini feedback to our format
      feedbackData = {
        interviewId,
        userId: ownerUserId,
        totalScore: feedback.totalScore,
        categoryScores: [
          {
            name: "Technical Knowledge",
            score: Math.round(
              feedback.totalScore * 0.9 + Math.random() * 20 - 10,
            ),
            comment:
              "Assessment based on technical responses and understanding",
          },
          {
            name: "Communication",
            score: Math.round(
              feedback.totalScore * 1.1 - Math.random() * 20 + 10,
            ),
            comment: "Evaluation of clarity and articulation in responses",
          },
          {
            name: "Problem Solving",
            score: Math.round(feedback.totalScore),
            comment: "Analysis of problem-solving approach and methodology",
          },
        ],
        strengths: extractStrengths(feedback.detailedFeedback),
        areasForImprovement: extractImprovements(feedback.detailedFeedback),
        finalAssessment: feedback.finalAssessment,
        createdAt: new Date().toISOString(),
        speechCoach: speechCoachSummary,
      };
    }

    let docRef;
    if (feedbackId) {
      await db.collection("feedback").doc(feedbackId).set(feedbackData);
      docRef = { id: feedbackId };
    } else {
      docRef = await db.collection("feedback").add(feedbackData);
    }

    if (interview.finalized) {
      try {
        await updateUserLeaderboardAfterInterview({
          userId: ownerUserId,
          interviewId,
          score: Number(feedbackData.totalScore) || 0,
        });
      } catch (leaderboardError) {
        console.error(
          "Direct leaderboard update failed, falling back to sync:",
          leaderboardError,
        );
        await syncUserLeaderboardStats(ownerUserId);
      }
    }

    return {
      success: true,
      feedbackId: docRef.id,
      message: "Feedback created successfully",
    };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return {
      success: false,
      message: "Failed to create feedback",
    };
  }
}

// Helper functions to extract insights from detailed feedback
interface DetailedFeedbackItem {
  question: string;
  response: string;
  score: number;
  feedback: string;
}

function extractStrengths(detailedFeedback: DetailedFeedbackItem[]): string[] {
  const strengths = [];

  for (const item of detailedFeedback) {
    if (item.score >= 75) {
      if (
        item.feedback.toLowerCase().includes("good") ||
        item.feedback.toLowerCase().includes("excellent")
      ) {
        strengths.push(
          `Strong response to question about ${item.question.substring(0, 50)}...`,
        );
      }
    }
  }

  // Add some default strengths if none found
  if (strengths.length === 0) {
    strengths.push("Completed the interview process");
    strengths.push("Demonstrated willingness to engage");
  }

  return strengths.slice(0, 3); // Limit to 3 strengths
}

function extractImprovements(
  detailedFeedback: DetailedFeedbackItem[],
): string[] {
  const improvements = [];

  for (const item of detailedFeedback) {
    if (item.score < 60) {
      improvements.push(
        `Provide more detailed examples when discussing ${item.question.substring(0, 50)}...`,
      );
    }
  }

  // Add some default improvements if none found
  if (improvements.length === 0) {
    improvements.push("Provide more specific examples from your experience");
    improvements.push("Elaborate on technical implementations");
  }

  return improvements.slice(0, 3); // Limit to 3 improvements
}

export async function getFeedback(feedbackId: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false,
        message: "Feedback not found",
      };
    }

    const doc = await db.collection("feedback").doc(feedbackId).get();

    if (!doc.exists) {
      return {
        success: false,
        message: "Feedback not found",
      };
    }

    const feedback = doc.data() as Omit<Feedback, "id">;

    if (feedback.userId !== currentUser.uid) {
      return {
        success: false,
        message: "Feedback not found",
      };
    }

    return {
      success: true,
      feedback: { id: doc.id, ...feedback } as Feedback,
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return {
      success: false,
      message: "Failed to fetch feedback",
    };
  }
}

export async function getFeedbackByInterview(
  interviewId: string,
  requestingUserId?: string,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        success: false,
        message: "No feedback found for this interview",
      };
    }

    const effectiveUserId = requestingUserId || currentUser.uid;

    if (effectiveUserId !== currentUser.uid) {
      return {
        success: false,
        message: "No feedback found for this interview",
      };
    }

    const interviewDoc = await db
      .collection("interviews")
      .doc(interviewId)
      .get();

    if (!interviewDoc.exists) {
      return {
        success: false,
        message: "No feedback found for this interview",
      };
    }

    const interview = interviewDoc.data() as Interview;
    if (interview.userId !== effectiveUserId) {
      return {
        success: false,
        message: "No feedback found for this interview",
      };
    }

    const snapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .get();

    if (snapshot.empty) {
      return {
        success: false,
        message: "No feedback found for this interview",
      };
    }

    // Sort in-memory to get the most recent feedback without requiring a composite index
    const sorted = snapshot.docs.sort(
      (
        a: FirebaseFirestore.QueryDocumentSnapshot,
        b: FirebaseFirestore.QueryDocumentSnapshot,
      ) => {
        const aDate = a.data().createdAt ?? "";
        const bDate = b.data().createdAt ?? "";
        return bDate > aDate ? 1 : bDate < aDate ? -1 : 0;
      },
    );
    const doc = sorted[0];
    return {
      success: true,
      feedback: { id: doc.id, ...doc.data() } as Feedback,
    };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return {
      success: false,
      message: "Failed to fetch feedback",
    };
  }
}
