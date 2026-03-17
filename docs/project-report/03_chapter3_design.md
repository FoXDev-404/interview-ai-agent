# CHAPTER 3: DESIGN OF PROJECT MODEL

---

## 3.1 System Architecture Overview

AI MockPrep employs a six-layer modular architecture designed for scalability, maintainability, and clear separation of concerns. Each layer encapsulates a distinct functional domain, communicating through well-defined interfaces. The architecture is illustrated in Figure 1.

**[INSERT FIGURE 1: Six-Layer System Architecture of AI MockPrep]**

The six layers, from the user-facing presentation tier to the data persistence tier, are described below:

**Layer 1 — Frontend UI (Next.js 16 / React 19):** The presentation layer is built using Next.js 16 with the App Router architecture and React 19 with TypeScript. It provides a responsive, server-side rendered, single-page application experience. The UI utilizes Tailwind CSS v4 for styling, Framer Motion for animations, Radix UI for accessible component primitives, Lucide React for iconography, Recharts for data visualization, and Sonner for toast notifications. For the Live Coding IDE, the frontend integrates a fully functional embedded Monaco Editor supporting syntax highlighting and multi-language auto-completion. A real-time Global Leaderboard is also implemented at this layer to aggregate performance metrics. The frontend communicates with the backend through Next.js Server Actions (for mutations and secure server-side operations) and API Routes (for client-side data fetching and external service integration).

**Layer 2 — Speech Capture Engine (VAPI AI + AssemblyAI):** This layer handles voice-based interview delivery and speech-to-text transcription. VAPI AI provides the real-time voice interface for conducting mock interviews, managing question delivery with 60-second timeouts, capturing candidate speech, and providing voice-synthesized feedback. AssemblyAI's universal-3-pro model transcribes recorded audio with word-level timestamps, enabling precise computation of speech metrics.

**Layer 3 — NLP Core (Hugging Face Mistral-7B / Google Gemini):** The AI processing layer employs multiple LLMs for different tasks. Hugging Face's Mistral-7B-Instruct model generates role-specific, level-appropriate interview questions via the Hugging Face Inference API. Google Gemini 1.5-Flash performs real-time per-question answer evaluation. Google Gemini 2.5-Flash generates enhanced coaching feedback for the speech analytics module. Google Gemini 3-Flash powers the resume analysis engine. This multi-model approach optimizes each task with the most appropriate model architecture.

**Layer 4 — Scoring Module (Adaptive Weighted Scoring):** The evaluation layer implements four distinct weighted scoring algorithms, each tailored to a specific interview domain. The module receives raw analysis data from the NLP Core and applies domain-specific weight distributions to produce normalized scores. The scoring module also implements strict inadequate-response detection, identifying patterns such as "I don't know," excessively brief answers, and filler-only responses, assigning zero scores and generating appropriate feedback for such cases.

**Layer 5 — Database (Firebase Firestore):** The data persistence layer uses Firebase Firestore, a serverless NoSQL document database, to store three primary collections: `users` (user profiles and authentication metadata), `interviews` (interview configurations, questions, and completion status), and `feedback` (per-question scores, final analysis, and hiring recommendations). Firebase Authentication with Google OAuth and email/password providers manages user identity, with session-based cookie authentication for secure, server-verified access control.

**Layer 6 — Resume Engine (Keyword Extraction + ATS Scoring):** The resume analysis layer parses uploaded PDF and DOCX files, extracts text content, and submits the text along with a target job description to Google Gemini 3-Flash for comprehensive analysis. The engine evaluates keyword coverage, semantic alignment, bullet-point impact, skills fit, experience relevance, and format compliance, producing a composite ATS score.

---

## 3.2 Frontend Design

The frontend is architected using the Next.js App Router pattern with route groups, providing a logical separation of concerns between authenticated, unauthenticated, and support pages.

**[INSERT FIGURE 2: Frontend Component Hierarchy]**

### 3.2.1 Route Structure and Page Organization

The application employs three route groups:

