# Hybrid Notes Hub

An offline-first, intelligent research and notes workspace built for the **#BuildHybridAI 2026 Hackathon**.

The application combines **on-device generative AI** (Chrome Gemini Nano) for zero-latency, private, offline single-note tasks with **cloud intelligence** (Gemini via Firebase AI Logic) for deep cross-note synthesis.

---

## Key Capabilities

- **Hybrid Inference Routing:** Automatically directs single-note tasks (< 1,000 tokens) to Chrome's local Gemini Nano model. Routes multi-note synthesis and heavier queries to Cloud Gemini.
- **Offline-First Persistence:** Notes are immediately written to browser IndexedDB and queued for background Firestore synchronization.
- **Transparent Status Indicator:** Live visual badge showing whether on-device Gemini Nano or Cloud Gemini processed your request, including execution duration in milliseconds.
- **Resilient AI Feedback:** Non-blocking notifications with retry queues when models are unready or connectivity changes.
- **Zero-Barrier Authentication:** Immediate anonymous guest access with optional Google Sign-In for cross-device sync.

---

## Architectural Layout

```
+-------------------------------------------------------------+
| Browser / Client (Chrome)                                   |
|  +--------------------+      +---------------------------+  |
|  |  React UI (Pages & | ---> |  Core Domain Logic        |  |
|  |  Components)       |      |  (Storage & Router)       |  |
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
                       +-------------------------+
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or pnpm
- Google Chrome (Chrome Canary or Dev recommended for on-device Gemini Nano flags)

### Installation

```bash
git clone <your-repo-url>
cd BuildHybridAI_2026_Project
npm install
```

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

---

## Enabling On-Device Gemini Nano in Chrome

To enable built-in local inference in Chrome Dev or Canary:

1. Open `chrome://flags` in your browser.
2. Enable **Prompt API for Gemini Nano** (`#prompt-api-for-gemini-nano`).
3. Set **Enables optimization guide on device** (`#optimization-guide-on-device-model`) to `Enabled BypassPerfRequirement`.
4. Relaunch Chrome.
5. Go to `chrome://components`, locate **Optimization Guide On Device Model**, and click **Check for update**.
6. Open the app; the status badge will indicate **Gemini Nano Ready (On-Device)**.

---

## License

This project is licensed under the Apache License, Version 2.0.
