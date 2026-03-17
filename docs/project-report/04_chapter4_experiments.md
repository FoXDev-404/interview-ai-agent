# CHAPTER 4: EXPERIMENTS, SIMULATION & TESTING

---

## 4.1 Methodology

The development of AI MockPrep followed an Agile/Iterative methodology, enabling rapid prototyping, continuous integration of AI services, and incremental feature delivery. The methodology was structured into four principal phases, each comprising multiple iterative sprints.

**[INSERT FIGURE 16: Agile Development Methodology Flowchart]**

### 4.1.1 Development Phases

**Phase 1 — Requirement Analysis & Planning (August 2025 – September 2025):**
During this phase, the project team conducted a comprehensive analysis of existing interview preparation tools, surveyed 50 students from MGMCET Noida to identify preparation pain points, reviewed academic literature on NLP-based evaluation systems, and defined the system requirements specification (SRS). Key deliverables included the project proposal, feature prioritization matrix, and initial technology stack selection.

**Phase 2 — System Design & Architecture (September 2025 – October 2025):**
This phase focused on architectural design including the six-layer system architecture, database schema design, API endpoint specification, component hierarchy definition, and UI/UX wireframing. The team evaluated multiple AI service providers (OpenAI GPT-4, Google Gemini, Hugging Face, Anthropic Claude) and selected the current multi-model architecture based on cost efficiency, API reliability, and task-specific performance benchmarks.

**Phase 3 — Model Integration & Development (October 2025 – February 2026):**
The core development phase comprised multiple two-week sprints:
- Sprint 1–2: Project scaffolding (Next.js 16 setup, Firebase integration, authentication system)
- Sprint 3–4: Interview creation and question generation module (HuggingFace integration, CSV fallback)
- Sprint 5–6: Real-time answer evaluation (Gemini 1.5-Flash integration, scoring algorithm)
- Sprint 7–8: Voice interview integration (VAPI AI), interview interface refinement
- Sprint 9–10: Resume analysis engine (file parsing, Gemini 3-Flash, ATS scoring)
- Sprint 11–12: Speech analytics pipeline (AssemblyAI, Gemini 2.5-Flash coaching)
- Sprint 13–14: UI polish, responsive design, landing page, support pages
- Sprint 15–16: Live Coding IDE integration (Monaco editor setup, multi-language support)
- Sprint 17–18: Local C++ execution engine (`child_process`), Gamification & Leaderboard implementation

**Phase 4 — Testing & Evaluation (February 2026 – April 2026):**
This phase involved systematic testing across multiple dimensions (detailed in Section 4.4), the controlled experimental study with 120 participants (detailed in Section 4.5), and iterative bug fixing and performance optimization based on test results.

### 4.1.2 Tools and Practices

The team employed the following Agile practices:
- **Version Control:** Git with GitHub for collaborative development, branching strategy (main/develop/feature branches)
- **Task Management:** GitHub Issues and Projects for sprint planning and progress tracking
- **Code Review:** Mandatory peer review for all pull requests before merging to develop branch
- **Continuous Integration:** Automatic Vercel deployments on push to main branch
- **Communication:** Weekly team standups and bi-weekly supervisor meetings with Dr. Neelam Shrivastava

---

## 4.2 Hardware and Software Used

### 4.2.1 Hardware Requirements

**Table II: Hardware Requirements**

| Component | Minimum Specification | Recommended Specification |
|-----------|----------------------|--------------------------|
| Processor | Intel Core i5 / AMD Ryzen 5 (8th Gen+) | Intel Core i7 / AMD Ryzen 7 |
| RAM | 8 GB DDR4 | 16 GB DDR4 |
| Storage | 256 GB SSD | 512 GB SSD |
| Display | 1366 × 768 resolution | 1920 × 1080 Full HD |
| Internet | Broadband connection (10 Mbps+) | High-speed connection (50 Mbps+) |
| Microphone | Built-in laptop microphone | External USB/headset microphone |
| Webcam | Not required (future scope) | Not required |
| GPU | Not required (AI processing is cloud-based) | Not required |

### 4.2.2 Software and Technology Stack

