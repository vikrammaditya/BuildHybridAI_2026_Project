import { Note, ModelStatus, InferenceResult, InferenceTask, AuthUser } from "./types";
import { StorageManager } from "./storageManager";
import { InferenceRouter } from "./inferenceRouter";
import { NanoConnector } from "../connectors/ai/nanoConnector";
import { FirebaseAiConnector } from "../connectors/ai/firebaseAiConnector";
import { RemoteConfigConnector } from "../connectors/firebase/remoteConfigConnector";
import { FirebaseAuthConnector } from "../connectors/firebase/authConnector";
import { createSummaryPrompt } from "../prompts/summaryPrompt";
import { createActionItemsPrompt } from "../prompts/actionItemsPrompt";
import { createTaggingPrompt } from "../prompts/taggingPrompt";
import { createSynthesisPrompt } from "../prompts/synthesisPrompt";

export class WorkspaceService {
  private storage: StorageManager;
  private router: InferenceRouter;
  private auth: FirebaseAuthConnector;

  constructor() {
    this.storage = new StorageManager();
    const nano = new NanoConnector();
    const cloud = new FirebaseAiConnector();
    const remoteConfig = new RemoteConfigConnector();
    this.router = new InferenceRouter(nano, cloud, remoteConfig);
    this.auth = new FirebaseAuthConnector();
  }

  async loadNotes(): Promise<Note[]> {
    return this.storage.loadNotes();
  }

  async saveNote(note: Note): Promise<void> {
    return this.storage.saveNote(note);
  }

  async deleteNote(id: string): Promise<void> {
    return this.storage.deleteNote(id);
  }

  async initAuth(): Promise<AuthUser> {
    return this.auth.initAnonymousAuth();
  }

  async signInWithGoogle(): Promise<AuthUser> {
    return this.auth.signInWithGoogle();
  }

  async getModelStatus(): Promise<ModelStatus> {
    return this.router.getStatus();
  }

  async runAction(
    type: "summarize" | "action-items" | "tagging",
    note: Note,
  ): Promise<InferenceResult> {
    let prompt = "";
    if (type === "summarize") {
      prompt = createSummaryPrompt(note.title, note.content);
    } else if (type === "action-items") {
      prompt = createActionItemsPrompt(note.title, note.content);
    } else if (type === "tagging") {
      prompt = createTaggingPrompt(note.content);
    }

    const task: InferenceTask = {
      id: `task-${Date.now()}`,
      type,
      prompt,
      noteIds: [note.id],
    };

    return this.router.routeAndExecute(task, [note]);
  }

  async runSynthesis(notes: Note[]): Promise<InferenceResult> {
    const prompt = createSynthesisPrompt(notes);
    const task: InferenceTask = {
      id: `task-synth-${Date.now()}`,
      type: "synthesize",
      prompt,
      noteIds: notes.map((n) => n.id),
    };

    return this.router.routeAndExecute(task, notes);
  }
}
