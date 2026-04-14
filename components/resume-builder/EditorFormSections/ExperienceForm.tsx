"use client";

import { createExperienceEntry } from "@/lib/resume-builder/default-data";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface ExperienceFormProps {
  data: ResumeExperience[];
  onChange: (data: ResumeExperience[]) => void;
}

export default function ExperienceForm({
  data,
  onChange,
}: ExperienceFormProps) {
  const addEntry = () => {
    onChange([...data, createExperienceEntry()]);
  };

  const removeEntry = (id: string) => {
    onChange(data.filter((e) => e.id !== id));
  };

  const updateEntry = (
    id: string,
    field: keyof ResumeExperience,
    value: string | string[],
  ) => {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const moveEntry = (index: number, direction: "up" | "down") => {
    const newData = [...data];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newData.length) return;
    [newData[index], newData[targetIndex]] = [
      newData[targetIndex],
      newData[index],
    ];
    onChange(newData);
  };

  const updateHighlight = (
    entryId: string,
    highlightIndex: number,
    value: string,
  ) => {
    onChange(
      data.map((e) => {
        if (e.id !== entryId) return e;
        const newHighlights = [...e.highlights];
        newHighlights[highlightIndex] = value;
        return { ...e, highlights: newHighlights };
      }),
    );
  };

  const addHighlight = (entryId: string) => {
    onChange(
      data.map((e) => {
        if (e.id !== entryId) return e;
        return { ...e, highlights: [...e.highlights, ""] };
      }),
    );
  };

  const removeHighlight = (entryId: string, highlightIndex: number) => {
    onChange(
      data.map((e) => {
        if (e.id !== entryId) return e;
        return {
          ...e,
          highlights: e.highlights.filter((_, i) => i !== highlightIndex),
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Work Experience</h3>
        <button
          onClick={addEntry}
          className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-sm text-light-600 text-center py-6">
          No experience entries yet. Click "Add Experience" to get started.
        </p>
      )}

      <div className="space-y-4">
        {data.map((entry, index) => (
          <div key={entry.id} className="interview-glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-light-600" />
                <span className="text-sm font-medium text-light-400">
                  Experience {index + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveEntry(index, "up")}
                    className="text-xs text-light-400 hover:text-white"
                    aria-label="Move experience up"
                    title="Move up"
                  >
                    ↑
                  </button>
                )}
                {index < data.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveEntry(index, "down")}
                    className="text-xs text-light-400 hover:text-white"
                    aria-label="Move experience down"
                    title="Move down"
                  >
                    ↓
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-destructive-100 hover:text-destructive-200 transition-colors"
                  aria-label={`Remove experience at ${entry.company || `position ${index + 1}`}`}
                  title="Remove experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-light-400 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={entry.company}
                  onChange={(e) =>
                    updateEntry(entry.id, "company", e.target.value)
                  }
                  placeholder="Stripe"
                  className="interview-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-light-400 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={entry.role}
                  onChange={(e) =>
                    updateEntry(entry.id, "role", e.target.value)
                  }
                  placeholder="Senior Software Engineer"
                  className="interview-input w-full"
                />
              </div>
              <div>
                <label
                  htmlFor={`experience-start-${entry.id}`}
                  className="block text-sm text-light-400 mb-1"
                >
                  Start Date
                </label>
                <input
                  id={`experience-start-${entry.id}`}
                  type="month"
                  value={entry.startDate}
                  onChange={(e) =>
                    updateEntry(entry.id, "startDate", e.target.value)
                  }
                  title="Start date"
                  className="interview-input w-full"
                />
              </div>
              <div>
                <label
                  htmlFor={`experience-end-${entry.id}`}
                  className="block text-sm text-light-400 mb-1"
                >
                  End Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`experience-end-${entry.id}`}
                    type="month"
                    value={entry.endDate === "Present" ? "" : entry.endDate}
                    onChange={(e) =>
                      updateEntry(
                        entry.id,
                        "endDate",
                        e.target.value || "Present",
                      )
                    }
                    className="interview-input w-full"
                    disabled={entry.endDate === "Present"}
                    title="End date"
                  />
                  <label className="flex items-center gap-1 text-xs text-light-400 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entry.endDate === "Present"}
                      onChange={(e) =>
                        updateEntry(
                          entry.id,
                          "endDate",
                          e.target.checked ? "Present" : "",
                        )
                      }
                      className="rounded border-gray-600"
                    />
                    Current
                  </label>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-light-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={entry.location || ""}
                  onChange={(e) =>
                    updateEntry(entry.id, "location", e.target.value)
                  }
                  placeholder="San Francisco, CA"
                  className="interview-input w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm text-light-400">
                  Key Achievements / Bullets
                </label>
                <button
                  type="button"
                  onClick={() => addHighlight(entry.id)}
                  className="text-xs text-primary-200 hover:text-white transition-colors"
                >
                  + Add bullet
                </button>
              </div>
              {entry.highlights.map((highlight, hIndex) => (
                <div key={hIndex} className="flex items-start gap-2">
                  <span className="text-light-600 mt-2.5 text-xs">•</span>
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) =>
                      updateHighlight(entry.id, hIndex, e.target.value)
                    }
                    placeholder="Led a team of 5 engineers to redesign..."
                    className="interview-input w-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(entry.id, hIndex)}
                    className="text-light-600 hover:text-destructive-100 mt-2 transition-colors"
                    aria-label={`Remove bullet ${hIndex + 1}`}
                    title="Remove bullet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
