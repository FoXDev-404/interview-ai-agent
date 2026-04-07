# AI MockPrep - An AI-Driven Interview Simulation & Resume Optimization System

An AI-powered interview preparation platform that integrates speech analysis, behavioural scoring, NLP-driven content evaluation, and ATS-compliant resume optimization. Built with Next.js 15, Firebase, and multiple AI backends, AI MockPrep bridges the gap between employer-facing AI recruitment tools and job-seeker readiness.



## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [AI & ML Integrations](#ai--ml-integrations)
- [Scoring Model](#scoring-model)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Research Findings](#research-findings)
- [Deployment](#deployment)
- [Authors](#authors)
- [License](#license)

## Overview

Modern recruitment systems increasingly rely on AI for evaluating candidates, yet job-seekers rarely receive AI-assisted guidance to improve their performance. Studies show that 67% of job-seekers feel unprepared for behavioural interviews, and 54% struggle to articulate technical knowledge under pressure.

AI MockPrep addresses this by providing a unified system that no existing tool offers — combining interview simulation, real-time scoring, speech analysis, an ATS resume builder, and multi-domain question generation in a single platform.

### How It Compares

| Tool | Strength | Gap |
|------|----------|-----|
| Google Interview Warmup | Strong NLP questions | No behavioural scoring |
| Huru AI | Body language scoring | No ATS resume support |
| Final Round AI | Avatar interaction | Limited domain depth |
| Pramp | Peer interviews | Not AI-driven |
| **AI MockPrep** | **All of the above, unified** | — |

## Features

### Interview Simulation
- Dynamic interview creation based on role, experience level (Junior / Mid / Senior), and tech stack
- 8 AI-generated or curated questions per session tailored to the selected domain
- Voice-based interviews via VAPI AI or text-based input mode
- Real-time question delivery with 60-second timeout management
- Question preview before the interview begins
- FAANG-specific quick-start templates (Google, Amazon, Meta, Apple, Netflix, Microsoft)

### AI-Powered Feedback
- Per-question scoring (0-10) with comparison to ideal answers
- Comprehensive final assessment with an overall score (0-100)
- Performance classification: Excellent, Good, Average, Needs Improvement, Poor
- Hiring recommendation: Strong Hire, Hire, No Hire, Strong No Hire
- Detailed breakdown across technical accuracy, communication, problem-solving, and domain knowledge
- Strengths, weaknesses, and actionable improvement suggestions per response

### Resume Optimization (ATS Analysis)
- Upload PDF or DOCX resumes (up to 25MB)
- Match resume against a target job description
- Keyword analysis: matched, missing, and partial keyword identification
- Semantic alignment scoring (0-100)
- Impact analysis: flags weak bullet points, missing metrics, and passive voice
- AI-generated bullet point rewrites for stronger impact
- Composite ATS score using a weighted formula (keyword 30%, semantic 25%, impact 15%, skills 10%, experience 10%, format 10%)

### Speech Analytics
- Words-per-minute (WPM) measurement
- Filler word detection and frequency tracking (um, uh, like, basically, etc.)
- Hesitation pause identification (gaps > 1.5 seconds)
- Word-level timestamps via AssemblyAI transcription
- AI coaching with a clarity score (0-100) and 3 actionable improvement steps

### Dashboard & History
- Track all past interviews with role, tech stack, and date
- View and revisit previous feedback
- User profile and settings management

### Authentication
- Firebase authentication with email/password
- Google OAuth support
- Email verification flow
- Session-based auth via secure cookies with server-side verification

## System Architecture

AI MockPrep uses a layered architecture:

```
Frontend UI (Next.js 15 / React 19)
        |
  Speech Capture Engine (VAPI AI + AssemblyAI)
        |
    NLP Core (Hugging Face Mistral-7B / Google Gemini)
        |
   Scoring Module (Weighted, interview-type-aware)
        |
    Database (Firebase Firestore)
        |
   Resume Engine (Keyword extraction + ATS scoring)
```

- **Frontend:** Next.js App Router with route groups for auth, root, and support pages
- **Backend:** Next.js Server Actions and API routes
- **AI Layer:** NLP question generator, speech-to-text module, LLM evaluator for relevance, clarity, confidence, and technical depth
- **Database:** Firebase Firestore storing users, interviews, and feedback
- **Resume Engine:** Keyword extraction and composite ATS scoring

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Next.js Server Actions, Next.js API Routes |
| Database | Firebase Firestore |
| Authentication | Firebase Auth, Google OAuth |
| AI - Questions | Hugging Face Inference API (Mistral-7B-Instruct) |
| AI - Feedback | Google Generative AI (Gemini 1.5-Flash) |
| AI - Resume | Google Generative AI (Gemini 3-Flash) |
| Voice AI | VAPI AI |
| Speech-to-Text | AssemblyAI (universal-3-pro model) |
| File Parsing | pdfjs-dist (PDF), mammoth (DOCX) |
| UI Components | Radix UI, Lucide React, Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form, Zod |
| Email | Nodemailer, Resend |
| Notifications | Sonner |

## AI & ML Integrations

### Question Generation
Uses Hugging Face's Mistral-7B-Instruct model to generate role-specific, level-appropriate interview questions. Falls back to a curated CSV question bank when the API is unavailable.

### Real-Time Answer Analysis
Google Gemini 1.5-Flash evaluates each candidate response on a 0-10 scale with strict evaluation rules, producing feedback, correct answer templates, strengths, weaknesses, and improvement suggestions. A final analysis aggregates all responses into an overall assessment with a hiring recommendation.

### Speech Analytics Pipeline
AssemblyAI transcribes audio with word-level timestamps. The system computes WPM, filler word frequency, and hesitation pauses. Google Gemini then generates coaching feedback with a clarity score and actionable improvement steps.

### Resume Analysis Engine
Google Gemini 3-Flash performs deep resume-to-job-description matching. It evaluates keyword coverage, semantic alignment, bullet point impact, skills fit, experience relevance, and format compliance, producing a composite ATS score.

## Scoring Model

The scoring module adapts evaluation weights based on interview type:

**Coding / DSA:**
- Problem Understanding 25% | Logic 30% | Correctness 30% | Efficiency 15%

**Technical Round:**
- Technical Accuracy 40% | Communication 35% | Problem-Solving 20% | Confidence 5%

**Behavioural Interview:**
- Communication 35% | STAR Structure 40% | Tone & Professionalism 25%

**Aptitude Test:**
- Accuracy 50% | Reasoning 30% | Speed 20%

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm
- A Firebase project
- API keys for: Google Generative AI, Hugging Face, VAPI AI, AssemblyAI

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/localghost09/interview-ai-agent.git
   cd interview-ai-agent
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password and Google sign-in providers)
   - Generate a service account key from Project Settings > Service Accounts

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"

   # Firebase Client SDK
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

   # AI Services
   GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
   HUGGING_FACE_API_KEY="your-huggingface-key"
   VAPI_API_KEY="your-vapi-key"
   ASSEMBLYAI_API_KEY="your-assemblyai-key"

   # Email (optional)
   RESEND_API_KEY="your-resend-key"
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up / Sign In** — Create an account with email or Google OAuth.
2. **Create an Interview** — Select your target role, experience level, tech stack, and interview type (Technical, Behavioural, or Mixed).
3. **Preview Questions** — Review the 8 AI-generated questions before starting.
4. **Take the Interview** — Answer questions via voice (VAPI AI) or text input within the 60-second window per question.
5. **Get Feedback** — Receive per-question scoring and a comprehensive final analysis with a hiring recommendation.
6. **Analyze Your Resume** — Upload your resume and a job description to get an ATS score with keyword gaps and rewrite suggestions.
7. **Review Speech Analytics** — Upload or record audio to get WPM, filler word counts, hesitation analysis, and coaching feedback.
8. **Track Progress** — View your interview history and revisit past feedback from the dashboard.

## Project Structure

```
app/
├── (auth)/              # Sign-in, sign-up, email verification
├── (root)/              # Dashboard, interview flow, resume, speech analytics, profile
├── (support)/           # About, contact, help, privacy, terms
└── api/                 # REST endpoints for resume analysis, speech analysis, auth

components/
├── auth/                # Authentication forms
├── resume/              # Resume analysis UI
├── speech/              # Speech analytics UI
├── ui/                  # Radix UI primitives
├── InterviewInterface   # Core interview experience
├── InterviewForm        # Interview creation
├── FeedbackDisplay      # Feedback presentation
└── Navigation/Footer    # Layout components

lib/
├── actions/             # Server actions (interview, auth, feedback CRUD)
├── resume/              # File parsing (PDF, DOCX)
├── speech/              # Speech analysis API & coaching
├── gemini.ts            # Hugging Face question generation
├── realTimeAnalysis.ts  # Google Gemini answer evaluation
├── vapi.ts              # VAPI voice AI integration
├── serverQuestions.ts   # Question generation orchestration
├── csvQuestions.ts      # CSV question bank fallback
└── auth.ts              # Session management helpers

firebase/
├── admin.ts             # Firebase Admin SDK
└── client.ts            # Firebase Client SDK

types/                   # TypeScript interfaces (Interview, Feedback, User, Resume, Speech)
constants/               # Tech stack mappings and configuration
```


### Performance Comparison

| Metric | AI MockPrep (Group A) | Traditional (Group B) |
|--------|----------------------|----------------------|
| Communication Clarity | +34% | +12% |
| Technical Accuracy | +26% | +9% |
| Behavioural Confidence | +31% | +10% |
| Filler Word Reduction | 41% lower | 14% lower |

### Model Performance

| Evaluation Metric | Score |
|-------------------|-------|
| Semantic Matching Accuracy | 86% |
| Speech-to-Text Reliability | 91% |
| Filler Word Detection | 94% |
| Sentiment Recognition | 81% |

### Quantitative Results
- Overall scoring accuracy: 88%
- Resume ATS improvement: 53% to 74%
- 70% of AI MockPrep users reached the recruiter callback stage vs. 30% in the control group

Full details are available in the published paper: *IJERT Vol. 15, Issue 01, January 2026 (IJERTV15IS010560)*.

## Deployment

Deploy on Vercel:

```bash
npx vercel
```

Add all environment variables from `.env.local` to the Vercel dashboard under Project Settings > Environment Variables.

### Build Commands

```bash
npm run build    # Production build
npm run dev      # Development server (Turbopack)
npm run lint     # ESLint
```

## Devs

- **Nikhil Pratap Singh**
- **Rajpal Nishad**
- **Shubham Bhardwaj**

## License

This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).
