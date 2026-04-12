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

const JD_SUGGESTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Mobile Developer",
];

const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isAnalyzing, analysisError }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('upload');
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hiddenSuggestions, setHiddenSuggestions] = useState<Set<number>>(new Set());
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
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('upload')}
          className={clsx(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === 'upload' ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          Upload Resume
          {activeTab === 'upload' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={clsx(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === 'paste' ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          Paste Text
          {activeTab === 'paste' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Left: Resume Input */}
        <div className="flex flex-col h-full">
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Resume</label>

          {activeTab === 'upload' ? (
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors h-64"
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
                   <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 text-green-600 dark:text-green-400">
                      <FileText size={24} />
                   </div>
                   <p className="font-medium text-gray-900 dark:text-white mb-1">{fileName}</p>
                   <p className="text-sm text-green-600 dark:text-green-400">Ready for analysis</p>
                   <button
                    onClick={(e) => { e.stopPropagation(); setFileName(null); setResumeText(''); }}
                    className="mt-4 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                   >
                     <X size={12} /> Remove
                   </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                    <Upload size={24} />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF or DOCX (Max 5MB)</p>
                </>
              )}
            </div>
          ) : (
            <textarea
              className="w-full h-64 p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          )}
        </div>

        {/* Right: JD Input */}
        <div className="flex flex-col h-full">
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Job Description</label>
          <div className="flex flex-col border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <textarea
              className="w-full h-52 p-4 bg-transparent resize-none text-sm outline-none border-none"
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            {/* Suggestions inside input */}
            {JD_SUGGESTIONS.some((_, i) => !hiddenSuggestions.has(i)) && (
              <div className="px-3 pb-3 flex flex-wrap gap-1.5 border-t border-gray-100 dark:border-gray-700/50 pt-2">
                {JD_SUGGESTIONS.map((suggestion, i) =>
                  hiddenSuggestions.has(i) ? null : (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-[11px] cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <span onClick={() => setJdText(suggestion)}>{suggestion}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHiddenSuggestions(prev => new Set(prev).add(i));
                        }}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {displayError && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={16} />
            We could not analyze your resume
          </div>
          <p className="mt-1">{displayError}</p>
          <p className="mt-1 text-xs text-red-600/90 dark:text-red-300/90">
            You can review your resume/JD input and try again.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing}
          className={clsx(
            "px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
            isAnalyzing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95"
          )}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </div>
  );
};

export default InputPanel;
