---
id: RFC-0001
title: Offline-First Hybrid AI Notes Workspace
status: approved
classification: internal
signoffs_required: 1
requested_by: Aditya Vikramm Singhal
request_source: Hackathon Submission Requirement (#BuildHybridAI 2026)
owner: vikrammaditya05@gmail.com
supersedes: []
related_rfcs: []
author: vikrammaditya05@gmail.com
created: 2026-11-23
approved_by: [vikrammaditya05@gmail.com]
---

# RFC-0001 — Offline-First Hybrid AI Notes Workspace

## 1. Summary
We are building an offline-first intelligent notes and research web application that utilizes Firebase AI Logic hybrid inference. The system automatically routes single-note tasks (instant summarization, action-item extraction, entity tagging) to Chrome's local Gemini Nano model for zero-latency, private, and offline execution. For complex cross-note synthesis, research queries, or when local models are unavailable, it transparently routes requests to Cloud Gemini models via Firebase AI Logic, protected by App Check and guided by Remote Config thresholds.

## 2. The need
**User scenario:** A researcher or developer taking notes and synthesizing knowledge needs immediate, responsive summarization and tagging even when offline (e.g., in transit, low connectivity). When connected, they want to synthesize multiple notes and perform deeper research without manual configuration or managing API keys.
**Done means:** A user can create and edit markdown notes offline, generate on-device summaries and tags via Chrome Gemini Nano with sub-second response, toggle network off in DevTools to demonstrate complete offline operation, and seamlessly trigger cloud-based multi-note synthesis with live routing indicators in the UI.

## 3. Interview record

| # | Question | Answer | Effect |
| --- | --- | --- | --- |
| 1 | What core interface and workflow should anchor the MVP feature? | Interactive Markdown Note Editor: Write/edit notes with instant on-device summary & cloud synthesis panels | Confirmed |
| 2 | How should hybrid inference status and model routing be exposed to the user? | Transparent Hybrid Indicator: UI shows live badge (Local Nano vs Cloud Gemini) with latency and fallback reason | Confirmed |
| 3 | How should note storage and persistence be structured? | Offline-First Local + Firestore Sync: Immediate IndexedDB/LocalStorage saving with background Firestore sync and offline cache | Confirmed |
| 4 | Who is recorded as requesting and owning this feature? | Aditya Vikramm Singhal (Solo Creator & Owner) | Confirmed |
| 5 | Which specific Gen AI capabilities should the workspace offer? | Instant Summary & Action Items, Smart Entity/Topic Tagging, and Deep Multi-Note Synthesis | Confirmed |
| 6 | How should the app behave if Gemini Nano is unavailable/downloading AND the device is offline? | Graceful UI notice with retry queue without crashing or blocking note editing | Confirmed |
| 7 | How should user identity and authentication be handled? | Hybrid Auth: Anonymous guest mode for instant zero-friction use, with optional Google Sign-In for cross-device sync | Confirmed |
| 8 | What exact condition should determine routing to Cloud vs Local Gemini Nano? | Capability & Token Dynamic Routing: Local Nano for tasks < 1k tokens, cloud for multi-note synthesis or when Nano is unready | Confirmed |
| 9 | What visual layout and look-and-feel do you prefer for the workspace UI? | Clean Minimalist Dual-Pane: Left sidebar (notes list & tags), main editor, right AI drawer, with auto light/dark theme | Confirmed |
| 10 | What is the target manual verification / demo flow for the hackathon submission? | Simulated DevTools Offline Demo: Toggle DevTools offline to prove on-device Nano runs without internet, then toggle online to demo cloud multi-note synthesis | Confirmed |
| 11 | How should Firebase Remote Config parameters be integrated? | Remote Config with safe local defaults: Fetch fallback thresholds from Remote Config when online, fallback to local constants when offline | Confirmed |

### Read-back
- **Confirmed:**
  - Application type: Client-side React + TypeScript + Vite SPA.
  - Hybrid AI logic: Chrome Gemini Nano (on-device) for local single-note summarization & tagging; Firebase AI Logic cloud fallback for multi-note synthesis.
  - Storage: Local IndexedDB/cache immediate write + background Firestore persistence.
  - Auth: Anonymous guest mode by default, optional Google Sign-in.
  - Routing feedback: Visual badge indicating Local Nano vs Cloud Gemini execution mode, token count, and latency.
  - Guardrails: No silent fallback failures, no blocking main thread, zero secret leakage.
- **Tensions:** None.
- **Open decisions:** None.
- **Docs to update after approval:** None required (aligns completely with PROJECT.md and ARCHITECTURE.md).

## 4. Proposal
Build the `hybrid-notes-workspace` feature providing:
1. **Note Management**: Left sidebar listing notes, tags, and search. Center pane provides a responsive Markdown editor with live preview and local persistence.
2. **Hybrid Inference Engine (`core/` & `connectors/`)**:
   - Connector to Firebase AI Logic inspecting model readiness (`window.ai` / Chrome Built-in AI / Gemini Nano).
   - Token & capability evaluator directing single-note summary (< 1k tokens) to on-device Nano.
   - Automatic fallback to Firebase AI Logic cloud model if on-device model is downloading, unsupported, or task is multi-note synthesis.
3. **Transparent Status Banner**: Header/pill indicator displaying active model (`Gemini Nano (Local)` in green vs `Gemini Cloud (Hybrid)` in blue), execution duration, and fallback reason if triggered.
4. **Resilient Offline Architecture**: UI remains fully functional when disconnected. If offline and local model is unavailable, presents a clear notification banner with a retry queue instead of throwing unhandled exceptions.
5. **Firebase Integration**: Firestore offline cache persistence, Firebase Auth (anonymous + Google), App Check verification, and Remote Config for dynamic fallback tuning.

## 5. Alternatives considered
- **Cloud-Only Architecture**: Simpler to implement but fails hackathon hybrid AI requirements, incurs network latency, and prevents offline note summarization.
- **Local-Only Model**: Zero server cost, but cannot handle large-context cross-note synthesis or devices without Chrome Gemini Nano support.
- **Rigid User Model Switch**: Forcing users to manually choose Local vs Cloud creates unnecessary cognitive load; dynamic routing with a transparent indicator delivers the best UX.

## 6. Risks and objections
- **Risk:** Chrome Gemini Nano model may take time to download or may not be enabled on the evaluator's browser.
  - **Mitigation:** Include clear instructions in the README for enabling Chrome Canary/Dev flags (`#prompt-api-for-gemini-nano`), and implement transparent, graceful fallback to Cloud Gemini via Firebase AI Logic so the app never breaks.
- **Risk:** Offline Firestore synchronization conflicts.
  - **Mitigation:** Use last-write-wins timestamp resolution for personal single-user notes.

## 7. Impact
**Repos touched:** `BuildHybridAI_2026_Project` (single standalone repository).
**Constitution check:**
- Hybrid-first principle: Compliant (prioritizes Chrome Gemini Nano first).
- Privacy and offline integrity: Compliant (offline note creation and local summarization).
- Guardrails: Compliant (no secrets exposed, fallback reason clearly surfaced, main thread unblocked via streaming).
**Cost / performance / security notes:**
- Zero cloud cost for on-device inference.
- Minimal cloud API usage via Firebase Spark tier.
- App Check protects cloud endpoints from unauthorized abuse.

## 8. Cross-repo contract (only if classification is `api`)
N/A, internal.

## 9. Out of scope
- Real-time multi-user collaborative editing.
- Native mobile app wrapper (React Native / Flutter / Android Studio).
- Audio transcription or voice input.

## 10. Open questions
_None._
