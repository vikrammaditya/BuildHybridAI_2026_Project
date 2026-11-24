---
id: RFC-0001
title: Fieldpulse Hybrid Triage
status: approved
classification: internal
signoffs_required: 1
requested_by: Aditya Vikramm Singhal
request_source: hackathon
owner: vikrammaditya
supersedes: []
related_rfcs: []
author: vikrammaditya
created: 2026-11-24
approved_by: [vikrammaditya]
---

# RFC-0001 — Fieldpulse Hybrid Triage

## 1. Summary
FieldPulse is an offline-first hybrid AI emergency first-response and disaster triage web application built with Firebase AI Logic for the #BuildHybridAI 2026 Hackathon. It provides rapid START triage categorization (Immediate/Red, Delayed/Yellow, Minor/Green, Expectant/Black) and emergency stabilization guidance (bleeding, airway, shock, burns) running 100% on-device with Chrome Gemini Nano with zero latency when offline. When online, it routes complex multi-casualty incident aggregation, structured hospital handover dispatch synthesis (MIST/SBAR), and drug interaction/contraindication verification to Cloud Gemini via Firebase AI Logic with App Check attestation and Firestore offline cache synchronization.

## 2. The need
**User scenario:** Emergency medical responders, paramedics, disaster relief teams, and wilderness first aiders operating in disaster zones, remote regions, or crisis environments where internet connectivity is severed or unstable. Responders need instantaneous, zero-latency clinical triage assistance and immediate life-saving stabilization guidance on-device, followed by comprehensive hospital handover dispatch reporting when communication links are restored.
**Done means:** A functional, responsive web application (with high-contrast emergency field mode) where responders can log casualty vitals via quick-tap buttons or text, receive instantaneous on-device START triage color tags and step-by-step first-aid stabilization protocols offline via Gemini Nano, and upon network restoration, receive comprehensive hospital handover reports and pharmacological verification via Cloud Gemini.

## 3. Interview record

| # | Question | Answer | Effect |
| --- | --- | --- | --- |
| 1 | What primary UI layout and form factor should FieldPulse provide for the hackathon demo? | Responsive Web Application: optimized for desktop & tablet viewports with high-contrast emergency field mode | Confirmed |
| 2 | What triage standard and input method should be implemented for rapid casualty assessment? | START Protocol (Simple Triage & Rapid Treatment): quick-tap vitals (Respiration, Perfusion/Pulse, Mental Status) + voice/text injury notes | Confirmed |
| 3 | When online, what cloud AI capabilities should Firebase AI Logic route to Cloud Gemini? | Multi-casualty incident summary, structured hospital handover dispatch (MIST/SBAR), and drug/contraindication checks | Confirmed |
| 4 | How should we transition the existing repository codebase to FieldPulse? | Replace the notes UI with FieldPulse triage while preserving and adapting the clean core/connectors/config architecture | Confirmed |
| 5 | Which offline emergency stabilization guidance protocols should Gemini Nano support on-device? | Bleeding control & tourniquet protocols, Airway & breathing obstruction guidance, Shock management & hypothermia prevention, Burn triage & stabilization guidelines | Confirmed |
| 6 | How should offline casualty records be persisted and synchronized across sessions? | Cloud Firestore with offline persistence enabled + automatic background sync upon reconnection | Confirmed |
| 7 | What primary scenario should be featured in the 3-minute hackathon demo video? | Simulated mass-casualty scenario: triage 3 patients offline with instant guidance, then reconnect to generate hospital handover | Confirmed |

### Read-back
- **Confirmed:** Responsive web application with high-contrast emergency theme; START triage protocol with quick-tap vitals; on-device Gemini Nano for offline triage categorization and emergency stabilization guidance; Cloud Gemini via Firebase AI Logic for multi-casualty incident summary, MIST/SBAR hospital handover dispatch, and drug interaction checks; Cloud Firestore with offline cache and auto-sync; clean adaptation of existing `core/`, `connectors/`, and `config/` architecture.
- **Tensions:** None. All design choices align directly with the offline-first hybrid inference paradigm.
- **Open decisions:** None.
- **Docs to update after approval:** None (foundation documents `PROJECT.md`, `ARCHITECTURE.md`, `CONSTITUTION.md` are already updated and confirmed).