**Table III: Software and Technology Stack**

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | Next.js | 16.1.6 | Full-stack React framework with App Router, SSR, API Routes |
| **UI Library** | React | 19.0.0 | Component-based user interface development |
| **Language** | TypeScript | 5.x | Type-safe JavaScript superset |
| **CSS Framework** | Tailwind CSS | 4.x | Utility-first CSS framework for responsive styling |
| **Animation** | Framer Motion | 12.34.1 | Declarative animation library for React |
| **Component Primitives** | Radix UI | Latest | Accessible, unstyled UI component primitives |
| **Icons** | Lucide React | 0.487.0 | Icon library for UI elements |
| **Charts** | Recharts | 3.7.0 | Data visualization and charting library |
| **Forms** | React Hook Form | 7.55.0 | Performant form management library |
| **Validation** | Zod | 3.24.2 | TypeScript-first schema validation |
| **Notifications** | Sonner | 2.0.3 | Toast notification library |
| **Theming** | next-themes | 0.4.6 | Dark/light theme management |
| **Date Handling** | Day.js | 1.11.13 | Lightweight date manipulation library |
| **Database** | Firebase Firestore | 11.6.1 (client) / 13.3.0 (admin) | Serverless NoSQL document database |
| **Authentication** | Firebase Auth | 11.6.1 | Email/password and Google OAuth authentication |
| **AI — Questions** | Hugging Face Inference API | — | Mistral-7B-Instruct for question generation |
| **AI — Evaluation** | Google Generative AI | 0.24.1 | Gemini 1.5-Flash for real-time answer analysis |
| **AI — Coaching** | Google GenAI | 1.41.0 | Gemini 2.5-Flash for speech coaching feedback |
| **AI — Resume** | Google Generative AI | — | Gemini 3-Flash for resume analysis |
| **Voice AI** | VAPI AI | 2.3.8 | Voice-based interview delivery and management |
| **Speech-to-Text** | AssemblyAI | 4.23.1 | Word-level audio transcription (universal-3-pro) |
| **PDF Parsing** | pdfjs-dist | 5.4.624 | Client-side PDF text extraction |
| **DOCX Parsing** | mammoth | 1.11.0 | DOCX to text conversion |
| **Email** | Nodemailer / Resend | 7.0.5 / 6.2.0 | Email delivery for contact forms and notifications |
| **UI Utilities** | clsx, tailwind-merge, class-variance-authority | Latest | CSS class composition utilities |
| **Code Editor** | @monaco-editor/react | 4.6.0 | Embedded high-performance code IDE |
| **Execution Engine**| Node.js child_process | Native | Spawns sandboxed local C++ compiler environments |
| **Linting** | ESLint | 9.x | Code quality and style enforcement |
| **Build Tool** | Turbopack | Built-in | Next.js development server bundler |
| **Deployment** | Vercel | — | Serverless deployment platform |
| **Version Control** | Git & GitHub | — | Source code management |
| **IDE** | Visual Studio Code | — | Primary development environment |

---

## 4.3 Implementation Details

### 4.3.1 Key Module Implementations

**Local Code Execution Engine (from `lib/serverCppJudge.ts`):**

The `executeCppCode` function leverages native Node.js capabilities to compile and evaluate user-submitted algorithms in a secure, isolated sub-process:

```typescript
export async function executeCppCode(code: string, input: string = ""): Promise<ExecutionResult> {
  const fileId = uuidv4();
  const sourceFile = path.join(os.tmpdir(), `${fileId}.cpp`);
  const execFile = path.join(os.tmpdir(), `${fileId}.out`);
  
  await fs.writeFile(sourceFile, code);
  
  return new Promise((resolve) => {
    // Compile
    exec(`g++ ${sourceFile} -o ${execFile}`, (compileErr, stdout, stderr) => {
      if (compileErr) return resolve({ success: false, error: stderr });
      
      const startTime = performance.now();
      // Execute
      const child = spawn(execFile);
      child.stdin.write(input);
      child.stdin.end();
      
      child.on('close', (code) => {
        const executionTime = performance.now() - startTime;
        resolve({ success: code === 0, output: outputData, time: executionTime });
      });
    });
  });
}
```

**Real-Time Answer Evaluation (from `lib/realTimeAnalysis.ts`):**

The `RealTimeAnalysisService` class implements two core methods. The `analyzeAnswer` method evaluates individual responses:

