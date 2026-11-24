# FieldPulse — Constitution

> The non-negotiable rules. Every RFC, spec and pull request is checked against this. If a
> change conflicts with it, stop and say so — amend it deliberately instead of working around it.
> Keep it short: a rule that cannot be checked is a wish.

**Version:** 1.0.0 · **Ratified:** 2026-11-23

## Principles
1. Spec before code — no feature implementation without an approved spec and eval plan.
2. Hybrid-first — always attempt local on-device inference via Gemini Nano before falling back to cloud.
3. Privacy and offline integrity — local casualty records and emergency triage guidance must remain accessible, editable, and operational without an active internet connection.

## Guardrails (things that must never happen)
- Never expose private Firebase API keys or administrative secrets in client-side code or public repos.
- Never fail silently when falling back between local and cloud inference; fallback events must be logged and clearly surfaced in the UI.
- Never block the main UI thread during heavy AI generation or streaming tasks.

## Quality gates (what "done" means)
- TypeScript type-check and linter pass with zero errors.
- Unit and integration tests pass with simulated on-device and cloud fallback paths.
- Bundle size and local inference latency remain within acceptable thresholds.

## Amendments
_None yet._
