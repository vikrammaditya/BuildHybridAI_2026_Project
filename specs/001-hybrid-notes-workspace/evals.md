---
id: 001-hybrid-notes-workspace
spec: spec.md
spec_version: ccfcb396c4c8d70232e253b447d525fa582ee967716c837ed6242cb940f3ab0c
created: 2026-11-23
---

# Evaluations: Hybrid Notes Workspace

| ID | Scenario | Input | Expected | Covers | How checked |
| --- | --- | --- | --- | --- | --- |
| E1 | Immediate local persistence | Note draft with title "Meeting Notes" and body "Discussion items" | Saved in IndexedDB within 500ms and queued for background sync | AC-1 | automated test `tests/storage.test.ts` |
| E2 | On-device single note summary | Note content of 350 tokens with ready local Gemini Nano | Summary bullets returned in < 1,500ms with `model: 'local-nano'` | AC-2 | automated test `tests/router.test.ts` & spec §8 step 3 |
| E3 | Automated topic tagging | Note text mentioning "Vite, React, Firebase" | Generated tags `["vite", "react", "firebase"]` attached to note metadata | AC-3 | automated test `tests/router.test.ts` |
| E4 | Multi-note cloud synthesis | Two notes selected with synthesis query "Compare key findings" | Routed to Cloud Gemini via Firebase AI Logic with `model: 'cloud-gemini'` | AC-4 | automated test `tests/router.test.ts` & spec §8 step 7 |
| E5 | Offline and unready model handling | Network disconnected in DevTools and Nano unready | Clear non-blocking notice rendered; editor input remains interactive | AC-5 | spec §8 step 6 & automated test `tests/router.test.ts` |
| E6 | Anonymous guest access | Fresh application load with no prior session | Anonymous Firebase Auth user created without login dialog | AC-6 | automated test `tests/auth.test.ts` |
| E7 | Remote Config threshold fetch | Online app initialization with Remote Config active | Fallback threshold parameter retrieved with default 1,000 tokens | AC-7 | automated test `tests/config.test.ts` |
| E8 | Secret protection in client bundle | Production web build inspection | Zero administrative private API keys or service account credentials in code | guardrail: Never expose private Firebase API keys or administrative secrets in client-side code or public repos | automated bundle check |
| E9 | Transparent fallback logging | Local Nano throws inference error during execution | Fallback event logged and surfaced in UI status badge with explicit reason | guardrail: Never fail silently when falling back between local and cloud inference | automated test `tests/router.test.ts` |
| E10 | Main thread responsiveness | Active streaming AI text generation in AI drawer | Editor typing maintains 60 FPS input latency with zero frame drop | guardrail: Never block the main UI thread during heavy AI generation or streaming tasks | manual interaction in browser |

## Scenario catalogue (things real users will do that nobody wrote down)
- Rapid consecutive edits to note title and body within 100ms: Debounce ensures single save write to IndexedDB without race condition.
- Empty note summarization click: Router returns validation warning without invoking on-device model.
- Note exceeding 10,000 characters: Successfully switches from on-device Nano to Cloud Gemini due to token boundary limit.
- Switching between notes while an AI generation stream is active: Stream cleanly aborts or binds to original note ID without corrupting new note view.
