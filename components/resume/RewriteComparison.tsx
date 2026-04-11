'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface RewriteComparisonProps {
  rewrites: Rewrite[];
}

const RewriteComparison: React.FC<RewriteComparisonProps> = ({ rewrites }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-200/25 dark-gradient p-5 shadow-sm">
        <h3 className="text-xl font-bold text-primary-200">AI Suggested Improvements</h3>
        <p className="mt-1 text-sm text-light-100">Side-by-side rewrites focused on stronger outcomes, clarity, and measurable impact.</p>
      </div>

      {rewrites.length === 0 && (
        <div className="rounded-2xl border border-primary-200/20 bg-dark-100/70 p-6 text-sm text-light-100">
          No rewrite recommendations were generated for this analysis.
        </div>
      )}

      {rewrites.map((item, idx) => (
        <div key={idx} className="grid md:grid-cols-2 gap-4 md:gap-8 p-6 dark-gradient rounded-2xl border border-primary-200/20 shadow-sm relative overflow-hidden">

          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-dark-100 rounded-full items-center justify-center border border-primary-200/25 z-10 shadow-sm">
            <ArrowRight size={14} className="text-primary-200" />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-destructive-100 uppercase tracking-wide">Original</div>
            <div className="p-4 rounded-xl border border-destructive-100/30 bg-destructive-100/10 text-light-100 text-sm leading-relaxed">
              {item.original}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-primary-200 uppercase tracking-wide">AI Rewritten</div>
            <div className="p-4 rounded-xl border border-primary-200/35 bg-primary-200/10 text-light-100 text-sm leading-relaxed">
              {item.improved}
            </div>
            <p className="text-xs text-light-100 italic mt-2">
              <span className="font-semibold not-italic">Why:</span> {item.explanation}
            </p>
          </div>

        </div>
      ))}
    </div>
  );
};

export default RewriteComparison;
