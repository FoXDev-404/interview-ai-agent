"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import {
  getAllTemplates,
  getTemplateCategories,
} from "@/lib/resume-builder/template-registry";
import TemplateCard from "./TemplateCard";

interface TemplatePickerProps {
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

export default function TemplatePicker({
  currentTemplateId,
  onSelect,
  onClose,
}: TemplatePickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isGridReady, setIsGridReady] = useState(false);
  const categories = useMemo(() => getTemplateCategories(), []);
  const allTemplates = useMemo(() => getAllTemplates(), []);

  useEffect(() => {
    // Defer heavy grid mount to the next frame so modal shell can paint first.
    const frameId = window.requestAnimationFrame(() => {
      setIsGridReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const filteredTemplates = useMemo(
    () =>
      activeCategory === "all"
        ? allTemplates
        : allTemplates.filter((t) => t.category === activeCategory),
    [activeCategory, allTemplates],
  );

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      onClose();
    },
    [onClose, onSelect],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[90vw] max-w-6xl h-[85vh] bg-dark-200 rounded-2xl border border-gray-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Choose a Template</h2>
            <p className="text-sm text-light-400 mt-0.5">
              {allTemplates.length} professionally designed templates
            </p>
          </div>
          <button
            onClick={onClose}
            title="Close template picker"
            aria-label="Close template picker"
            className="p-2 text-light-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-primary-200/20 text-primary-200"
                : "text-light-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            All ({allTemplates.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.category
                  ? "bg-primary-200/20 text-primary-200"
                  : "text-light-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {isGridReady ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTemplates.map((entry) => (
                <TemplateCard
                  key={entry.id}
                  entry={entry}
                  isSelected={entry.id === currentTemplateId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[300px] rounded-xl border border-gray-700 bg-dark-300 animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
