'use server';

import { loadQuestionsFromCSV, generateFallbackCSVQuestions } from './csvQuestions';

export const generateQuestions = async (
  role: string,
  level: string,
  techstack: string[],
  type: string = 'Technical'
): Promise<string[]> => {
  // Load questions from CSV file
  const csvQuestions = await loadQuestionsFromCSV(role, level, techstack, type);

  // If CSV has matching questions, return them
  if (csvQuestions.length > 0) {
    return csvQuestions;
  }

  // Fallback to generated questions if CSV doesn't have matches
  console.warn('No matching questions found in CSV, using fallback questions');
  return await generateFallbackCSVQuestions(role, level, techstack);
};
