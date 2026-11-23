---
id: 001-hybrid-notes-workspace
rfc: RFC-0001
title: Hybrid Notes Workspace
status: approved
created: 2026-11-23
author: vikrammaditya05@gmail.com
requested_by: Aditya Vikramm Singhal
owner: Aditya Vikramm Singhal
implemented_by: [vikrammaditya05@gmail.com]
support: [Aditya Vikramm Singhal]
extends: []
depends_on: []
builds_against: []
amends: []
approved_by: [vikrammaditya05@gmail.com]
---

# Spec: Hybrid Notes Workspace

## 1. Problem
Delivering the single-repo web client experience specified in RFC-0001 §2 to provide instant offline note intelligence and cloud research capabilities.

## 2. Users and context
Knowledge workers, researchers, and developers capturing notes across varying network conditions who require immediate local summarization without latency and deep synthesis when online.

## 3. User stories
- **US-1**: As a researcher working without internet, I want instant on-device note summaries and action items so that I can organize thoughts offline with zero latency.
- **US-2**: As a knowledge worker with multiple related notes, I want to execute cross-note synthesis via cloud inference so that I can extract insights across my research library.
- **US-3**: As a user, I want clear visual indicators showing whether Gemini Nano or Cloud Gemini handled my request so that I understand execution latency and routing reasons.

## 4. Functional requirements
- **FR-1**: The system MUST provide a Markdown editor with live preview that auto-saves note changes to IndexedDB local storage and synchronizes to Cloud Firestore in the background.
- **FR-2**: The system MUST execute single-note summarization and action-item extraction locally using Chrome Gemini Nano when the on-device model is available.
- **FR-3**: The system MUST extract topical keywords and categorization tags from note content locally using Gemini Nano.
- **FR-4**: The system MUST route multi-note cross-referencing, prompts exceeding the token limit (default 1,000 tokens), or requests where Gemini Nano is unready to Cloud Gemini models via Firebase AI Logic.
- **FR-5**: The system MUST display an active model status badge in the header indicating whether the execution ran on "Gemini Nano (Local)" or "Gemini Cloud (Hybrid)", including execution duration in milliseconds and fallback reason.
- **FR-6**: The system MUST display a non-blocking notification banner with retry capability when an AI action is attempted while offline and Gemini Nano is unready, while keeping note editing fully functional.
- **FR-7**: The system MUST provide immediate anonymous guest authentication on initial visit, with an optional Google Sign-In option to persist and sync notes across devices.
- **FR-8**: The system MUST fetch hybrid routing thresholds from Firebase Remote Config when online and fall back to local constants when offline.

## 5. Non-functional requirements
- **NFR-1 (Performance)**: On-device summarization MUST begin streaming or return within 1,500ms for notes under 1,000 tokens.
- **NFR-2 (UI Responsiveness)**: AI generation MUST NOT block the main JavaScript thread; editor input latency must remain fluid at 60 FPS.
- **NFR-3 (Security)**: Client bundles MUST NOT expose private Firebase administrative credentials; cloud calls must carry Firebase App Check attestation tokens.
- **NFR-4 (Accessibility & Theme)**: The UI MUST meet WCAG AA contrast standards and support light and dark theme toggling.

## 6. Acceptance criteria
- **AC-1**: Given a user typing markdown in the editor, when input pauses for 500ms, then the note content is saved in IndexedDB and queued for Firestore synchronization. (covers FR-1)
- **AC-2**: Given a note under 1,000 tokens and an available Gemini Nano model, when the user clicks "Summarize", then bullet points appear in the AI drawer within 1,500ms accompanied by a green "Gemini Nano (Local)" badge. (covers FR-2, FR-5)
- **AC-3**: Given note text containing key topics, when the user clicks "Auto-Tag", then relevant category tags are generated and attached to the note locally. (covers FR-3)
- **AC-4**: Given multiple selected notes, when the user requests "Synthesize", then the request routes to Firebase AI Logic cloud inference with an App Check token and displays a blue "Gemini Cloud (Hybrid)" badge. (covers FR-4, FR-5)
- **AC-5**: Given Chrome DevTools network set to Offline and Gemini Nano unready, when the user triggers an AI operation, then a clear notice banner appears while note editing remains completely unblocked. (covers FR-6)
- **AC-6**: Given a first-time user opening the web application, when the home screen mounts, then an anonymous Firebase Auth session is created automatically without a login gate. (covers FR-7)
- **AC-7**: Given an active internet connection, when the application initializes, then routing parameters are fetched from Remote Config and cached for offline use. (covers FR-8)

## 7. Failure behaviour
- When the device is offline and Gemini Nano is unavailable or downloading: A gentle banner explains that on-device models are downloading or unsupported and internet is disconnected. The note text editor remains fully interactive.
- When cloud inference fails or times out: An error toast explains the network or quota failure with a single-click retry action.

## 8. Manual test
1. Open the web app in Chrome with Gemini Nano enabled (`#prompt-api-for-gemini-nano`).
2. Create a note titled "Hybrid AI Architecture" and type three paragraphs of text.
3. Click "Summarize": Verify the summary appears within 1.5 seconds and displays the green "Gemini Nano (Local)" pill.
4. In Chrome DevTools > Network, select "Offline".
5. In the same note, click "Extract Action Items": Verify action items generate completely offline.
6. Select multiple notes in the sidebar and click "Synthesize": Verify the app detects offline status for multi-note synthesis and shows an informative banner without crashing.
7. Switch DevTools back to "Online" and click "Retry Synthesize": Verify cloud synthesis streams response with the blue "Gemini Cloud (Hybrid)" pill.

## 9. Out of scope
As RFC-0001 §9.
