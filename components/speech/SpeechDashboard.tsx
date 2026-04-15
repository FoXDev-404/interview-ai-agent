'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import {
  Zap, Clock, MessageCircle, Pause,
  CheckCircle, AlertTriangle, ArrowRight,
  Brain, Key, ListChecks, Shield, SmilePlus, Target, MessageSquareQuote,
  BarChart3, BookOpen, Info,
} from 'lucide-react';

interface SpeechDashboardProps {
  data: SpeechAnalysisResponse;
}

/** Reusable radial gauge matching the existing ScoreGauge pattern. */
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const safeScore = typeof score === 'number' && !Number.isNaN(score) ? score : 0;

  const getColor = (val: number) => {
    if (val >= 75) return '#22c55e';
    if (val >= 50) return '#eab308';
    return '#ef4444';
  };

  const chartData = [{ name: label, value: safeScore, fill: getColor(safeScore) }];

  return (
    <div className="relative w-full h-52 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={18}
          data={chartData}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-2 text-center">
        <span className="text-4xl font-bold text-foreground block">{safeScore}</span>
        <span className="text-xs text-light-400 uppercase tracking-wider font-semibold">{label}</span>
      </div>
    </div>
  );
}

/** Stat card for numeric metrics. */
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="interview-glass p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-light-400">{label}</p>
      </div>
    </div>
  );
}

/** Displays the interview question that was answered. */
function QuestionCard({ question }: { question: string }) {
  return (
    <div className="interview-glass p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-primary-200/10 border border-primary-200/15 flex items-center justify-center">
          <MessageSquareQuote className="w-4 h-4 text-primary-200" />
        </div>
        <div className="min-w-0">
          <p className="section-label mb-1">Question Answered</p>
          <p className="text-sm font-medium text-light-100 leading-relaxed">
            {question}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Shows a reliability indicator for medium/low confidence metrics. */
function ReliabilityBadge({ reliability }: { reliability: 'high' | 'medium' | 'low' }) {
  if (reliability === 'high') return null;

  const config = reliability === 'medium'
    ? {
        bg: 'bg-yellow-900/20',
        border: 'border-yellow-700/50',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-200',
        textColor: 'text-yellow-400',
        title: 'Moderate Reliability',
        message: 'Recording is between 10-30 seconds. Pace and hesitation metrics may be less precise. Record for 30+ seconds for full accuracy.',
      }
    : {
        bg: 'bg-orange-900/20',
        border: 'border-orange-700/50',
        iconColor: 'text-orange-400',
        titleColor: 'text-orange-200',
        textColor: 'text-orange-400',
        title: 'Low Reliability',
        message: 'Recording is under 10 seconds. Speech metrics are approximate. Record for 30+ seconds for reliable analysis.',
      };

  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl p-4 flex items-start gap-3`}>
      <Info className={`w-5 h-5 ${config.iconColor} mt-0.5 shrink-0`} />
      <div>
        <p className={`text-sm font-medium ${config.titleColor}`}>{config.title}</p>
        <p className={`text-xs ${config.textColor} mt-1`}>{config.message}</p>
      </div>
    </div>
  );
}

/** Horizontal score bar (0-100). */
function ScoreBar({ score, className }: { score: number; className?: string }) {
  const getColor = (val: number) => {
    if (val >= 75) return 'bg-green-500';
    if (val >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-bold text-white w-8 text-right">{score}</span>
    </div>
  );
}

/** Renders a list of tags with a given color theme. */
function TagList({ tags, variant }: { tags: string[]; variant: 'green' | 'red' | 'gray' }) {
  if (tags.length === 0) return null;
  const colorMap = {
    green: 'bg-green-500/15 text-green-300',
    red: 'bg-red-500/15 text-red-300',
    gray: 'bg-white/10 text-light-400',
  };
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map((tag, i) => (
        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${colorMap[variant]}`}>
          {tag}
        </span>
      ))}
    </div>
  );
}

