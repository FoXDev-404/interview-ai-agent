import { lazy, ComponentType } from "react";

const templateRegistry = new Map<string, TemplateRegistryEntry>();
let allTemplatesCache: TemplateRegistryEntry[] | null = null;
let categoryCountsCache: Map<TemplateCategory, number> | null = null;

const CATEGORY_DEFINITIONS: { category: TemplateCategory; label: string }[] = [
  { category: "modern", label: "Modern" },
  { category: "classic", label: "Classic" },
  { category: "creative", label: "Creative" },
  { category: "minimal", label: "Minimal" },
  { category: "professional", label: "Professional" },
  { category: "tech", label: "Tech" },
  { category: "executive", label: "Executive" },
  { category: "ats", label: "ATS-Optimized" },
];

function ensureTemplateCaches() {
  if (allTemplatesCache && categoryCountsCache) return;

  allTemplatesCache = Array.from(templateRegistry.values());
  categoryCountsCache = new Map<TemplateCategory, number>();

  for (const template of allTemplatesCache) {
    categoryCountsCache.set(
      template.category,
      (categoryCountsCache.get(template.category) ?? 0) + 1,
    );
  }
}

function registerTemplate(
  metadata: TemplateMetadata,
  loader: () => Promise<{ default: ComponentType<TemplateProps> }>,
) {
  templateRegistry.set(metadata.id, {
    ...metadata,
    component: lazy(loader),
  });

  allTemplatesCache = null;
  categoryCountsCache = null;
}

export function getTemplate(id: string): TemplateRegistryEntry | undefined {
  return templateRegistry.get(id);
}

export function getAllTemplates(): TemplateRegistryEntry[] {
  ensureTemplateCaches();
  return allTemplatesCache ?? [];
}

export function getTemplatesByCategory(
  category: TemplateCategory,
): TemplateRegistryEntry[] {
  return getAllTemplates().filter((t) => t.category === category);
}

export function getTemplateCategories(): {
  category: TemplateCategory;
  label: string;
  count: number;
}[] {
  ensureTemplateCaches();

  return CATEGORY_DEFINITIONS.map((c) => ({
    ...c,
    count: categoryCountsCache?.get(c.category) ?? 0,
  }));
}

