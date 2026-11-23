import React, { useState } from "react";
import { Eye, Edit3, Sparkles, CheckSquare, Tag, Trash2 } from "lucide-react";
import { marked } from "marked";
import { Note } from "../core/types";

interface EditorProps {
  note: Note;
  onUpdateNote: (updated: Note) => void;
  onDeleteNote: (id: string) => void;
  onRunAction: (type: "summarize" | "action-items" | "tagging") => void;
  isGenerating: boolean;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onRunAction,
  isGenerating,
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNote({
      ...note,
      title: e.target.value,
      updatedAt: Date.now(),
      synced: false,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNote({
      ...note,
      content: e.target.value,
      updatedAt: Date.now(),
      synced: false,
    });
  };

  const previewHtml = marked.parse(note.content || "*No content yet.*", {
    async: false,
  }) as string;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Editor Toolbar */}
      <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        {/* AI Action Quick Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onRunAction("summarize")}
            disabled={isGenerating || !note.content.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800 disabled:opacity-50 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summarize (Nano)</span>
          </button>

          <button
            onClick={() => onRunAction("action-items")}
            disabled={isGenerating || !note.content.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Action Items</span>
          </button>

          <button
            onClick={() => onRunAction("tagging")}
            disabled={isGenerating || !note.content.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>Auto-Tag</span>
          </button>
        </div>

        {/* View toggles & Delete */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium inline-flex items-center gap-1 transition-colors"
            title="Toggle Live Preview"
          >
            {isPreview ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </>
            )}
          </button>

          <button
            onClick={() => onDeleteNote(note.id)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-8 pt-6 pb-2">
        <input
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Untitled Note..."
          className="w-full text-2xl font-bold bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {note.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Editor Body or Preview */}
      <div className="flex-1 px-8 py-4 overflow-y-auto">
        {isPreview ? (
          <div
            className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : (
          <textarea
            value={note.content}
            onChange={handleContentChange}
            placeholder="Start typing your research notes in Markdown..."
            className="w-full h-full resize-none bg-transparent text-slate-800 dark:text-slate-200 text-sm leading-relaxed focus:outline-none font-mono"
          />
        )}
      </div>
    </div>
  );
};
