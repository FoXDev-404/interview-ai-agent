'use server';

import fs from 'fs';
import path from 'path';

export async function loadQuestionsFromCSV(
  role: string,
  level: string,
  techStack: string[],
  type: string
): Promise<string[]> {
  try {
    // Load CSV file from public folder
    const filePath = path.join(process.cwd(), 'public', 'interview-questions.csv');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`CSV file not found at ${filePath}`);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const questions: string[] = [];
    
    // Parse CSV (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle CSV parsing with potential quoted fields
      const fields = lines[i].split(',');
      if (fields.length < 5) continue;
      
      const csvRole = fields[0].trim();
      const csvLevel = fields[1].trim();
      const csvTechstack = fields[2].trim();
      const csvType = fields[3].trim();
      const question = fields.slice(4).join(',').trim(); // In case question has commas
      
      // Match based on role, level, type, and tech stack
      if (csvRole.toLowerCase() === role.toLowerCase() &&
          csvLevel.toLowerCase() === level.toLowerCase() &&
          csvType.toLowerCase() === type.toLowerCase()) {
        
        const techs = csvTechstack.split(';').map(t => t.trim().toLowerCase());
        const techStackLower = techStack.map(t => t.toLowerCase());
        
        // Check if at least one tech matches
        if (techStackLower.some(t => techs.includes(t)) || techs.length === 0) {
          questions.push(question);
        }
      }
    }
    
    console.log(`Loaded ${questions.length} questions from CSV for ${role} (${level})`);
    return questions.length > 0 ? questions.slice(0, 10) : [];
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