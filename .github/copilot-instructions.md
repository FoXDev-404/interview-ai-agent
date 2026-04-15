# Copilot instructions for interview-ai-agent

## Big picture architecture

- This is a Next.js App Router app (route groups: `app/(auth)`, `app/(root)`, `app/(support)`) with Firebase-backed auth/data and AI-assisted interview flows.
- Server-side data mutations/read patterns are implemented as server actions in `lib/actions/*.action.ts` and consumed directly by client/server components.
- Core interview flow is: create interview -> preview questions -> start interview -> finalize -> feedback (`app/(root)/interview/[id]/*`, `components/InterviewForm.tsx`, `components/InterviewInterface.tsx`, `components/FeedbackDisplay.tsx`).

## Auth and session boundaries

- Auth is hybrid:
  - Client SDK: `firebase/client.ts` for sign-in/sign-up UI actions.
  - Admin SDK: `firebase/admin.ts` for secure cookie/session verification + Firestore access.
- Session cookie name is `session`; route protection in `proxy.ts` guards non-public pages and redirects to `/sign-in`.
- Reuse existing helpers from `lib/auth.ts` (`getCurrentUser`, `requireAuth`) for server components/routes instead of custom cookie parsing.

## Data and service boundaries

- Firestore collections used directly: `users`, `interviews`, `feedback` (see `lib/actions/auth.action.ts`, `lib/actions/interview.action.ts`, `lib/actions/feedback.action.ts`).
- Interview question generation entrypoint is `lib/interview/questionGenerator.ts` (CSV-first via `lib/interview/csvQuestions.ts`, fallback generation).
- `lib/ai/interviewFeedback.ts` currently keeps legacy function names but calls Hugging Face inference; do not assume Google Gemini is the only active question/feedback backend.
- Real-time scoring/final analysis path is `lib/realTimeAnalysis.ts` (Google Generative AI SDK) and is wired by `components/InterviewInterface.tsx`.
- Voice interview and speech-coaching utilities currently live under `lib/speech/*` and are wired via `components/InterviewInterface.tsx`.

## Project-specific coding patterns

- Keep TypeScript interfaces from global declarations in `types/index.d.ts` aligned when adding/changing interview/feedback payloads.
- Existing UI uses Tailwind utility classes plus project CSS tokens/classes from `app/globals.css` (e.g., `interview-glass`, `interview-primary-btn`, `hero-gradient-text`). Prefer extending these patterns over introducing new style systems.
- Toast notifications use `sonner` consistently for async UX feedback.
- Dynamic server rendering is intentionally used on key authenticated routes (`export const dynamic = 'force-dynamic'`). Preserve unless you intentionally change caching behavior.

## Dev workflows

- Use npm scripts from `package.json`:
  - `npm run dev` (Turbopack)
  - `npm run build`
  - `npm run lint`
- There is no dedicated test script in this repo today; rely on lint/build plus targeted manual route checks.

## Known implementation caveats (preserve/flag before refactor)

- `components/GenerateFeedbackButton.tsx` currently submits a mock transcript.
- `firebase/client.ts` contains fallback Firebase config values and development logging; avoid expanding secret-like values.
- Prefer incremental fixes that keep existing flows intact unless explicitly asked to refactor auth/interview architecture.

## When making changes

- Follow existing layering: UI in `components/*`, route orchestration in `app/*`, data writes/reads in `lib/actions/*`, provider integrations in `lib/*`.
- For new authenticated pages, add `requireAuth()` in the route and keep middleware/public route lists coherent.
- For new interview/feedback fields, update both Firestore write/read code and UI renderers together to avoid partial schema drift.
