# FieldPulse — Project

> Business context, not technical detail. Written for a new teammate, a stakeholder, or an
> agent that needs to know *why* this exists. Technical shape lives in ARCHITECTURE.md.
> Never guess a fact here: ask the user.

## What this is
FieldPulse is an offline-first hybrid AI emergency first-response and disaster triage assistant built for the #BuildHybridAI 2026 Hackathon. It leverages Firebase AI Logic to execute instant, private, on-device symptom triage, emergency stabilization guidance, and vital signs assessment using Chrome Gemini Nano, while seamlessly routing complex multi-casualty incident coordination, rare differential analysis, and hospital intake handover to Cloud Gemini.

## Who it is for
Emergency medical responders, paramedics, disaster relief teams, wilderness first aiders, and humanitarian workers operating in environments with zero, intermittent, or unstable network connectivity.

## Why now / what success looks like
In crisis situations and disaster zones, communications infrastructure is often the first thing to fail. Responders cannot afford network spinners or failure screens when triaging casualties and making split-second decisions. Success is delivering an intuitive, responsive web application that runs local triage inference via Firebase AI Logic (Gemini Nano on Chrome) with zero latency, operates completely offline for immediate stabilization protocols, and gracefully synchronizes with and escalates to cloud Gemini models when connectivity is restored for comprehensive hospital handover reports and pharmacological verification.

## Scope
**In scope:**
- Web application built with React, TypeScript, Vite, and Tailwind CSS.
- Firebase AI Logic integration with on-device (Gemini Nano in Chrome) and cloud fallback.
- Casualty intake, vital signs logging, START triage categorization (Immediate/Red, Delayed/Yellow, Minor/Green, Expectant/Black), and offline emergency stabilization protocol guidance (bleeding control, airway management, shock, burn triage).
- Seamless online cloud fallback for multi-patient incident summary, hospital intake dispatch reports, and drug/allergy interaction checks.
- Cloud Firestore offline persistence, Firebase App Check attestation, Firebase Remote Config (for dynamic protocol thresholds), and Firebase Authentication.
- Real-time network and inference mode indicator (On-Device Nano vs. Cloud Gemini).

**Explicitly out of scope:**
- Direct hardware telemetry / medical IoT device Bluetooth streaming (data is inputted via responsive web forms/voice-to-text).
- Native iOS or Android mobile application package (focused on Chrome Web platform for this submission).
- Certified medical diagnostic device claims (intended as a rapid decision-support assistant for trained responders and hackathon demonstration).

## Who works on what
| Person | Role | Owns / ask them about | Contact (email / chat handle) |
| --- | --- | --- | --- |
| Aditya Vikramm Singhal | Lead Developer & Architect | Overall application architecture, Firebase AI Logic integration, triage core domain, frontend UI, cloud fallbacks | @vikrammaditya |

## Stakeholders and decision makers
Aditya Vikramm Singhal (Solo Creator / Project Owner) signs off on scope, technical architecture, and hackathon submission.

## Repositories in this product
| Repository | Purpose | Owner |
| --- | --- | --- |
| BuildHybridAI_2026_Project | Main web application and documentation repository for FieldPulse | Aditya Vikramm Singhal |

## Glossary
- **Firebase AI Logic**: The unified SDK providing hybrid inference routing between on-device models and Google Cloud Gemini models.
- **Gemini Nano**: Google's lightweight, on-device foundation model running locally in Chrome.
- **Hybrid Inference**: Execution pattern where prompts run locally on-device when available/supported, falling back to cloud models when unavailable or for heavier workloads.
- **Offline-First**: Architectural design where all user data entry and core AI operations (triage, vital evaluation, immediate guidance) function without internet connectivity.
- **START Triage**: Simple Triage and Rapid Treatment — an internationally recognized emergency protocol for rapidly categorizing casualties in mass-casualty incidents.
- **App Check**: Firebase service that protects backend resources from abuse by attesting request authenticity.
