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

export default function Tech05({ data, className }: TemplateProps) {
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
              <span className="text-xs font-mono font-bold text-violet-600">
                GET
              </span>
              <span className="text-sm font-mono text-gray-800">/summary</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">
                200 OK
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 font-mono">
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
              <span className="text-xs font-mono font-bold text-violet-600">
                GET
              </span>
              <span className="text-sm font-mono text-gray-800">
                /experience
              </span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">
                200 OK
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-3">
              {experience.map((exp) => (
                <div
                  key={exp.id}
                  className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-mono font-semibold text-gray-900">
                        {exp.role}
                      </h3>
                      <p className="text-xs font-mono text-violet-600">
                        {exp.company}
                        {exp.location ? ` // ${exp.location}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.highlights?.length > 0 && (
                    <div className="mt-1.5 bg-white border border-gray-200 rounded p-2">
                      <div className="text-[10px] font-mono text-gray-400 mb-1">
                        // response.highlights
                      </div>
                      <ul className="space-y-0.5">
                        {exp.highlights.map((h, i) => (
                          <li
                            key={i}
                            className="text-xs font-mono text-gray-700 pl-3 relative before:content-['-'] before:absolute before:left-0 before:text-violet-400"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
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
              <span className="text-xs font-mono font-bold text-violet-600">
                GET
              </span>
              <span className="text-sm font-mono text-gray-800">
                /education
              </span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">
                200 OK
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-mono font-semibold text-gray-900">
                        {edu.degree}
                      </h3>
                      <p className="text-xs font-mono text-violet-600">
                        {edu.institution}
                        {edu.location ? ` // ${edu.location}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                  {edu.gpa && (
                    <p className="text-xs font-mono text-gray-600 mt-0.5">
                      &quot;gpa&quot;: &quot;{edu.gpa}&quot;
                    </p>
                  )}
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {edu.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="text-xs font-mono text-gray-700 pl-3 relative before:content-['-'] before:absolute before:left-0 before:text-violet-400"
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
              <span className="text-xs font-mono font-bold text-green-600">
                POST
              </span>
              <span className="text-sm font-mono text-gray-800">/skills</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">
                201 Created
              </span>
            </div>
            <div className="bg-gray-900 rounded p-3 font-mono">
              <div className="text-[10px] text-gray-500 mb-1">{"{"}</div>
              {skills.map((group, i) => (
                <div key={i} className="ml-4 mb-1">
                  <span className="text-xs text-violet-400">
                    &quot;{group.category}&quot;
                  </span>
                  <span className="text-xs text-gray-400">: [</span>
                  <span className="text-xs text-green-400">
                    {group.items.map((item) => `"${item}"`).join(", ")}
                  </span>
                  <span className="text-xs text-gray-400">
                    ]{i < skills.length - 1 ? "," : ""}
                  </span>
                </div>
              ))}
              <div className="text-[10px] text-gray-500">{"}"}</div>
            </div>
          </div>
        ) : null;

      case "projects":
        return projects?.length > 0 ? (
          <div key={key} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-yellow-600">
                PUT
              </span>
              <span className="text-sm font-mono text-gray-800">/projects</span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">
                200 OK
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-mono font-semibold text-gray-900">
                      {proj.name}
                    </h3>
                    {proj.url && (
                      <span className="text-xs font-mono text-violet-500 ml-2 truncate max-w-[150px]">
                        {proj.url}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-gray-700 mt-0.5">
                    {proj.description}
                  </p>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded"
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
                          className="text-xs font-mono text-gray-700 pl-3 relative before:content-['-'] before:absolute before:left-0 before:text-violet-400"
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
              <span className="text-xs font-mono font-bold text-violet-600">
                GET
              </span>
              <span className="text-sm font-mono text-gray-800">
                /certifications
              </span>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">
                200 OK
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-1.5">
              {certifications.map((cert) => (
                <div key={cert.id} className="font-mono">
                  <span className="text-xs font-semibold text-gray-800">
                    {cert.name}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {" "}
                    // {cert.issuer} | {formatDate(cert.date)}
                  </span>
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
      <div className="bg-violet-600 text-white px-8 py-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono bg-violet-500 px-2 py-0.5 rounded">
            v1.0
          </span>
          <h1 className="text-2xl font-bold font-mono">
            {personalInfo.fullName}
          </h1>
        </div>
        {personalInfo.title && (
          <p className="text-sm font-mono text-violet-200 mt-0.5">
            {personalInfo.title}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs font-mono text-violet-200">
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
