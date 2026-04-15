"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DisplayTechIcons from "./DisplayTechIcons";
import Image from "next/image";
import dayjs from "dayjs";

interface Props {
  interview: Interview;
}

const InterviewQuestions = ({ interview }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      router.push(`/interview/${interview.id}/start`);
    } catch {
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = dayjs(interview.createdAt).format('DD/MM/YYYY');

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Interview Header Card */}
      <div className="interview-glass p-7 md:p-9 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: 'rgba(202, 197, 254, 0.08)', border: '1px solid rgba(202, 197, 254, 0.12)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[11px] font-medium text-primary-200/80 tracking-wide">Interview Ready</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {interview.role} <span className="hero-gradient-text">Interview</span>
            </h1>
            <p className="text-light-400 mt-1.5 text-sm">
              {interview.type} &bull; {interview.level} Level
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="interview-badge">{interview.type}</span>
            <div className="flex items-center gap-2">
              <Image src="/calendar.svg" alt="calendar" width={14} height={14} className="opacity-40" />
              <span className="text-xs text-light-400">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-light-600/20 to-transparent mb-6" />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="interview-stat-card">
            <p className="text-2xl font-extrabold text-foreground">{interview.questions.length}</p>
            <p className="text-[11px] text-light-400 mt-1">Questions</p>
          </div>
          <div className="interview-stat-card">
            <p className="text-2xl font-extrabold text-foreground">{interview.level}</p>
            <p className="text-[11px] text-light-400 mt-1">Level</p>
          </div>
          <div className="interview-stat-card">
            <p className="text-2xl font-extrabold text-foreground">{interview.type}</p>
            <p className="text-[11px] text-light-400 mt-1">Type</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-medium text-light-400 mb-2.5 uppercase tracking-wider">Technologies</h3>
          <DisplayTechIcons techStack={interview.techstack} />
        </div>
      </div>

      {/* Instructions */}
      <div className="interview-instruction-card mb-6 p-6 md:p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="interview-icon-box !w-9 !h-9">
            <svg className="w-4 h-4 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-foreground">Before You Begin</h2>
        </div>
        <div className="space-y-3.5 pl-12">
          <div className="flex items-start gap-3">
            <span className="interview-dot mt-1.5"></span>
            <span className="text-sm text-light-100/80">This interview contains <span className="text-foreground font-semibold">{interview.questions.length} questions</span></span>
          </div>
          <div className="flex items-start gap-3">
            <span className="interview-dot mt-1.5"></span>
            <span className="text-sm text-light-100/80">Take your time to answer each question thoughtfully</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="interview-dot mt-1.5"></span>
            <span className="text-sm text-light-100/80">AI feedback will be provided after completing all questions</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="interview-dot mt-1.5"></span>
            <span className="text-sm text-light-100/80">Use <span className="text-foreground font-semibold">voice or text</span> to respond</span>
          </div>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="interview-glass p-7 md:p-9 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Questions Preview</h2>
          <span className="interview-badge">{interview.questions.length} total</span>
        </div>
        <div className="space-y-3">
          {interview.questions.map((question, index) => (
            <div key={index} className="interview-question-item flex items-start gap-4">
              <div className="interview-number-badge !w-7 !h-7 !text-[11px] mt-0.5">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-primary-200/50 font-medium uppercase tracking-wider mb-1">Question {index + 1}</p>
                <p className="text-sm text-light-100 leading-relaxed">{question}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button onClick={() => router.back()} className="interview-outline-btn">
          Go Back
        </button>
        <button onClick={handleStartInterview} disabled={loading} className="interview-primary-btn px-10 py-3 text-base">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              Starting...
            </span>
          ) : "Start Interview"}
        </button>
      </div>
    </div>
  );
};

export default InterviewQuestions;