**`(auth)/` — Authentication Pages:**
- `/sign-in` — Email/password sign-in form with Google OAuth option
- `/sign-up` — User registration with email verification workflow
- `/verify-email` — Email verification landing page
- Layout includes `AuthHeader` component with navigation back to landing page

**`(root)/` — Authenticated Application Pages:**
- `/` — Landing/home page (public) with hero section, feature overview, and FAANG quick-start cards
- `/interview/[id]` — Individual interview page with question display and response interface
- `/coding-interview` — Live IDE for Data Structures and Algorithms with embedded Monaco editor and algorithmic evaluation panel
- `/resume` — Resume analyzer with file upload, job description input, and ATS analysis dashboard
- `/speech-analytics` — Speech practice with audio recording, transcription, and coaching feedback
- `/leaderboard` — Global ranking dashboard tracking user interview metrics and gamified performance
- `/profile` — User profile management with avatar, bio, and experience details
- `/settings` — Application settings including theme, email preferences, and account management
- Layout includes `Navigation` component (responsive navbar with mobile drawer) and `Footer`

**`(support)/` — Static Support Pages:**
- `/about` — Platform overview and team information
- `/contact` — Contact form with Nodemailer/Resend email integration
- `/help` — FAQ and usage guides
- `/privacy` — Privacy policy
- `/terms` — Terms of service

### 3.2.2 Component Architecture

The component library comprises 24+ custom components organized into four directories:

**Core Components:**
- `InterviewInterface.tsx` (13.9 KB) — Central interview experience manager handling question display, answer input (text and voice modes), timer management, real-time answer submission, and AI feedback display
- `InterviewForm.tsx` (7.9 KB) — Interview creation form with role selection, experience level dropdown, tech stack multi-select, and interview type selection
- `InterviewCard.tsx` (3.9 KB) — Dashboard card displaying interview summary with role, tech stack icons, type badge, and creation date
- `FeedbackDisplay.tsx` (15.2 KB) — Comprehensive feedback viewer with overall score gauge, category score breakdowns, strengths/weaknesses lists, and hiring recommendation
- `LiveChat.tsx` (18.5 KB) — Real-time chat interface for text-based interview interaction
- `VapiInterview.tsx` (11.4 KB) — Voice-based interview wrapper integrating VAPI AI service
- `LeaderboardTopWidget.tsx` — Real-time display of top-ranked users based on aggregated algorithmic and interview scoring
- `MonacoEditor.tsx` — Embedded code editor abstraction with syntax highlighting and multi-language support (C++, JS, Python)
- `ProfilePage.tsx` (23.3 KB) — Full user profile management interface
- `SettingsPage.tsx` (17.1 KB) — Settings management with theme toggle, notification preferences
- `Navigation.tsx` (13.6 KB) — Responsive navigation bar with mobile hamburger menu
- `ContactForm.tsx` (10.4 KB) — Contact form with form validation using React Hook Form and Zod
- `FaangCard.tsx` (2.8 KB) — FAANG company quick-start interview cards

**Resume Components (`components/resume/`):**
- `ResumeAnalyzer.tsx` — Main resume analysis orchestrator
- `InputPanel.tsx` (8.7 KB) — File upload (PDF/DOCX) and job description textarea
- `Dashboard.tsx` — Analysis results overview with score gauge
- `ScoreGauge.tsx` — Circular score visualization component
- `ScoreBreakdown.tsx` — Detailed score breakdown by category
- `KeywordPanel.tsx` — Matched, missing, and partial keyword display
- `ImpactPanel.tsx` — Weak bullet identification and impact scoring
- `RewriteComparison.tsx` — Side-by-side original vs. improved bullet comparisons
- `ProjectionPanel.tsx` — Projected score improvement visualization

**Speech Components (`components/speech/`):**
- `SpeechDashboard.tsx` (25.3 KB) — Comprehensive speech analytics dashboard with metrics cards, evaluation method breakdowns, and coaching steps
- `SpeechAnalyzer.tsx` (11.0 KB) — Speech analysis orchestrator managing recording flow and API calls
- `AudioRecorder.tsx` (14.5 KB) — Audio recording component with waveform visualization, timer, and energy detection

