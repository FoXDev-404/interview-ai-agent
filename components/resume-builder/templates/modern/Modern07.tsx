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

export default function Modern07({ data, className }: TemplateProps) {
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

  const leftSections: ResumeSectionKey[] = ["skills", "certifications"];
  const centerSections: ResumeSectionKey[] = [
    "summary",
    "experience",
    "projects",
    "education",
  ];

  const renderLeftSection = (key: ResumeSectionKey) => {
    switch (key) {
      case "skills":
        return skills?.length > 0 ? (
          <div key={key} className="mb-5">
            <h2 className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.15em] mb-2">
              Skills
            </h2>
            {skills.map((group, i) => (
              <div key={i} className="mb-3">
                <h3 className="text-[10px] font-semibold text-gray-300 mb-1">
                  {group.category}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item, j) => (
                    <p key={j} className="text-[10px] text-gray-400">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case "certifications":
        return certifications?.length > 0 ? (
          <div key={key} className="mb-5">
            <h2 className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.15em] mb-2">
              Certifications
            </h2>
            {certifications.map((cert) => (
              <div key={cert.id} className="mb-2">
                <h3 className="text-[10px] font-semibold text-gray-300">
                  {cert.name}
                </h3>
                <p className="text-[9px] text-gray-500">{cert.issuer}</p>
                <p className="text-[9px] text-gray-500">
                  {formatDate(cert.date)}
                </p>
              </div>
            ))}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const renderCenterSection = (key: ResumeSectionKey) => {
    switch (key) {
      case "summary":
        return summary?.content ? (
          <div key={key} className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-orange-500">
              Summary
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed">
              {summary.content}
            </p>
          </div>
        ) : null;

      case "experience":
        return experience?.length > 0 ? (
          <div key={key} className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-orange-500">
              Experience
            </h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {exp.role}
                    </h3>
                    <p className="text-xs text-orange-600 font-medium">
                      {exp.company}
                      {exp.location ? ` — ${exp.location}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                    {formatDate(exp.startDate)} &ndash;{" "}
                    {formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.highlights?.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {exp.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-orange-400"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : null;

      case "projects":
        return projects?.length > 0 ? (
          <div key={key} className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-orange-500">
              Projects
            </h2>
            {projects.map((proj) => (
              <div key={proj.id} className="mb-3 last:mb-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {proj.name}
                  </h3>
                  {proj.url && (
                    <span className="text-[10px] text-orange-500 ml-2 truncate max-w-[140px]">
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
                        className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded"
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
                        className="text-xs text-gray-700 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-orange-400"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : null;

      case "education":
        return education?.length > 0 ? (
          <div key={key} className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-orange-500">
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3 last:mb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {edu.degree}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {edu.institution}
                      {edu.location ? ` — ${edu.location}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                    {formatDate(edu.startDate)} &ndash;{" "}
                    {formatDate(edu.endDate)}
                  </span>
                </div>
                {edu.gpa && (
                  <p className="text-xs text-gray-600 mt-0.5">GPA: {edu.gpa}</p>
                )}
                {edu.highlights && edu.highlights.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {edu.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-orange-400"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={cn("w-[794px] min-h-[1123px] bg-white flex", className)}>
      {/* Left sidebar - dark */}
      <div className="w-[22%] bg-slate-800 text-white p-4 flex flex-col">
        {/* Name in sidebar */}
        <div className="mb-5">
          <h1 className="text-base font-bold text-white leading-tight">
            {personalInfo.fullName}
          </h1>
          {personalInfo.title && (
            <p className="text-[10px] text-orange-400 font-medium mt-1">
              {personalInfo.title}
            </p>
          )}
        </div>

        {/* Contact */}
        <div className="mb-5">
          <h2 className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.15em] mb-2">
            Contact
          </h2>
          <div className="space-y-1.5 text-[10px] text-gray-300">
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
            {personalInfo.linkedIn && (
              <p className="truncate">{personalInfo.linkedIn}</p>
            )}
            {personalInfo.github && (
              <p className="truncate">{personalInfo.github}</p>
            )}
            {personalInfo.portfolio && (
              <p className="truncate">{personalInfo.portfolio}</p>
            )}
          </div>
        </div>

        {/* Left sidebar sections */}
        {sectionOrder
          .filter((key) => key !== "personalInfo" && leftSections.includes(key))
          .map((key) => renderLeftSection(key))}
      </div>

      {/* Center content */}
      <div className="w-[56%] p-5">
        {sectionOrder
          .filter(
            (key) => key !== "personalInfo" && centerSections.includes(key),
          )
          .map((key) => renderCenterSection(key))}
      </div>

      {/* Right strip */}
      <div className="w-[22%] bg-gray-50 p-4 border-l border-gray-200">
        {/* Quick stats */}
        {experience?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-2">
              Quick Stats
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {experience.length}
                </p>
                <p className="text-[9px] text-gray-500 uppercase">
                  Positions Held
                </p>
              </div>
              {skills?.length > 0 && (
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {skills.reduce((acc, g) => acc + g.items.length, 0)}
                  </p>
                  <p className="text-[9px] text-gray-500 uppercase">Skills</p>
                </div>
              )}
              {projects?.length > 0 && (
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {projects.length}
                  </p>
                  <p className="text-[9px] text-gray-500 uppercase">Projects</p>
                </div>
              )}
              {certifications?.length > 0 && (
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {certifications.length}
                  </p>
                  <p className="text-[9px] text-gray-500 uppercase">
                    Certifications
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education summary in right column */}
        {education?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-2">
              Degrees
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <p className="text-[10px] font-semibold text-gray-800">
                  {edu.degree}
                </p>
                <p className="text-[9px] text-gray-500">{edu.institution}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
