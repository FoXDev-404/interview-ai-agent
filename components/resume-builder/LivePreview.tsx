"use client";

import { Suspense, useRef, memo, forwardRef, useImperativeHandle } from "react";
import { getTemplate } from "@/lib/resume-builder/template-registry";

interface LivePreviewProps {
  data: ResumeData;
  templateId: string;
  zoom: number;
}

export interface LivePreviewHandle {
  getElement: () => HTMLDivElement | null;
}

const LivePreview = memo(
  forwardRef<LivePreviewHandle, LivePreviewProps>(
    ({ data, templateId, zoom }, ref) => {
      const contentRef = useRef<HTMLDivElement>(null);

      useImperativeHandle(ref, () => ({
        getElement: () => contentRef.current,
      }));

      const entry = getTemplate(templateId);

      if (!entry) {
        return (
          <div className="flex items-center justify-center h-full text-light-400">
            Template not found: {templateId}
          </div>
        );
      }

      const TemplateComponent = entry.component;

      return (
        <div className="h-full overflow-y-auto overflow-x-hidden bg-black p-4 flex justify-center">
          <div
            className="origin-top"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              width: "794px",
            }}
          >
            <div ref={contentRef} className="pb-10">
              <Suspense
                fallback={
                  <div className="w-[794px] min-h-[1123px] bg-white rounded-lg flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary-200 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">
                        Loading template...
                      </span>
                    </div>
                  </div>
                }
              >
                <TemplateComponent
                  data={data}
                  className="shadow-xl rounded-sm"
                />
              </Suspense>
            </div>
          </div>
        </div>
      );
    },
  ),
);

LivePreview.displayName = "LivePreview";

export default LivePreview;
