# BuildHybridAI_2026_Project — Project

> Business context, not technical detail. Written for a new teammate, a stakeholder, or an
> agent that needs to know *why* this exists. Technical shape lives in ARCHITECTURE.md.
> Never guess a fact here: ask the user.

## What this is
An offline-first hybrid AI intelligent notes and research hub built for the #BuildHybridAI 2026 Hackathon. It leverages Firebase AI Logic to execute fast, private, on-device summarization, tagging, and entity extraction using Chrome Gemini Nano, while seamlessly routing complex queries, multi-document synthesis, and deep research tasks to the cloud.

## Who it is for
Researchers, students, knowledge workers, and developers who need instant, responsive note-taking, semantic search, and document summarization with full offline capability and enhanced cloud synthesis when connected.

## Why now / what success looks like
Success is delivering an intuitive, responsive web application that runs local inference via Firebase AI Logic (Gemini Nano on Chrome) with zero latency, gracefully falls back to cloud Gemini models when offline or when capabilities exceed local limits, passes all hackathon criteria, and provides demonstrable value in both offline and online modes.

## Scope
**In scope:**
- Web application built with React, TypeScript, and Vite.
- Firebase AI Logic integration with on-device (Gemini Nano in Chrome) and cloud fallback.
- Firebase Auth (Google & anonymous), Cloud Firestore (with offline persistence enabled), Firebase App Check, and Remote Config.
- Note creation, rich editing, offline local summarization/tagging, and cloud multi-note synthesis.
- Responsive UI, telemetry, and fallback status indicators.

**Explicitly out of scope:**
- Native iOS or Android mobile application (focused on Chrome Web platform for this submission).
- Multi-user real-time collaborative editing canvas (focused on personal note & research hub).
- Complex custom fine-tuned on-device models outside Gemini Nano / Chrome Built-in AI.

## Who works on what
| Person | Role | Owns / ask them about | Contact (email / chat handle) |
| --- | --- | --- | --- |
| Aditya Vikramm Singhal | Lead Developer & Architect | Overall application architecture, Firebase AI Logic integration, frontend UI, cloud fallbacks | vikrammaditya05@gmail.com |

## Stakeholders and decision makers
Aditya Vikramm Singhal (Solo Creator / Project Owner) signs off on scope, technical architecture, and hackathon submission.

## Repositories in this product
| Repository | Purpose | Owner |
| --- | --- | --- |
| BuildHybridAI_2026_Project | Main web application and documentation repository | Aditya Vikramm Singhal |

## Glossary
- **Firebase AI Logic**: The unified SDK providing hybrid inference routing between on-device models and Google Cloud Gemini models.
- **Gemini Nano**: Google's lightweight, on-device foundation model running locally in Chrome.
- **Hybrid Inference**: Execution pattern where prompts run locally on-device when available/supported, falling back to cloud models when unavailable or for heavier workloads.
- **Offline-First**: Architectural design where all user data entry and core AI operations (summarization, key points) function without internet connectivity.
- **App Check**: Firebase service that protects backend resources from abuse by attesting request authenticity.
