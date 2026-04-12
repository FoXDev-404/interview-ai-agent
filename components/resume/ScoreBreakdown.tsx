'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScoreBreakdownProps {
  data: AnalysisResult;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ data }) => {
  const metrics = [
    { label: 'Keyword Match', value: data.keyword_analysis.keyword_score, color: 'from-[#cac5fe] to-[#a78bfa]' },
    { label: 'Semantic Match', value: data.semantic_analysis.semantic_score, color: 'from-[#7c6fff] to-[#6366f1]' },
    { label: 'Impact Strength', value: data.impact_analysis.impact_score, color: 'from-[#9aa5ff] to-[#7c6fff]' },
    { label: 'Skills Alignment', value: data.skills_alignment, color: 'from-[#b8b3ff] to-[#7c6fff]' },
    { label: 'Experience', value: data.experience_alignment, color: 'from-[#60a5fa] to-[#7c6fff]' },
    { label: 'Formatting', value: data.format_compliance, color: 'from-[#f75353] to-[#7c6fff]' },
  ];

  return (
    <div className="h-full rounded-2xl border border-primary-200/25 dark-gradient p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-1 text-primary-200">Detailed Breakdown</h3>
      <p className="mb-6 text-sm text-light-100">Section-level ATS contribution and quality confidence.</p>
      <div className="space-y-5">
        {metrics.map((metric, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span className="text-light-100">{metric.label}</span>
              <span className="text-white">{metric.value}%</span>
            </div>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1, delay: idx * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