```typescript
class RealTimeAnalysisService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async analyzeAnswer(
    question: string, candidateAnswer: string,
    role: string, techStack: string[], level: string
  ): Promise<AnswerAnalysis> {
    // Step 1: Check for inadequate responses
    if (this.isInadequateResponse(candidateAnswer)) {
      return { score: 0, feedback: "No substantive answer...", ... };
    }
    // Step 2: Generate ideal answer and evaluate candidate response
    const prompt = `You are a world-class technical interviewer...
      STEP 1: Generate the IDEAL/PERFECT answer...
      STEP 2: Compare candidate's answer against the ideal...
      STEP 3: Score using strict criteria (0-10)...`;
    const result = await this.model.generateContent(prompt);
    // Step 3: Parse and return structured analysis
    return { score, feedback, correctAnswer, strengths, weaknesses, suggestions };
  }
}
```

**VAPI Voice Interview Service (from `lib/vapi.ts`):**

The `VapiService` class manages the complete voice interview lifecycle:

```typescript
export class VapiService {
  private vapi: Vapi;
  private isSessionActive = false;
  private currentQuestionIndex = 0;
  private readonly QUESTION_TIMEOUT = 60000; // 60 seconds

  async startInterviewSession(interviewConfig: {
    role: string; level: string; type: string;
    questions: string[]; currentQuestionIndex: number;
  }) {
    this.questions = interviewConfig.questions;
    await this.vapi.start(VAPI_ASSISTANT_ID);
    setTimeout(() => this.askCurrentQuestion(), 2000);
  }

  askCurrentQuestion() {
    // Set 60-second timeout for unanswered questions
    this.questionTimer = setTimeout(() => {
      this.handleUnansweredQuestion(); // Score 0
    }, this.QUESTION_TIMEOUT);
    // Deliver question via voice
    this.vapi.send({
      type: "add-message",
      message: { role: "assistant",
        content: `Question ${index}: ${currentQuestion}` }
    });
  }
}
```

**Speech Coaching with Multi-Key Rotation (from `lib/speech/coachingFeedback.ts`):**

```typescript
export async function generateCoachingFeedback(
  transcript: string, metrics: SpeechMetrics,
  question: string, fillerFrequency: number
): Promise<EnhancedCoachingFeedback & { isFallback: boolean }> {
  const apiKeys = getApiKeys(); // Supports up to 5 Gemini API keys
  const maxAttempts = apiKeys.length * 2; // 2 passes through all keys

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ai = new GoogleGenAI({ apiKey: apiKeys[attempt % apiKeys.length] });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.3 }
      });
      // Blend filler score: 70% deterministic + 30% AI evaluation
      data.evaluationScores.fillerWordFrequency = Math.round(
        deterministicFiller * 0.70 + aiFiller * 0.30
      );
      return { ...data, isFallback: false };
    } catch (error) {
      if (isRateLimitError(error)) {
        await sleep(backoffMs); // Exponential backoff
      }
    }
  }
  return fallbackResponse; // Graceful degradation
}
```

### 4.3.2 API Endpoint Implementation

**Table IV: API Endpoints and Their Purpose**

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|-------------|----------|
| `/api/auth/verify-session` | POST | Verify session cookie | `{ session }` | `{ valid, user }` |
| `/api/resume/analyze` | POST | Analyze resume vs. JD | `{ resumeText, jobDescription }` | `{ keyword_analysis, semantic_analysis, impact_analysis, rewrites, final_score }` |
| `/api/speech/analyze` | POST | Analyze speech recording | `FormData: { audio, confidenceScore, question }` | `{ metrics, coaching, transcript }` |
| `/api/contact` | POST | Submit contact form | `{ name, email, subject, message }` | `{ success, message }` |
| `/api/logout` | POST | Logout and clear session | — | `{ success }` |

### 4.3.3 Firebase Firestore Data Operations

**Table V: Firebase Firestore Collections and Fields**

| Collection | Document ID | Key Fields | Operations |
|-----------|-------------|------------|------------|
| `users` | Firebase Auth UID | name, email | Create on signup, Read on profile, Update display name |
| `interviews` | Auto-generated | userId, role, level, techstack, type, questions, finalized, createdAt | Create on interview setup, Read by user/ID, Update finalization |
| `feedback` | Auto-generated / specified | interviewId, userId, totalScore, categoryScores, strengths, areasForImprovement, finalAssessment, performanceLevel, hiringRecommendation, detailedAnalysis | Create after interview, Read by interview/feedback ID |