**Auth Components (`components/auth/`):**
- `AuthForm.tsx` — Generic authentication form wrapper
- `SignInForm.tsx` — Email/password sign-in with error handling
- `SignUpForm.tsx` — Registration form with email verification trigger
- `GoogleLoginButton.tsx` — Google OAuth sign-in button with Firebase popup flow
- `AuthHeader.tsx` — Authentication page header

**[INSERT FIGURE 3: User Navigation Flow]**

### 3.2.3 User Flow

The typical user journey through AI MockPrep follows this path:

1. **Landing Page** → User views feature overview, testimonials, and FAANG templates
2. **Authentication** → Sign up (email/password or Google OAuth) → Email verification → Sign in
3. **Dashboard** → View past interviews, access new interview creation, navigate to resume/speech tools
4. **Create Interview** → Select role, level, tech stack, and type → AI generates 8 questions
5. **Question Preview** → Review generated questions before starting
6. **Take Interview** → Answer questions via text input or VAPI voice → 60s timeout per question → Real-time per-question feedback
7. **View Results** → Comprehensive final analysis with scores, hiring recommendation, strengths, and improvement areas
8. **Resume Analysis** → Upload resume + job description → View ATS score, keyword gaps, rewrites
9. **Speech Practice** → Select a practice question → Record audio → View WPM, fillers, coaching feedback

---

## 3.3 Backend Design

The backend leverages Next.js's built-in server capabilities, utilizing both Server Actions (for secure server-side mutations) and API Routes (for client-facing endpoints and external service integration).

**[INSERT FIGURE 4: REST API Architecture]**

### 3.3.1 Server Actions

Server Actions, introduced in Next.js 13+, enable direct server-side function calls from React client components without explicit API endpoint creation. AI MockPrep employs three server action modules:

**`lib/actions/auth.action.ts` — Authentication Actions:**
- `signUp(params)` — Creates user document in Firestore with UID, name, and email
- `signIn(params)` — Verifies Firebase ID token, checks email verification status, creates session cookie
- `setSessionCookie(idToken)` — Creates HTTP-only secure session cookie with 7-day expiration
- `logout()` — Deletes session cookie
- `updateUserDisplayName(uid, displayName)` — Updates display name in both Firebase Auth and Firestore

**`lib/actions/interview.action.ts` — Interview Management Actions:**
- `createInterview(params)` — Generates questions via AI, creates interview document in Firestore with userId, role, level, techstack, type, questions, and timestamp
- `getInterview(interviewId)` — Retrieves single interview by document ID
- `getUserInterviews(userId)` — Retrieves all interviews for a user, sorted by creation date
- `finalizeInterview(interviewId)` — Marks interview as completed

**`lib/serverCppJudge.ts` — Code Execution Engine:**
- `executeCppCode(code, input)` — Spawns isolated Node.js `child_process` instances to natively compile and execute C++ payloads, returning standard output, standard error, and latency metrics directly to the IDE.

**`lib/actions/feedback.action.ts` — Feedback Generation Actions:**
- `createFeedback(params)` — If finalAnalysis is provided (from real-time analysis), stores comprehensive feedback including category scores, performance level, hiring recommendation, and detailed analysis; otherwise, falls back to legacy Gemini-based feedback generation
- `getFeedback(feedbackId)` — Retrieves feedback by document ID
- `getFeedbackByInterview(interviewId)` — Retrieves feedback associated with a specific interview

### 3.3.2 API Routes

**`/api/auth/` — Authentication Endpoints:**
- `POST /api/auth/verify-session` — Verifies session cookie validity on the server side
- `POST /api/auth/refresh` — Refreshes expired session tokens
- `POST /api/logout` — Server-side logout handler

