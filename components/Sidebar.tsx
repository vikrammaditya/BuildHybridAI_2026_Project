import React from "react";
import { Plus, Search, FileText, CheckSquare, Square, Tag } from "lucide-react";
import { Note, AuthUser } from "../core/types";

interface SidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  multiSelectMode: boolean;
  onToggleMultiSelectMode: () => void;
  selectedMultiIds: string[];
  onToggleMultiId: (id: string) => void;
  user: AuthUser | null;
  onGoogleSignIn: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  multiSelectMode,
  onToggleMultiSelectMode,
  selectedMultiIds,
  onToggleMultiId,
  user,
  onGoogleSignIn,
  searchQuery,
  onSearchChange,
}) => {
  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="w-72 sm:w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 select-none">
      {/* App Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
            Hybrid Notes Hub
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">#BuildHybridAI 2026</p>
        </div>
        <button
          onClick={onNewNote}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{notes.length} notes</span>
          <button
            onClick={onToggleMultiSelectMode}
            className={`hover:text-indigo-600 dark:hover:text-indigo-400 font-medium ${
              multiSelectMode ? "text-indigo-600 dark:text-indigo-400" : ""
            }`}
          >
            {multiSelectMode ? "Cancel Multi-Select" : "Select Multiple"}
          </button>
        </div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredNotes.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No notes found. Click "New Note" to create one.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = selectedNoteId === note.id;
            const isMultiChecked = selectedMultiIds.includes(note.id);

            return (
              <div
                key={note.id}
                onClick={() => {
                  if (multiSelectMode) {
                    onToggleMultiId(note.id);
                  } else {
                    onSelectNote(note.id);
                  }
                }}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected && !multiSelectMode
                    ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-indigo-600"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start gap-2">
                  {multiSelectMode && (
                    <button type="button" className="mt-0.5 text-slate-400 hover:text-indigo-600">
                      {isMultiChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {note.title || "Untitled Note"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {note.content || "Empty note..."}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded"
                          >
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Status Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/50">
        <div className="truncate">
          <p className="font-medium text-slate-700 dark:text-slate-300 truncate">
            {user?.displayName || "Guest User"}
          </p>
          <p className="text-[10px] text-slate-400">
            {user?.isAnonymous ? "Guest (Local Store)" : "Signed In"}
          </p>
        </div>
        {user?.isAnonymous && (
          <button
            onClick={onGoogleSignIn}
            className="px-2.5 py-1 text-[11px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-medium transition-colors"
          >
            Google Sign-in
          </button>
        )}
      </div>
    </aside>
  );
};
