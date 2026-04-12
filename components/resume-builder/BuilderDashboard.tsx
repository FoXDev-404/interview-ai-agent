'use client';

import { useState } from 'react';
import { FileText, Loader2, Trash2 } from 'lucide-react';
import ResumeCard from './ResumeCard';
import TemplateCard from './TemplateCard';
import { useRouter } from 'next/navigation';
import { getAllTemplates, getTemplateCategories } from '@/lib/resume-builder/template-registry';
import { deleteAllResumes } from '@/lib/actions/resume-builder.action';
import { toast } from 'sonner';

interface BuilderDashboardProps {
  resumes: ResumeDocument[];
  userId: string;
}

export default function BuilderDashboard({ resumes, userId }: BuilderDashboardProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const templates = getAllTemplates();
  const categories = getTemplateCategories();
  const filteredTemplates =
    activeCategory === 'all'
      ? templates
      : templates.filter((template) => template.category === activeCategory);

  const handleChange = () => {
    router.refresh();
  };

  const handleDeleteAll = async () => {
    if (isDeletingAll || resumes.length === 0) return;

    setIsDeletingAll(true);
    try {
      const result = await deleteAllResumes({ userId });
      if (result.success) {
        toast.success(result.message || 'All resumes removed');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to remove all resumes');
      }
    } catch {
      toast.error('Failed to remove all resumes');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#1f2937] px-8 py-12 md:px-12 md:py-14">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-200/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative max-w-4xl">
          <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-light-300">
            Resume Builder
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-5xl">
            Build a polished, job-ready resume that makes a strong first impression.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-light-300 md:text-lg">
            Choose from professional templates, customize every section with ease, and keep all your resume versions organized in one place.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-light-300">48+ premium templates</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-light-300">ATS-aware designs</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-light-300">Fast edit workflow</span>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="interview-glass p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
            <p className="text-sm text-light-400 mt-1">
              Start a new resume instantly with any template
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary-200/20 text-primary-200'
                  : 'text-light-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              All ({templates.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.category
                    ? 'bg-primary-200/20 text-primary-200'
                    : 'text-light-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              entry={template}
              isSelected={false}
              onSelect={(id) => router.push(`/resume-builder/new?templateId=${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Saved resumes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Saved Resumes</h2>
          <div className="flex items-center gap-3">
            {resumes.length > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={isDeletingAll}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {isDeletingAll ? 'Removing...' : 'Remove All'}
              </button>
            )}
            <span className="text-sm text-light-400">{resumes.length} total</span>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="interview-glass flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary-200/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary-200" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No saved resumes yet</h3>
            <p className="text-sm text-light-400 text-center max-w-md">
              Pick any template above to create your first resume.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDeleted={handleChange}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
