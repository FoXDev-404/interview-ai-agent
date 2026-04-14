"use client";

import { Suspense, memo, useRef, useState, useEffect } from "react";
import { sampleResumeData } from "@/lib/resume-builder/sample-data";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  entry: TemplateRegistryEntry;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function TemplateCard({ entry, isSelected, onSelect }: TemplateCardProps) {
  const TemplateComponent = entry.component;
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [shouldRenderPreview, setShouldRenderPreview] = useState(isSelected);

  useEffect(() => {
    if (isSelected) {
      setShouldRenderPreview(true);
    }
  }, [isSelected]);

  useEffect(() => {
    if (shouldRenderPreview) return;

    const card = cardRef.current;
    if (!card || !("IntersectionObserver" in window)) {
      setShouldRenderPreview(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((observedEntry) => observedEntry.isIntersecting)) {
          setShouldRenderPreview(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(card);

    return () => {
      observer.disconnect();
    };
  }, [shouldRenderPreview]);

  return (
    <button
      ref={cardRef}
      onClick={() => onSelect(entry.id)}
      className={cn(
        "group relative rounded-xl overflow-hidden border-2 transition-all text-left",
        isSelected
          ? "border-primary-200 shadow-lg shadow-primary-200/20"
          : "border-gray-700 hover:border-gray-500",
      )}
    >
      {/* Mini preview */}
      <div className="w-full h-[220px] overflow-hidden bg-white relative">
        <div
          className="origin-top-left pointer-events-none"
          style={{
            transform: "scale(0.24)",
            width: "794px",
            height: "1123px",
          }}
        >
          {shouldRenderPreview ? (
            <Suspense
              fallback={
                <div className="w-[794px] h-[1123px] bg-gray-50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <TemplateComponent data={sampleResumeData} />
            </Suspense>
          ) : (
            <div className="w-[794px] h-[1123px] bg-gray-50" />
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="p-3 bg-dark-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">{entry.name}</h4>
            <p className="text-xs text-light-600 capitalize">
              {entry.category}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {entry.previewColors.map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full border border-gray-600"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        {entry.isAtsOptimized && (
          <span className="mt-1.5 inline-block text-[10px] px-1.5 py-0.5 bg-success-100/20 text-success-100 rounded">
            ATS-Friendly
          </span>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-200 rounded-full flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5 text-dark-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

export default memo(TemplateCard);
