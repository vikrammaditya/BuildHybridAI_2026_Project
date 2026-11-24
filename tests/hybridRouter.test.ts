import { describe, it, expect, vi } from "vitest";
import { HybridTriageRouter } from "../core/triage/hybridRouter";
import { NanoPort } from "../connectors/ai/nanoConnector";
import { CloudAiPort } from "../connectors/ai/firebaseAiConnector";
import { Casualty } from "../core/triage/types";

describe("HybridTriageRouter (Hybrid Inference Routing)", () => {
  const dummyCasualty: Casualty = {
    id: "cas-test-1",
    tagNumber: "TAG-001",
    timestamp: Date.now(),
    gender: "male",
    category: "unassessed",
    injuries: ["Laceration", "Arterial Bleed"],
    traumaNotes: "Severe blood loss",
    allergies: ["Penicillin"],
    medications: [],
    stabilizationActions: [],
    aiRationale: "",
    evaluatedBy: "manual",
    vitals: {
      ambulatory: false,
      respirations: 34,
      perfusion: "delayed",
      mentalStatus: "can_follow_commands",
    },
  };

  it("routes to Chrome Gemini Nano on-device when available", async () => {
    const mockNano: NanoPort = {
      isAvailable: vi.fn().mockResolvedValue(true),
      generateText: vi
        .fn()
        .mockResolvedValue(
          "CATEGORY: Immediate\nRATIONALE: Severe tachypnea and delayed perfusion.",
        ),
    };
    const mockCloud: CloudAiPort = {
      isOnline: vi.fn().mockReturnValue(true),
      generateText: vi.fn().mockResolvedValue("Cloud response"),
    };

    const router = new HybridTriageRouter(mockNano, mockCloud);
    const result = await router.evaluateTriage(dummyCasualty);

    expect(result.category).toBe("immediate");
    expect(result.evaluatedBy).toBe("nano_on_device");
    expect(mockNano.generateText).toHaveBeenCalled();

    const telemetry = router.getTelemetry();
    expect(telemetry.activeRoute).toBe("on_device_nano");
    expect(telemetry.nanoAvailable).toBe(true);
  });

  it("E12 (Constitution Guardrail): falls back gracefully to deterministic START algorithm with clear telemetry when Nano is unready", async () => {
    const mockNano: NanoPort = {
      isAvailable: vi.fn().mockResolvedValue(false),
      generateText: vi.fn(),
    };
    const mockCloud: CloudAiPort = {
      isOnline: vi.fn().mockReturnValue(false),
      generateText: vi.fn(),
    };

    const router = new HybridTriageRouter(mockNano, mockCloud);
    const result = await router.evaluateTriage(dummyCasualty);

    // Must correctly categorize without throwing
    expect(result.category).toBe("immediate");
    expect(result.evaluatedBy).toBe("deterministic_start");

    // Telemetry MUST explain fallback reason (Guardrail: never fail silently)
    const telemetry = router.getTelemetry();
    expect(telemetry.activeRoute).toBe("deterministic_fallback");
    expect(telemetry.fallbackReason).toBeDefined();
    expect(telemetry.fallbackReason).toContain("START");
  });

  it("routes multi-casualty hospital handover to Cloud Gemini", async () => {
    const mockNano: NanoPort = {
      isAvailable: vi.fn().mockResolvedValue(true),
      generateText: vi.fn(),
    };
    const mockCloud: CloudAiPort = {
      isOnline: vi.fn().mockReturnValue(true),
      generateText: vi.fn().mockResolvedValue("### Formal Hospital Intake Dispatch (MIST & SBAR)"),
    };

    const router = new HybridTriageRouter(mockNano, mockCloud);
    const handover = await router.generateHospitalHandover([dummyCasualty], "Earthquake collapse");

    expect(handover).toContain("MIST & SBAR");
    expect(mockCloud.generateText).toHaveBeenCalled();
    expect(router.getTelemetry().activeRoute).toBe("cloud_gemini");
  });
});