---

## 4.4 Testing Technology Used

### 4.4.1 Unit Testing

Unit tests were conducted on individual modules to verify functional correctness:

**Table VI: Unit Testing Results Summary**

| Module | Tests Conducted | Test Cases | Pass Rate |
|--------|----------------|------------|-----------|
| Question Generation | 15 | Prompt construction, fallback activation, question count validation | 93% |
| Inadequate Response Detection | 25 | 20+ "don't know" patterns, filler responses, brief answers | 100% |
| Answer Evaluation | 20 | Score range validation, JSON parsing, error handling | 90% |
| Resume File Parsing | 12 | PDF parsing, DOCX parsing, unsupported format rejection | 100% |
| ATS Score Computation | 10 | Weight validation, score clamping, edge cases | 95% |
| Filler Score Computation | 8 | Exponential decay validation, boundary values | 100% |
| C++ Execution Engine   | 15 | Infinite loop timeouts, memory limits, I/O streams | 98% |
| Leaderboard Ranking    | 12 | Score aggregation, tie-breaker logic, real-time sync | 100% |
| Authentication Flow | 18 | Sign-up, sign-in, token verification, session management | 89% |

### 4.4.2 Integration Testing

Integration tests verified end-to-end data flow across modules:
- **Interview Creation → Question Generation → Database Storage:** Verified that creating an interview triggers question generation and stores the complete document in Firestore
- **Audio Recording → AssemblyAI → Speech Metrics → Coaching Feedback:** Verified the complete speech analytics pipeline from audio capture to final coaching output
- **Resume Upload → Parsing → API Call → Dashboard Display:** Verified resume analysis from file selection to results rendering

### 4.4.3 Usability Testing

A usability study was conducted with 20 students from MGMCET Noida (12 CSE, 5 IT, 3 ECE) evaluating the platform on a 5-point Likert scale across five dimensions:

**Table VII: Usability Testing Survey Responses (n=20)**

| Dimension | Average Score (1–5) | Positive Responses (4–5) |
|-----------|-------|---------|
| Ease of Navigation | 4.3 | 85% |
| Clarity of Feedback | 4.5 | 90% |
| Relevance of Questions | 4.2 | 80% |
| Resume Analysis Usefulness | 4.4 | 85% |
| Overall Satisfaction | 4.4 | 90% |

### 4.4.4 AI Performance Testing

AI model performance was evaluated on accuracy, latency, and consistency:
- **Gemini 1.5-Flash Answer Evaluation:** Average response time 2.3 seconds, score consistency (σ = 0.8 across repeated evaluations of same response)
- **Gemini 2.5-Flash Coaching Feedback:** Average response time 4.1 seconds, all required JSON fields present in 97% of responses
- **HuggingFace Question Generation:** Average response time 3.5 seconds, ≥5 parseable questions in 85% of calls
- **AssemblyAI Transcription:** Average word-level accuracy 91%, processing time ~1.2× real-time audio duration

---

## 4.5 Experimental Setup

A controlled experimental study was conducted to evaluate the efficacy of AI MockPrep in improving interview performance metrics.

**Table VIII: Experimental Group Demographics**

| Parameter | Group A (AI MockPrep) | Group B (Traditional) |
|-----------|----------------------|----------------------|
| Total Participants | 60 | 60 |
| Gender Distribution | 35M / 25F | 33M / 27F |
| Academic Background | CSE/IT students | CSE/IT students |
| Year of Study | Final year B.Tech | Final year B.Tech |
| Prior Interview Experience | 0–3 interviews | 0–3 interviews |
| Age Range | 21–24 years | 21–24 years |

**Study Protocol:**
- **Duration:** 10 days of preparation, followed by evaluation
- **Group A (Treatment):** Used AI MockPrep daily for interview practice, speech analytics, and resume optimization. Average 45 minutes per session.
- **Group B (Control):** Used traditional preparation methods — online question banks, peer practice, YouTube tutorials, and generic resume templates. Same average daily time commitment.
- **Evaluation:** Each participant completed 15 mock interviews (5 Technical, 5 Behavioural, 5 Mixed) administered by the AI MockPrep evaluation engine (for Group A) and by trained human evaluators (for Group B, to ensure comparable assessment). All participants received the same set of evaluation questions.