**`/api/resume/analyze` — Resume Analysis Endpoint:**
- `POST /api/resume/analyze` — Accepts resumeText and jobDescription in JSON body, invokes Google Gemini 3-Flash for comprehensive analysis, returns keyword analysis, semantic score, impact analysis, rewrites, projected score, and composite ATS score

**`/api/speech/analyze` — Speech Analysis Endpoint:**
- `POST /api/speech/analyze` — Accepts multipart form data with audio blob, confidence score, and optional question text; transcribes audio via AssemblyAI, computes speech metrics, generates coaching feedback via Gemini 2.5-Flash, returns full analysis response

**`/api/contact` — Contact Form Endpoint:**
- `POST /api/contact` — Processes contact form submissions, sends emails via Nodemailer/Resend

**[INSERT FIGURE 5: Firebase Authentication Flow]**

### 3.3.3 Authentication Architecture

The authentication system implements a multi-layered security model:

1. **Client-Side Firebase Auth:** Firebase Client SDK handles user registration, email/password sign-in, Google OAuth popup, and email verification
2. **Server-Side Token Verification:** Firebase Admin SDK verifies ID tokens and checks email verification status
3. **Session Cookie Management:** Secure HTTP-only cookies with 7-day expiration, SameSite=Lax, and conditional `secure` flag in production
4. **Middleware Protection:** Next.js middleware (`middleware.ts`) intercepts all requests, checks for session cookie presence, and redirects unauthenticated users to `/sign-in`. Public pages (`/`, `/sign-in`, `/sign-up`, `/verify-email`, `/about`, `/contact`, `/help`, `/privacy`, `/terms`) bypass authentication checks.

---

## 3.4 AI/ML Module Design

The AI/ML subsystem comprises four interconnected modules, each leveraging specialized language models for distinct tasks.

**[INSERT FIGURE 6: AI/ML Pipeline — Question Generation to Feedback]**

### 3.4.1 Question Generation Module

The question generation module dynamically creates 8 interview questions tailored to the specified role, experience level, tech stack, and interview type.

**Primary Engine:** Hugging Face Inference API with Mistral-7B-Instruct model. The system constructs a detailed prompt specifying the role, level, tech stack, interview type, and requirements (mix of technical/behavioural/problem-solving, level-appropriate difficulty, tech-stack-specific questions). The model generates questions as a numbered list, which is parsed using regex extraction (`/^\d+\./`).

**Fallback Mechanism:** If the Hugging Face API is unavailable or returns insufficient questions (< 5), the system employs a two-tier fallback: (i) curated questions generated from role, tech stack, and level templates (`generateFallbackQuestions` function), and (ii) a comprehensive CSV question bank (`interview-questions.csv`, 1.2 MB) containing thousands of pre-curated questions categorized by domain.

```typescript
// Question Generation Code Snippet (from lib/gemini.ts)
export const generateInterviewQuestions = async (
  role: string,
  level: string,
  techStack: string[],
  type: string = 'Technical'
): Promise<string[]> => {
  const prompt = `Generate 8 diverse and challenging interview questions 
    for a ${level} level ${role} position...`;
  const text = await callHfModel(prompt);
  // Parse numbered questions from response
  const questions = (text ?? '')
    .split('\n')
    .filter((line) => line.trim().match(/^\d+\./))
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((question) => question.length > 0);
  
  if (questions.length < 5) {
    return generateFallbackQuestions(role, level, techStack);
  }
  return questions.slice(0, 8);
};
```

### 3.4.2 Real-Time Answer Evaluation Module

The real-time analysis module (`lib/realTimeAnalysis.ts`) employs Google Gemini 1.5-Flash to evaluate each candidate response against an AI-generated ideal answer.

**Evaluation Process:**
1. **Inadequate Response Detection:** Before invoking the AI model, the system checks for inadequate responses using pattern matching against 20+ "don't know" patterns, filler-only responses, and extremely brief answers (< 10 characters). Inadequate responses receive an automatic score of 0 with detailed feedback.
2. **AI Evaluation:** For substantive responses, the system sends a detailed prompt to Gemini 1.5-Flash instructing it to: (a) generate the perfect/ideal answer, (b) compare the candidate's answer against the ideal, and (c) provide a strict score (0–10) with detailed feedback.
3. **Strict Scoring Criteria:** 0–1 for no answer/completely wrong; 2–3 for major misconceptions; 4–5 for partial correctness; 6–7 for mostly correct; 8–9 for comprehensive; 10 for perfect.

