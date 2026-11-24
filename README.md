# FieldPulse — Offline-First Hybrid AI Emergency Triage & Hospital Handover

[![Built for #BuildHybridAI 2026](https://img.shields.io/badge/Hackathon-%23BuildHybridAI%202026-blue)](https://firebasehybridaihackathon.devpost.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)

**FieldPulse** is an offline-first hybrid generative AI emergency first-response and disaster triage application built for the **Google #BuildHybridAI 2026 Hackathon**.

It empowers emergency responders, paramedics, and wilderness medics operating in network-severed disaster zones with **instant, zero-latency on-device clinical triage and trauma stabilization guidance** via Chrome Gemini Nano, and seamlessly escalates to **Cloud Gemini via Firebase AI Logic** for multi-casualty trauma center handover dispatches and pharmacological safety auditing when connectivity is restored.

---

## 🚑 Why FieldPulse? (The Hybrid AI Necessity)

In earthquakes, storms, or remote wilderness emergencies, communications infrastructure is the first point of failure. Responders cannot afford network spinners or failure screens when making split-second mass-casualty triage decisions:

1. **Zero-Latency On-Device Triage (Chrome Gemini Nano):** Operates 100% offline. Evaluates casualty vitals according to international START guidelines (Immediate/Red, Delayed/Yellow, Minor/Green, Expectant/Black) and streams actionable trauma stabilization protocols (Combat Application Tourniquets, airway maneuvers, shock prevention, burn dressings) with sub-second response times.
2. **Cloud Escalation & Hospital Handover (Firebase AI Logic):** When network connectivity is detected or restored, the hybrid router dispatches the aggregated casualty registry to Cloud Gemini to synthesize military/EMS standard **MIST** (Mechanism, Injuries, Signs, Treatments) and **SBAR** dispatch reports, preparing trauma centers before patient arrival.
3. **Pharmacology Safety Auditor:** Audits proposed field analgesia and emergency interventions against patient allergies, closed head trauma, and respiratory depression contraindications via Cloud Gemini.
4. **Deterministic Fallback Engine:** Conforms to constitutional safety guardrails — if Gemini Nano is unready or disabled, the system automatically falls back to deterministic START algorithms with clear telemetry feedback, never failing silently.

---

## 🏗️ Architectural Overview

```
+-------------------------------------------------------------------------+
| Browser / Client (Chrome Dev & Canary / Mobile Viewport)                |
|  +--------------------+      +---------------------------------------+  |
|  | React Field UI     | ---> | Core Triage & Incident Service Logic  |  |
|  | - Triage Board     |      | - START Decision Tree Algorithm       |  |
|  | - Intake Modal     |      | - Casualty Registry State Manager     |  |
|  | - Telemetry Pill   |      +---------------------------------------+  |
|  +--------------------+                          |                      |
|                                                  v                      |
|                                    +---------------------------+        |
|                                    | Hybrid Inference Router   |        |
|                                    +---------------------------+        |
|                                       /                     \           |
|                                      / (On-Device)           \ (Cloud)  |
|                                     v                         v         |
|                          +--------------------+    +------------------+ |
|                          | Chrome Gemini Nano |    | Firebase AI Logic| |
|                          | (Built-in Prompt)  |    | Client Connector | |
|                          +--------------------+    +------------------+ |
+--------------------------------------------------------------|----------+
                                                               | (HTTPS + App Check)
                                                               v
                                                  +-----------------------+
                                                  | Firebase Cloud AI     |
                                                  | - Gemini Cloud Models |
                                                  | - Firestore Sync Cache|
                                                  | - Remote Config / Auth|
                                                  +-----------------------+
```

---

## ⚡ Key Features

* **START Protocol Triage Intake:** Rapid-tap button interface designed for gloved responders in high-stress environments.
* **On-Device Emergency Stabilization:** Instant step-by-step guidance for arterial bleeding, airway obstruction, shock, and burns.
* **MIST & SBAR Hospital Dispatch:** Structured hospital handover dispatches generated with 1 click.
* **Simulated Offline Mode Toggle:** Live navbar button enabling instant demonstration of offline Gemini Nano execution versus online Cloud Gemini synthesis.
* **Offline Firestore Persistence:** All casualty assessments persist locally and sync to Cloud Firestore automatically upon reconnection.
* **High-Contrast Field Theme:** Dark tactical interface with prominent triage color badges (Red, Yellow, Green, Black) meeting WCAG AA contrast for outdoor daylight readability.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or newer)
* Google Chrome (Chrome Canary or Dev recommended for Gemini Nano built-in AI)

### Installation

```bash
git clone https://github.com/vikrammaditya/BuildHybridAI_2026_Project.git
cd BuildHybridAI_2026_Project
npm install
```

### Local Development

```bash
npm run dev
```

Open `http://localhost:5173` in Google Chrome.

### Running Tests

```bash
npm test
```

### Production Build

```bash
npm run build
```

---

## 🧪 Enabling On-Device Gemini Nano in Chrome

To enable Chrome's local built-in Gemini Nano model:
1. Navigate to `chrome://flags` in Chrome Canary/Dev.
2. Enable **Prompt API for Gemini Nano** (`#prompt-api-for-gemini-nano`).
3. Set **Enables optimization guide on device** (`#optimization-guide-on-device-model`) to `Enabled BypassPerfRequirement`.
4. Relaunch Chrome.
5. Go to `chrome://components`, locate **Optimization Guide On Device Model**, and click **Check for update**.
6. In FieldPulse, the navbar badge will display **Gemini Nano (On-Device)**.

---

## 🎥 3-Minute Demo Drill Sequence

1. Click **"Demo Drill (3 Patients)"** in the top bar to load a pre-configured mass-casualty scenario (Alex Mercer [Red], Sarah Connor [Yellow], David Miller [Green]).
2. Click the **"ONLINE"** badge in the navbar to toggle **Simulated Offline Mode** (airplane mode).
3. Open **Casualty TAG-001** and click **"Stabilize"** — demonstrate immediate on-device tourniquet guidance generated offline via Gemini Nano.
4. Toggle back to **"ONLINE"** and click **"Hospital Handover"** in the top navigation bar.
5. Click **"Generate MIST & SBAR Report"** — demonstrate Cloud Gemini synthesizing the incoming trauma intake dispatch.

---

## 📄 License

This project is licensed under the Apache License, Version 2.0.
