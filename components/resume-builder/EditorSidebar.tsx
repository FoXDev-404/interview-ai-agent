"use client";

import { memo } from "react";
import {
  User,
  FileText,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderOpen,
  Award,
} from "lucide-react";
import PersonalInfoForm from "./EditorFormSections/PersonalInfoForm";
import SummaryForm from "./EditorFormSections/SummaryForm";
import EducationForm from "./EditorFormSections/EducationForm";
import ExperienceForm from "./EditorFormSections/ExperienceForm";
import SkillsForm from "./EditorFormSections/SkillsForm";
import ProjectsForm from "./EditorFormSections/ProjectsForm";
import CertificationsForm from "./EditorFormSections/CertificationsForm";

const sectionMeta: Record<
  ResumeSectionKey,
  { label: string; icon: React.ElementType }
> = {
  personalInfo: { label: "Personal Info", icon: User },
  summary: { label: "Summary", icon: FileText },
  education: { label: "Education", icon: GraduationCap },
  experience: { label: "Experience", icon: Briefcase },
  skills: { label: "Skills", icon: Wrench },
  projects: { label: "Projects", icon: FolderOpen },
  certifications: { label: "Certifications", icon: Award },
};

interface EditorSidebarProps {
  data: ResumeData;
  activeSection: ResumeSectionKey;
  onSectionChange: (section: ResumeSectionKey) => void;
  onDataChange: (section: ResumeSectionKey, value: unknown) => void;
}

function EditorSidebar({
  data,
  activeSection,
  onSectionChange,
  onDataChange,
}: EditorSidebarProps) {
  const renderForm = () => {
    switch (activeSection) {
      case "personalInfo":
        return (
          <PersonalInfoForm
            data={data.personalInfo}
            onChange={(val) => onDataChange("personalInfo", val)}
          />
        );
      case "summary":
        return (
          <SummaryForm
            data={data.summary}
            onChange={(val) => onDataChange("summary", val)}
          />
        );
      case "education":
        return (
          <EducationForm
            data={data.education}
            onChange={(val) => onDataChange("education", val)}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            data={data.experience}
            onChange={(val) => onDataChange("experience", val)}
          />
        );
      case "skills":
        return (
          <SkillsForm
            data={data.skills}
            onChange={(val) => onDataChange("skills", val)}
          />
        );
      case "projects":
        return (
          <ProjectsForm
            data={data.projects}
            onChange={(val) => onDataChange("projects", val)}
          />
        );
      case "certifications":
        return (
          <CertificationsForm
            data={data.certifications}
            onChange={(val) => onDataChange("certifications", val)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section Navigation */}
      <div className="flex gap-1 p-3 border-b border-gray-800 overflow-x-auto">
        {data.sectionOrder.map((section) => {
          const meta = sectionMeta[section];
          const Icon = meta.icon;
          return (
            <button
              key={section}
              onClick={() => onSectionChange(section)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === section
                  ? "bg-primary-200/20 text-primary-200"
                  : "text-light-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Active Form */}
      <div className="flex-1 overflow-y-auto p-4 pb-6">{renderForm()}</div>
    </div>
  );
}

export default memo(EditorSidebar);
