'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { parseFile } from '@/lib/resume/fileParser';
import { clsx } from 'clsx';

interface InputPanelProps {
  onAnalyze: (resume: string, jd: string) => void;
  isAnalyzing: boolean;
  analysisError?: string | null;
}

const ROLE_SUGGESTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Mobile Developer',
  'Python Developer',
  'Java Developer',
  'QA Engineer',
  'Cloud Engineer',
];

const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isAnalyzing, analysisError }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    try {
      const text = await parseFile(file);
      setResumeText(text);
    } catch (err: any) {
      setError(err.message);
      setFileName(null);
    }
  };

  const handleSubmit = () => {
    if (!resumeText.trim()) {
      setError("Please provide resume content.");
      return;
    }
    if (!jdText.trim()) {
      setError("Please provide a job description.");
      return;
    }
    setError(null);
    onAnalyze(resumeText, jdText);
  };

  const displayError = error ?? analysisError;

  return (
    <section className="w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[linear-gradient(168deg,rgba(24,26,44,0.88)_0%,rgba(10,11,20,0.95)_100%)] p-5 md:p-6 shadow-2xl">

      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setActiveTab('upload')}
          className={clsx(
            'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
            activeTab === 'upload'
              ? 'text-cyan-200 border-cyan-300/40 bg-cyan-300/10'
              : 'text-light-300 border-white/15 bg-white/5 hover:text-white'
          )}
        >
          Upload Resume
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={clsx(
            'px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
            activeTab === 'paste'
              ? 'text-cyan-200 border-cyan-300/40 bg-cyan-300/10'
              : 'text-light-300 border-white/15 bg-white/5 hover:text-white'
          )}
        >
          Paste Text
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5">

        <div className="flex flex-col h-full">
          <label className="block text-sm font-semibold mb-2 text-light-200">Resume</label>

          {activeTab === 'upload' ? (
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors h-72"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
              />
              {fileName ? (
                <div className="flex flex-col items-center">
                   <div className="w-11 h-11 bg-emerald-300/15 rounded-full flex items-center justify-center mb-2 text-emerald-200">
                      <FileText size={24} />
                   </div>
                   <p className="font-medium text-white mb-1 text-sm max-w-[260px] truncate">{fileName}</p>
                   <p className="text-xs text-emerald-200">Ready for analysis</p>
                   <button
                    onClick={(e) => { e.stopPropagation(); setFileName(null); setResumeText(''); }}
                    className="mt-3 text-xs text-rose-200 hover:text-rose-100 flex items-center gap-1"
                   >
                     <X size={12} /> Remove
                   </button>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 bg-cyan-300/15 rounded-full flex items-center justify-center mb-2 text-cyan-200">
                    <Upload size={24} />
                  </div>
                  <p className="font-medium text-white mb-1 text-sm">Click to upload</p>
                  <p className="text-xs text-light-400">PDF or DOCX (Max 5MB)</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              className="w-full h-72 p-3 rounded-xl border border-white/20 bg-white/[0.03] text-light-100 focus:ring-2 focus:ring-cyan-300/30 focus:border-cyan-300/40 resize-none text-sm"
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          )}
        </div>

        <div className="flex flex-col h-full">
          <label className="block text-sm font-semibold mb-2 text-light-200">Job Description</label>
          <div className="flex flex-col border border-white/20 rounded-xl overflow-hidden bg-white/[0.03] focus-within:ring-2 focus-within:ring-cyan-300/30 focus-within:border-cyan-300/40 h-full">
            <textarea
              className="w-full flex-[0.4] p-3 bg-transparent resize-none text-sm outline-none border-none text-light-100"
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            <div className="border-t border-white/10 p-3 flex-[0.6] flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-3 gap-2 w-full">
                {ROLE_SUGGESTIONS.map((role) => (
                  <button
                    key={role}
                    onClick={() => setJdText(role)}
                    className="px-2 py-1 text-xs font-medium rounded-lg bg-cyan-300/15 text-cyan-200 border border-cyan-300/40 hover:bg-cyan-300/25 hover:border-cyan-300/60 transition-all whitespace-nowrap text-center"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {displayError && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-4 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} />
            We could not analyze your resume
          </div>
          <p className="mt-1">{displayError}</p>
          <p className="mt-1 text-xs text-rose-200/90">
            You can review your resume/JD input and try again.
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing}
          className={clsx(
            'px-7 py-2.5 rounded-xl font-semibold text-white transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30',
            isAnalyzing
              ? 'bg-slate-500/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 active:scale-95'
          )}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </section>
  );
};

export default InputPanel;
