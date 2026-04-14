"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import {
  getAllTemplates,
  getTemplateCategories,
} from "@/lib/resume-builder/template-registry";
import TemplateCard from "./TemplateCard";

const INITIAL_VISIBLE_TEMPLATES = 12;
const LOAD_MORE_STEP = 12;

interface TemplatePickerProps {
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

type IdleSchedulerWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function TemplatePicker({
  currentTemplateId,
  onSelect,
  onClose,
}: TemplatePickerProps) {
  const [isInteractiveReady, setIsInteractiveReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isGridReady, setIsGridReady] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const categories = useMemo(
    () => (isInteractiveReady ? getTemplateCategories() : []),
    [isInteractiveReady],
  );
  const allTemplates = useMemo(
    () => (isInteractiveReady ? getAllTemplates() : []),
    [isInteractiveReady],
  );
  const listRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Allow one paint cycle before mounting expensive interactive content.
    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setIsInteractiveReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    if (!isInteractiveReady) return;

    // Defer heavy grid work until after initial modal paint and idle time.
    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const idleSchedulerWindow = window as IdleSchedulerWindow;

    const hydrateGrid = () => {
      setIsGridReady(true);
      setVisibleCount(INITIAL_VISIBLE_TEMPLATES);
    };

    const requestIdleCallback = idleSchedulerWindow.requestIdleCallback;
    if (typeof requestIdleCallback === "function") {
      idleId = requestIdleCallback(hydrateGrid, { timeout: 900 });
    } else {
      timeoutId = window.setTimeout(hydrateGrid, 32);
    }

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      const cancelIdleCallback = idleSchedulerWindow.cancelIdleCallback;
      if (idleId !== null && typeof cancelIdleCallback === "function") {
        cancelIdleCallback(idleId);
      }
    };
  }, [isInteractiveReady]);

  const filteredTemplates = useMemo(
    () =>
      activeCategory === "all"
        ? allTemplates
        : allTemplates.filter((t) => t.category === activeCategory),
    [activeCategory, allTemplates],
  );

  useEffect(() => {
    if (!isGridReady) return;
    setVisibleCount(INITIAL_VISIBLE_TEMPLATES);
  }, [activeCategory, isGridReady]);

  const visibleTemplates = useMemo(
    () => filteredTemplates.slice(0, visibleCount),
    [filteredTemplates, visibleCount],
  );

  const hasMoreTemplates = visibleCount < filteredTemplates.length;

  useEffect(() => {
    if (!isGridReady || !hasMoreTemplates) return;

    const root = listRef.current;
    const target = loadMoreRef.current;
    if (!root || !target || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) =>
            Math.min(prev + LOAD_MORE_STEP, filteredTemplates.length),
          );
        }
      },
      {
        root,
        rootMargin: "200px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [filteredTemplates.length, hasMoreTemplates, isGridReady]);

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
        className={`absolute inset-0 ${
          isInteractiveReady ? "bg-black/60 backdrop-blur-sm" : "bg-black/70"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[90vw] max-w-6xl h-[85vh] bg-dark-200 rounded-2xl border border-gray-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Choose a Template</h2>
            <p className="text-sm text-light-400 mt-0.5">
              {isInteractiveReady
                ? `${allTemplates.length} professionally designed templates`
                : "Loading template catalog..."}
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
        {isInteractiveReady ? (
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
        ) : (
          <div className="h-[52px] border-b border-gray-700" />
        )}

        {/* Template grid */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-5">
          {isGridReady ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleTemplates.map((entry) => (
                  <TemplateCard
                    key={entry.id}
                    entry={entry}
                    isSelected={entry.id === currentTemplateId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>

              {hasMoreTemplates && <div ref={loadMoreRef} className="h-8" />}
            </>
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
