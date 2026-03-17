"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createCodingInterview, createInterview } from "@/lib/actions/interview.action";
import type { CodingLanguage } from "@/lib/codingInterview";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TECH_CATEGORIES: Record<string, string[]> = {
  "Frontend": ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "Tailwind CSS", "Bootstrap" ,"HTML" ,"CSS"],
  "Backend": ["Node.js", "Express", "Python", "Django", "Flask", "Java", "Spring", "Go", "Rust"],
  "DevOps & Cloud": ["Docker", "Kubernetes", "AWS", "Azure", "GraphQL", "REST API"],
  "Databases": ["MongoDB", "PostgreSQL", "MySQL", "Redis"],
  "Other": ["C#", ".NET", "PHP", "Laravel", "Ruby", "Rails"],
};

const ALL_TECH = Object.values(TECH_CATEGORIES).flat();

const CODING_LANGUAGES: Array<{ value: CodingLanguage; label: string }> = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

const ROLE_GROUPS: Array<{ label: string; roles: string[] }> = [
  {
    label: "Core Software",
    roles: [
      "Software Developer",
      "Application Engineer",
      "Full Stack Developer",
      "Backend Developer",
      "Frontend Developer",
    ],
  },
  {
    label: "Web & UI",
    roles: [
      "React Developer",
      "Next.js Developer",
      "UI Engineer",
      "Web Developer",
      "JavaScript Engineer",
      "TypeScript Engineer",
    ],
  },
  {
    label: "Platform & Cloud",
    roles: [
      "Platform Engineer",
      "DevOps Engineer",
      "Site Reliability Engineer",
      "Cloud Engineer",
      "Infrastructure Engineer",
      "Build and Release Engineer",
    ],
  },
  {
    label: "Data & AI",
    roles: [
      "Data Engineer",
      "Machine Learning Engineer",
      "AI Engineer",
      "MLOps Engineer",
      "Data Platform Engineer",
      "Analytics Engineer",
    ],
  },
  {
    label: "Mobile & Embedded",
    roles: [
      "Mobile Developer",
      "Android Engineer",
      "iOS Engineer",
      "Cross-Platform Developer",
      "Embedded Software Engineer",
      "Firmware Engineer",
    ],
  },
  {
    label: "Quality & Security",
    roles: [
      "QA Engineer",
      "QA Automation Engineer",
      "Test Engineer",
      "Security Engineer",
      "Application Security Engineer",
      "Penetration Testing Engineer",
    ],
  },
  {
    label: "Specialized",
    roles: [
      "Blockchain Developer",
      "Game Developer",
      "AR/VR Engineer",
      "Robotics Software Engineer",
      "Solutions Engineer",
      "Staff Software Engineer",
      "Principal Software Engineer",
    ],
  },
];

const ALL_ROLES = ROLE_GROUPS.flatMap((group) => group.roles);

const LEVEL_OPTIONS = [
  { value: "Junior", label: "Junior", desc: "0–2 years", icon: "🌱" },
  { value: "Mid", label: "Mid-level", desc: "2–5 years", icon: "🚀" },
  { value: "Senior", label: "Senior", desc: "5+ years", icon: "⭐" },
];

const TYPE_OPTIONS = [
  {
    value: "Technical", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.194-.14 1.743" />
      </svg>
    )
  },
  {
    value: "Behavioral", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    )
  },
  {
    value: "Mixed", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    )
  },
  {
    value: "Coding", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    )
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }
  }),
};

const InterviewForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [techFilter, setTechFilter] = useState("");
  const [activeCategory, setActiveCategory] = useState("Frontend");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState({
    role: "",
    level: "Junior",
    type: "Technical",
    techstack: [] as string[],
    codingLanguage: "javascript" as CodingLanguage,
  });

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (!response.ok) {
          setCurrentUser(null);
          return;
        }

        const user = await response.json();
        setCurrentUser(user.uid || null);
      } catch {
        setCurrentUser(null);
      }
    };

    loadCurrentUser();

    const role = searchParams.get('role');
    const type = searchParams.get('type');
    const level = searchParams.get('level');
    const techstack = searchParams.get('techstack');
    if (role || type || level || techstack) {
      setFormData(prev => ({
        ...prev,
        role: role || prev.role,
        type:
          type === 'mixed'
            ? 'Mixed'
            : type === 'technical'
              ? 'Technical'
              : type === 'coding'
                ? 'Coding'
                : type || prev.type,
        level: level ? level.charAt(0).toUpperCase() + level.slice(1) : prev.level,
        techstack: techstack ? techstack.split(',').map(t => t.trim()) : prev.techstack
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setIsRoleMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRoleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredTech = useMemo(() => {
    if (techFilter) {
      return ALL_TECH.filter(t => t.toLowerCase().includes(techFilter.toLowerCase()));
    }
    return TECH_CATEGORIES[activeCategory] || [];
  }, [techFilter, activeCategory]);

  const estimatedDuration = useMemo(() => {
    if (formData.type === "Coding") return "40-55 min";
    if (formData.type === "Mixed") return "30-40 min";
    if (formData.type === "Behavioral") return "20-30 min";
    return "25-35 min";
  }, [formData.type]);

  const hasPresetCustomRole = useMemo(() => {
    const role = formData.role.trim();
    return role.length > 0 && !ALL_ROLES.includes(role);
  }, [formData.role]);

  const handleTechToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techstack: prev.techstack.includes(tech)
        ? prev.techstack.filter(t => t !== tech)
        : [...prev.techstack, tech]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role.trim()) { toast.error("Please enter a role"); return; }
    if (formData.type !== 'Coding' && formData.techstack.length === 0) {
      toast.error("Please select at least one technology");
      return;
    }
    if (!currentUser) { toast.error("Please sign in"); router.push('/sign-in'); return; }

    setLoading(true);
    try {
      const result =
        formData.type === 'Coding'
          ? await createCodingInterview({
              userId: currentUser,
              role: formData.role,
              level: formData.level,
              language: formData.codingLanguage,
            })
          : await createInterview({
              userId: currentUser,
              role: formData.role,
              level: formData.level,
              techstack: formData.techstack,
              type: formData.type,
            });

      if (result.success) {
        toast.success("Interview created!");
        if (formData.type === 'Coding') {
          router.push(`/coding-interview/${result.interviewId}`);
        } else {
          router.push(`/interview/${result.interviewId}/questions`);
        }
      } else { toast.error(result.message); }
    } catch { toast.error("Failed to create interview"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="saas-form">
      {/* ── Job Role ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="saas-field-group">
        <label htmlFor="role" className="saas-label">
          Job Role
          <span className="saas-label-hint">Title you are preparing to interview for</span>
        </label>
        <div className="saas-input-wrap" ref={roleMenuRef}>
          <svg className="saas-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          <button
            type="button"
            id="role"
            className="saas-input saas-role-trigger"
            onClick={() => setIsRoleMenuOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isRoleMenuOpen}
          >
            <span className={`saas-role-trigger-text ${formData.role ? "saas-role-trigger-text-filled" : ""}`}>
              {formData.role || "Select your target role"}
            </span>
          </button>
          <svg className="saas-select-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>

          <AnimatePresence>
            {isRoleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="saas-role-menu"
                role="listbox"
                aria-labelledby="role"
              >
                {hasPresetCustomRole && (
                  <button
                    type="button"
                    className="saas-role-option saas-role-option-active"
                    onClick={() => setIsRoleMenuOpen(false)}
                  >
                    {formData.role} (preset)
                  </button>
                )}
                {ROLE_GROUPS.map((group) => (
                  <div key={group.label} className="saas-role-group">
                    <p className="saas-role-group-label">{group.label}</p>
                    <div className="saas-role-group-items">
                      {group.roles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          className={`saas-role-option ${formData.role === role ? "saas-role-option-active" : ""}`}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, role }));
                            setIsRoleMenuOpen(false);
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Experience Level ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="saas-field-group">
        <label className="saas-label">
          Experience Level
          <span className="saas-label-hint">Difficulty and expectations align to this level</span>
        </label>
        <div className="saas-level-grid">
          {LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, level: opt.value }))}
              className={`saas-level-card ${formData.level === opt.value ? "saas-level-active" : ""}`}
            >
              <span className="text-xl mb-1">{opt.icon}</span>
              <span className="saas-level-label">{opt.label}</span>
              <span className="saas-level-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Interview Type ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="saas-field-group">
        <label className="saas-label">
          Interview Mode
          <span className="saas-label-hint">Pick the focus area for this run</span>
        </label>
        <div className="saas-type-grid">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: opt.value }))}
              className={`saas-type-card ${formData.type === opt.value ? "saas-type-active" : ""}`}
            >
              <span className="saas-type-icon">{opt.icon}</span>
              <span className="text-xs font-medium mt-1">{opt.value}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {formData.type === 'Coding' && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="saas-field-group">
          <label htmlFor="codingLanguage" className="saas-label">
            Programming Language
            <span className="saas-label-hint">Problems and test cases will use this language</span>
          </label>
          <div className="saas-input-wrap">
            <select
              id="codingLanguage"
              className="saas-input saas-select"
              value={formData.codingLanguage}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, codingLanguage: e.target.value as CodingLanguage }))
              }
            >
              {CODING_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <svg className="saas-select-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* ── Technologies ─── */}
      {formData.type !== 'Coding' && (
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="saas-field-group">
        <label className="saas-label">
          Technologies & Skills
          <span className="saas-label-hint">Select the stack you want interviewers to probe</span>
        </label>

        {/* Search */}
        <div className="saas-input-wrap mb-3">
          <svg className="saas-input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Find tools, frameworks, and platforms"
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="saas-input"
          />
        </div>

        {/* Category tabs */}
        {!techFilter && (
          <div className="saas-cat-tabs">
            {Object.keys(TECH_CATEGORIES).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`saas-cat-tab ${activeCategory === cat ? "saas-cat-tab-active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Chips */}
        <div className="saas-chip-grid">
          <AnimatePresence mode="popLayout">
            {filteredTech.map((tech) => (
              <motion.button
                key={tech}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                type="button"
                onClick={() => handleTechToggle(tech)}
                className={`saas-chip ${formData.techstack.includes(tech) ? "saas-chip-active" : ""}`}
              >
                {formData.techstack.includes(tech) && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
                {tech}
              </motion.button>
            ))}
          </AnimatePresence>
          {filteredTech.length === 0 && (
            <p className="text-sm text-white/30 col-span-full text-center py-4">No results found</p>
          )}
        </div>

        {/* Selected summary */}
        <AnimatePresence>
          {formData.techstack.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="saas-selected-wrap"
            >
              <div className="saas-selected-header">
                <span className="saas-selected-count">{formData.techstack.length} selected</span>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, techstack: [] }))} className="saas-clear-btn">Clear all</button>
              </div>
              <div className="saas-selected-tags">
                {formData.techstack.map(t => (
                  <span key={t} className="saas-tag">
                    {t}
                    <button type="button" onClick={() => handleTechToggle(t)} className="saas-tag-remove">×</button>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="saas-live-summary">
        <div className="saas-live-summary-head">
          <p className="saas-live-summary-title">Session Preview</p>
          <span className="saas-live-summary-pill">{estimatedDuration}</span>
        </div>
        <div className="saas-live-summary-grid">
          <div className="saas-live-summary-item">
            <p className="saas-summary-label">Role</p>
            <p className="saas-summary-value">{formData.role.trim() || "Not set yet"}</p>
          </div>
          <div className="saas-live-summary-item">
            <p className="saas-summary-label">Level</p>
            <p className="saas-summary-value">{formData.level}</p>
          </div>
          <div className="saas-live-summary-item">
            <p className="saas-summary-label">Mode</p>
            <p className="saas-summary-value">{formData.type}</p>
          </div>
          <div className="saas-live-summary-item">
            <p className="saas-summary-label">Focus</p>
            <p className="saas-summary-value">
              {formData.type === "Coding"
                ? CODING_LANGUAGES.find((lang) => lang.value === formData.codingLanguage)?.label
                : `${formData.techstack.length} selected`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Divider ─── */}
      <div className="saas-divider" />

      {/* ── Submit ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
        <button type="submit" className="saas-submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2.5">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Generating Your Interview...
            </span>
          ) : (
            <span className="saas-submit-content">
              <span>Launch Interview Session</span>
              <svg className="saas-submit-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          )}
        </button>
      </motion.div>
    </form>
  );
};

export default InterviewForm;
