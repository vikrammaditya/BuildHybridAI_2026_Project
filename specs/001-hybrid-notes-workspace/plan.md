---
id: 001-hybrid-notes-workspace
spec: spec.md
spec_version: ccfcb396c4c8d70232e253b447d525fa582ee967716c837ed6242cb940f3ab0c
created: 2026-11-23
---

# Plan: Hybrid Notes Workspace

## 1. Approach
We build a client-side Single Page Application using React 18, TypeScript, and Vite. The core design employs a hybrid-first inference routing pattern (FR-2, FR-4) where single-note generation tasks (FR-2, FR-3) invoke Chrome's on-device Gemini Nano model (`window.ai` / Chrome Built-in AI Prompt API) when ready. When on-device capabilities are unavailable, task tokens exceed thresholds (FR-4, NFR-1), or multi-note synthesis is requested (FR-4), the router transparently delegates to Cloud Gemini models via Firebase AI Logic. Storage implements an offline-first architecture using browser IndexedDB with background synchronization to Cloud Firestore (FR-1). Heavy inference runs asynchronously to ensure main-thread UI responsiveness (NFR-2).

## 2. Affected modules and files
- `pages/`:
  - `pages/WorkspacePage.tsx`: Top-level route and layout composition.
- `components/`:
  - `components/Editor.tsx`: Markdown editor with live preview (FR-1, NFR-2).
  - `components/Sidebar.tsx`: Note list, search input, and tag filtering (FR-1, FR-3).
  - `components/AIDrawer.tsx`: Collapsible AI drawer for summary, action items, and synthesis (FR-2, FR-3, FR-4).
  - `components/StatusBadge.tsx`: Status indicator for model source, duration, and fallback reason (FR-5).
  - `components/OfflineBanner.tsx`: Non-blocking notification banner for offline/unready model states (FR-6).
- `core/`:
  - `core/types.ts`: Pure domain interfaces (`Note`, `InferenceResult`, `RouteDecision`).
  - `core/inferenceRouter.ts`: Evaluates model readiness, token length, and task type to route requests (FR-2, FR-4, FR-8).
  - `core/storageManager.ts`: Manages IndexedDB operations, dirty state tracking, and Firestore synchronization queue (FR-1).
- `connectors/`:
  - `connectors/ai/nanoConnector.ts`: Adapter interfacing with Chrome Built-in AI / Gemini Nano (FR-2, FR-3).
  - `connectors/ai/firebaseAiConnector.ts`: Adapter interfacing with Firebase AI Logic hybrid inference and App Check (FR-4, NFR-3).
  - `connectors/firebase/firestoreConnector.ts`: Adapter for Cloud Firestore persistence with offline cache (FR-1).
  - `connectors/firebase/authConnector.ts`: Adapter for anonymous guest and Google authentication (FR-7).
  - `connectors/firebase/remoteConfigConnector.ts`: Adapter for fetching routing thresholds with local fallbacks (FR-8).
- `config/`:
  - `config/firebase.ts`: Environment variable mapping and Firebase SDK initialization (NFR-3).
- `prompts/`:
  - `prompts/summaryPrompt.ts`: Summarization prompt template (FR-2).
  - `prompts/actionItemsPrompt.ts`: Action items extraction template (FR-2).
  - `prompts/taggingPrompt.ts`: Topic categorization template (FR-3).
  - `prompts/synthesisPrompt.ts`: Multi-note cross-reference synthesis template (FR-4).
- Root / Wiring:
  - `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`.

## 3. Data model and migrations
- `Note`: `{ id: string, title: string, content: string, tags: string[], createdAt: number, updatedAt: number, synced: boolean }`
- `InferenceResult`: `{ text: string, model: 'local-nano' | 'cloud-gemini', durationMs: number, fallbackReason?: string }`
- Persistence: Stored locally in IndexedDB object store `notes` and synchronized to Firestore path `users/{userId}/notes/{noteId}`. No schema migrations needed.

## 4. Interfaces and contracts
- `InferenceRouter`:
  - `routeAndExecute(task: InferenceTask): Promise<InferenceResult>`
- `StorageManager`:
  - `loadNotes(): Promise<Note[]>`
  - `saveNote(note: Note): Promise<void>`
  - `deleteNote(id: string): Promise<void>`
- `AuthConnector`:
  - `initAuth(): Promise<User>`
  - `signInWithGoogle(): Promise<User>`

## 5. Failure modes and edge cases
- Gemini Nano unready or downloading while offline: Caught in `inferenceRouter.ts`, which returns a graceful error state triggering the banner in spec §7 without crashing or blocking editor input.
- Firestore offline / network lost: Firestore SDK buffers writes locally; `storageManager.ts` ensures local IndexedDB retains immediate edits (spec §7).
- Cloud inference quota / network failure: Caught in `firebaseAiConnector.ts`, returning error details to the UI with an inline retry trigger (spec §7).

## 6. Test strategy
- Unit tests: Vitest suite covering `core/inferenceRouter.ts` (validating local execution, token threshold fallback, and unready state fallback) and `core/storageManager.ts`.
- Component tests: Testing status badge pill rendering and offline banner state transitions.
- Manual verification: End-to-end execution of the 7-step scenario specified in spec §8 using Chrome Canary with DevTools offline simulation.

## 7. Rollout and rollback
- Rollout: Vite build output deployed to Firebase Hosting (`npm run build && firebase deploy --only hosting`).
- Rollback: Immediate rollback to previous release via `firebase hosting:rollback` or previous git commit deployment.