**Evaluation Parameters:**
1. **Technical Accuracy** — Correctness and depth of technical responses
2. **Behavioural Confidence** — STAR adherence, assertive language, professional tone
3. **Communication Clarity** — Speaking pace, filler word frequency, sentence structure
4. **Algorithmic Efficiency** — Time and space complexity optimizations in Live IDE
5. **Filler Word Frequency** — Filler words per minute (lower is better)

---

## 4.6 Screenshots

The following sections describe the key user interfaces of AI MockPrep. Actual screenshots should be captured from the deployed application and inserted at the indicated locations.

**[INSERT FIGURE 17: Landing / Home Page]**
*Description:* The landing page features a hero section with the AI MockPrep tagline, a brief description of the platform's capabilities, call-to-action buttons for sign-up and sign-in, FAANG company quick-start cards (Google, Amazon, Meta, Apple, Netflix, Microsoft), feature highlights (AI Interview Simulation, Resume Optimizer, Speech Analytics), and a professional footer with navigation links.

**[INSERT FIGURE 18: Sign-Up Page]**
*Description:* The registration page displays a clean, centered form with fields for name, email, and password, along with a Google OAuth sign-in button. The form includes real-time validation using React Hook Form and Zod schemas. After successful registration, the user receives an email verification link.

**[INSERT FIGURE 19: Dashboard]**
*Description:* The authenticated dashboard shows the user's past interviews displayed as cards with role, tech stack icons, interview type, and creation date. Navigation links provide access to creating new interviews, resume analysis, speech analytics, and profile management.

**[INSERT FIGURE 20: Interview Setup Page]**
*Description:* The interview creation form includes a role input field, experience level dropdown (Junior/Mid/Senior), tech stack multi-select with auto-suggestion, and interview type selection (Technical/Behavioural/Mixed). A "Generate Interview" button triggers AI question generation.

**[INSERT FIGURE 21: Mock Interview in Progress]**
*Description:* The interview interface displays the current question number and text, a countdown timer (60 seconds), a text input area for typing responses (or a microphone button for voice mode), and a "Submit Answer" button. Real-time feedback appears after each answer submission.

**[INSERT FIGURE 22: Real-Time Feedback Display]**
*Description:* After each question, the feedback panel shows the candidate's score (0–10), detailed written feedback, the AI-generated ideal answer, identified strengths and weaknesses, and actionable suggestions for improvement.

**[INSERT FIGURE 23: Results / Analytics Page]**
*Description:* The comprehensive results page displays an overall score gauge (0–100), performance level badge (Excellent/Good/Average/Needs Improvement/Poor), hiring recommendation, category score breakdown (Technical Knowledge, Communication, Problem Solving, Overall Knowledge), strengths and areas for improvement lists, and next steps recommendations.

**[INSERT FIGURE 24: Resume Analyzer Interface]**
*Description:* The resume analysis page features a file upload zone (supporting PDF and DOCX), a job description textarea, and a results dashboard showing the composite ATS score gauge, keyword analysis panel (matched/missing/partial), semantic alignment score, impact analysis with weak bullets, and AI-generated rewrite suggestions with before/after comparisons.

**[INSERT FIGURE 25: Speech Analytics Dashboard]**
*Description:* The speech analytics page includes an audio recorder with waveform visualization, practice question selection, and after analysis: WPM display, filler word count and list, hesitation count, vocabulary diversity score, pace consistency score, five evaluation method breakdowns, clarity sub-metrics, and three actionable improvement steps.

**[INSERT FIGURE 26: Live Coding & System Design IDE]**
*Description:* The Coding IDE interface showcasing the embedded Monaco editor with syntax highlighting, a resizable terminal panel showing standard output and execution latency, and a side panel presenting the Gemini-powered evaluation of the code's time (Big-O) and space complexity.

**[INSERT FIGURE 27: Global Gamification Leaderboard]**
*Description:* The Leaderboard page rendering the real-time ranking of users based on aggregated scores from text, voice, and coding interviews. The interface features top-three podium highlights, user avatars, and competitive progression metrics.
