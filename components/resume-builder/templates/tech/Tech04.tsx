"use client";

import { cn } from "@/lib/utils";

function formatDate(date: string): string {
  if (!date || date.toLowerCase() === "present") return "Present";
  const [year, month] = date.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

export default function Tech04({ data, className }: TemplateProps) {
  const {
    personalInfo,
    summary,
    education,
    experience,
    skills,
    projects,
    certifications,
    sectionOrder,
  } = data;

  const renderSection = (key: ResumeSectionKey) => {
    switch (key) {
      case "summary":
        return summary?.content ? (
          <div key={key} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Init
              </div>
              <h2 className="text-sm font-bold text-gray-800">
                Pipeline Overview
              </h2>
            </div>
            <div className="border-l-2 border-sky-300 pl-4 ml-3">
              <p className="text-xs text-gray-700 leading-relaxed">
                {summary.content}
              </p>
            </div>
          </div>
        ) : null;

      case "experience":
        return experience?.length > 0 ? (
          <div key={key} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Deploy
              </div>
              <h2 className="text-sm font-bold text-gray-800">
                Experience Pipeline
              </h2>
            </div>
            <div className="border-l-2 border-sky-300 ml-3">
              {experience.map((exp) => (
                <div key={exp.id} className="pl-4 pb-4 relative">
                  {/* Connection dot */}
                  <div
                    className={cn(
                      "absolute -left-[5px] top-1 w-2 h-2 rounded-full",
                      exp.endDate.toLowerCase() === "present"
                        ? "bg-green-500"
                        : "bg-gray-400",
                    )}
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {exp.role}
                      </h3>
                      <p className="text-xs text-sky-600">
                        {exp.company}
                        {exp.location ? ` | ${exp.location}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          exp.endDate.toLowerCase() === "present"
                            ? "bg-green-500"
                            : "bg-gray-400",
                        )}
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(exp.startDate)} &rarr;{" "}
                        {formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>
                  {exp.highlights?.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-700 pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-sky-400 before:text-[10px]"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "education":
        return education?.length > 0 ? (
          <div key={key} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Build
              </div>
              <h2 className="text-sm font-bold text-gray-800">Education</h2>
            </div>
            <div className="border-l-2 border-sky-300 ml-3">
              {education.map((edu) => (
                <div key={edu.id} className="pl-4 pb-3 relative">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-sky-500" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-xs text-sky-600">
                        {edu.institution}
                        {edu.location ? ` | ${edu.location}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(edu.startDate)} &rarr;{" "}
                      {formatDate(edu.endDate)}
                    </span>
                  </div>
                  {edu.gpa && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      GPA: {edu.gpa}
                    </p>
                  )}
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {edu.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-700 pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-sky-400 before:text-[10px]"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "skills":
        return skills?.length > 0 ? (
          <div key={key} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Config
              </div>
              <h2 className="text-sm font-bold text-gray-800">Tech Stack</h2>
            </div>
            <div className="border-l-2 border-sky-300 pl-4 ml-3">
              {skills.map((group, i) => (
                <div key={i} className="mb-2">
                  <h3 className="text-xs font-semibold text-gray-800 mb-1">
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((item, j) => (
                      <span
                        key={j}
                        className="text-[10px] bg-sky-50 border border-sky-200 text-sky-700 px-2 py-0.5 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "projects":
        return projects?.length > 0 ? (
          <div key={key} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Test
              </div>
              <h2 className="text-sm font-bold text-gray-800">Projects</h2>
            </div>
            <div className="border-l-2 border-sky-300 ml-3">
              {projects.map((proj) => (
                <div key={proj.id} className="pl-4 pb-3 relative">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-sky-500" />
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {proj.name}
                    </h3>
                    {proj.url && (
                      <span className="text-xs text-sky-500 ml-2 truncate max-w-[150px]">
                        {proj.url}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5">
                    {proj.description}
                  </p>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-sky-50 border border-sky-200 text-sky-700 px-1.5 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {proj.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-700 pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-sky-400 before:text-[10px]"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "certifications":
        return certifications?.length > 0 ? (
          <div key={key} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Verify
              </div>
              <h2 className="text-sm font-bold text-gray-800">
                Certifications
              </h2>
            </div>
            <div className="border-l-2 border-sky-300 pl-4 ml-3 space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-green-600 font-bold">
                      {"\u2713"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-800">
                      {cert.name}
                    </h3>
                    <p className="text-[10px] text-gray-500">
                      {cert.issuer} &middot; {formatDate(cert.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "personalInfo":
        return null;

      default:
        return null;
    }
  };

  return (
    <div className={cn("w-[794px] min-h-[1123px] bg-white", className)}>
      {/* Header */}
      <div className="bg-sky-500 text-white px-8 py-5">
        <h1 className="text-2xl font-bold">{personalInfo.fullName}</h1>
        {personalInfo.title && (
          <p className="text-sm text-sky-100 font-medium mt-0.5">
            {personalInfo.title}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-sky-100">
          <span>{personalInfo.email}</span>
          <span>{personalInfo.phone}</span>
          <span>{personalInfo.location}</span>
          {personalInfo.linkedIn && <span>{personalInfo.linkedIn}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
          {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
        </div>
      </div>

      {/* Body */}
      <div className="p-8">
        {sectionOrder
          .filter((key) => key !== "personalInfo")
          .map((key) => renderSection(key))}
      </div>
    </div>
  );
}
