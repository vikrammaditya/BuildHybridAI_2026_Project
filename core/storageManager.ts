import { Note, StoragePort } from "./types";

export class StorageManager implements StoragePort {
  private inMemoryCache: Map<string, Note> = new Map();
  private dbName = "hybrid_notes_db";
  private storeName = "notes";
  private isBrowser = typeof window !== "undefined" && "indexedDB" in window;

  private async openDB(): Promise<IDBDatabase | null> {
    if (!this.isBrowser) return null;

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async loadNotes(): Promise<Note[]> {
    const db = await this.openDB();
    if (!db) {
      return Array.from(this.inMemoryCache.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();

      req.onsuccess = () => {
        const notes = (req.result as Note[]) || [];
        notes.forEach((n) => this.inMemoryCache.set(n.id, n));
        resolve(notes.sort((a, b) => b.updatedAt - a.updatedAt));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveNote(note: Note): Promise<void> {
    this.inMemoryCache.set(note.id, note);
    const db = await this.openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const req = store.put(note);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteNote(id: string): Promise<void> {
    this.inMemoryCache.delete(id);
    const db = await this.openDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async markSynced(id: string): Promise<void> {
    const note = this.inMemoryCache.get(id);
    if (note) {
      note.synced = true;
      await this.saveNote(note);
    }
  }
}
