import React from "react";
import { X, Sparkles, Cpu, Cloud, Check } from "lucide-react";
import { marked } from "marked";
import { InferenceResult } from "../core/types";

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: InferenceResult | null;
  isGenerating: boolean;
  currentTaskName: string;
  onApplyTags?: (tags: string[]) => void;
}

export const AIDrawer: React.FC<AIDrawerProps> = ({
  isOpen,
  onClose,
  result,
  isGenerating,
  currentTaskName,
  onApplyTags,
}) => {
  if (!isOpen) return null;

  const htmlContent = result?.text ? (marked.parse(result.text, { async: false }) as string) : "";

  // Check if result is comma-separated tags
  const isTagList =
    currentTaskName.toLowerCase().includes("tag") && result?.text && !result.text.includes("\n");
  const tagItems = isTagList
    ? result.text
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return (
    <div className="w-80 sm:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col shrink-0 shadow-lg animate-slideLeft z-10">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
            AI Assistant {currentTaskName ? `• ${currentTaskName}` : ""}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Model metadata */}
      {result && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            {result.model === "local-nano" ? (
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="font-medium">
              {result.model === "local-nano" ? "Gemini Nano (On-Device)" : "Gemini Cloud (Hybrid)"}
            </span>
          </div>
          <span>{result.durationMs}ms</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-slate-500 gap-3">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Processing inference via Hybrid Router...</span>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {isTagList && tagItems.length > 0 && onApplyTags && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-2">
                  Generated Tags:
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tagItems.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 text-xs rounded border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onApplyTags(tagItems)}
                  className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Tags to Note</span>
                </button>
              </div>
            )}

            <div
              className="prose dark:prose-invert prose-xs text-slate-800 dark:text-slate-200"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-12">
            Select an action in the editor to run hybrid intelligence.
          </div>
        )}
      </div>
    </div>
  );
};
