'use client';

import React from 'react';
import ScoreGauge from '@/components/resume/ScoreGauge';
import ScoreBreakdown from '@/components/resume/ScoreBreakdown';
import KeywordPanel from '@/components/resume/KeywordPanel';
import ImpactPanel from '@/components/resume/ImpactPanel';
import RewriteComparison from '@/components/resume/RewriteComparison';
import ProjectionPanel from '@/components/resume/ProjectionPanel';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, CheckCircle2, Sparkles, Target } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const scoreLabel =
    data.final_score >= 80 ? 'Strong ATS Position' : data.final_score >= 60 ? 'Competitive With Edits' : 'Needs Core Improvements';

  const scoreTone =
    data.final_score >= 80
      ? 'text-primary-200 bg-primary-200/15 border-primary-200/40'
      : data.final_score >= 60
        ? 'text-light-100 bg-white/5 border-white/15'
        : 'text-destructive-100 bg-destructive-100/10 border-destructive-100/40';

  return (
    <div className="space-y-5 animate-in fade-in duration-700 pb-6">
      <motion.section
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl border border-primary-200/30 blue-gradient-dark p-4 sm:p-6"
      >
        <div className="pointer-events-none absolute -top-24 -right-20 h-48 w-48 rounded-full bg-primary-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full border border-primary-200/40 bg-white/10 px-4 py-2 text-sm font-semibold text-light-100 transition hover:bg-white/15"
            >
              <ArrowLeft size={16} />
              Analyze Another Resume
            </button>

            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${scoreTone}`}>
              <Target size={15} />
              {scoreLabel}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Resume Analysis Report</h2>
            <p className="max-w-4xl text-sm text-light-100 leading-relaxed">
              Your resume has been benchmarked against role intent, keywords, impact language, and ATS format quality.
              Use the sections below to prioritize the edits with highest score lift.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-primary-200/25 bg-dark-100/70 p-4">
              <div className="mb-1 flex items-center gap-2 text-light-100">
                <Sparkles size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Current Score</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.final_score}/100</p>
            </div>

            <div className="rounded-2xl border border-primary-200/25 bg-dark-100/70 p-4">
              <div className="mb-1 flex items-center gap-2 text-light-100">
                <CheckCircle2 size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Keywords Matched</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.keyword_analysis.matched.length}</p>
            </div>

            <div className="rounded-2xl border border-primary-200/25 bg-dark-100/70 p-4">
              <div className="mb-1 flex items-center gap-2 text-light-100">
                <Briefcase size={15} />
                <span className="text-xs font-semibold uppercase tracking-wide">Projected Score</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.projected_score}/100</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid lg:grid-cols-12 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 rounded-2xl border border-primary-200/25 dark-gradient p-5 shadow-sm"
        >
           <h3 className="text-center font-bold text-primary-200 mb-3">Overall ATS Score</h3>
           <ScoreGauge score={data.final_score} />
           <p className="text-center text-sm text-light-100 mt-2 px-3 leading-relaxed">
             {data.semantic_analysis.explanation}
           </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4"
        >
          <ScoreBreakdown data={data} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <ProjectionPanel currentScore={data.final_score} projectedScore={data.projected_score} />
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <KeywordPanel data={data.keyword_analysis} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ImpactPanel data={data.impact_analysis} />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <RewriteComparison rewrites={data.rewrites} />
      </motion.div>

    </div>
  );
};

export default Dashboard;
