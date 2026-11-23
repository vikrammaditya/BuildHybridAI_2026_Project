import { describe, it, expect, beforeEach } from "vitest";
import { StorageManager } from "../core/storageManager";
import { Note } from "../core/types";

describe("StorageManager (E1 verification)", () => {
  let manager: StorageManager;

  beforeEach(() => {
    manager = new StorageManager();
  });

  it("saves and retrieves note within local store (E1)", async () => {
    const note: Note = {
      id: "note-1",
      title: "Meeting Notes",
      content: "Discussion items for hybrid AI architecture",
      tags: ["hybrid", "architecture"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    };

    await manager.saveNote(note);
    const notes = await manager.loadNotes();

    expect(notes.length).toBe(1);
    expect(notes[0].title).toBe("Meeting Notes");
    expect(notes[0].content).toContain("Discussion items");
  });

  it("updates note and marks synced status", async () => {
    const note: Note = {
      id: "note-2",
      title: "Task List",
      content: "Item 1, Item 2",
      tags: ["tasks"],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    };

    await manager.saveNote(note);
    await manager.markSynced("note-2");

    const notes = await manager.loadNotes();
    expect(notes[0].synced).toBe(true);
  });

  it("deletes note correctly from storage", async () => {
    const note: Note = {
      id: "note-3",
      title: "Delete Me",
      content: "Temporary content",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    };

    await manager.saveNote(note);
    await manager.deleteNote("note-3");

    const notes = await manager.loadNotes();
    expect(notes.find((n) => n.id === "note-3")).toBeUndefined();
  });
});
