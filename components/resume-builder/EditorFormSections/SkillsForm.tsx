"use client";

import { createSkillCategory } from "@/lib/resume-builder/default-data";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface SkillsFormProps {
  data: ResumeSkill[];
  onChange: (data: ResumeSkill[]) => void;
}

export default function SkillsForm({ data, onChange }: SkillsFormProps) {
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const addCategory = () => {
    onChange([...data, createSkillCategory()]);
  };

  const removeCategory = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateCategoryName = (index: number, name: string) => {
    onChange(data.map((s, i) => (i === index ? { ...s, category: name } : s)));
  };

  const addSkill = (categoryIndex: number) => {
    const value = inputValues[categoryIndex]?.trim();
    if (!value) return;
    onChange(
      data.map((s, i) =>
        i === categoryIndex ? { ...s, items: [...s.items, value] } : s,
      ),
    );
    setInputValues((prev) => ({ ...prev, [categoryIndex]: "" }));
  };

  const removeSkill = (categoryIndex: number, skillIndex: number) => {
    onChange(
      data.map((s, i) =>
        i === categoryIndex
          ? { ...s, items: s.items.filter((_, si) => si !== skillIndex) }
          : s,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Skills</h3>
        <button
          onClick={addCategory}
          className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {data.length === 0 && (
        <p className="text-sm text-light-600 text-center py-6">
          No skill categories yet. Click "Add Category" to organize your skills.
        </p>
      )}

      <div className="space-y-4">
        {data.map((category, cIndex) => (
          <div key={cIndex} className="interview-glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={category.category}
                onChange={(e) => updateCategoryName(cIndex, e.target.value)}
                placeholder="e.g., Languages, Frameworks, Tools"
                className="interview-input flex-1 mr-2"
              />
              <button
                type="button"
                onClick={() => removeCategory(cIndex)}
                className="text-destructive-100 hover:text-destructive-200 transition-colors"
                aria-label={`Remove ${category.category || `category ${cIndex + 1}`}`}
                title="Remove category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {category.items.map((skill, sIndex) => (
                <span
                  key={sIndex}
                  className="flex items-center gap-1 px-2.5 py-1 bg-dark-300 text-primary-200 text-sm rounded-full border border-primary-200/20"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(cIndex, sIndex)}
                    className="hover:text-destructive-100 transition-colors"
                    aria-label={`Remove skill ${skill}`}
                    title={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputValues[cIndex] || ""}
                onChange={(e) =>
                  setInputValues((prev) => ({
                    ...prev,
                    [cIndex]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(cIndex);
                  }
                }}
                placeholder="Type a skill and press Enter"
                className="interview-input flex-1"
              />
              <button
                onClick={() => addSkill(cIndex)}
                className="px-3 py-1.5 text-sm bg-primary-200/20 text-primary-200 rounded-lg hover:bg-primary-200/30 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
