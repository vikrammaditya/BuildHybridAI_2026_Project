---
id: 001-fieldpulse-hybrid-triage
rfc: RFC-0001
title: Fieldpulse Hybrid Triage
status: approved
created: 2026-11-24
author: vikrammaditya
requested_by: Aditya Vikramm Singhal
owner: vikrammaditya
implemented_by: [vikrammaditya]
support: [Aditya Vikramm Singhal]
extends: []
depends_on: []
builds_against: []
amends: []
approved_by: [vikrammaditya]
---

# Spec: Fieldpulse Hybrid Triage

## 1. Problem
As described in RFC-0001 §2, disaster zones and crisis environments suffer from severed communications infrastructure, leaving emergency first responders without access to cloud AI services when making split-second mass-casualty triage decisions.

## 2. Users and context
- **Primary users:** Paramedics, search-and-rescue teams, wilderness first-aiders, and emergency medical technicians.
- **Context:** Operating outdoors or in disaster zones with zero or unstable cell reception, requiring rapid touch-friendly casualty intake, instant triage guidance on-device, and structured hospital handover generation upon reconnecting.

## 3. User stories
- **US-1**: As an emergency first responder, I want to quickly tap in a patient's vital signs and injury description so that the system immediately assigns an accurate START triage color tag on-device without internet.
- **US-2**: As a field medic, I want instant step-by-step emergency stabilization instructions (e.g. tourniquet application, airway management) so that I can stabilize critical casualties under field conditions.
- **US-3**: As an incident commander, I want to aggregate all triaged casualties into a standardized MIST/SBAR hospital dispatch report once connected to the cloud so that receiving trauma centers are prepared for incoming patients.
- **US-4**: As a responder, I want clear visual telemetry showing whether the app is running in local offline mode (Gemini Nano) or cloud mode so that I always know the system state.

## 4. Functional requirements
- **FR-1**: The system MUST provide a rapid casualty intake interface capturing casualty ID/tag, demographics, vital signs (respiration rate, perfusion/radial pulse, mental status, ambulatory ability), and trauma notes.
- **FR-2**: The system MUST perform on-device START triage evaluation using Chrome Gemini Nano, categorizing each patient into Immediate (Red), Delayed (Yellow), Minor (Green), or Expectant (Black) with an explanation.
- **FR-3**: The system MUST generate on-device emergency stabilization protocols for bleeding/tourniquet, airway recovery, shock/hypothermia, and burns based on the logged injuries.
- **FR-4**: The system MUST store and persist casualty records locally with offline caching, functioning completely offline and synchronizing with Cloud Firestore when network connectivity is present.
- **FR-5**: The system MUST synthesize multi-casualty incident summaries and structured MIST/SBAR hospital handover dispatch reports via Cloud Gemini when connected.
- **FR-6**: The system MUST verify pharmacological contraindications and drug interactions for proposed field treatments against patient allergies and vitals via Cloud Gemini.
- **FR-7**: The system MUST display a real-time telemetry badge reflecting network state (Online vs. Offline) and active AI inference route (Local Nano vs. Cloud Gemini).
- **FR-8**: The system MUST provide a high-contrast emergency field theme with standard triage color coding and touch-friendly controls.

## 5. Non-functional requirements
- **NFR-1 (Latency):** On-device triage categorization and stabilization guidance MUST stream or complete in under 1 second without blocking the main browser UI thread.
- **NFR-2 (Offline Operation):** All triage inputs, vital evaluations, local guidance, and record browsing MUST be 100% functional with zero network connectivity.
- **NFR-3 (Security & Attestation):** Cloud requests MUST require Firebase App Check attestation and MUST NOT expose private API keys in client bundles.
- **NFR-4 (Accessibility & Contrast):** The interface MUST meet WCAG AA contrast standards with clear visual hierarchy for high-stress outdoor visibility.

## 6. Acceptance criteria
- **AC-1**: Given an active casualty session, when the responder selects "Walking: No", "Respirations: > 30/min", and saves, then the casualty record is updated in local state and Firestore cache. (covers FR-1, FR-4)
- **AC-2**: Given a non-ambulatory casualty with rapid respirations (>30/min), when "Run Triage" is triggered offline, then Gemini Nano assigns the "Immediate (Red)" tag with clinical justification within 1 second. (covers FR-2)
- **AC-3**: Given a casualty with arterial bleeding noted in trauma details, when "Stabilization Guide" is clicked, then Gemini Nano outputs step-by-step instructions for CAT tourniquet placement. (covers FR-3)
- **AC-4**: Given an offline browser session with multiple triaged casualties, when the page is reloaded without network, then all previously triaged casualties remain intact and accessible. (covers FR-4)
- **AC-5**: Given multiple triaged casualties and active network connectivity, when "Generate Hospital Handover" is clicked, then Cloud Gemini streams a standardized MIST/SBAR dispatch report. (covers FR-5)
- **AC-6**: Given a patient with logged allergies and planned pain medication, when "Verify Contraindications" is triggered online, then Cloud Gemini verifies safety warnings and drug interactions. (covers FR-6)
- **AC-7**: Given network transition between online and offline, when network status changes, then the telemetry indicator immediately toggles between "Offline (Gemini Nano)" and "Online (Hybrid Ready)". (covers FR-7)
- **AC-8**: Given any screen resolution from 375px to 1920px, when viewing the triage board, then triage color badges (Red, Yellow, Green, Black) are prominently distinguishable with high-contrast text. (covers FR-8)

## 7. Failure behaviour
- If Gemini Nano is unavailable or uninitialized in Chrome, the hybrid router falls back to local deterministic rule-based START triage when offline, or to Cloud Gemini when online, alerting the user via the telemetry badge without throwing fatal unhandled exceptions.
- If cloud requests fail due to intermittent connection during handover generation, the app retains all local casualty data, displays an unobtrusive retry notice, and preserves the drafted incident state.

## 8. Manual test
1. Launch the dev server: `npm run dev`.
2. Open Chrome (with Prompt API enabled) at `http://localhost:5173`.
3. Verify the telemetry pill shows "Hybrid Ready (Gemini Nano)".
4. Disconnect network / toggle browser DevTools Offline mode.
5. Verify the telemetry pill switches to "Offline (Gemini Nano Active)".
6. Create Casualty #1: Select Non-ambulatory, Respiration > 30, Perfusion normal, Mental normal, Note: "Deep thigh laceration with pulsatile bleeding".
7. Click "Assess Triage" — verify "Immediate (Red)" is assigned within 1 second.
8. Click "Stabilization Guide" — verify step-by-step tourniquet application guidance renders.
9. Create Casualty #2: Walking wounded, Minor scratches — verify assigned "Minor (Green)".
10. Refresh the browser while offline — verify both casualties persist.
11. Reconnect network (disable offline mode).
12. Click "Generate Hospital Handover" — verify Cloud Gemini produces a complete MIST/SBAR dispatch report.

## 9. Out of scope
As RFC-0001 §9.
