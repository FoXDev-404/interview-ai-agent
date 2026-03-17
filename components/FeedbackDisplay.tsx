"use client";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import DisplayTechIcons from "./DisplayTechIcons";

interface Props {
  interview: Interview;
  feedback: Feedback;
}

const RUBRIC_MAX = {
  technical_accuracy: 40,
  clarity_structure: 20,
  problem_solving: 20,
  depth_of_knowledge: 20,
} as const;

const FeedbackDisplay = ({ interview, feedback }: Props) => {
  const router = useRouter();

  const rubric = feedback.rubricSummary;

  const rubricRows = [
    {
      key: "technical_accuracy" as const,
      title: "Technical Accuracy",
      subtitle: "Correctness and technical validity",
      value: rubric?.technical_accuracy ?? feedback.detailedAnalysis?.technical ?? 0,
      max: RUBRIC_MAX.technical_accuracy,
    },
    {
      key: "clarity_structure" as const,
      title: "Clarity & Structure",
      subtitle: "Logical and clear communication",
      value: rubric?.clarity_structure ?? feedback.detailedAnalysis?.communication ?? 0,
      max: RUBRIC_MAX.clarity_structure,
    },
    {
      key: "problem_solving" as const,
      title: "Problem Solving",
      subtitle: "Analytical approach and reasoning",
      value: rubric?.problem_solving ?? feedback.detailedAnalysis?.problemSolving ?? 0,
      max: RUBRIC_MAX.problem_solving,
    },
    {
      key: "depth_of_knowledge" as const,
      title: "Depth of Knowledge",
      subtitle: "Detail, terminology, depth",
      value: rubric?.depth_of_knowledge ?? feedback.detailedAnalysis?.overallKnowledge ?? 0,
      max: RUBRIC_MAX.depth_of_knowledge,
    },
  ];

  const totalScore = feedback.totalScore ?? rubric?.total_score ?? 0;
  const keywordMatch = rubric?.keyword_match_score ?? 0;
  const penalties = rubric?.penalties_applied ?? 0;
  const difficultyAdjustment = rubric?.difficulty_adjustment ?? 0;

  const scoreBand =
    totalScore >= 95 ? "Exceptional" :
    totalScore >= 85 ? "Strong" :
    totalScore >= 75 ? "Good" :
    totalScore >= 60 ? "Basic" :
    totalScore >= 40 ? "Partial" : "Weak";

  const scoreBandColor =
    totalScore >= 85 ? "text-emerald-400" :
    totalScore >= 75 ? "text-blue-400" :
    totalScore >= 60 ? "text-amber-400" : "text-red-400";

  const scoreGradient =
    totalScore >= 85 ? "from-emerald-400 via-cyan-400 to-blue-500" :
    totalScore >= 75 ? "from-blue-400 via-indigo-400 to-violet-500" :
    totalScore >= 60 ? "from-amber-400 via-orange-400 to-rose-500" : "from-red-400 via-rose-500 to-pink-600";

  const scorePercent = Math.max(0, Math.min(100, totalScore));

  const badgeClass = (value: number, max: number) => {
    const ratio = max > 0 ? value / max : 0;
    if (ratio >= 0.8) return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    if (ratio >= 0.6) return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    return "bg-red-500/15 text-red-400 border border-red-500/30";
  };

  const barClass = (value: number, max: number) => {
    const ratio = max > 0 ? value / max : 0;
    if (ratio >= 0.8) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
    if (ratio >= 0.6) return "bg-gradient-to-r from-amber-400 to-amber-500";
    return "bg-gradient-to-r from-red-400 to-red-500";
  };

  const strengths = feedback.keyStrengths || feedback.strengths || [];
  const weaknesses = feedback.improvementAreas || feedback.areasForImprovement || [];
  const speechCoach = feedback.speechCoach;

  const speechMetricRows = speechCoach ? [
    { label: "Confidence", value: speechCoach.confidence },
    { label: "Tone", value: speechCoach.tone },
    { label: "Clarity", value: speechCoach.clarity },
    { label: "Pacing", value: speechCoach.pacing },
    { label: "Filler Control", value: speechCoach.fillerControl },
  ] : [];

  const decompositionItems = [
    {
      label: "Keyword Match",
      value: `${keywordMatch}%`,
      tone: "border-blue-400/30 bg-blue-500/10 text-blue-200",
    },
    {
      label: "Penalties",
      value: `-${penalties}`,
      tone: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    },
    {
      label: "Difficulty Adj",
      value: difficultyAdjustment >= 0 ? `+${difficultyAdjustment}` : `${difficultyAdjustment}`,
      tone: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#171a31] via-[#12172b] to-[#0f1325] p-7 md:p-9">
        <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">Interview Scorecard</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {interview.role} <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Performance Report</span>
            </h1>
            <p className="mt-3 text-sm text-light-300/80">
              {interview.type} • {interview.level} level • {interview.questions.length} questions • {dayjs(feedback.createdAt).format("MMM DD, YYYY")}
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-wider text-light-400 mb-2">Technologies Evaluated</p>
              <DisplayTechIcons techStack={interview.techstack} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-wider text-light-300/80">Final Score</p>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">{scoreBand}</span>
            </div>

            <div className="my-4 flex justify-center">
              <div
                className="relative flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, rgba(255,255,255,0.12) ${100 - scorePercent}%, rgba(255,255,255,0.02) ${100 - scorePercent}% 100%), conic-gradient(from 220deg, #22d3ee 0%, #60a5fa 35%, #818cf8 70%, #c084fc 100%)`,
                }}
              >
                <div className="h-32 w-32 rounded-full bg-[#111627] border border-white/10 flex flex-col items-center justify-center">
                  <p className="text-4xl font-extrabold text-white">{totalScore}</p>
                  <p className="text-[11px] uppercase tracking-widest text-light-400">/100</p>
                </div>
              </div>
            </div>

            <p className={`text-center text-sm font-semibold ${scoreBandColor}`}>{scoreBand} interview-level performance</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {decompositionItems.map((item) => (
          <article key={item.label} className={`rounded-2xl border p-5 ${item.tone}`}>
            <p className="text-xs uppercase tracking-wider opacity-80">{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1529] via-[#10182c] to-[#0c1222] p-7 md:p-9">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-extrabold text-white">Rubric Breakdown</h2>
          <span className="text-[11px] uppercase tracking-[0.16em] text-light-400">Strict 100-Point Model</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {rubricRows.map((row) => {
            const pct = row.max > 0 ? Math.min(100, Math.round((row.value / row.max) * 100)) : 0;
            return (
              <article key={row.key} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-base">{row.title}</h3>
                    <p className="text-xs text-light-400 mt-1">{row.subtitle}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass(row.value, row.max)}`}>
                    {row.value}/{row.max}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${barClass(row.value, row.max)}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] uppercase tracking-wider text-light-500">{pct}% of max weight</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <article className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 p-7">
          <h2 className="text-lg font-bold text-white mb-4">What You Did Well</h2>
          <div className="space-y-3">
            {strengths.length > 0 ? strengths.map((item, index) => (
              <div key={index} className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                <p className="text-sm text-light-100/90 leading-relaxed">{item}</p>
              </div>
            )) : (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                <p className="text-sm text-light-100/80">No strengths were recorded for this attempt.</p>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-amber-900/10 p-7">
          <h2 className="text-lg font-bold text-white mb-4">What To Improve</h2>
          <div className="space-y-3">
            {weaknesses.length > 0 ? weaknesses.map((item, index) => (
              <div key={index} className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                <p className="text-sm text-light-100/90 leading-relaxed">{item}</p>
              </div>
            )) : (
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                <p className="text-sm text-light-100/80">No improvement areas were recorded for this attempt.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {speechCoach && speechCoach.analyzedResponses > 0 && (
        <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#0b1a29] via-[#0f2235] to-[#112840] p-7 md:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Speech Coach Analysis</h2>
              <p className="text-xs text-light-300/80 mt-1">
                Voice-based communication analysis from {speechCoach.analyzedResponses} response{speechCoach.analyzedResponses === 1 ? "" : "s"}
              </p>
            </div>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 font-semibold">
              Overall {speechCoach.overall}/100
            </span>
          </div>

          <div className="grid md:grid-cols-5 gap-3 mb-6">
            {speechMetricRows.map((metric) => (
              <article key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-wider text-light-400">{metric.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-white">{metric.value}</p>
              </article>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-6">
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-wider text-light-400">Average Pace</p>
              <p className="mt-1 text-xl font-bold text-white">{speechCoach.averageWpm} WPM</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-wider text-light-400">Filler Words</p>
              <p className="mt-1 text-xl font-bold text-white">{speechCoach.totalFillerWords}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-wider text-light-400">Most Frequent Fillers</p>
              <p className="mt-1 text-sm text-light-100/90 leading-relaxed">
                {speechCoach.topFillerWords.length > 0 ? speechCoach.topFillerWords.join(", ") : "None detected"}
              </p>
            </article>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <article className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Communication Highlights</h3>
              <div className="space-y-2">
                {speechCoach.insights.map((insight, index) => (
                  <p key={index} className="text-sm text-light-100/85 leading-relaxed">• {insight}</p>
                ))}
              </div>
            </article>
            <article className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-5">
              <h3 className="text-sm font-bold text-white mb-3">Speech Improvement Plan</h3>
              <div className="space-y-2">
                {speechCoach.recommendations.map((recommendation, index) => (
                  <p key={index} className="text-sm text-light-100/85 leading-relaxed">• {recommendation}</p>
                ))}
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#11182d] to-[#101b34] p-7 md:p-9">
        <h2 className="text-xl font-extrabold text-white mb-4">Interviewer Assessment</h2>
        <p className="text-sm text-light-100/85 leading-relaxed">{feedback.finalAssessment}</p>

        {(feedback.performanceLevel || feedback.hiringRecommendation) && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {feedback.performanceLevel && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-wider text-light-400">Performance Level</p>
                <p className="mt-1 text-lg font-bold text-white">{feedback.performanceLevel}</p>
              </div>
            )}
            {feedback.hiringRecommendation && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-wider text-light-400">Hiring Recommendation</p>
                <p className="mt-1 text-lg font-bold text-white">{feedback.hiringRecommendation}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {!!feedback.nextSteps?.length && (
        <section className="rounded-3xl border border-white/10 bg-[#0f1528] p-7 md:p-9">
          <h2 className="text-xl font-extrabold text-white mb-5">Action Plan</h2>
          <div className="grid gap-3">
            {feedback.nextSteps.map((step, index) => (
              <article key={index} className="flex items-start gap-4 rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200 text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-light-100/85 leading-relaxed">{step}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!!feedback.interviewerNotes && (
        <section className="rounded-3xl border border-white/10 bg-[#0f1528] p-7 md:p-9">
          <h2 className="text-lg font-bold text-white mb-4">Interviewer Notes</h2>
          <blockquote className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-5 text-sm italic text-light-100/80 leading-relaxed">
            "{feedback.interviewerNotes}"
          </blockquote>
        </section>
      )}

      <div className="flex flex-wrap justify-center gap-4 pb-6">
        <button onClick={() => router.push('/')} className="interview-outline-btn py-3 px-6">
          Back to Dashboard
        </button>
        <button onClick={() => router.push('/interview')} className={`bg-gradient-to-r ${scoreGradient} text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:opacity-95 transition-opacity`}>
          Take Another Interview
        </button>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