// ─── Modern Templates ────────────────────────────────────
registerTemplate(
  {
    id: "modern-01",
    name: "Aurora",
    category: "modern",
    description: "Clean two-column with colorful sidebar",
    tags: ["two-column", "sidebar", "colorful"],
    previewColors: ["#7c6fff", "#cac5fe"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/modern/Modern01"),
);
registerTemplate(
  {
    id: "modern-02",
    name: "Meridian",
    category: "modern",
    description: "Asymmetric columns with accent strip",
    tags: ["two-column", "accent", "modern"],
    previewColors: ["#6366f1", "#818cf8"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/modern/Modern02"),
);
registerTemplate(
  {
    id: "modern-03",
    name: "Horizon",
    category: "modern",
    description: "Full-width header with two-column body",
    tags: ["header", "two-column", "gradient"],
    previewColors: ["#0ea5e9", "#38bdf8"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/modern/Modern03"),
);
registerTemplate(
  {
    id: "modern-04",
    name: "Prism",
    category: "modern",
    description: "Diagonal header accent with timeline",
    tags: ["diagonal", "timeline", "geometric"],
    previewColors: ["#8b5cf6", "#a78bfa"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/modern/Modern04"),
);
registerTemplate(
  {
    id: "modern-05",
    name: "Flux",
    category: "modern",
    description: "Floating cards layout with subtle shadows",
    tags: ["cards", "shadow", "spacious"],
    previewColors: ["#14b8a6", "#2dd4bf"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/modern/Modern05"),
);
registerTemplate(
  {
    id: "modern-06",
    name: "Zenith",
    category: "modern",
    description: "Bold header with clean body",
    tags: ["bold-header", "single-column", "modern"],
    previewColors: ["#f43f5e", "#fb7185"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/modern/Modern06"),
);
registerTemplate(
  {
    id: "modern-07",
    name: "Catalyst",
    category: "modern",
    description: "Three-panel layout with stats sidebar",
    tags: ["three-panel", "stats", "compact"],
    previewColors: ["#f97316", "#fb923c"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/modern/Modern07"),
);

// ─── Classic Templates ───────────────────────────────────
registerTemplate(
  {
    id: "classic-01",
    name: "Cambridge",
    category: "classic",
    description: "Traditional academic/professional format",
    tags: ["single-column", "serif", "academic"],
    previewColors: ["#1e3a5f", "#2563eb"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/classic/Classic01"),
);
registerTemplate(
  {
    id: "classic-02",
    name: "Oxford",
    category: "classic",
    description: "Two-column classic with formal styling",
    tags: ["two-column", "formal", "navy"],
    previewColors: ["#1e40af", "#3b82f6"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/classic/Classic02"),
);
registerTemplate(
  {
    id: "classic-03",
    name: "Heritage",
    category: "classic",
    description: "Conservative corporate layout",
    tags: ["single-column", "corporate", "subtle"],
    previewColors: ["#374151", "#6b7280"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/classic/Classic03"),
);
registerTemplate(
  {
    id: "classic-04",
    name: "Prestige",
    category: "classic",
    description: "Elegant with tasteful color accents",
    tags: ["single-column", "elegant", "decorative"],
    previewColors: ["#0f172a", "#334155"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/classic/Classic04"),
);
registerTemplate(
  {
    id: "classic-05",
    name: "Cornerstone",
    category: "classic",
    description: "Newspaper-style columns with ruled lines",
    tags: ["two-column", "ruled", "typeset"],
    previewColors: ["#292524", "#57534e"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/classic/Classic05"),
);
registerTemplate(
  {
    id: "classic-06",
    name: "Legacy",
    category: "classic",
    description: "Centered header, traditional body",
    tags: ["single-column", "centered", "classic"],
    previewColors: ["#1c1917", "#44403c"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/classic/Classic06"),
);

// ─── Creative Templates ──────────────────────────────────
registerTemplate(
  {
    id: "creative-01",
    name: "Palette",
    category: "creative",
    description: "Colorful geometric blocks per section",
    tags: ["colorful", "blocks", "pastel"],
    previewColors: ["#ec4899", "#f472b6"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/creative/Creative01"),
);
registerTemplate(
  {
    id: "creative-02",
    name: "Origami",
    category: "creative",
    description: "Angular design with folded-paper effect",
    tags: ["angular", "paper", "unique"],
    previewColors: ["#d946ef", "#e879f9"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/creative/Creative02"),
);
registerTemplate(
  {
    id: "creative-03",
    name: "Canvas",
    category: "creative",
    description: "Art-portfolio inspired layout",
    tags: ["portfolio", "artistic", "creative"],
    previewColors: ["#f59e0b", "#fbbf24"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/creative/Creative03"),
);
registerTemplate(
  {
    id: "creative-04",
    name: "Mosaic",
    category: "creative",
    description: "Tile-based grid layout",
    tags: ["grid", "tiles", "colorful"],
    previewColors: ["#06b6d4", "#22d3ee"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/creative/Creative04"),
);
registerTemplate(
  {
    id: "creative-05",
    name: "Neon",
    category: "creative",
    description: "Dark background with neon accent glows",
    tags: ["dark", "neon", "dev"],
    previewColors: ["#22d3ee", "#f472b6"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/creative/Creative05"),
);
registerTemplate(
  {
    id: "creative-06",
    name: "Doodle",
    category: "creative",
    description: "Hand-drawn border accents on clean base",
    tags: ["sketched", "playful", "casual"],
    previewColors: ["#a855f7", "#c084fc"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/creative/Creative06"),
);

// ─── Minimal Templates ──────────────────────────────────
registerTemplate(
  {
    id: "minimal-01",
    name: "Blank",
    category: "minimal",
    description: "Maximum whitespace, zero decoration",
    tags: ["whitespace", "clean", "no-color"],
    previewColors: ["#9ca3af", "#d1d5db"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/minimal/Minimal01"),
);
registerTemplate(
  {
    id: "minimal-02",
    name: "Slate",
    category: "minimal",
    description: "Gray-scale only, understated elegance",
    tags: ["grayscale", "elegant", "subtle"],
    previewColors: ["#64748b", "#94a3b8"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/minimal/Minimal02"),
);
registerTemplate(
  {
    id: "minimal-03",
    name: "Wire",
    category: "minimal",
    description: "Hairline borders define structure",
    tags: ["borders", "grid", "light"],
    previewColors: ["#cbd5e1", "#e2e8f0"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/minimal/Minimal03"),
);
registerTemplate(
  {
    id: "minimal-04",
    name: "Dot",
    category: "minimal",
    description: "Dot-grid section dividers",
    tags: ["dots", "dividers", "minimal"],
    previewColors: ["#a1a1aa", "#d4d4d8"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/minimal/Minimal04"),
);
registerTemplate(
  {
    id: "minimal-05",
    name: "Space",
    category: "minimal",
    description: "Ultra-generous margins and spacing",
    tags: ["spacious", "breathing", "wide-margin"],
    previewColors: ["#737373", "#a3a3a3"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/minimal/Minimal05"),
);
registerTemplate(
  {
    id: "minimal-06",
    name: "Type",
    category: "minimal",
    description: "Pure typography hierarchy, no borders",
    tags: ["typography", "hierarchy", "no-borders"],
    previewColors: ["#525252", "#737373"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/minimal/Minimal06"),
);

// ─── Professional Templates ──────────────────────────────
registerTemplate(
  {
    id: "professional-01",
    name: "Corporate",
    category: "professional",
    description: "Business-ready format with structured layout",
    tags: ["two-column", "corporate", "blue"],
    previewColors: ["#1d4ed8", "#3b82f6"],
    isAtsOptimized: true,
  },
  () =>
    import("@/components/resume-builder/templates/professional/Professional01"),
);
registerTemplate(
  {
    id: "professional-02",
    name: "Consultant",
    category: "professional",
    description: "Emphasizes experience and achievements",
    tags: ["single-column", "achievement", "metric"],
    previewColors: ["#047857", "#059669"],
    isAtsOptimized: true,
  },
  () =>
    import("@/components/resume-builder/templates/professional/Professional02"),
);
registerTemplate(
  {
    id: "professional-03",
    name: "Director",
    category: "professional",
    description: "Senior-level emphasis on leadership",
    tags: ["single-column", "leadership", "bold"],
    previewColors: ["#7c3aed", "#8b5cf6"],
    isAtsOptimized: true,
  },
  () =>
    import("@/components/resume-builder/templates/professional/Professional03"),
);
registerTemplate(
  {
    id: "professional-04",
    name: "Analyst",
    category: "professional",
    description: "Data-focused layout with skill bars",
    tags: ["two-column", "data", "charts"],
    previewColors: ["#0369a1", "#0284c7"],
    isAtsOptimized: true,
  },
  () =>
    import("@/components/resume-builder/templates/professional/Professional04"),
);
registerTemplate(
  {
    id: "professional-05",
    name: "Advisor",
    category: "professional",
    description: "Financial/consulting style",
    tags: ["single-column", "conservative", "navy"],
    previewColors: ["#1e3a5f", "#1e40af"],
    isAtsOptimized: true,
  },
  () =>
    import("@/components/resume-builder/templates/professional/Professional05"),
);
registerTemplate(
  {
    id: "professional-06",
    name: "Strategist",
    category: "professional",
    description: "Strategic thinker with achievements banner",
    tags: ["two-column", "strategic", "banner"],
    previewColors: ["#4338ca", "#6366f1"],
    isAtsOptimized: true,
  },
  () =>
    import("@/components/resume-builder/templates/professional/Professional06"),
);

// ─── Tech Templates ──────────────────────────────────────
registerTemplate(
  {
    id: "tech-01",
    name: "Terminal",
    category: "tech",
    description: "Code-editor inspired layout",
    tags: ["monospace", "code", "dark-accent"],
    previewColors: ["#22c55e", "#4ade80"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/tech/Tech01"),
);
registerTemplate(
  {
    id: "tech-02",
    name: "GitHub",
    category: "tech",
    description: "GitHub profile inspired",
    tags: ["github", "contribution", "dev"],
    previewColors: ["#171717", "#404040"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/tech/Tech02"),
);
registerTemplate(
  {
    id: "tech-03",
    name: "Stack",
    category: "tech",
    description: "Stack Overflow inspired",
    tags: ["tags", "reputation", "community"],
    previewColors: ["#f48024", "#fbad50"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/tech/Tech03"),
);
registerTemplate(
  {
    id: "tech-04",
    name: "DevOps",
    category: "tech",
    description: "Pipeline/CI-CD inspired flow",
    tags: ["pipeline", "timeline", "flow"],
    previewColors: ["#0ea5e9", "#38bdf8"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/tech/Tech04"),
);
registerTemplate(
  {
    id: "tech-05",
    name: "API",
    category: "tech",
    description: "REST API documentation style",
    tags: ["api", "documentation", "endpoints"],
    previewColors: ["#8b5cf6", "#a78bfa"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/tech/Tech05"),
);
registerTemplate(
  {
    id: "tech-06",
    name: "Circuit",
    category: "tech",
    description: "PCB/circuit board aesthetic",
    tags: ["circuit", "hardware", "technical"],
    previewColors: ["#059669", "#34d399"],
    isAtsOptimized: false,
  },
  () => import("@/components/resume-builder/templates/tech/Tech06"),
);

// ─── Executive Templates ────────────────────────────────
registerTemplate(
  {
    id: "executive-01",
    name: "Chairman",
    category: "executive",
    description: "C-suite level, understated luxury",
    tags: ["single-column", "luxury", "gold"],
    previewColors: ["#b45309", "#d97706"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/executive/Executive01"),
);
registerTemplate(
  {
    id: "executive-02",
    name: "Boardroom",
    category: "executive",
    description: "High-impact metrics focus",
    tags: ["single-column", "metrics", "kpi"],
    previewColors: ["#0f172a", "#1e293b"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/executive/Executive02"),
);
registerTemplate(
  {
    id: "executive-03",
    name: "Summit",
    category: "executive",
    description: "Global executive, multilingual ready",
    tags: ["two-column", "global", "international"],
    previewColors: ["#164e63", "#0e7490"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/executive/Executive03"),
);
registerTemplate(
  {
    id: "executive-04",
    name: "Pinnacle",
    category: "executive",
    description: "Designed for 15+ year careers",
    tags: ["single-column", "timeline", "compact"],
    previewColors: ["#3f3f46", "#52525b"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/executive/Executive04"),
);

// ─── ATS Templates ──────────────────────────────────────
registerTemplate(
  {
    id: "ats-01",
    name: "Scanner",
    category: "ats",
    description: "Maximum ATS compatibility",
    tags: ["single-column", "minimal", "system-font"],
    previewColors: ["#374151", "#6b7280"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/ats/ATS01"),
);
registerTemplate(
  {
    id: "ats-02",
    name: "Parser",
    category: "ats",
    description: "Keyword-optimized format",
    tags: ["single-column", "keyword", "dense"],
    previewColors: ["#1f2937", "#4b5563"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/ats/ATS02"),
);
registerTemplate(
  {
    id: "ats-03",
    name: "Beacon",
    category: "ats",
    description: "Clean with subtle navy color",
    tags: ["single-column", "navy", "clean"],
    previewColors: ["#1e3a5f", "#2563eb"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/ats/ATS03"),
);
registerTemplate(
  {
    id: "ats-04",
    name: "Clear",
    category: "ats",
    description: "Transparent hierarchical structure",
    tags: ["single-column", "hierarchy", "bold-headings"],
    previewColors: ["#111827", "#374151"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/ats/ATS04"),
);
registerTemplate(
  {
    id: "ats-05",
    name: "Standard",
    category: "ats",
    description: "Industry standard format",
    tags: ["single-column", "standard", "traditional"],
    previewColors: ["#27272a", "#52525b"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/ats/ATS05"),
);
registerTemplate(
  {
    id: "ats-06",
    name: "Compass",
    category: "ats",
    description: "Balanced readability and ATS score",
    tags: ["two-column", "balanced", "readable"],
    previewColors: ["#0f766e", "#14b8a6"],
    isAtsOptimized: true,
  },
  () => import("@/components/resume-builder/templates/ats/ATS06"),
);