**Final Analysis Generation:** After all questions are answered, the `generateFinalAnalysis` method aggregates per-question scores, applies strict inadequate-response penalties, and produces a comprehensive `InterviewAnalysis` object containing: overallScore, performanceLevel, detailedAnalysis (technical, communication, problemSolving, overallKnowledge), hiring recommendation, key strengths, improvement areas, next steps, and interviewer notes.

### 3.4.3 Speech Coaching Feedback Module

The coaching feedback module (`lib/speech/coachingFeedback.ts`) uses Google Gemini 2.5-Flash with a structured evaluation framework comprising five distinct evaluation methods:

1. **Semantic Similarity** — Compares answer meaning against an ideal response (rubric: 0–100)
2. **Keyword Recall** — Identifies 5–10 expected domain keywords and measures coverage
3. **Context Completeness** — Evaluates coverage of 3–6 expected aspects (STAR for behavioural)
4. **Confidence Detection** — Analyzes assertive/hedging/passive language patterns
5. **Sentiment Polarity** — Assesses professional emotional tone (45–75 optimal range)

**Scoring Derivation:**
- `technicalAccuracy = 0.40 × semanticSimilarity + 0.35 × keywordRecall + 0.25 × contextCompleteness`
- `behaviouralConfidence = 0.60 × confidenceDetection + 0.20 × sentimentPolarity + 0.20 × paceScore`
- `communicationClarity = 0.30 × structureScore + 0.25 × coherenceScore + 0.25 × conciseness + 0.20 × vocabularyAppropriateness`
- `fillerWordFrequency = 0.70 × deterministicScore + 0.30 × aiScore`
- `overallScore = 0.35 × technicalAccuracy + 0.25 × behaviouralConfidence + 0.25 × communicationClarity + 0.15 × fillerWordFrequency`

The filler word score uses an exponential decay function: `score = 100 × e^(−0.15 × fillersPerMinute)`.

### 3.4.4 Adaptive Scoring Algorithm Design

**[INSERT FIGURE 7: Adaptive Scoring Weight Distribution by Interview Type]**

The scoring module implements four distinct weighted evaluation formulas:

**Coding / DSA Interview:**
- Problem Understanding: 25%
- Logic & Approach: 30%
- Correctness: 30%
- Efficiency (Time/Space Complexity): 15%

For Coding interviews, the system combines real execution output (e.g., passing 10/10 test cases sets a high baseline Correctness score) with Gemini evaluating the Big-O time and space complexity string parsing to accurately award Efficiency points.

**Technical Interview:**
- Technical Accuracy: 40%
- Communication: 35%
- Problem-Solving: 20%
- Confidence: 5%

**Behavioural Interview:**
- Communication: 35%
- STAR Structure Adherence: 40%
- Tone & Professionalism: 25%

**Aptitude Test:**
- Accuracy: 50%
- Reasoning: 30%
- Speed: 20%

---

## 3.5 Database Design

AI MockPrep uses Firebase Firestore, a serverless NoSQL document database, with three primary collections.

**[INSERT FIGURE 8: Firebase Firestore Database Schema]**

### 3.5.1 Collections and Document Schemas

**Collection: `users`**

| Field | Type | Description |
|-------|------|-------------|
| name | string | User's display name |
| email | string | User's email address (unique) |

Document ID: Firebase Auth UID

**Collection: `interviews`**

