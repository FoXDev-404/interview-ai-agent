'use client';

import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(24,26,44,0.92)_0%,rgba(10,11,20,0.95)_100%)] px-5 py-5 md:px-7 md:py-6 text-center">
      <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-8 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10">
        <p className="mb-2 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
          Resume Analyzer
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Optimize Your Resume for ATS in Minutes
        </h1>
        <p className="mt-2 text-sm md:text-base text-light-300 max-w-2xl mx-auto">
          Paste or upload your resume, add the job description, and get a precise AI match report with actionable improvements.
        </p>
      </div>
    </section>
  );
};

export default Hero;
