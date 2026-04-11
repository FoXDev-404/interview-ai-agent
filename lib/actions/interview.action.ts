'use server';

import { db } from "@/firebase/admin";
import { generateQuestions } from "@/lib/serverQuestions";
import { generateCodingQuestionSet, type CodingLanguage } from "@/lib/codingInterview";

export async function createInterview(params: {
  userId: string;
  role: string;
  level: string;
  techstack: string[];
  type: string;
}) {
  const { userId, role, level, techstack, type } = params;

  try {
    // Generate interview questions based on role, level, tech stack, and type
    const questions = await generateQuestions(role, level, techstack, type);
    
    const interviewData = {
      userId,
      role,
      level,
      techstack,
      type,
      questions,
      finalized: false,
      createdAt: new Date().toISOString(),
    };

    // Create interview document in Firestore
    const docRef = await db.collection('interviews').add(interviewData);

    return {
      success: true,
      interviewId: docRef.id,
      message: 'Interview created successfully'
    };

  } catch (error) {
    console.error('Error creating interview:', error);
    return {
      success: false,
      message: 'Failed to create interview'
    };
  }
}

export async function createCodingInterview(params: {
  userId: string;
  role: string;
  level: string;
  language: CodingLanguage;
}) {
  const { userId, role, level, language } = params;

  try {
    const codingQuestions = generateCodingQuestionSet({ role, level, language });

    const interviewData = {
      userId,
      role,
      level,
      techstack: [language],
      type: 'Coding',
      codingLanguage: language,
      codingTopic: null,
      // Serialize to a JSON string to avoid Firestore's nested-array restriction
      // (DesignTestCase.parameters is unknown[][], which Firestore rejects)
      codingQuestions: JSON.stringify(codingQuestions),
      questions: codingQuestions.map((question) => question.title),
      finalized: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('interviews').add(interviewData);

    return {
      success: true,
      interviewId: docRef.id,
      message: 'Coding interview created successfully',
    };
  } catch (error) {
    console.error('Error creating coding interview:', error);
    return {
      success: false,
      message: 'Failed to create coding interview',
    };
  }
}

export async function getInterview(interviewId: string) {
  try {
    const doc = await db.collection('interviews').doc(interviewId).get();
    
    if (!doc.exists) {
      return {
        success: false,
        message: 'Interview not found'
      };
    }

    const data = doc.data()!;
    // Parse codingQuestions back from JSON string if it was serialized on save
    if (typeof data.codingQuestions === 'string') {
      try {
        data.codingQuestions = JSON.parse(data.codingQuestions);
      } catch {
        data.codingQuestions = [];
      }
    }
    return {
      success: true,
      interview: { id: doc.id, ...data } as Interview,
    };

  } catch (error) {
    console.error('Error fetching interview:', error);
    return {
      success: false,
      message: 'Failed to fetch interview'
    };
  }
}

export async function setCodingInterviewTopic(interviewId: string, codingTopic: string | null) {
  try {
    await db.collection('interviews').doc(interviewId).update({
      codingTopic,
    });

    return {
      success: true,
      message: 'Coding topic saved successfully',
    };
  } catch (error) {
    console.error('Error saving coding topic:', error);
    return {
      success: false,
      message: 'Failed to save coding topic',
    };
  }
}

export async function getUserInterviews(userId: string) {
  try {
    const snapshot = await db.collection('interviews')
      .where('userId', '==', userId)
      .get();

    const interviews = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as Interview[];

    // Sort by createdAt in JavaScript instead of Firestore
    interviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      interviews
    };

  } catch (error) {
    console.error('Error fetching user interviews:', error);
    return {
      success: false,
      interviews: []
    };
  }
}

export async function finalizeInterview(interviewId: string) {
  try {
    await db.collection('interviews').doc(interviewId).update({
      finalized: true
    });

    return {
      success: true,
      message: 'Interview finalized successfully'
    };

  } catch (error) {
    console.error('Error finalizing interview:', error);
    return {
      success: false,
      message: 'Failed to finalize interview'
    };
  }
}
