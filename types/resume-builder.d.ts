interface ResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  title?: string;
}

interface ResumeSummary {
  content: string;
}

interface ResumeEducation {
  id: string;
  institution: string;
  degree: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights?: string[];
}

interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

interface ResumeSkill {
  category: string;
  items: string[];
}

interface ResumeProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  highlights?: string[];
}

interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

type ResumeSectionKey =
  | 'personalInfo'
  | 'summary'
  | 'education'
  | 'experience'
  | 'skills'
  | 'projects'
  | 'certifications';

interface ResumeData {
  personalInfo: ResumePersonalInfo;
  summary: ResumeSummary;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  sectionOrder: ResumeSectionKey[];
}

interface ResumeDocument {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

type TemplateCategory =
  | 'modern'
  | 'classic'
  | 'creative'
  | 'minimal'
  | 'professional'
  | 'tech'
  | 'executive'
  | 'ats';

interface TemplateMetadata {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  previewColors: string[];
  isAtsOptimized: boolean;
}

interface TemplateProps {
  data: ResumeData;
  className?: string;
}

interface TemplateRegistryEntry extends TemplateMetadata {
  component: React.ComponentType<TemplateProps>;
}

interface CreateResumeParams {
  userId: string;
  title: string;
  templateId: string;
  data: ResumeData;
}

interface UpdateResumeParams {
  resumeId: string;
  userId: string;
  title?: string;
  templateId?: string;
  data?: ResumeData;
}

interface DeleteResumeParams {
  resumeId: string;
  userId: string;
}

interface DeleteAllResumesParams {
  userId: string;
}
