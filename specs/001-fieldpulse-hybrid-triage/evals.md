---
id: 001-fieldpulse-hybrid-triage
spec: spec.md
spec_version: 4f971da59dfc34e115664c21c0cacdf36eedf00b87b0b29cf8fb4dbac6301632
created: 2026-11-24
---

# Evaluations: Fieldpulse Hybrid Triage

| ID | Scenario | Input | Expected | Covers | How checked |
| --- | --- | --- | --- | --- | --- | --- |
| E1 | Non-ambulatory rapid respirations triage | Casualty with ambulatory=false, respirations=36 | Category assigned as 'immediate' (Red) | AC-2 | `npm test -- tests/startAlgorithm.test.ts` |
| E2 | Walking wounded minor triage | Casualty with ambulatory=true | Category assigned as 'minor' (Green) | AC-2 | `npm test -- tests/startAlgorithm.test.ts` |
| E3 | Absent breathing with airway repositioning | Casualty with respirations='absent', reposition airway restores breathing | Category assigned as 'immediate' (Red) | AC-2 | `npm test -- tests/startAlgorithm.test.ts` |
| E4 | Absent breathing non-responsive to airway | Casualty with respirations='absent', reposition airway fails | Category assigned as 'expectant' (Black) | AC-2 | `npm test -- tests/startAlgorithm.test.ts` |
| E5 | Delayed vital signs triage | Casualty non-ambulatory, respirations=20, perfusion='normal', mental='follows_commands' | Category assigned as 'delayed' (Yellow) | AC-2 | `npm test -- tests/startAlgorithm.test.ts` |
| E6 | Casualty intake and local state persistence | Add new casualty with vital entries | Record saved in local state and Firestore cache | AC-1, AC-4 | `npm test -- tests/triageService.test.ts` |
| E7 | Stabilization guidance generation | Casualty with arterial bleed note | Step-by-step tourniquet application guide generated | AC-3 | spec §8 step 8 |
| E8 | Cloud MIST/SBAR hospital handover synthesis | 3 triaged casualties + incident context | Standardized MIST and SBAR handover text generated | AC-5 | spec §8 step 12 |
| E9 | Drug contraindication safety check | Patient with severe head trauma, morphine proposed | Warning issued for respiratory depression risk | AC-6 | spec §8 step 12 |
| E10 | Telemetry pill reflects offline mode | Network disconnected in browser | Pill indicates "Offline (Gemini Nano Active)" | AC-7 | spec §8 step 5 |
| E11 | High-contrast triage field view | Viewport width 375px to 1920px | Color badges Red/Yellow/Green/Black render with distinct contrast | AC-8 | spec §8 step 6 |
| E12 | Constitution guardrail: no silent fallback | Gemini Nano unready | Router triggers deterministic fallback and sets fallback reason in telemetry | guardrail: Never fail silently on fallback | `npm test -- tests/hybridRouter.test.ts` |

## Scenario catalogue (things real users will do that nobody wrote down)
- First responder operates in a subterranean or storm-damaged area with total loss of cellular signal.
- Medic inputs rapid vitals in under 10 seconds per casualty during an active mass-casualty drill.
- Receiving emergency trauma center reads the generated MIST/SBAR dispatch prior to ambulance convoy arrival.
