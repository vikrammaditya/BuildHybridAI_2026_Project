---
id: 001-fieldpulse-hybrid-triage
spec: spec.md
spec_version: 4f971da59dfc34e115664c21c0cacdf36eedf00b87b0b29cf8fb4dbac6301632
plan: plan.md
created: 2026-11-24
---

# Tasks: Fieldpulse Hybrid Triage

> One task = one reviewable change, ordered so the suite stays green after each.
> `[P]` marks tasks on disjoint files. Legend: `[ ]` not started · `[~]` in progress · `[x]` done.
> Mark a task `[x]` only after its "done when" is verified.
> "Done when" names the proof — the eval ids and the command that runs them — never the behaviour again (the spec owns that).

- [x] **T001** — Core Triage Domain Types & Deterministic START Algorithm
  - **Files:** `core/triage/types.ts`, `core/triage/startAlgorithm.ts`, `tests/startAlgorithm.test.ts`
  - **Done when:** E1, E2, E3, E4, E5 pass (`npm test -- tests/startAlgorithm.test.ts`)
  - **Covers:** FR-2

- [x] **T002** — Triage Service & Local State Management
  - **Files:** `core/triage/triageService.ts`, `tests/triageService.test.ts`
  - **Done when:** E6 passes (`npm test -- tests/triageService.test.ts`)
  - **Covers:** FR-1, FR-4

- [x] **T003** — Emergency Prompts & Hybrid AI Inference Connectors
  - **Files:** `prompts/triagePrompts.ts`, `connectors/ai/nanoConnector.ts`, `connectors/ai/firebaseAiConnector.ts`, `connectors/ai/hybridRouter.ts`, `tests/hybridRouter.test.ts`
  - **Done when:** E12 passes (`npm test -- tests/hybridRouter.test.ts`)
  - **Covers:** FR-2, FR-3, FR-5, FR-6, FR-7

- [x] **T004** — Offline Firestore Connector & Persistence
  - **Files:** `connectors/firebase/firestoreConnector.ts`
  - **Done when:** Firestore initialization compiles and verifies with offline cache enabled (`npm run typecheck`)
  - **Covers:** FR-4

- [x] **T005** — Field UI Components & Telemetry Pill
  - **Files:** `components/TelemetryPill.tsx`, `components/triage/CasualtyCard.tsx`, `components/triage/CasualtyIntakeModal.tsx`, `components/triage/StabilizationGuideDrawer.tsx`, `components/triage/HospitalHandoverModal.tsx`
  - **Done when:** Components compile and typecheck cleanly (`npm run typecheck`)
  - **Covers:** FR-1, FR-3, FR-5, FR-6, FR-7, FR-8

- [x] **T006** — Main FieldPulse Triage Dashboard & App Integration
  - **Files:** `pages/TriageWorkspacePage.tsx`, `src/App.tsx`
  - **Done when:** Application builds cleanly (`npm run build`) and renders the triage dashboard
  - **Covers:** FR-1, FR-8

## Verification
- [x] **T900** — `groundwork.py verify` passes (format, lint, types, tests)
- [x] **T901** — every FR in the spec maps to at least one completed task
- [x] **T902** — the spec's manual-test section was run by hand and matches
- [x] **T903** — foundation docs (ARCHITECTURE/AGENTS/CONTRACTS/PROJECT) updated or explicitly unchanged; `groundwork.py fresh` is clean
