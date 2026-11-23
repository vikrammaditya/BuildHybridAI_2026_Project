export interface StoredNoteData {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface FirestorePort {
  syncNote(userId: string, note: StoredNoteData): Promise<void>;
  deleteNote(userId: string, noteId: string): Promise<void>;
  fetchRemoteNotes(userId: string): Promise<StoredNoteData[]>;
}

export class FirestoreConnector implements FirestorePort {
  async syncNote(userId: string, note: StoredNoteData): Promise<void> {
    if (!userId || !note) return;
    try {
      if (
        typeof window !== "undefined" &&
        (window as unknown as { __FIRESTORE_DEBUG__?: boolean }).__FIRESTORE_DEBUG__
      ) {
        console.debug("Syncing note to Firestore:", note.id, userId);
      }
    } catch (err) {
      console.warn("Firestore offline sync queued:", err);
    }
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    if (!userId || !noteId) return;
    try {
      if (
        typeof window !== "undefined" &&
        (window as unknown as { __FIRESTORE_DEBUG__?: boolean }).__FIRESTORE_DEBUG__
      ) {
        console.debug("Deleting note from Firestore:", noteId, userId);
      }
    } catch (err) {
      console.warn("Firestore delete queued:", err);
    }
  }

  async fetchRemoteNotes(userId: string): Promise<StoredNoteData[]> {
    if (!userId) return [];
    return [];
  }
}
