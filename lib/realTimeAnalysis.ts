import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey =
  process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GOOGLE_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  "";

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AnswerAnalysis {
  score: number; // 0-10 scale
  feedback: string;
  correctAnswer: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rubric?: {
    technical_accuracy: number;
    clarity_structure: number;
    problem_solving: number;
    depth_of_knowledge: number;
    keyword_match_score: number;
    penalties_applied: number;
    difficulty_adjustment: number;
    total_score: number;
  };
}

export interface InterviewAnalysis {
  overallScore: number; // 0-100 scale
  totalQuestions: number;
  answeredQuestions: number;
  averageScore: number;
  finalFeedback: string;
  performanceLevel: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor';
  detailedAnalysis: {
    technical: number;
    communication: number;
    problemSolving: number;
    overallKnowledge: number;
  };
  keyStrengths: string[];
  improvementAreas: string[];
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire';
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
}

class RealTimeAnalysisService {
  private model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

  private isAuthOrIdentityError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();

    return (
      normalized.includes('unregistered callers') ||
      normalized.includes('api key') ||
      normalized.includes('permission denied') ||
      normalized.includes('forbidden') ||
      normalized.includes('[403')
    );
  }

  private mapDifficulty(level: string): 'Easy' | 'Medium' | 'Hard' {
    const normalized = (level || '').toLowerCase();

    if (normalized.includes('senior') || normalized.includes('staff') || normalized.includes('principal')) {
      return 'Hard';
    }
    if (normalized.includes('mid')) {
      return 'Medium';
    }

    return 'Easy';
  }

  private buildExpectedKeywords(question: string, techStack: string[]): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'with', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'be', 'how', 'what', 'why', 'when', 'where', 'which', 'who', 'that', 'this', 'your', 'you'
    ]);

    const questionKeywords = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    const uniqueQuestionKeywords = Array.from(new Set(questionKeywords)).slice(0, 8);
    const normalizedTech = techStack.map((tech) => tech.trim()).filter(Boolean);

    return Array.from(new Set([...normalizedTech, ...uniqueQuestionKeywords])).slice(0, 12);
  }

  async generateReferenceAnswer(
    question: string,
    role: string,
    techStack: string[],
    level: string
  ): Promise<string> {
    const expectedKeywords = this.buildExpectedKeywords(question, techStack);
    const difficulty = this.mapDifficulty(level);

    try {
      if (!this.model) {
        throw new Error('Gemini API key is not configured for interview analysis.');
      }

      const prompt = `
You are an expert technical interviewer.

Generate a concise model answer for this interview question.

Role: ${role}
Difficulty: ${difficulty}
Question: ${question}
Expected Concepts: ${expectedKeywords.join(', ')}

Requirements:
- Write 3 to 5 short sentences.
- Answer directly and clearly.
- Include the important technical concepts.
- Do not mention that this is a reference answer.
- Do not use bullet points.

Return plain text only.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return text || `Expected key concepts: ${expectedKeywords.join(', ') || 'Core technical concepts relevant to the question.'}`;
    } catch (error) {
      if (this.isAuthOrIdentityError(error)) {
        console.warn('Gemini auth/identity issue detected in reference answer generation. Falling back to heuristic answer.');
      } else {
        console.error('Error generating reference answer:', error);
      }

      return `A strong answer should address: ${expectedKeywords.join(', ') || 'the core technical concepts for this question'}.`;
    }
  }

  // Add method to detect inadequate responses
  private isInadequateResponse(answer: string): boolean {
    const cleanAnswer = answer.toLowerCase().trim();
    
    // Check for explicit "don't know" patterns
    const dontKnowPatterns = [
      /^i don'?t know$/,
      /^don'?t know$/,
      /^no idea$/,
      /^not sure$/,
      /^i have no idea$/,
      /^i'm not sure$/,
      /^idk$/,
      /^dunno$/,
      /^no clue$/,
      /^i don'?t understand$/,
      /^i'm not familiar$/,
      /^never heard of/,
      /^i can'?t answer/,
      /^i don'?t have experience/,
      /^pass$/,
      /^skip$/,
      /^next$/,
      /^nothing$/,
      /^none$/,
      /^n\/?a$/,
      /^not applicable$/
    ];

    // Check if answer matches any "don't know" pattern
    if (dontKnowPatterns.some(pattern => pattern.test(cleanAnswer))) {
      return true;
    }

    // Check for very short, non-substantive answers
    if (cleanAnswer.length < 10) {
      return true;
    }

    // Check for generic filler responses
    const fillerPatterns = [
      /^(um+|uh+|well|so|like|you know|basically|actually)[\s\.,]*$/,
      /^(yes|no|maybe|possibly|probably)[\s\.,]*$/,
      /^(good question|interesting|that'?s hard)[\s\.,]*$/
    ];

    if (fillerPatterns.some(pattern => pattern.test(cleanAnswer))) {
      return true;
    }

    return false;
  }

  async analyzeAnswer(
    question: string,
    candidateAnswer: string,
    role: string,
    techStack: string[],
    level: string
  ): Promise<AnswerAnalysis> {
    const difficulty = this.mapDifficulty(level);
    const expectedKeywords = this.buildExpectedKeywords(question, techStack);

    // Check for inadequate response first
    if (this.isInadequateResponse(candidateAnswer)) {
      return {
        score: 0,
        feedback: `No substantive answer was provided. This question required technical knowledge and explanation. Simply stating "I don't know" or providing no meaningful response does not demonstrate the competency expected for a ${role} position.`,
        correctAnswer: "A comprehensive answer would demonstrate understanding of the concepts, provide specific technical details, explain the reasoning, and include practical examples or implementation approaches.",
        strengths: [],
        weaknesses: [
          "Did not attempt to answer the question",
          "No demonstration of technical knowledge",
          "Missed opportunity to show problem-solving approach",
          "Did not engage with the technical concepts"
        ],
        suggestions: [
          "Study the fundamental concepts related to this topic",
          "Practice explaining technical concepts even when uncertain",
          "Learn to break down complex problems into smaller parts",
          "Research industry best practices and common approaches",
          "Even when unsure, attempt to discuss what you do know about related topics"
        ],
        rubric: {
          technical_accuracy: 0,
          clarity_structure: 0,
          problem_solving: 0,
          depth_of_knowledge: 0,
          keyword_match_score: 0,
          penalties_applied: 15,
          difficulty_adjustment: 0,
          total_score: 0,
        }
      };
    }

    try {
      if (!this.model) {
        throw new Error('Gemini API key is not configured for interview analysis.');
      }

      const prompt = `
You are a senior technical interviewer evaluating a candidate during a mock technical interview.

Your job is to objectively evaluate the candidate's response based on the specific interview question and provide a strict, structured evaluation similar to a real technical interview.

Interview Question:
${question}

Candidate Answer:
${candidateAnswer}

Difficulty Level:
${difficulty}

Expected Key Concepts:
${expectedKeywords.join(', ')}

Evaluation Rubric (Total = 100)

1. Technical Accuracy (0-40)
- Correctness of concepts
- Whether the candidate answers the actual question
- Whether the explanation is technically valid

2. Clarity and Structure (0-20)
- Logical explanation
- Clear communication
- Organized reasoning

3. Problem Solving Approach (0-20)
- Whether the candidate explains how they approached the problem
- Evidence of analytical thinking

4. Depth of Knowledge (0-20)
- Level of detail
- Use of correct terminology
- Demonstration of deeper understanding

Keyword Coverage Check:
Compare the candidate answer with the expected key concepts.
If the answer includes important concepts, reward Technical Accuracy and Depth scores.

Penalty Rules:
Apply score penalties when necessary:
- If the answer is extremely short or vague, subtract up to 15 points
- If the answer is unrelated to the question, score must be below 30
- If the answer contains incorrect technical claims, subtract up to 20 points
- If the answer repeats generic statements without explanation, subtract up to 10 points

Difficulty Adjustment:
Adjust expectations based on difficulty level.
- Easy Question: Expect basic conceptual understanding
- Medium Question: Expect correct explanation with reasoning
- Hard Question: Expect deeper explanation, examples, or system-level thinking

Scoring Guidelines:
- 0-40: Incorrect or irrelevant answer
- 40-60: Partially correct but weak explanation
- 60-75: Basic understanding but missing depth
- 75-85: Good interview-level answer
- 85-95: Strong explanation with reasoning
- 95-100: Exceptional answer demonstrating expert-level understanding

Important Instructions:
- Never default to a middle score such as 70
- Use the entire scoring range when appropriate
- Be strict and realistic like a real interviewer
- Avoid inflated scores unless the answer truly deserves it
- Base the score strictly on the candidate answer, not assumptions

Output Format (Strict JSON):
{
  "technical_accuracy": number,
  "clarity_structure": number,
  "problem_solving": number,
  "depth_of_knowledge": number,
  "keyword_match_score": number,
  "penalties_applied": number,
  "difficulty_adjustment": number,
  "total_score": number,
  "strengths": "2-3 sentences describing what the candidate did well",
  "weaknesses": "2-3 sentences describing what is missing or incorrect",
  "improvement_suggestion": "Specific suggestion on how the candidate could improve the answer"
}
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedText);
      
      const totalScore100 = Math.max(0, Math.min(100, Number(analysis.total_score) || 0));
      const normalizedScore10 = Math.max(0, Math.min(10, Math.round(totalScore100 / 10)));

      const rubric = {
        technical_accuracy: Math.max(0, Math.min(40, Number(analysis.technical_accuracy) || 0)),
        clarity_structure: Math.max(0, Math.min(20, Number(analysis.clarity_structure) || 0)),
        problem_solving: Math.max(0, Math.min(20, Number(analysis.problem_solving) || 0)),
        depth_of_knowledge: Math.max(0, Math.min(20, Number(analysis.depth_of_knowledge) || 0)),
        keyword_match_score: Math.max(0, Math.min(100, Number(analysis.keyword_match_score) || 0)),
        penalties_applied: Math.max(0, Math.min(30, Number(analysis.penalties_applied) || 0)),
        difficulty_adjustment: Math.max(-20, Math.min(20, Number(analysis.difficulty_adjustment) || 0)),
        total_score: totalScore100,
      };

      const strengthsText = typeof analysis.strengths === 'string' ? analysis.strengths : '';
      const weaknessesText = typeof analysis.weaknesses === 'string' ? analysis.weaknesses : '';
      const improvementText = typeof analysis.improvement_suggestion === 'string' ? analysis.improvement_suggestion : '';

      const feedback = [
        `Rubric Score: ${totalScore100}/100`,
        strengthsText,
        weaknessesText,
        `Improvement: ${improvementText}`,
      ].filter(Boolean).join(' ');

      return {
        score: normalizedScore10,
        feedback: feedback || 'Structured evaluation completed.',
        correctAnswer: `Expected key concepts: ${expectedKeywords.join(', ') || 'Core technical concepts relevant to the question.'}`,
        strengths: strengthsText ? [strengthsText] : [],
        weaknesses: weaknessesText ? [weaknessesText] : [],
        suggestions: improvementText ? [improvementText] : [],
        rubric,
      };
    } catch (error) {
      if (this.isAuthOrIdentityError(error)) {
        console.warn('Gemini auth/identity issue detected in answer analysis. Falling back to heuristic scoring.');
      } else {
        console.error('Error analyzing answer:', error);
      }
      
      // Enhanced fallback with strict inadequate response handling
      if (this.isInadequateResponse(candidateAnswer)) {
        return {
          score: 0,
          feedback: "No meaningful answer was provided to this technical question.",
          correctAnswer: "A proper answer would demonstrate technical knowledge and understanding of the concepts involved.",
          strengths: [],
          weaknesses: ["Did not provide a substantive answer"],
          suggestions: ["Study the topic thoroughly", "Practice explaining technical concepts"],
          rubric: {
            technical_accuracy: 0,
            clarity_structure: 0,
            problem_solving: 0,
            depth_of_knowledge: 0,
            keyword_match_score: 0,
            penalties_applied: 15,
            difficulty_adjustment: 0,
            total_score: 0,
          }
        };
      }

      // Regular fallback for other cases, using strict non-inflated scoring.
      const wordCount = candidateAnswer.trim().split(/\s+/).length;
      const answerLower = candidateAnswer.toLowerCase();
      const keywordHits = expectedKeywords.filter((k) => answerLower.includes(k.toLowerCase())).length;
      const keywordCoverage = expectedKeywords.length > 0 ? keywordHits / expectedKeywords.length : 0;

      let fallbackScore100 = 20;
      if (wordCount > 20) fallbackScore100 += 10;
      if (wordCount > 50) fallbackScore100 += 10;
      if (keywordCoverage >= 0.3) fallbackScore100 += 10;
      if (keywordCoverage >= 0.6) fallbackScore100 += 10;

      // Difficulty-aware cap to keep fallback conservative.
      if (difficulty === 'Hard') fallbackScore100 = Math.min(fallbackScore100, 70);
      if (difficulty === 'Medium') fallbackScore100 = Math.min(fallbackScore100, 75);
      if (difficulty === 'Easy') fallbackScore100 = Math.min(fallbackScore100, 80);

      const fallbackScore10 = Math.max(0, Math.min(10, Math.round(fallbackScore100 / 10)));

      return {
        score: fallbackScore10,
        feedback: `Fallback rubric score: ${fallbackScore100}/100. Response length and keyword coverage were used because structured scoring model output was unavailable.`,
        correctAnswer: `Expected key concepts: ${expectedKeywords.join(', ') || 'Core technical concepts relevant to the question.'}`,
        strengths: [
          ...(wordCount > 30 ? ["Provided detailed response"] : []),
          ...(keywordHits > 0 ? ["Included relevant key concepts"] : []),
          ...(candidateAnswer.length > 0 ? ["Attempted to answer"] : [])
        ],
        weaknesses: [
          ...(wordCount < 20 ? ["Response too brief"] : []),
          ...(keywordHits > 0 ? [] : ["Misses expected key concepts"]),
          "Could provide more specific technical details"
        ],
        suggestions: [
          "Study fundamental concepts more thoroughly",
          "Practice explaining technical details clearly",
          "Include specific examples and use cases",
          "Learn industry terminology and best practices"
        ],
        rubric: {
          technical_accuracy: Math.min(40, Math.round(fallbackScore100 * 0.4)),
          clarity_structure: Math.min(20, Math.round(fallbackScore100 * 0.2)),
          problem_solving: Math.min(20, Math.round(fallbackScore100 * 0.2)),
          depth_of_knowledge: Math.min(20, Math.round(fallbackScore100 * 0.2)),
          keyword_match_score: Math.round(keywordCoverage * 100),
          penalties_applied: Math.max(0, 100 - fallbackScore100 > 30 ? 20 : 10),
          difficulty_adjustment: difficulty === 'Hard' ? -5 : difficulty === 'Easy' ? 3 : 0,
          total_score: fallbackScore100,
        }
      };
    }
  }

  async generateFinalAnalysis(
    answers: Array<{
      question: string;
      answer: string;
      score: number;
      feedback: string;
      rubric?: {
        technical_accuracy: number;
        clarity_structure: number;
        problem_solving: number;
        depth_of_knowledge: number;
        keyword_match_score: number;
        penalties_applied: number;
        difficulty_adjustment: number;
        total_score: number;
      };
    }>,
    role: string,
    techStack: string[],
    level: string
  ): Promise<InterviewAnalysis> {
    const answersWithRubric = answers.filter((answer) => Boolean(answer.rubric));
    const rubricSummary = answersWithRubric.length > 0
      ? {
          technical_accuracy: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.technical_accuracy || 0), 0) / answersWithRubric.length),
          clarity_structure: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.clarity_structure || 0), 0) / answersWithRubric.length),
          problem_solving: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.problem_solving || 0), 0) / answersWithRubric.length),
          depth_of_knowledge: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.depth_of_knowledge || 0), 0) / answersWithRubric.length),
          keyword_match_score: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.keyword_match_score || 0), 0) / answersWithRubric.length),
          penalties_applied: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.penalties_applied || 0), 0) / answersWithRubric.length),
          difficulty_adjustment: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.difficulty_adjustment || 0), 0) / answersWithRubric.length),
          total_score: Math.round(answersWithRubric.reduce((sum, answer) => sum + (answer.rubric?.total_score || 0), 0) / answersWithRubric.length),
        }
      : {
          technical_accuracy: 0,
          clarity_structure: 0,
          problem_solving: 0,
          depth_of_knowledge: 0,
          keyword_match_score: 0,
          penalties_applied: 0,
          difficulty_adjustment: 0,
          total_score: 0,
        };

    // Count inadequate responses
    const inadequateCount = answers.filter(answer => 
      this.isInadequateResponse(answer.answer) || answer.score <= 1
    ).length;
    
    const inadequatePercentage = (inadequateCount / answers.length) * 100;
    
    // IMMEDIATE CHECK: If all or most answers are inadequate, return poor performance immediately
    if (inadequatePercentage >= 80) {
      return {
        overallScore: Math.min(15, Math.round((answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length / 10) * 100)),
        totalQuestions: answers.length,
        answeredQuestions: answers.length - inadequateCount,
        averageScore: answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length,
        finalFeedback: `Critical performance issue: ${inadequateCount} out of ${answers.length} questions (${inadequatePercentage.toFixed(1)}%) received inadequate responses such as "I don't know" or no meaningful answer. This indicates severe lack of preparation and technical knowledge for the ${role} position. Technical interviews require demonstrating knowledge and problem-solving abilities, not simply stating unfamiliarity with concepts. This performance suggests the candidate is not ready for this role and requires substantial study before reapplying.`,
        performanceLevel: 'Poor',
        detailedAnalysis: {
          technical: 10,
          communication: 15,
          problemSolving: 5,
          overallKnowledge: 10
        },
        keyStrengths: [],
        improvementAreas: [
          "Fundamental technical knowledge is critically lacking",
          "Interview preparation and study methodology",
          "Basic understanding of core concepts for the role",
          "Technical vocabulary and terminology",
          "Problem-solving approach and methodology"
        ],
        hiringRecommendation: 'Strong No Hire',
        nextSteps: [
          "Complete comprehensive technical training program",
          "Study fundamental concepts extensively before reapplying",
          "Practice technical interview questions with detailed answers",
          "Build practical projects to demonstrate learning",
          "Consider entry-level positions or internships for experience"
        ],
        interviewerNotes: `Candidate provided ${inadequateCount} inadequate responses out of ${answers.length} questions (${inadequatePercentage.toFixed(1)}% inadequate rate). This level of non-response indicates insufficient technical knowledge and preparation. Not recommended for any technical role at this time.`,
        rubricSummary,
      };
    }

    try {
      if (!this.model) {
        throw new Error('Gemini API key is not configured for interview analysis.');
      }

      const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
      const averageScore = answers.length > 0 ? totalScore / answers.length : 0;
      const overallScore = Math.round((averageScore / 10) * 100);

      const prompt = `
You are a senior technical interviewer conducting a final evaluation. You must be EXTREMELY STRICT and accurate.

CRITICAL METRICS:
- ${inadequateCount} out of ${answers.length} questions received inadequate responses ("I don't know" or similar)
- Inadequate Response Rate: ${inadequatePercentage.toFixed(1)}%
- Average Score: ${averageScore.toFixed(2)}/10
- Raw Overall Score: ${overallScore}/100

STRICT EVALUATION RULES:
- If >50% inadequate responses: Performance Level = "Poor", Score = 0-30
- If >30% inadequate responses: Performance Level = "Needs Improvement", Score = 31-45  
- If >15% inadequate responses: Performance Level = "Average" (max), Score = 46-60
- Only candidates with <10% inadequate responses can be "Good" or "Excellent"

DETAILED QUESTION-BY-QUESTION ANALYSIS:
${answers.map((answer, index) => `
Question ${index + 1}: ${answer.question}
Candidate Answer: ${answer.answer}
Score: ${answer.score}/10
Detailed Assessment: ${answer.feedback}
`).join('\n')}

Provide comprehensive analysis in JSON format:
{
  "finalFeedback": "6-8 paragraph analysis covering overall performance, inadequate response impact, technical gaps, and recommendations",
  "performanceLevel": "Excellent|Good|Average|Needs Improvement|Poor",
  "detailedAnalysis": {
    "technical": 0-100,
    "communication": 0-100, 
    "problemSolving": 0-100,
    "overallKnowledge": 0-100
  },
  "keyStrengths": ["Only list genuine strengths with evidence"],
  "improvementAreas": ["Specific areas needing work based on answer analysis"],
  "hiringRecommendation": "Strong Hire|Hire|No Hire|Strong No Hire",
  "nextSteps": ["Specific learning recommendations based on gaps identified"],
  "interviewerNotes": "Professional notes for hiring decision including specific examples"
}

BE EXTREMELY STRICT. High inadequate response rates should result in poor scores and negative recommendations.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedText);
      
      // Apply strict score adjustments based on inadequate responses
      let adjustedScore = overallScore;
      
      // CRITICAL: If candidate provided mostly inadequate responses, override the AI score
      if (inadequatePercentage >= 50) {
        adjustedScore = Math.min(20, overallScore); // Force very low score
      } else if (inadequatePercentage >= 30) {
        adjustedScore = Math.min(35, overallScore); // Force low score
      } else if (inadequatePercentage >= 15) {
        adjustedScore = Math.min(50, overallScore); // Cap at 50
      }
      
      // Additional check: if average score is very low due to inadequate responses, force it down
      if (averageScore <= 2 && inadequateCount > 0) {
        adjustedScore = Math.min(25, adjustedScore);
      }

      return {
        overallScore: adjustedScore,
        totalQuestions: answers.length,
        answeredQuestions: answers.length - inadequateCount,
        averageScore,
        finalFeedback: analysis.finalFeedback || `This interview revealed significant knowledge gaps with ${inadequateCount} inadequate responses out of ${answers.length} questions (${inadequatePercentage.toFixed(1)}%).`,
        performanceLevel: inadequatePercentage >= 50 ? 'Poor' : 
                         inadequatePercentage >= 30 ? 'Needs Improvement' : 
                         adjustedScore < 40 ? 'Poor' :
                         adjustedScore < 55 ? 'Needs Improvement' :
                         adjustedScore < 70 ? 'Average' :
                         analysis.performanceLevel || 'Average',
        detailedAnalysis: {
          technical: Math.min(analysis.detailedAnalysis?.technical || adjustedScore, adjustedScore),
          communication: Math.min(analysis.detailedAnalysis?.communication || adjustedScore, adjustedScore),
          problemSolving: Math.min(analysis.detailedAnalysis?.problemSolving || adjustedScore, adjustedScore),
          overallKnowledge: Math.min(analysis.detailedAnalysis?.overallKnowledge || adjustedScore, adjustedScore)
        },
        keyStrengths: inadequatePercentage > 30 ? [] : (analysis.keyStrengths || []),
        improvementAreas: analysis.improvementAreas || ["Fundamental technical knowledge", "Interview preparation", "Technical communication"],
        hiringRecommendation: inadequatePercentage > 50 ? 'Strong No Hire' :
                            inadequatePercentage > 30 ? 'No Hire' :
                            analysis.hiringRecommendation || 'No Hire',
        nextSteps: analysis.nextSteps || ["Intensive study of fundamental concepts", "Technical interview practice"],
        interviewerNotes: analysis.interviewerNotes || `${inadequateCount} inadequate responses indicate insufficient preparation for this role.`,
        rubricSummary,
      };
    } catch (error) {
      if (this.isAuthOrIdentityError(error)) {
        console.warn('Gemini auth/identity issue detected in final analysis. Falling back to deterministic summary.');
      } else {
        console.error('Error generating final analysis:', error);
      }
      
      const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
      const averageScore = answers.length > 0 ? totalScore / answers.length : 0;
      let adjustedScore = Math.round((averageScore / 10) * 100);
      
      // Apply strict penalties for inadequate responses in fallback
      if (inadequatePercentage >= 80) {
        adjustedScore = Math.min(adjustedScore, 15); // Extremely poor performance
      } else if (inadequatePercentage >= 50) {
        adjustedScore = Math.min(adjustedScore, 25); // Very poor performance
      } else if (inadequatePercentage >= 30) {
        adjustedScore = Math.min(adjustedScore, 40); // Poor performance
      } else if (inadequatePercentage >= 15) {
        adjustedScore = Math.min(adjustedScore, 55); // Below average performance
      }
      
      // Additional penalty for very low average scores
      if (averageScore <= 1) {
        adjustedScore = Math.min(adjustedScore, 20);
      } else if (averageScore <= 2) {
        adjustedScore = Math.min(adjustedScore, 30);
      }
      
      return {
        overallScore: adjustedScore,
        totalQuestions: answers.length,
        answeredQuestions: answers.length - inadequateCount,
        averageScore,
        finalFeedback: `Interview performance analysis for ${role} position (${level} level) with ${techStack.join(', ')} tech stack: ${inadequateCount} out of ${answers.length} questions received inadequate responses (${inadequatePercentage.toFixed(1)}%). This indicates ${inadequatePercentage > 50 ? 'severe knowledge gaps and lack of preparation' : inadequatePercentage > 30 ? 'significant preparation issues and technical deficiencies' : 'some areas requiring improvement'}. The candidate ${inadequatePercentage > 50 ? 'is not ready for this role and requires substantial study' : inadequatePercentage > 30 ? 'needs additional preparation before being considered' : 'shows some potential but requires development'}. Technical interviews require demonstrating knowledge even when uncertain, and the high rate of non-responses suggests insufficient preparation for a ${role} position.`,
        performanceLevel: inadequatePercentage >= 80 ? 'Poor' : 
                         inadequatePercentage >= 50 ? 'Poor' : 
                         inadequatePercentage >= 30 ? 'Needs Improvement' : 
                         adjustedScore >= 60 ? 'Average' : 
                         adjustedScore >= 40 ? 'Needs Improvement' : 'Poor',
        detailedAnalysis: {
          technical: Math.max(adjustedScore - 10, 0),
          communication: Math.max(adjustedScore - 5, 0),
          problemSolving: Math.max(adjustedScore - 15, 0),
          overallKnowledge: Math.max(adjustedScore - 10, 0)
        },
        keyStrengths: inadequatePercentage > 30 ? [] : ["Completed the interview process"],
        improvementAreas: [
          "Fundamental technical knowledge gaps",
          "Interview preparation and readiness",
          "Technical communication skills",
          "Problem-solving approach",
          "Basic understanding of core concepts"
        ],
        hiringRecommendation: inadequatePercentage > 50 ? 'Strong No Hire' : inadequatePercentage > 30 ? 'No Hire' : adjustedScore >= 60 ? 'No Hire' : 'Strong No Hire',
        nextSteps: [
          "Intensive study of fundamental technical concepts",
          "Complete structured learning program or bootcamp",
          "Practice technical interview questions",
          "Build practical projects to demonstrate skills",
          "Retake assessment after significant preparation"
        ],
        interviewerNotes: `Candidate provided ${inadequateCount} inadequate responses out of ${answers.length} questions (${inadequatePercentage.toFixed(1)}% inadequate rate). This indicates insufficient technical knowledge for the ${role} position. Recommend substantial additional preparation before reconsideration.`,
        rubricSummary,
      };
    }
  }
}

export const realTimeAnalysisService = new RealTimeAnalysisService();
