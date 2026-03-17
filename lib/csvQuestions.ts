'use server';

import fs from 'fs';
import path from 'path';

type CsvQuestionCandidate = {
  question: string;
  techs: string[];
};

const QUESTION_LIMIT = 10;

function normalizeInterviewType(type: string): 'technical' | 'behavioral' | 'mixed' {
  const normalized = type.trim().toLowerCase();
  if (normalized === 'behavioral') return 'behavioral';
  if (normalized === 'mixed') return 'mixed';
  return 'technical';
}

function getCsvFileNameForType(type: string): string {
  const normalizedType = normalizeInterviewType(type);

  if (normalizedType === 'behavioral') {
    return 'final_20k_behavioral_cleaned.csv';
  }

  if (normalizedType === 'mixed') {
    return 'final_20k_mixed_cleaned.csv';
  }

  return 'final_20k_technical_cleaned.csv';
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function pickQuestionsWithCoverage(
  candidates: CsvQuestionCandidate[],
  selectedTechs: string[],
  limit: number
): string[] {
  if (candidates.length === 0) return [];

  const selected: string[] = [];
  const selectedSet = new Set<string>();
  const randomizedCandidates = shuffleArray(candidates);

  // Ensure each selected tech is represented at least once when possible.
  for (const tech of selectedTechs) {
    const matchingPool = shuffleArray(
      randomizedCandidates.filter(
        (candidate) => candidate.techs.includes(tech) && !selectedSet.has(candidate.question)
      )
    );

    if (matchingPool.length > 0) {
      const chosen = matchingPool[0].question;
      selected.push(chosen);
      selectedSet.add(chosen);

      if (selected.length >= limit) {
        return selected;
      }
    }
  }

  // Fill remaining slots randomly while keeping unique questions.
  for (const candidate of randomizedCandidates) {
    if (selectedSet.has(candidate.question)) continue;

    selected.push(candidate.question);
    selectedSet.add(candidate.question);

    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
}

export async function loadQuestionsFromCSV(
  role: string,
  level: string,
  techStack: string[],
  type: string
): Promise<string[]> {
  try {
    // Pick source CSV by selected interview type.
    const csvFileName = getCsvFileNameForType(type);
    const filePath = path.join(process.cwd(), 'public', csvFileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`CSV file not found at ${filePath}`);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const strictMatches: CsvQuestionCandidate[] = [];
    const techMatches: CsvQuestionCandidate[] = [];
    const typeMatches: CsvQuestionCandidate[] = [];
    const normalizedType = normalizeInterviewType(type);
    const normalizedRole = role.trim().toLowerCase();
    const normalizedLevel = level.trim().toLowerCase();
    const techStackLower = techStack.map((t) => t.toLowerCase());
    
    // Parse CSV (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle CSV parsing with potential quoted fields
      const fields = lines[i].split(',');
      if (fields.length < 5) continue;
      
      const csvRole = fields[0].trim().toLowerCase();
      const csvLevel = fields[1].trim().toLowerCase();
      const csvTechstack = fields[2].trim();
      const csvType = fields[3].trim().toLowerCase();
      const question = fields.slice(4).join(',').trim(); // In case question has commas
      if (!question) continue;

      if (csvType !== normalizedType) continue;

      const techs = csvTechstack
        .split(';')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const candidate: CsvQuestionCandidate = {
        question,
        techs,
      };

      typeMatches.push(candidate);

      const hasTechMatch =
        techStackLower.length === 0 ||
        techs.length === 0 ||
        techStackLower.some((t) => techs.includes(t));

      if (hasTechMatch) {
        techMatches.push(candidate);
      }
      
      // Match based on role, level, type, and tech stack
      if (
        csvRole === normalizedRole &&
        csvLevel === normalizedLevel &&
        hasTechMatch
      ) {
        strictMatches.push(candidate);
      }
    }

    const selectedPool =
      strictMatches.length > 0
        ? strictMatches
        : techMatches.length > 0
          ? techMatches
          : typeMatches;

    const selectedQuestions = pickQuestionsWithCoverage(
      selectedPool,
      techStackLower,
      QUESTION_LIMIT
    );
    
    console.log(
      `Loaded ${selectedQuestions.length} questions from ${csvFileName} for ${role} (${level}, ${type})`
    );
    return selectedQuestions;
  } catch (error) {
    console.error('Error loading questions from CSV:', error);
    return [];
  }
}

// Fallback function if CSV loading fails
export async function generateFallbackCSVQuestions(
  role: string,
  level: string,
  techStack: string[]
): Promise<string[]> {
  const questions = [
    `Tell me about yourself and your experience with ${role} development.`,
    `What interests you about this ${role} position?`,
    "Describe a challenging project you've worked on.",
    `What is your experience with ${techStack[0] || 'the required technologies'}?`,
    `How do you approach debugging issues in ${techStack[0] || 'your tech stack'}?`,
    "How do you stay updated with new technologies?",
    "Describe a time you worked with a difficult team member.",
    "How do you handle tight deadlines?",
  ];
  
  return questions.slice(0, 8);
}