| Field | Type | Description |
|-------|------|-------------|
| userId | string | Reference to user document ID |
| role | string | Target job role (e.g., "Frontend Developer") |
| level | string | Experience level ("Junior" / "Mid" / "Senior") |
| techstack | string[] | Array of technologies (e.g., ["React", "TypeScript"]) |
| type | string | Interview type ("Technical" / "Behavioural" / "Mixed") |
| questions | string[] | Array of 8 generated/curated questions |
| finalized | boolean | Whether interview has been completed |
| createdAt | string | ISO 8601 timestamp of creation |

Document ID: Auto-generated Firestore document ID

**Collection: `feedback`**

| Field | Type | Description |
|-------|------|-------------|
| interviewId | string | Reference to interview document ID |
| userId | string | Reference to user document ID |
| totalScore | number | Overall score (0–100) |
| categoryScores | array | Array of {name, score, comment} objects |
| strengths | string[] | Identified strengths |
| areasForImprovement | string[] | Areas needing work |
| finalAssessment | string | Comprehensive written assessment |
| createdAt | string | ISO 8601 timestamp |
| performanceLevel | string | "Excellent" / "Good" / "Average" / "Needs Improvement" / "Poor" |
| hiringRecommendation | string | "Strong Hire" / "Hire" / "No Hire" / "Strong No Hire" |
| keyStrengths | string[] | Key strengths from detailed analysis |
| improvementAreas | string[] | Improvement areas from detailed analysis |
| nextSteps | string[] | Recommended next steps |
| interviewerNotes | string | Interviewer summary notes |
| detailedAnalysis | object | {technical, communication, problemSolving, overallKnowledge} scores |

---

## 3.6 Resume Engine Design

**[INSERT FIGURE 9: Resume Analysis Engine Pipeline]**

The resume analysis engine follows a four-stage pipeline:

**Stage 1 — File Parsing:** Uploaded files are parsed client-side using `pdfjs-dist` for PDF files and `mammoth` for DOCX files. The `parseFile` function in `lib/resume/fileParser.ts` detects the file MIME type and delegates to the appropriate parser, extracting raw text content.

**Stage 2 — Content Submission:** The extracted resume text and user-provided job description are submitted to the `/api/resume/analyze` API endpoint as a JSON payload.

**Stage 3 — AI Analysis:** Google Gemini 3-Flash performs comprehensive analysis producing: keyword analysis (matched, missing, partial, categorized by technical/soft/tools/certifications), semantic alignment scoring, impact analysis (weak bullets, issues), AI-generated rewrites, skills alignment, experience alignment, and format compliance scores.

**Stage 4 — Composite Scoring:** The composite ATS score is computed as:
`Final Score = 0.30 × keyword_score + 0.25 × semantic_score + 0.15 × impact_score + 0.10 × skills_alignment + 0.10 × experience_alignment + 0.10 × format_compliance`

---

## 3.7 Data Flow Diagrams

### 3.7.1 Level 0 DFD (Context Diagram)

**[INSERT FIGURE 10: Level 0 Data Flow Diagram]**

The Level 0 DFD shows the AI MockPrep system as a single process with three external entities: (1) **Job-Seeker/User** providing interview configuration, responses, resume uploads, and audio recordings; (2) **AI Services** (Gemini, HuggingFace, VAPI, AssemblyAI) providing question generation, answer evaluation, speech transcription, and coaching feedback; (3) **Firebase Services** providing authentication, data storage, and session management. Data flows include interview requests, generated questions, candidate responses, evaluation feedback, resume analysis results, and speech analytics.

### 3.7.2 Level 1 DFD

**[INSERT FIGURE 11: Level 1 Data Flow Diagram]**

The Level 1 DFD decomposes the system into five processes: (1) **User Authentication** receiving credentials and producing session tokens; (2) **Interview Management** receiving interview configuration and generating question sets; (3) **Answer Evaluation** receiving candidate responses and producing per-question feedback; (4) **Resume Analysis** receiving resume text and job descriptions, producing ATS scores; (5) **Speech Analytics** receiving audio recordings and producing speech metrics with coaching feedback. Data stores include User Store, Interview Store, and Feedback Store.

### 3.7.3 Level 2 DFD

**[INSERT FIGURE 12: Level 2 Data Flow Diagram]**

