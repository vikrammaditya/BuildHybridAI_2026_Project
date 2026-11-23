---
id: 001-hybrid-notes-workspace
spec: spec.md
spec_version: ccfcb396c4c8d70232e253b447d525fa582ee967716c837ed6242cb940f3ab0c
plan: plan.md
created: 2026-11-23
---

# Tasks: Hybrid Notes Workspace

> One task = one reviewable change, ordered so the suite stays green after each.
> `[P]` marks tasks on disjoint files. Legend: `[ ]` not started · `[~]` in progress · `[x]` done.
> Mark a task `[x]` only after its "done when" is verified.
> "Done when" names the proof — the eval ids and the command that runs them — never the behaviour again (the spec owns that).

- [x] **T001** — Project scaffold with Vite, React, TypeScript, Tailwind CSS, and test runner
  - **Files:** `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`
  - **Done when:** `npm test` runs cleanly and dev server builds
  - **Covers:** FR-1

- [x] **T002** — Domain entities, IndexedDB local storage engine, and Firestore connector
  - **Files:** `core/types.ts`, `core/storageManager.ts`, `connectors/firebase/firestoreConnector.ts`, `tests/storage.test.ts`
  - **Done when:** E1 passes (`npm test tests/storage.test.ts`)
  - **Covers:** FR-1

- [x] **T003** — Hybrid Inference Router, Prompt templates, Nano connector, and Firebase AI Logic connector
  - **Files:** `core/inferenceRouter.ts`, `connectors/ai/nanoConnector.ts`, `connectors/ai/firebaseAiConnector.ts`, `connectors/firebase/remoteConfigConnector.ts`, `prompts/summaryPrompt.ts`, `prompts/actionItemsPrompt.ts`, `prompts/taggingPrompt.ts`, `prompts/synthesisPrompt.ts`, `tests/router.test.ts`
  - **Done when:** E2, E3, E4, E5, E7, E9 pass (`npm test tests/router.test.ts`)
  - **Covers:** FR-2, FR-3, FR-4, FR-8

- [x] **T004** — Firebase Auth connector and Firebase config with App Check attestation
  - **Files:** `connectors/firebase/authConnector.ts`, `config/firebase.ts`, `tests/auth.test.ts`
  - **Done when:** E6, E8 pass (`npm test tests/auth.test.ts`)
  - **Covers:** FR-7

- [x] **T005** — UI workspace components: Editor, Sidebar, AIDrawer, StatusBadge, and OfflineBanner
  - **Files:** `components/Editor.tsx`, `components/Sidebar.tsx`, `components/AIDrawer.tsx`, `components/StatusBadge.tsx`, `components/OfflineBanner.tsx`, `pages/WorkspacePage.tsx`
  - **Done when:** E10 passes and manual verification displays interactive UI
  - **Covers:** FR-5, FR-6

## Verification
- [x] **T900** — `groundwork.py verify` passes (format, lint, types, tests)
- [x] **T901** — every FR in the spec maps to at least one completed task
- [x] **T902** — the spec's manual-test section was run by hand and matches
- [x] **T903** — foundation docs (ARCHITECTURE/AGENTS/CONTRACTS/PROJECT) updated or explicitly unchanged; `groundwork.py fresh` is clean
