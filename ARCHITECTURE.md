# BuildHybridAI_2026_Project — Architecture

> High-level technical truth. Names used here are the names used everywhere else — do not
> invent parallel vocabulary. Update in the same change as the thing it describes.

## Overview
The application is a client-side Single Page Application (SPA) structured around an offline-first hybrid inference engine. User interactions and note storage are handled locally via React and Firestore offline persistence. AI tasks are dispatched through a unified Inference Manager layer via Firebase AI Logic: prompts are inspected and directed to on-device Gemini Nano if available and within token/capability limits, or routed to cloud Gemini models via Firebase AI Logic with App Check attestation.

```
+-------------------------------------------------------------+
| Browser / Client (Chrome)                                   |
|  +--------------------+      +---------------------------+  |
|  |  React UI (Pages & | ---> |  Core Note & Research     |  |
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
| UI Layer (`pages/`, `components/`) | User interface for note-taking, markdown rendering, AI stream views, and network/model status pills | React 18+, TypeScript, Tailwind CSS | Aditya Vikramm Singhal |
| Core Domain (`core/`) | Note management, prompt construction, hybrid inference orchestration, token estimation | Pure TypeScript | Aditya Vikramm Singhal |
| Connectors (`connectors/`) | Integration adapters for Firebase AI Logic, Firestore, Auth, Remote Config, and App Check | Firebase JS SDK v11+, Firebase AI Logic | Aditya Vikramm Singhal |
| Config (`config/`) | Environment configuration, Firebase project credentials, feature flags | TypeScript (`config/firebase.ts`) | Aditya Vikramm Singhal |
| Prompts (`prompts/`) | Model prompt templates for summarization, entity extraction, and synthesis | Markdown / Text templates | Aditya Vikramm Singhal |

## Data flow
1. User creates or edits a note; note state is instantly saved to local memory and persisted to Cloud Firestore with offline cache enabled.
2. User triggers an AI action (e.g., "Summarize Note", "Extract Action Items", "Deep Synthesize").
3. Core domain constructs prompt from template in `prompts/` and passes it to the Hybrid Inference Router connector.
4. Router evaluates local model readiness (Gemini Nano via Firebase AI Logic / Chrome built-in AI) and task complexity.
5. If local model is ready and task fits within context window, inference runs 100% on-device with zero network latency.
6. If local model is unavailable, offline with no model, or task requires deep multi-note reasoning, request routes to Firebase AI Logic cloud inference with App Check token.
7. Results stream back to the UI and are stored alongside the note metadata.

## Tech stack and tools
- Languages & Frameworks: TypeScript, React 18+, Vite
- Styling: Tailwind CSS
- Cloud & AI: Firebase Web SDK (v11+), Firebase AI Logic, Cloud Firestore, Firebase Authentication, Firebase Remote Config, Firebase App Check
- Package Manager: npm
- Testing & Linting: Vitest / Jest, ESLint, Prettier

## Deployment and environments
- Hosting: Firebase Hosting
- Environments:
  - Development: Localhost (`npm run dev`) using Chrome Canary / Dev with `#prompt-api-for-gemini-nano` enabled.
  - Production: Firebase Hosting (`npm run build && firebase deploy --only hosting`).
- Rollback: Re-deploy previous Git commit or run `firebase hosting:rollback`.

## Boundaries and contracts
- Client to Firebase: Secured via Firebase App Check tokens and granular Firestore Security Rules.
- Core to Connectors: Strict interface boundaries defined in `core/` (pure domain logic with no external dependencies; connectors implement ports).

## Cross-cutting concerns
- Auth: Google Sign-in and Anonymous authentication via Firebase Auth.
- Security: App Check attestation for all backend requests; API keys restricted via Google Cloud Console.
- Observability & Cost: Remote Config dynamically controls fallback thresholds and model selection to optimize latency and cloud API costs.
- Performance: Streaming responses and asynchronous Web Workers to keep main thread completely unblocked.

## Local development
- Setup: `npm install`
- Run local dev server: `npm run dev`
- Build production bundle: `npm run build`
- Typecheck & Lint: `npm run check` (or `npx tsc --noEmit && npx eslint .`)
- Test: `npm test`
