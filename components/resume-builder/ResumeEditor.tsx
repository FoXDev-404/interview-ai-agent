"use client";

import { useReducer, useRef, useEffect, useCallback, useState } from "react";
import {
  ArrowLeft,
  Palette,
  ZoomIn,
  ZoomOut,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { updateResume } from "@/lib/actions/resume-builder.action";
import { getTemplate } from "@/lib/resume-builder/template-registry";
import EditorSidebar from "./EditorSidebar";
import LivePreview from "./LivePreview";
import type { LivePreviewHandle } from "./LivePreview";
import PdfExportButton from "./PdfExportButton";

interface EditorState {
  resumeId: string;
  userId: string;
  title: string;
  templateId: string;
  data: ResumeData;
  activeSection: ResumeSectionKey;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}

type EditorAction =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_TEMPLATE"; payload: string }
  | { type: "UPDATE_SECTION"; section: ResumeSectionKey; payload: unknown }
  | { type: "SET_ACTIVE_SECTION"; payload: ResumeSectionKey }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; payload: string }
  | { type: "SAVE_FAILURE" };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.payload, isDirty: true };
    case "SET_TEMPLATE":
      return { ...state, templateId: action.payload, isDirty: true };
    case "UPDATE_SECTION":
      return {
        ...state,
        data: { ...state.data, [action.section]: action.payload },
        isDirty: true,
      };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    case "SAVE_START":
      return { ...state, isSaving: true };
    case "SAVE_SUCCESS":
      return {
        ...state,
        isSaving: false,
        isDirty: false,
        lastSavedAt: action.payload,
      };
    case "SAVE_FAILURE":
      return { ...state, isSaving: false };
    default:
      return state;
  }
}

interface ResumeEditorProps {
  resume: ResumeDocument;
}

const TemplatePicker = dynamic(() => import("./TemplatePicker"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative rounded-xl border border-gray-700 bg-dark-200 px-5 py-4 text-sm text-light-400">
        Loading templates...
      </div>
    </div>
  ),
});

export default function ResumeEditor({ resume }: ResumeEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    resumeId: resume.id,
    userId: resume.userId,
    title: resume.title,
    templateId: resume.templateId,
    data: resume.data,
    activeSection: "personalInfo",
    isDirty: false,
    isSaving: false,
    lastSavedAt: resume.updatedAt,
  });

  const [zoom, setZoom] = useState(0.7);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const previewRef = useRef<LivePreviewHandle>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const templateEntry = getTemplate(state.templateId);

  const save = useCallback(async () => {
    dispatch({ type: "SAVE_START" });
    try {
      const result = await updateResume({
        resumeId: state.resumeId,
        userId: state.userId,
        title: state.title,
        templateId: state.templateId,
        data: state.data,
      });
      if (result.success) {
        dispatch({ type: "SAVE_SUCCESS", payload: new Date().toISOString() });
      } else {
        dispatch({ type: "SAVE_FAILURE" });
        toast.error("Failed to save resume");
      }
    } catch {
      dispatch({ type: "SAVE_FAILURE" });
      toast.error("Failed to save resume");
    }
  }, [state.resumeId, state.userId, state.title, state.templateId, state.data]);

  // Auto-save with 2s debounce
  useEffect(() => {
    if (!state.isDirty) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      save();
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.isDirty, save]);

  const handleSectionDataChange = useCallback(
    (section: ResumeSectionKey, value: unknown) => {
      dispatch({ type: "UPDATE_SECTION", section, payload: value });
    },
    [],
  );

  const handleSectionChange = useCallback((section: ResumeSectionKey) => {
    dispatch({ type: "SET_ACTIVE_SECTION", payload: section });
  }, []);

  const openTemplatePicker = useCallback(() => {
    setShowTemplatePicker(true);
  }, []);

  const closeTemplatePicker = useCallback(() => {
    setShowTemplatePicker(false);
  }, []);

  const handleTemplateSelect = useCallback((id: string) => {
    dispatch({ type: "SET_TEMPLATE", payload: id });
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 1));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.3));

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-dark-200">
        <div className="flex items-center gap-3">
          <Link
            href="/resume-builder"
            className="flex items-center gap-1.5 text-sm text-light-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="h-5 w-px bg-gray-700" />

          <input
            type="text"
            value={state.title}
            onChange={(e) =>
              dispatch({ type: "SET_TITLE", payload: e.target.value })
            }
            className="bg-transparent text-white font-medium text-sm border-none outline-none focus:ring-0 w-64"
            placeholder="Resume title"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Save indicator */}
          <span className="text-xs text-light-600 flex items-center gap-1">
            {state.isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </>
            ) : state.isDirty ? (
              "Unsaved changes"
            ) : (
              <>
                <Check className="w-3 h-3 text-success-100" />
                Saved
              </>
            )}
          </span>

          {/* Template switcher */}
          <button
            onClick={openTemplatePicker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-light-400 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <Palette className="w-3.5 h-3.5" />
            {templateEntry?.name || "Template"}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-gray-700 rounded-lg">
            <button
              onClick={zoomOut}
              title="Zoom out"
              aria-label="Zoom out"
              className="p-1.5 text-light-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-light-400 w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              title="Zoom in"
              aria-label="Zoom in"
              className="p-1.5 text-light-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PDF Export */}
          <PdfExportButton
            previewRef={previewRef}
            fileName={
              state.data.personalInfo.fullName
                ? `${state.data.personalInfo.fullName}_Resume`
                : state.title
            }
          />
        </div>
      </div>

      {/* Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div className="w-[45%] border-r border-gray-800 overflow-hidden bg-dark-300">
          <EditorSidebar
            data={state.data}
            activeSection={state.activeSection}
            onSectionChange={handleSectionChange}
            onDataChange={handleSectionDataChange}
          />
        </div>

        {/* Right: Preview */}
        <div className="w-[55%] overflow-hidden">
          <LivePreview
            ref={previewRef}
            data={state.data}
            templateId={state.templateId}
            zoom={zoom}
          />
        </div>
      </div>

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <TemplatePicker
          currentTemplateId={state.templateId}
          onSelect={handleTemplateSelect}
          onClose={closeTemplatePicker}
        />
      )}
    </div>
  );
}
