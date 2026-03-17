import { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { getUserResumes } from '@/lib/actions/resume-builder.action';
import BuilderDashboard from '@/components/resume-builder/BuilderDashboard';

export const metadata: Metadata = {
  title: 'Resume Builder | AI MockPrep',
  description: 'Create professional resumes with 48 beautifully designed templates',
};

export const dynamic = 'force-dynamic';

export default async function ResumeBuilderPage() {
  const user = await requireAuth();

  const result = await getUserResumes(user.uid);
  const resumes = result.success ? result.resumes : [];

  return <BuilderDashboard resumes={resumes} />;
}
