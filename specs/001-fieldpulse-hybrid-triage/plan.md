---
id: 001-fieldpulse-hybrid-triage
spec: spec.md
spec_version: 4f971da59dfc34e115664c21c0cacdf36eedf00b87b0b29cf8fb4dbac6301632
created: 2026-11-24
---

# Plan: Fieldpulse Hybrid Triage

## 1. Approach
FieldPulse leverages the existing clean architectural separation in the repository (`core/`, `connectors/`, `prompts/`, `components/`, `pages/`) to implement an offline-first disaster triage system.
1. Pure domain models and deterministic START algorithm logic live in `core/triage/` with zero external dependencies (FR-1, FR-2).
2. Specialized emergency triage prompts live in `prompts/triagePrompts.ts` (FR-2, FR-3, FR-5, FR-6).
3. The hybrid inference connector layer (`connectors/ai/`) evaluates device readiness and network state: rapid individual casualty assessments and emergency stabilization guides are routed to local Chrome Gemini Nano (FR-2, FR-3, NFR-1, NFR-2), while multi-patient aggregation, MIST/SBAR hospital handover reports, and drug contraindications route to Cloud Gemini via Firebase AI Logic (FR-5, FR-6, NFR-3).
4. Data persistence (`connectors/firebase/firestoreConnector.ts`) uses Cloud Firestore with offline cache enabled to maintain complete offline integrity (FR-4, NFR-2).
5. The UI layer (`pages/TriageWorkspacePage.tsx`, `components/triage/`) delivers a high-contrast, touch-optimized field dashboard with real-time telemetry pills (FR-7, FR-8, NFR-4).

## 2. Affected modules and files
- `core/triage/types.ts` (`core`): Domain types for casualties, vitals, START categories, triage guidance, and handover summaries (FR-1, FR-2, FR-3, FR-5).
- `core/triage/startAlgorithm.ts` (`core`): Deterministic clinical START triage evaluation logic (FR-2, NFR-1).
- `core/triage/triageService.ts` (`core`): Casualty state management, filtering, and prompt generation (FR-1, FR-4).
- `prompts/triagePrompts.ts` (`prompts`): Prompt templates for on-device START categorization, emergency stabilization guidelines, hospital MIST/SBAR dispatch, and contraindication checks (FR-2, FR-3, FR-5, FR-6).
- `connectors/ai/nanoConnector.ts` (`connectors/ai`): Chrome Built-in AI / Prompt API adapter with streaming support for on-device inference (FR-2, FR-3, NFR-1).
- `connectors/ai/firebaseAiConnector.ts` (`connectors/ai`): Firebase AI Logic / Cloud Gemini connector for hospital handover and pharmacological analysis (FR-5, FR-6, NFR-3).
- `connectors/ai/hybridRouter.ts` (`connectors/ai`): Router arbitrating between on-device Gemini Nano and Cloud Gemini based on task and connectivity (FR-2, FR-5, FR-7).
- `connectors/firebase/firestoreConnector.ts` (`connectors/firebase`): Firestore adapter with offline persistence (FR-4, NFR-2).
- `components/TelemetryPill.tsx` (`components`): Real-time network and inference mode badge (FR-7).
- `components/triage/CasualtyCard.tsx` (`components`): High-contrast casualty card with triage color badges and quick action triggers (FR-1, FR-8).
- `components/triage/CasualtyIntakeModal.tsx` (`components`): Quick-tap vitals entry modal for responders (FR-1, FR-8).
- `components/triage/StabilizationGuideDrawer.tsx` (`components`): Slide-out drawer rendering emergency stabilization protocol steps (FR-3, FR-8).
- `components/triage/HospitalHandoverModal.tsx` (`components`): Modal for generating and streaming MIST/SBAR hospital reports and drug checks (FR-5, FR-6).
- `pages/TriageWorkspacePage.tsx` (`pages`): Main dashboard composing the casualty board, filter tabs, stats, and command header (FR-1, FR-8).
- `src/App.tsx` (`src`): Mounts `TriageWorkspacePage` (FR-8).

## 3. Data model and migrations
- `Casualty`:
  - `id`: string (UUID)
  - `tagNumber`: string (e.g. "TAG-001")
  - `timestamp`: number
  - `name`: string (optional)
  - `age`: number (optional)
  - `gender`: 'male' | 'female' | 'unknown'
  - `vitals`:
    - `ambulatory`: boolean (can walk)
    - `respirations`: 'normal' | 'rapid' | 'absent' | number (breaths/min)
    - `perfusion`: 'normal' | 'delayed' | 'absent' (capillary refill / radial pulse)
    - `mentalStatus`: 'follows_commands' | 'unresponsive' | 'altered'
  - `category`: 'immediate' | 'delayed' | 'minor' | 'expectant' | 'unassessed'
  - `clinicalNotes`: string
  - `injuries`: string[]
  - `allergies`: string[]
  - `stabilizationActions`: string[]
  - `aiRationale`: string
- No schema migrations required; persisted in Firestore collection `casualties` with local cache fallback.

## 4. Interfaces and contracts
- `ITriageRouter`:
  - `evaluateTriage(casualty: Casualty): Promise<TriageEvaluationResult>`
  - `generateStabilizationGuidance(casualty: Casualty, protocolType: ProtocolType): Promise<AsyncIterable<string>>`
  - `generateHospitalHandover(casualties: Casualty[], incidentContext: string): Promise<AsyncIterable<string>>`
  - `checkContraindications(casualty: Casualty, medication: string): Promise<string>`

## 5. Failure modes and edge cases
- **Chrome Prompt API unavailable / unready:** The router falls back to the deterministic clinical START algorithm in `core/triage/startAlgorithm.ts` when offline, or to Cloud Gemini when online, alerting the user via the telemetry pill without breaking the UI (as specified in spec §7).
- **Network loss during cloud handover generation:** The system preserves all local casualty records, falls back to a locally structured text template summary, and queues cloud dispatch for when network connectivity restores (spec §7).
- **Incomplete vitals input:** Default to conservative assessment or flag missing vital parameters in the intake modal.

## 6. Test strategy
- **Unit Tests (Vitest):**
  - `tests/startAlgorithm.test.ts`: Validates deterministic START triage classification logic across all clinical branches (covers FR-2, AC-2).
  - `tests/triageService.test.ts`: Validates casualty CRUD, filtering, and local state transitions (covers FR-1, FR-4, AC-1, AC-4).
  - `tests/hybridRouter.test.ts`: Validates hybrid routing logic between Nano and Cloud Gemini depending on network and model readiness (covers FR-7, AC-7).
- **Manual End-to-End Test:** Performed by following spec §8 across desktop and simulated mobile viewports in Chrome.

## 7. Rollout and rollback
- **Rollout:** Build with Vite (`npm run build`) and deploy to Firebase Hosting (`firebase deploy --only hosting`).
- **Rollback:** `firebase hosting:rollback` or redeploying the prior Git commit.
