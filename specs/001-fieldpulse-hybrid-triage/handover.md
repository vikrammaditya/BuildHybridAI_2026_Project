# Handover — FieldPulse Hybrid Triage

> Repo-local facts for one spec, kept in `specs/001-fieldpulse-hybrid-triage/handover.md`. A handover is a snapshot:
> lasting facts live in ARCHITECTURE.md, the contracts and the decision record — link, don't copy.
> Test: a new engineer can continue without asking why each major decision was made.

**Status:** ready
**RFC:** RFC-0001 — rationale, rejected alternatives and deploy order live there, not here.
**Cross-repo handover:** none — internal RFC

## What this repo changed
- Scaffolding & Root: `package.json` (`fieldpulse-hybrid-ai-triage`), `CODEMAP.md`, `src/App.tsx`.
- Core Triage Domain: `core/triage/types.ts`, `core/triage/startAlgorithm.ts`, `core/triage/triageService.ts`, `core/triage/hybridRouter.ts`.
- Connectors: `connectors/ai/nanoConnector.ts`, `connectors/ai/firebaseAiConnector.ts`, `connectors/firebase/firestoreConnector.ts`.
- Prompts: `prompts/triagePrompts.ts` (START triage categorization, emergency stabilization guidelines, MIST/SBAR hospital handover synthesis, pharmacology contraindication check).
- UI Layer:
  - `pages/TriageWorkspacePage.tsx`: Main field responder dashboard.
  - `components/TelemetryPill.tsx`: Real-time network and inference mode badge with simulated offline toggle.
  - `components/triage/TriageHeader.tsx`: Field command header and action controls.
  - `components/triage/TriageStatsBanner.tsx`: Triage casualty counts (Total, Immediate, Delayed, Minor, Expectant).
  - `components/triage/CasualtyCard.tsx`: High-contrast casualty item with color badges and quick action triggers.
  - `components/triage/CasualtyIntakeModal.tsx`: Modal for recording new casualties and trauma notes.
  - `components/triage/VitalsQuickSelector.tsx`: Touch-optimized START vitals button group.
  - `components/triage/StabilizationGuideDrawer.tsx`: Drawer rendering step-by-step emergency stabilization protocols.
  - `components/triage/HospitalHandoverModal.tsx`: Cloud MIST/SBAR hospital handover dispatch and drug safety auditor.
- Tests: `tests/startAlgorithm.test.ts`, `tests/triageService.test.ts`, `tests/hybridRouter.test.ts` (27 total tests in test suite).

## State: done / in progress / deliberately deferred
- **Done:** 10/10 tasks complete. All functional requirements (FR-1 through FR-8) implemented, verified, and passing automated test suites.
- **In progress:** None.
- **Deliberately deferred:** Direct Bluetooth/IoT hardware sensor pairing (all vitals entered via fast UI buttons or dictation as planned in RFC §9).

## Contracts used or provided
- Chrome Built-in AI / Prompt API (`window.ai.languageModel`).
- Firebase AI Logic hybrid inference and Cloud Gemini fallback.
- Cloud Firestore offline cache adapter.

## Known limitations and edge cases
- On-device Gemini Nano requires Chrome with `#prompt-api-for-gemini-nano` enabled.
- If Chrome Prompt API is unready or disabled, the hybrid router gracefully falls back to the deterministic START algorithm when offline, or to Cloud Gemini when online, alerting the user in the telemetry pill without failing silently.

## How to run, test and deploy
- Run local dev server: `npm run dev`
- Run test suites: `npm test`
- Conformance & toolchain verification: `python .agents/groundwork/engine/groundwork.py verify`
- Production build: `npm run build`
- Deploy to Firebase Hosting: `firebase deploy --only hosting`

## Ownership and support
**Owner:** Aditya Vikramm Singhal (@vikrammaditya)
