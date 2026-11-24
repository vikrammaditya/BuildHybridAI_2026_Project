# FieldPulse — Architecture

> High-level technical truth. Names used here are the names used everywhere else — do not
> invent parallel vocabulary. Update in the same change as the thing it describes.

## Overview
FieldPulse is a client-side Single Page Application (SPA / PWA) structured around an offline-first hybrid inference engine for emergency triage and field medicine. Casualty records and incident data are stored locally in memory and persisted via Cloud Firestore offline cache. AI tasks are dispatched through a unified Inference Router via Firebase AI Logic: rapid casualty assessments and first-aid stabilization prompts are directed to on-device Gemini Nano with zero network latency, while multi-casualty incident aggregation, complex differential diagnoses, and hospital handover dispatches route to cloud Gemini models via Firebase AI Logic with App Check attestation.

```
+-------------------------------------------------------------+
| Browser / Client (Chrome)                                   |
|  +--------------------+      +---------------------------+  |
|  |  React UI (Pages & | ---> |  Core Triage & Incident   |  |
|  |  Components)       |      |  Service Logic            |  |
|  +--------------------+      +---------------------------+  |
|                                            |                |
|                      +---------------------+                |
|                      v                                      |
|         +-------------------------+                         |
|         | Hybrid Inference Router |                         |
|         +-------------------------+                         |
|             |                 |                             |
|             v (on-device)     v (cloud fallback)            |
|       +-----------+      +-------------------+              |
|       | Chrome    |      | Firebase AI Logic |              |
|       | Gemini    |      | Client Connector  |              |
|       | Nano      |      +-------------------+              |
+-------+-----------+---------------+-------------------------+
                                    | (HTTPS + App Check)
                                    v
                       +-------------------------+
                       | Firebase Cloud Services |
                       | - Gemini Cloud Models   |
                       | - Cloud Firestore Sync  |
                       | - Remote Config / Auth  |
                       +-------------------------+
```

## Components and repositories
| Component | Responsibility | Tech | Owner |
| --- | --- | --- | --- |
| UI Layer (`pages/`, `components/`) | User interface for casualty intake, triage board, protocol cards, audio/text stream views, and network/model status badges | React 18+, TypeScript, Tailwind CSS | Aditya Vikramm Singhal |
| Core Domain (`core/`) | Casualty state management, START triage assessment logic, prompt construction, hybrid inference orchestration, token estimation | Pure TypeScript | Aditya Vikramm Singhal |
| Connectors (`connectors/`) | Integration adapters for Firebase AI Logic, Firestore, Auth, Remote Config, and App Check | Firebase JS SDK v11+, Firebase AI Logic | Aditya Vikramm Singhal |
| Config (`config/`) | Environment configuration, Firebase project credentials, feature flags | TypeScript (`config/firebase.ts`) | Aditya Vikramm Singhal |
| Prompts (`prompts/`) | Model prompt templates for rapid triage, emergency stabilization guidance, and hospital handover synthesis | Markdown / Text templates | Aditya Vikramm Singhal |

## Data flow
1. Responder logs casualty details (vitals: respiration, perfusion, mental status, injuries) via rapid UI buttons or voice text; state is saved to local memory and Cloud Firestore offline cache.
2. Responder requests AI assessment (e.g. "Assess START Category", "Provide Bleeding Stabilization Guidance", "Generate Hospital Handover").
3. Core domain constructs prompt from template in `prompts/` and passes it to the Hybrid Inference Router connector.
4. Router evaluates local model readiness (Gemini Nano via Firebase AI Logic / Chrome built-in AI) and task complexity.
5. If local model is ready, inference runs 100% on-device with zero network latency, giving immediate step-by-step guidance.
6. If local model is unavailable or the user requests multi-casualty incident synthesis / hospital handover dispatch, request routes to Firebase AI Logic cloud inference with App Check token.
7. Results stream back to the UI, update casualty metadata, and sync to Cloud Firestore when network connectivity is present.

## Tech stack and tools
- Languages & Frameworks: TypeScript, React 18+, Vite
- Styling: Tailwind CSS, Lucide icons
- Cloud & AI: Firebase Web SDK (v11+), Firebase AI Logic, Cloud Firestore, Firebase Authentication, Firebase Remote Config, Firebase App Check
- Package Manager: npm
- Testing & Linting: Vitest, ESLint, Prettier

## Deployment and environments
- Hosting: Firebase Hosting
- Environments:
  - Development: Localhost (`npm run dev`) using Chrome with Prompt API / Gemini Nano enabled.
  - Production: Firebase Hosting (`npm run build && firebase deploy --only hosting`).
- Rollback: Re-deploy previous Git commit or run `firebase hosting:rollback`.

## Boundaries and contracts
- Client to Firebase: Secured via Firebase App Check tokens and granular Firestore Security Rules.
- Core to Connectors: Strict interface boundaries defined in `core/` (pure domain logic with no external dependencies; connectors implement ports).

## Cross-cutting concerns
- Auth: Anonymous authentication for immediate disaster field startup, with optional Google Sign-in to link field teams.
- Security: App Check attestation for all backend requests; API keys restricted via Google Cloud Console.
- Observability & Cost: Remote Config dynamically controls fallback thresholds and model selection to optimize latency and cloud API usage.
- Performance: Streaming responses and asynchronous Web Workers to keep main thread completely unblocked.

## Local development
- Setup: `npm install`
- Run local dev server: `npm run dev`
- Build production bundle: `npm run build`
- Typecheck & Lint: `npm run typecheck`
- Test: `npm test`
