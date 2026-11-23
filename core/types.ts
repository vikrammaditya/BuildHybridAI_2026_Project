export type InferenceTaskType = "summarize" | "action-items" | "tagging" | "synthesize";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  displayName?: string | null;
  email?: string | null;
}

export interface InferenceTask {
  id: string;
  type: InferenceTaskType;
  prompt: string;
  noteIds: string[];
  tokenEstimate?: number;
}

export interface InferenceResult {
  text: string;
  model: "local-nano" | "cloud-gemini";
  durationMs: number;
  fallbackReason?: string;
  timestamp?: number;
}

export interface ModelStatus {
  nanoAvailable: boolean;
  cloudAvailable: boolean;
  activeModel: "local-nano" | "cloud-gemini" | "none";
  isOffline: boolean;
  lastFallbackReason?: string;
}

export interface StoragePort {
  loadNotes(): Promise<Note[]>;
  saveNote(note: Note): Promise<void>;
  deleteNote(id: string): Promise<void>;
}
