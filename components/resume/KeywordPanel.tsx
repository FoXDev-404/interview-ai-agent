'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Check, X, AlertTriangle } from 'lucide-react';

interface KeywordPanelProps {
  data: KeywordAnalysis;
}

const KeywordPanel: React.FC<KeywordPanelProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'soft' | 'tools' | 'certifications'>('technical');

  const categories = {
    technical: data.categorized.technical || [],
    soft: data.categorized.soft || [],
    tools: data.categorized.tools || [],
    certifications: data.categorized.certifications || []
  };

  const getStatus = (keyword: string) => {
    if (data.matched.includes(keyword)) return 'matched';
    if (data.partial.includes(keyword)) return 'partial';
    return 'missing';
  };

  const activeKeywords = categories[activeTab];
  const activeMatched = activeKeywords.filter((keyword) => getStatus(keyword) === 'matched').length;
  const activePartial = activeKeywords.filter((keyword) => getStatus(keyword) === 'partial').length;
  const activeMissing = activeKeywords.filter((keyword) => getStatus(keyword) === 'missing').length;
  const activeCoverage = activeKeywords.length === 0 ? 0 : Math.round((activeMatched / activeKeywords.length) * 100);
  const activeSuggestions = activeKeywords
    .filter((keyword) => getStatus(keyword) !== 'matched')
    .slice(0, 4);

  const actionText =
    activeCoverage >= 80
      ? 'Strong coverage in this category. Focus on improving partially matched phrasing.'
      : activeCoverage >= 50
        ? 'Coverage is moderate. Add 2 to 3 missing terms naturally in recent experience bullets.'
        : 'Coverage is low. Prioritize role-critical terms in headline, skills, and top project bullets.';

  return (
    <div className="rounded-2xl border border-primary-200/25 dark-gradient p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-primary-200">Keyword Intelligence</h3>
        <span className="text-sm px-3 py-1 bg-primary-200/10 text-primary-200 rounded-full font-medium border border-primary-200/30">
          {data.matched.length} Matched
        </span>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-primary-200/30 bg-primary-200/10 p-3">
          <p className="text-xs uppercase tracking-wide text-primary-200 font-semibold">Matched</p>
          <p className="text-xl font-bold text-white">{data.matched.length}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-light-100 font-semibold">Partial</p>
          <p className="text-xl font-bold text-white">{data.partial.length}</p>
        </div>
        <div className="rounded-xl border border-destructive-100/30 bg-destructive-100/10 p-3">
          <p className="text-xs uppercase tracking-wide text-destructive-100 font-semibold">Missing</p>
          <p className="text-xl font-bold text-white">{data.missing.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-primary-200/20 pb-2">
        {(Object.keys(categories) as Array<keyof typeof categories>).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={clsx(
              "px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
              activeTab === cat
                ? "text-primary-200 bg-primary-200/10 border border-primary-200/35"
                : "text-light-100 hover:text-white bg-white/5 border border-white/15"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {activeKeywords.map((keyword, idx) => {
          const status = getStatus(keyword);
          return (
            <div
              key={idx}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1.5",
                status === 'matched' && "bg-primary-200/15 text-primary-200 border-primary-200/35",
                status === 'partial' && "bg-white/10 text-light-100 border-white/20",
                status === 'missing' && "bg-destructive-100/10 text-destructive-100 border-destructive-100/30"
              )}
            >
              {status === 'matched' && <Check size={14} />}
              {status === 'partial' && <AlertTriangle size={14} />}
              {status === 'missing' && <X size={14} />}
              {keyword}
            </div>
          );
        })}
        {activeKeywords.length === 0 && (
          <p className="text-light-100 text-sm italic py-4">No keywords found in this category.</p>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-primary-200/20 bg-dark-100/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-light-100 capitalize">{activeTab} Coverage</p>
          <p className="text-sm font-bold text-white">{activeCoverage}%</p>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#cac5fe] to-[#7c6fff] transition-all duration-500"
            style={{ width: `${activeCoverage}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-primary-200/35 bg-primary-200/10 px-2.5 py-2 text-center text-primary-200 font-semibold">
            {activeMatched} matched
          </div>
          <div className="rounded-lg border border-white/20 bg-white/5 px-2.5 py-2 text-center text-light-100 font-semibold">
            {activePartial} partial
          </div>
          <div className="rounded-lg border border-destructive-100/30 bg-destructive-100/10 px-2.5 py-2 text-center text-destructive-100 font-semibold">
            {activeMissing} missing
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-light-100">{actionText}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {activeSuggestions.length > 0 ? (
            activeSuggestions.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-primary-200/25 bg-primary-200/10 px-2.5 py-1 text-xs font-medium text-primary-200"
              >
                Add: {keyword}
              </span>
            ))
          ) : (
            <span className="text-xs text-light-100">No priority additions needed for this tab.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordPanel;
