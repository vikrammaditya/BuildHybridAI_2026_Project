import React, { useState, useEffect, useMemo, useRef } from "react";
import { Sidebar } from "../components/Sidebar";
import { Editor } from "../components/Editor";
import { AIDrawer } from "../components/AIDrawer";
import { StatusBadge } from "../components/StatusBadge";
import { OfflineBanner } from "../components/OfflineBanner";
import { SettingsModal } from "../components/SettingsModal";
import { WorkspaceService } from "../core/workspaceService";
import { Note, ModelStatus, InferenceResult, AuthUser } from "../core/types";
import { Sun, Moon, Layers, Settings } from "lucide-react";

export const WorkspacePage: React.FC = () => {
  // Service from core
  const service = useMemo(() => new WorkspaceService(), []);

  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    nanoAvailable: false,
    cloudAvailable: true,
    activeModel: "none",
    isOffline: false,
  });
  const [lastExecution, setLastExecution] = useState<{
    model: "local-nano" | "cloud-gemini";
    durationMs: number;
    fallbackReason?: string;
  } | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedMultiIds, setSelectedMultiIds] = useState<string[]>([]);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskName, setCurrentTaskName] = useState("");
  const [aiResult, setAiResult] = useState<InferenceResult | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Debounced auto-save ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh status
  const refreshStatus = async () => {
    const status = await service.getModelStatus();
    setModelStatus(status);
    return status;
  };

  // Initialize
  useEffect(() => {
    async function init() {
      const guest = await service.initAuth();
      setUser(guest);

      const loaded = await service.loadNotes();
      if (loaded.length === 0) {
        const initialNote: Note = {
          id: `note-${Date.now()}`,
          title: "Welcome to Hybrid Notes Hub",
          content:
            "# Hybrid AI Intelligence\n\nThis application runs on-device inference via **Chrome Gemini Nano** when available, and transparently routes complex cross-note queries to **Cloud Gemini** models via Firebase AI Logic.\n\n### Key Capabilities:\n- **Instant Summarization**: Runs locally in your browser with 0 latency.\n- **Offline First**: All edits persist immediately to IndexedDB.\n- **Deep Synthesis**: Multi-note reasoning across multiple notes when connected.",
          tags: ["welcome", "hybrid-ai", "guide"],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          synced: false,
        };
        await service.saveNote(initialNote);
        setNotes([initialNote]);
        setSelectedNoteId(initialNote.id);
      } else {
        setNotes(loaded);
        setSelectedNoteId(loaded[0].id);
      }

      const status = await service.getModelStatus();
      setModelStatus(status);
    }
    init();

    const handleOnlineStatus = async () => {
      const status = await service.getModelStatus();
      setModelStatus(status);
      if (status.isOffline) {
        setOfflineNotice("Device is currently offline.");
      } else {
        setOfflineNotice(null);
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [service]);

  // Selected note
  const currentNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) || null,
    [notes, selectedNoteId],
  );

  // Update note with debounced auto-save
  const handleUpdateNote = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await service.saveNote(updated);
    }, 400);
  };

  // Create new note
  const handleNewNote = async () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      content: "",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    };
    await service.saveNote(newNote);
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    await service.deleteNote(id);
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    if (selectedNoteId === id) {
      setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Google sign in
  const handleGoogleSignIn = async () => {
    const signedIn = await service.signInWithGoogle();
    setUser(signedIn);
  };

  // Run single-note AI action
  const handleRunAction = async (type: "summarize" | "action-items" | "tagging") => {
    if (!currentNote) return;

    const actionNames = {
      summarize: "Summarize",
      "action-items": "Action Items",
      tagging: "Auto-Tag",
    };

    setIsGenerating(true);
    setCurrentTaskName(actionNames[type]);
    setIsAiDrawerOpen(true);
    setAiResult(null);

    try {
      const result = await service.runAction(type, currentNote);
      setAiResult(result);
      setLastExecution({
        model: result.model,
        durationMs: result.durationMs,
        fallbackReason: result.fallbackReason,
      });
      setOfflineNotice(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setOfflineNotice(errMsg);
    } finally {
      setIsGenerating(false);
      refreshStatus();
    }
  };

  // Multi-note synthesis action
  const handleRunSynthesis = async () => {
    const selectedNotes = notes.filter((n) => selectedMultiIds.includes(n.id));
    if (selectedNotes.length === 0) return;

    setIsGenerating(true);
    setCurrentTaskName("Multi-Note Synthesis");
    setIsAiDrawerOpen(true);
    setAiResult(null);

    try {
      const result = await service.runSynthesis(selectedNotes);
      setAiResult(result);
      setLastExecution({
        model: result.model,
        durationMs: result.durationMs,
        fallbackReason: result.fallbackReason,
      });
      setOfflineNotice(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setOfflineNotice(errMsg);
    } finally {
      setIsGenerating(false);
      refreshStatus();
    }
  };

  // Apply generated tags
  const handleApplyTags = (newTags: string[]) => {
    if (!currentNote) return;
    const combined = Array.from(new Set([...currentNote.tags, ...newTags]));
    handleUpdateNote({
      ...currentNote,
      tags: combined,
    });
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${isDarkMode ? "dark" : ""}`}>
      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-xs tracking-wide text-slate-800 dark:text-slate-200">
            Hybrid Notes Hub
          </span>
          <StatusBadge status={modelStatus} lastExecution={lastExecution} />
        </div>

        <div className="flex items-center gap-2">
          {multiSelectMode && selectedMultiIds.length > 0 && (
            <button
              onClick={handleRunSynthesis}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Synthesize {selectedMultiIds.length} Notes (Cloud)</span>
            </button>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Configure AI & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark / Light Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Offline Alert Banner */}
      {offlineNotice && (
        <OfflineBanner
          message={offlineNotice}
          onRetry={() => {
            setOfflineNotice(null);
            service.getModelStatus().then(setModelStatus);
          }}
          onDismiss={() => setOfflineNotice(null)}
        />
      )}

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onNewNote={handleNewNote}
          multiSelectMode={multiSelectMode}
          onToggleMultiSelectMode={() => {
            setMultiSelectMode(!multiSelectMode);
            setSelectedMultiIds([]);
          }}
          selectedMultiIds={selectedMultiIds}
          onToggleMultiId={(id) => {
            setSelectedMultiIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            );
          }}
          user={user}
          onGoogleSignIn={handleGoogleSignIn}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {currentNote ? (
          <Editor
            note={currentNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onRunAction={handleRunAction}
            isGenerating={isGenerating}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-xs">
            Select or create a note to begin editing.
          </div>
        )}

        <AIDrawer
          isOpen={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          result={aiResult}
          isGenerating={isGenerating}
          currentTaskName={currentTaskName}
          onApplyTags={handleApplyTags}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            refreshStatus();
          }}
          isNanoAvailable={modelStatus.nanoAvailable}
        />
      </div>
    </div>
  );
};