/** Card for one of the 5 evaluation methods. */
function EvaluationMethodCard({
  icon: Icon,
  title,
  score,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  score: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`interview-glass p-5 ${className ?? ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-primary-200" />
        <h4 className="font-semibold text-light-100 text-sm">{title}</h4>
      </div>
      <ScoreBar score={score} className="mb-3" />
      <div className="text-sm text-light-400 space-y-2">
        {children}
      </div>
    </div>
  );
}

/** Highlights filler words in the transcript with colored badges. */
function HighlightedTranscript({ transcript, fillers }: { transcript: string; fillers: SpeechFiller[] }) {
  const singleFillers = new Set<string>();
  const multiFillers: string[] = [];

  for (const f of fillers) {
    const cleaned = f.word.toLowerCase().replace(/[.,!?]/g, '');
    if (cleaned.includes(' ')) {
      if (!multiFillers.includes(cleaned)) multiFillers.push(cleaned);
    } else {
      singleFillers.add(cleaned);
    }
  }

  const words = transcript.split(/(\s+)/);

  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < words.length) {
    let matched = false;
    for (const mf of multiFillers) {
      const parts = mf.split(' ');
      const slice: string[] = [];
      let j = i;
      for (const part of parts) {
        while (j < words.length && words[j].trim() === '') j++;
        if (j < words.length && words[j].toLowerCase().replace(/[.,!?]/g, '') === part) {
          slice.push(words[j]);
          j++;
        } else {
          break;
        }
      }
      if (slice.length === parts.length) {
        const fullSlice: string[] = [];
        for (let k = i; k < j; k++) fullSlice.push(words[k]);
        result.push(
          <span
            key={i}
            className="inline-block bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-xs font-medium mx-0.5"
          >
            {fullSlice.join('')}
          </span>
        );
        i = j;
        matched = true;
        break;
      }
    }

    if (!matched) {
      const word = words[i];
      const cleaned = word.toLowerCase().replace(/[.,!?]/g, '');
      if (cleaned && singleFillers.has(cleaned)) {
        result.push(
          <span
            key={i}
            className="inline-block bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-xs font-medium mx-0.5"
          >
            {word}
          </span>
        );
      } else {
        result.push(<span key={i}>{word}</span>);
      }
      i++;
    }
  }

  return (
    <p className="text-sm text-light-100 leading-relaxed">
      {result}
    </p>
  );
}

/**
 * Displays the full speech analysis results with the expanded 6-row layout:
 * Row 0: Question Context, Row 1: 4 Primary Score Gauges,
 * Row 2: Overall Score + Stats, Row 3: Evaluation Methods Breakdown,
 * Row 4: Strengths / Weaknesses / Action Steps, Row 5: Annotated Transcript.
 */
const SpeechDashboard: React.FC<SpeechDashboardProps> = ({ data }) => {
  const es: EvaluationScores = data.evaluationScores ?? {
    technicalAccuracy: 0,
    behaviouralConfidence: 0,
    communicationClarity: 0,
    fillerWordFrequency: 0,
  };

  const defaultEm: EvaluationMethods = {
    semanticSimilarity: { score: 0, explanation: 'Not available.', idealAnswerSummary: '' },
    keywordRecall: { score: 0, expectedKeywords: [], matchedKeywords: [], missingKeywords: [] },
    contextCompleteness: { score: 0, expectedAspects: [], coveredAspects: [], missingAspects: [], explanation: 'Not available.' },
    confidenceDetection: { score: 0, assertivePatterns: [], hedgingPatterns: [], passivePatterns: [], explanation: 'Not available.' },
    sentimentPolarity: { score: 50, polarity: 'neutral', positiveIndicators: [], negativeIndicators: [], explanation: 'Not available.' },
  };
  const em: EvaluationMethods = data.evaluationMethods
    ? {
        semanticSimilarity: data.evaluationMethods.semanticSimilarity ?? defaultEm.semanticSimilarity,
        keywordRecall: data.evaluationMethods.keywordRecall ?? defaultEm.keywordRecall,
        contextCompleteness: data.evaluationMethods.contextCompleteness ?? defaultEm.contextCompleteness,
        confidenceDetection: data.evaluationMethods.confidenceDetection ?? defaultEm.confidenceDetection,
        sentimentPolarity: data.evaluationMethods.sentimentPolarity ?? defaultEm.sentimentPolarity,
      }
    : defaultEm;

  const csm: ClaritySubMetrics = data.claritySubMetrics ?? {
    structureScore: 0, coherenceScore: 0, conciseness: 0, vocabularyAppropriateness: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Fallback Warning Banner */}
      {data.isFallback && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-amber-900/20 border border-amber-700/50 rounded-2xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-200">
              Limited Analysis Available
            </p>
            <p className="text-xs text-amber-400 mt-1">
              AI evaluation could not be completed. Scores shown are based on deterministic speech metrics only.
              Please try again for full AI-powered analysis.
            </p>
          </div>
        </motion.div>
      )}

      {/* Reliability Badge (shown for medium/low only) */}
      {data.metricsReliability && data.metricsReliability !== 'high' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.03 }}
        >
          <ReliabilityBadge reliability={data.metricsReliability} />
        </motion.div>
      )}

      {/* Row 0 — Question Context Card */}
      {data.question && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <QuestionCard question={data.question} />
        </motion.div>
      )}

      {/* Row 1 — 4 Primary Score Gauges */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        {([
          { score: es.technicalAccuracy, label: 'Technical Accuracy', icon: Target, accent: 'bg-emerald-500', iconColor: 'text-emerald-500' },
          { score: es.behaviouralConfidence, label: 'Behavioural Confidence', icon: Shield, accent: 'bg-blue-500', iconColor: 'text-blue-500' },
          { score: es.communicationClarity, label: 'Communication Clarity', icon: Brain, accent: 'bg-violet-500', iconColor: 'text-violet-500' },
          { score: es.fillerWordFrequency, label: 'Filler Word Score', icon: MessageCircle, accent: 'bg-amber-500', iconColor: 'text-amber-500' },
        ] as const).map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + idx * 0.08 }}
            className="interview-glass overflow-hidden"
          >
            <div className={`h-1 ${item.accent}`} />
            <div className="p-6">
              <h3 className="text-center font-bold text-light-100 mb-2 text-sm flex items-center justify-center gap-1.5">
                <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                {item.label}
              </h3>
              <ScoreGauge score={item.score} label={item.label} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2 — Overall Score + Speech Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Overall Score */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="interview-glass overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <div className="p-6">
            <p className="text-xs font-bold text-light-400 uppercase tracking-widest text-center mb-1">Overall Score</p>
            <ScoreGauge score={data.overallScore ?? 0} label="Overall" />
            {data.overallVerdict && (
              <p className="text-center text-sm text-light-400 mt-2 font-medium">{data.overallVerdict}</p>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <StatCard icon={Zap} label="Words per Minute" value={data.wpm} color="bg-blue-500" />
          <StatCard icon={MessageCircle} label="Fillers / min" value={(data.fillerFrequency ?? 0).toFixed(1)} color="bg-amber-500" />
          <StatCard icon={Pause} label="Hesitation Pauses" value={data.hesitationCount} color="bg-purple-500" />
          <StatCard icon={Clock} label="Duration" value={`${data.durationSeconds.toFixed(0)}s`} color="bg-indigo-500" />
          <StatCard icon={BarChart3} label="Pace Consistency" value={`${data.paceConsistencyScore ?? 0}/100`} color="bg-teal-500" />
          <StatCard icon={BookOpen} label="Vocab Diversity" value={`${((data.vocabularyDiversityRatio ?? 0) * 100).toFixed(0)}%`} color="bg-cyan-500" />
        </motion.div>
      </div>

      {/* Row 3 — Evaluation Methods Breakdown (5 cards) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500 shrink-0" />
          <h3 className="text-lg font-bold text-white">Evaluation Breakdown</h3>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Semantic Similarity */}
          <EvaluationMethodCard icon={Brain} title="Semantic Similarity" score={em.semanticSimilarity.score}>
            <p>{em.semanticSimilarity.explanation}</p>
            {em.semanticSimilarity.idealAnswerSummary && (
              <p className="text-xs text-light-400 mt-1">
                <span className="font-medium">Ideal answer:</span> {em.semanticSimilarity.idealAnswerSummary}
              </p>
            )}
          </EvaluationMethodCard>

          {/* Keyword Recall */}
          <EvaluationMethodCard icon={Key} title="Keyword Recall" score={em.keywordRecall.score}>
            <TagList tags={em.keywordRecall.matchedKeywords} variant="green" />
            <TagList tags={em.keywordRecall.missingKeywords} variant="red" />
          </EvaluationMethodCard>

          {/* Context Completeness */}
          <EvaluationMethodCard icon={ListChecks} title="Context Completeness" score={em.contextCompleteness.score}>
            <p>{em.contextCompleteness.explanation}</p>
            <TagList tags={em.contextCompleteness.coveredAspects} variant="green" />
            <TagList tags={em.contextCompleteness.missingAspects} variant="red" />
          </EvaluationMethodCard>

          {/* Confidence Detection */}
          <EvaluationMethodCard icon={Shield} title="Confidence Detection" score={em.confidenceDetection.score}>
            <p>{em.confidenceDetection.explanation}</p>
            {em.confidenceDetection.assertivePatterns.length > 0 && (
              <div className="mt-1">
                <span className="text-xs font-medium text-green-400">Assertive:</span>
                {em.confidenceDetection.assertivePatterns.map((p, i) => (
                  <p key={i} className="text-xs italic text-light-400 ml-2">&ldquo;{p}&rdquo;</p>
                ))}
              </div>
            )}
            {em.confidenceDetection.hedgingPatterns.length > 0 && (
              <div className="mt-1">
                <span className="text-xs font-medium text-amber-400">Hedging:</span>
                {em.confidenceDetection.hedgingPatterns.map((p, i) => (
                  <p key={i} className="text-xs italic text-light-400 ml-2">&ldquo;{p}&rdquo;</p>
                ))}
              </div>
            )}
          </EvaluationMethodCard>

          {/* Sentiment Polarity — spans full width */}
          <EvaluationMethodCard icon={SmilePlus} title="Sentiment Polarity" score={em.sentimentPolarity.score} className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                em.sentimentPolarity.polarity === 'positive'
                  ? 'bg-green-500/15 text-green-300'
                  : em.sentimentPolarity.polarity === 'negative'
                    ? 'bg-red-500/15 text-red-300'
                    : 'bg-white/10 text-light-400'
              }`}>
                {em.sentimentPolarity.polarity}
              </span>
            </div>
            <p>{em.sentimentPolarity.explanation}</p>
          </EvaluationMethodCard>

          {/* Communication Clarity Breakdown */}
          <EvaluationMethodCard icon={Brain} title="Clarity Breakdown" score={es.communicationClarity} className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-light-400 mb-1">Structure</p>
                <ScoreBar score={csm.structureScore} />
              </div>
              <div>
                <p className="text-xs font-medium text-light-400 mb-1">Coherence</p>
                <ScoreBar score={csm.coherenceScore} />
              </div>
              <div>
                <p className="text-xs font-medium text-light-400 mb-1">Conciseness</p>
                <ScoreBar score={csm.conciseness} />
              </div>
              <div>
                <p className="text-xs font-medium text-light-400 mb-1">Vocabulary</p>
                <ScoreBar score={csm.vocabularyAppropriateness} />
              </div>
            </div>
          </EvaluationMethodCard>
        </div>
      </motion.div>

      {/* Row 4 — Strengths / Weaknesses / Action Steps (kept as-is) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="interview-glass overflow-hidden"
        >
          <div className="h-1 bg-green-500" />
          <div className="p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {data.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span className="text-light-100 leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="interview-glass overflow-hidden"
        >
          <div className="h-1 bg-red-500" />
          <div className="p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {data.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-light-100 leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Actionable Steps */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="interview-glass overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary-200" />
              Action Steps
            </h3>
            <ol className="space-y-3">
              {data.actionableSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-primary-200/15 text-primary-200 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-light-100 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </div>

      {/* Row 5 — Annotated Transcript (kept as-is) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="interview-glass overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-white/5 via-white/15 to-white/5" />
        <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-5 rounded-full bg-white/25 shrink-0" />
          <h3 className="font-bold text-white">Transcript</h3>
        </div>
        <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {data.transcript ? (
            <HighlightedTranscript transcript={data.transcript} fillers={data.fillers} />
          ) : (
            <p className="text-sm text-light-400 italic">No transcript available.</p>
          )}
        </div>
        {data.fillerCount > 0 && (
          <p className="mt-3 text-xs text-light-400">
            Filler words are highlighted in amber. {data.fillerCount} filler word{data.fillerCount !== 1 ? 's' : ''} detected ({(data.fillerFrequency ?? 0).toFixed(1)}/min).
          </p>
        )}
        </div>
      </motion.div>
    </div>
  );
};

export default SpeechDashboard;
