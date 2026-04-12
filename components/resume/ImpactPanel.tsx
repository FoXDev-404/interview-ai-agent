'use client';

import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';

interface ImpactPanelProps {
  data: ImpactAnalysis;
}

const ImpactPanel: React.FC<ImpactPanelProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-primary-200/25 dark-gradient p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-200/15 rounded-lg text-primary-200 border border-primary-200/25">
           <Zap size={20} />
        </div>
        <div>
           <h3 className="text-lg font-bold text-primary-200">Impact Analysis</h3>
           <p className="text-sm text-light-100">Score: {data.impact_score}/100</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.weak_bullets.map((bullet, idx) => (
          <div key={idx} className="p-4 bg-dark-100/70 rounded-xl border border-primary-200/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-destructive-100 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-light-100">Weak Bullet #{idx + 1}</p>
                <p className="text-light-100 text-sm italic mb-3">&quot;{bullet}&quot;</p>
                <div className="flex flex-wrap gap-2">
                  {data.issues.map((issue, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-destructive-100/10 text-destructive-100 rounded font-medium border border-destructive-100/30">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {data.weak_bullets.length === 0 && (
          <div className="text-center py-8 text-light-100">
             <p>No weak bullets detected. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpactPanel;
