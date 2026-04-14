"use client";

import { createProjectEntry } from "@/lib/resume-builder/default-data";
import { Plus, Trash2, GripVertical, X } from "lucide-react";
import { useState } from "react";

interface ProjectsFormProps {
  data: ResumeProject[];
  onChange: (data: ResumeProject[]) => void;
}

export default function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const [techInput, setTechInput] = useState<Record<string, string>>({});

  const addEntry = () => {
    onChange([...data, createProjectEntry()]);
  };

  const removeEntry = (id: string) => {
    onChange(data.filter((e) => e.id !== id));
  };

  const updateEntry = (
    id: string,
    field: keyof ResumeProject,
    value: string | string[],
  ) => {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addTech = (id: string) => {
    const value = techInput[id]?.trim();
    if (!value) return;
    onChange(
      data.map((e) =>
        e.id === id ? { ...e, technologies: [...e.technologies, value] } : e,
      ),
    );
    setTechInput((prev) => ({ ...prev, [id]: "" }));
  };

  const removeTech = (id: string, techIndex: number) => {
    onChange(
      data.map((e) =>
        e.id === id
          ? {
              ...e,
              technologies: e.technologies.filter((_, i) => i !== techIndex),
            }
          : e,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Projects</h3>
        <button
          onClick={addEntry}
          className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-sm text-light-600 text-center py-6">
          No projects yet. Click "Add Project" to showcase your work.
        </p>
      )}

      <div className="space-y-4">
        {data.map((entry, index) => (
          <div key={entry.id} className="interview-glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-light-600" />
                <span className="text-sm font-medium text-light-400">
                  Project {index + 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="text-destructive-100 hover:text-destructive-200 transition-colors"
                aria-label={`Remove project ${entry.name || index + 1}`}
                title="Remove project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-light-400 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) =>
                    updateEntry(entry.id, "name", e.target.value)
                  }
                  placeholder="OpenTrace"
                  className="interview-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-light-400 mb-1">URL</label>
                <input
                  type="text"
                  value={entry.url || ""}
                  onChange={(e) => updateEntry(entry.id, "url", e.target.value)}
                  placeholder="github.com/username/project"
                  className="interview-input w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-light-400 mb-1">
                  Description
                </label>
                <textarea
                  value={entry.description}
                  onChange={(e) =>
                    updateEntry(entry.id, "description", e.target.value)
                  }
                  placeholder="An open-source distributed tracing library..."
                  rows={2}
                  className="interview-textarea w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-light-400 mb-1">
                Technologies
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {entry.technologies.map((tech, tIndex) => (
                  <span
                    key={tIndex}
                    className="flex items-center gap-1 px-2 py-0.5 bg-dark-300 text-primary-200 text-xs rounded-full border border-primary-200/20"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(entry.id, tIndex)}
                      className="hover:text-destructive-100"
                      aria-label={`Remove technology ${tech}`}
                      title={`Remove ${tech}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput[entry.id] || ""}
                  onChange={(e) =>
                    setTechInput((prev) => ({
                      ...prev,
                      [entry.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTech(entry.id);
                    }
                  }}
                  placeholder="Type technology and press Enter"
                  className="interview-input flex-1"
                />
                <button
                  onClick={() => addTech(entry.id)}
                  className="px-3 py-1.5 text-xs bg-primary-200/20 text-primary-200 rounded-lg hover:bg-primary-200/30 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-light-400 mb-1">
                Highlights (one per line)
              </label>
              <textarea
                value={(entry.highlights || []).join("\n")}
                onChange={(e) =>
                  updateEntry(
                    entry.id,
                    "highlights",
                    e.target.value.split("\n").filter((l) => l.trim()),
                  )
                }
                placeholder="2.5K+ GitHub stars&#10;Featured in GopherCon 2022"
                rows={2}
                className="interview-textarea w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