## 4. Proposal
FieldPulse implements an end-to-end emergency triage workflow:
1. **Casualty Intake & Quick Triage:** Responders log casualties with an assigned ID/tag, demographics, and rapid clinical indicators:
   - Ambulatory status (can walk vs. non-ambulatory)
   - Respiration rate (<30/min, >30/min, absent)
   - Perfusion (capillary refill <2s, >2s, radial pulse presence)
   - Mental status (follows simple commands vs. unresponsive)
2. **On-Device Hybrid Triage Engine:** Gemini Nano evaluates the inputs and validates the START categorization:
   - **Immediate (Red):** Critical life-threat requiring immediate surgical/trauma intervention.
   - **Delayed (Yellow):** Serious injuries requiring care, but stable for delayed transport.
   - **Minor (Green):** Walking wounded with minor lacerations/bruises.
   - **Expectant (Black):** Deceased or injuries non-survivable with available field resources.
3. **Emergency Stabilization Guidance:** Immediate, bulleted step-by-step action guides for:
   - Bleeding & Tourniquet application (Combat Application Tourniquet / pressure dressings)
   - Airway & Breathing (recovery position, head-tilt chin-lift, jaw thrust, tension pneumothorax alert)
   - Shock & Hypothermia management (elevation, warming blankets, IV fluid alert)
   - Burn triage (Rule of Nines estimate, sterile dressing, cooling precautions)
4. **Cloud Escalation & Incident Handover:**
   - When network connectivity is active (or re-established), Firebase AI Logic routes the aggregated incident casualties to Cloud Gemini.
   - Generates a military/EMS standard **MIST report** (Mechanism of injury, Injuries found, Symptoms/Signs, Treatments given) and **SBAR summary** (Situation, Background, Assessment, Recommendation) formatted for receiving hospital trauma intake.
   - Performs rapid pharmacological verification (contraindications for pain management or clotting agents based on logged allergies/conditions).
5. **Inference & Network Telemetry Pill:** A real-time UI status indicator showing connection state (Offline vs. Online) and active inference route (Local Gemini Nano vs. Cloud Gemini).

## 5. Alternatives considered
- **Pure cloud inference:** Rejected because in catastrophic disasters or wilderness rescues, cellular infrastructure is completely unavailable. A 100% cloud app would be completely inoperative in the core user scenario.
- **Pure on-device without cloud fallback:** Rejected because local on-device models lack the large context window to aggregate dozens of casualties into comprehensive multi-patient hospital handover dispatches or cross-reference extensive pharmacology databases.
- **Free-form notes without structured START inputs:** Rejected because under chaotic emergency conditions, responders need rapid button-driven assessment rather than typing lengthy paragraphs.

## 6. Risks and objections
- **Clinical liability / Medical accuracy:** FieldPulse is explicitly designed as a rapid decision-support tool adhering strictly to international START emergency triage guidelines, not an autonomous diagnostic device. Clear field disclaimers are present.
- **Device capability variations:** Gemini Nano requires a compatible Chrome environment. If Nano is unavailable, the hybrid router gracefully falls back to deterministic rule-based triage offline, or Cloud Gemini when online.

## 7. Impact
**Repos touched:** BuildHybridAI_2026_Project
**Constitution check:**
- *Principle 1 (Spec before code):* Verified — following RFC -> Spec -> Plan -> Tasks -> Evals -> Implementation pipeline.
- *Principle 2 (Hybrid-first):* Verified — local on-device Gemini Nano is always attempted first for triage and stabilization guidance.
- *Principle 3 (Privacy and offline integrity):* Verified — casualty records and stabilization protocols operate completely offline without data loss.
**Cost / performance / security notes:**
- Zero cloud cost for local on-device inference.
- Cloud requests attested via Firebase App Check.
- Patient health records stored locally in browser Firestore cache.

## 8. Cross-repo contract (only if classification is `api`)
N/A, internal

## 9. Out of scope
- Direct Bluetooth/IoT vital sign monitor pairing (all vitals entered via fast UI buttons or text).
- Regulatory medical device certification (CE/FDA).
- Native iOS/Android mobile binary submission (focused on Chrome Web platform with responsive viewport support).

## 10. Open questions
_None._
