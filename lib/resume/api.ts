const API_URL = '/api/resume/analyze';

export const analyzeResume = async (
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> => {
  let response: Response;

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });
  } catch {
    throw new Error('Unable to reach the analysis service. Please check your connection and try again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '' }));

    if (response.status >= 500) {
      throw new Error('The analysis service is temporarily unavailable. Please try again in a few minutes.');
    }

    throw new Error(error.error || 'Resume analysis failed. Please review your input and try again.');
  }

  return response.json();
};

// Mock function for demonstration purposes
export const mockAnalyzeResume = async (): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    keyword_analysis: {
      matched: ["React", "TypeScript", "Node.js", "Team Leadership"],
      missing: ["GraphQL", "AWS", "Docker"],
      partial: ["Agile"],
      categorized: {
        technical: ["React", "TypeScript", "Node.js"],
        soft: ["Team Leadership"],
        tools: ["Jira", "Git"],
        certifications: []
      },
      keyword_score: 75
    },
    semantic_analysis: {
      semantic_score: 82,
      explanation: "The resume strongly correlates with the senior engineering requirements, though it lacks some specific cloud infrastructure terminology present in the JD."
    },
    impact_analysis: {
      impact_score: 60,
      weak_bullets: [
        "Worked on frontend components",
        "Helped with database migration"
      ],
      issues: ["No Metrics", "Weak Verb"]
    },
    rewrites: [
      {
        original: "Worked on frontend components",
        improved: "Engineered reusable React components, reducing development time by 30% across 4 projects.",
        explanation: "Added specific action verb 'Engineered' and quantified impact with '30%'."
      },
      {
        original: "Helped with database migration",
        improved: "Executed zero-downtime PostgreSQL migration for 2TB dataset, improving query performance by 40%.",
        explanation: "Quantified data size and performance impact."
      }
    ],
    projected_score: 88,
    final_score: 74,
    skills_alignment: 80,
    experience_alignment: 75,
    format_compliance: 90
  };
};