The Level 2 DFD further decomposes the Interview Management and Answer Evaluation processes. Interview Management is decomposed into: Question Generation (HuggingFace API call), Fallback Question Selection (CSV bank query), Interview Document Creation (Firestore write). Answer Evaluation is decomposed into: Inadequate Response Detection (pattern matching), AI Answer Analysis (Gemini API call), Score Computation (weighted formula application), Final Analysis Aggregation (overall score and recommendation generation).

---

## 3.8 Use Case Diagram

**[INSERT FIGURE 13: Use Case Diagram]**

**Actors:**
- **Registered User** (primary actor)
- **Unregistered Visitor** (limited actor)
- **AI Services** (supporting actor)

**Use Cases for Registered User:**
1. Create Account / Sign Up
2. Sign In (Email/Password or Google OAuth)
3. View Dashboard
4. Create New Interview (select role, level, tech stack, type)
5. Preview Interview Questions
6. Take Mock Interview (text or voice mode)
7. View Per-Question Feedback
8. View Final Analysis and Hiring Recommendation
9. Upload and Analyze Resume
10. View ATS Score and Keyword Analysis
11. Record Speech for Analysis
12. View Speech Metrics and Coaching Feedback
13. Write and Execute Code in Live IDE
14. View Global Leaderboard Standings
15. Manage Profile
16. Manage Settings
17. View Past Interviews and Feedback
18. Submit Contact Form

**Use Cases for Unregistered Visitor:**
1. View Landing Page
2. Sign Up
3. View About / Help / Privacy / Terms pages

---

## 3.9 Sequence Diagrams

### 3.9.1 Mock Interview Flow

**[INSERT FIGURE 14: Sequence Diagram — Mock Interview Flow]**

1. User → Frontend: Select role, level, tech stack, type
2. Frontend → Server Action (`createInterview`): Interview params
3. Server Action → HuggingFace API: Generate questions prompt
4. HuggingFace API → Server Action: 8 generated questions
5. Server Action → Firestore: Store interview document
6. Server Action → Frontend: Interview ID + questions
7. Frontend → User: Display question preview
8. User → Frontend: Start interview
9. Loop [for each question]:
   - Frontend → User: Display question (60s timer)
   - User → Frontend: Submit answer (text/voice)
   - Frontend → Gemini 1.5-Flash: Question + answer for evaluation
   - Gemini → Frontend: Score, feedback, ideal answer
   - Frontend → User: Display per-question feedback
10. Frontend → Server Action (`createFeedback`): All answers + final analysis
11. Server Action → Firestore: Store feedback document
12. Frontend → User: Display comprehensive results

### 3.9.2 Resume Analysis Flow

**[INSERT FIGURE 15: Sequence Diagram — Resume Analysis Flow]**

1. User → Frontend: Upload PDF/DOCX + enter job description
2. Frontend → FileParser: Parse file to text
3. Frontend → API Route (`/api/resume/analyze`): Resume text + JD
4. API Route → Gemini 3-Flash: Analyze resume against JD
5. Gemini → API Route: Keyword analysis, semantic score, rewrites
6. API Route → Frontend: Complete analysis result
7. Frontend → User: Display ATS score, keywords, rewrites

### 3.9.3 Coding Interview and Execution Flow

**[INSERT FIGURE 16: Sequence Diagram — Coding Execution Flow]**

1. User → Frontend: Type code in Monaco Editor and click "Run"
2. Frontend → Server Action / API (`serverCppJudge`): Transmit raw code payload
3. Server Action → OS Child Process: Spawns `g++` compiler on the server environment
4. OS Child Process → Server Action: Execution standard output / errors / runtime metrics
5. Server Action → Frontend: Return output payload
6. Frontend → User: Display execution output in terminal panel
7. Frontend → Gemini API: Assess Big-O logical complexity of submitted code
8. Gemini → Frontend: Return Big-O algorithm evaluation feedback
9. Frontend → User: Display algorithmic scoring and update leaderboard telemetry
