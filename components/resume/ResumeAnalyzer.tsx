'use client';

import { useState } from 'react';
import Hero from '@/components/resume/Hero';
import InputPanel from '@/components/resume/InputPanel';
import LoadingState from '@/components/resume/LoadingState';
import Dashboard from '@/components/resume/Dashboard';
import { analyzeResume } from '@/lib/resume/api';

export default function ResumeAnalyzer() {
  const [view, setView] = useState<'input' | 'loading' | 'dashboard'>('input');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async (resume: string, jd: string) => {
    setAnalysisError(null);
    setView('loading');
    try {
      const data = await analyzeResume(resume, jd);
      setResult(data);
      setView('dashboard');
    } catch (error) {
      console.error('AI analysis failed:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Resume analysis failed. Please try again in a moment.';
      setAnalysisError(message);
      setView('input');
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-0 pb-4 lg:pt-6 lg:pb-6">
      {view === 'input' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 lg:min-h-[calc(100vh-7rem)] lg:flex lg:items-center">
          <div className="w-full space-y-4 lg:-mt-4">
            <Hero />
            <InputPanel
              onAnalyze={handleAnalyze}
              isAnalyzing={false}
              analysisError={analysisError}
            />
          </div>
        </div>
      )}

      {view === 'loading' && (
        <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in duration-500">
          <LoadingState />
        </div>
      )}

      {view === 'dashboard' && result && (
        <Dashboard data={result} onReset={() => setView('input')} />
      )}
    </div>
  );
}
