# Handover — Hybrid Notes Workspace

> Repo-local facts for one spec, kept in `specs/001-hybrid-notes-workspace/handover.md`. A handover is a snapshot:
> lasting facts live in ARCHITECTURE.md, the contracts and the decision record — link, don't copy.
> Test: a new engineer can continue without asking why each major decision was made.

**Status:** open
**RFC:** RFC-0001 — rationale, rejected alternatives and deploy order live there, not here.
**Cross-repo handover:** none — internal RFC

## What this repo changed
- Scaffolding & Build: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`.
- Core Domain: `core/types.ts`, `core/storageManager.ts`, `core/inferenceRouter.ts`, `core/workspaceService.ts`.
- Connectors: `connectors/ai/nanoConnector.ts`, `connectors/ai/firebaseAiConnector.ts`, `connectors/firebase/authConnector.ts`, `connectors/firebase/firestoreConnector.ts`, `connectors/firebase/remoteConfigConnector.ts`.
- Components & Pages: `pages/WorkspacePage.tsx`, `components/Sidebar.tsx`, `components/Editor.tsx`, `components/AIDrawer.tsx`, `components/StatusBadge.tsx`, `components/OfflineBanner.tsx`.
- Prompts: `prompts/summaryPrompt.ts`, `prompts/actionItemsPrompt.ts`, `prompts/taggingPrompt.ts`, `prompts/synthesisPrompt.ts`.
- Tests: `tests/smoke.test.ts`, `tests/storage.test.ts`, `tests/router.test.ts`, `tests/auth.test.ts`.

## State: done / in progress / deliberately deferred
- **Done:** 9/9 tasks complete. All functional requirements (FR-1 through FR-8) implemented and passing automated verification.
- **In progress:** None.
- **Deliberately deferred:** Multi-user real-time collaboration canvas (out of scope for this MVP).

## Contracts used or provided
- Chrome Built-in AI / Prompt API (`window.ai.languageModel`).
- Firebase AI Logic hybrid inference and Cloud Gemini fallback.

## Known limitations and edge cases
- On-device Gemini Nano requires Chrome Canary/Dev with `#prompt-api-for-gemini-nano` enabled.
- On standard browsers without Chrome Prompt API flags, the hybrid router gracefully defaults to Cloud Gemini via Firebase AI Logic.

## How to run, test and deploy
- Run local dev server: `npm run dev`
- Run test suites: `npm test`
- Conformance & toolchain verification: `python .agents/groundwork/engine/groundwork.py verify`
- Production build: `npm run build`
- Deploy to Firebase Hosting: `firebase deploy --only hosting`

## Ownership and support
**Owner:** Aditya Vikramm Singhal (vikrammaditya05@gmail.com)
**Requested by:** Aditya Vikramm Singhal (#BuildHybridAI 2026 Hackathon requirement)
**Implemented by:** Aditya Vikramm Singhal via Antigravity
**Deployed by / how to deploy:** Aditya Vikramm Singhal / `firebase deploy --only hosting`
**Support (first contact, escalation, hours):** Aditya Vikramm Singhal (vikrammaditya05@gmail.com)

## Next three recommended actions
1. Run `npm run dev` and open `http://localhost:3000` to interact with the workspace in browser.
2. Toggle Network to "Offline" in Chrome DevTools to demonstrate on-device Gemini Nano execution.
3. Record the 3-minute hackathon demo video for Devpost submission.
