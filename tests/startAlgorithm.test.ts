import { describe, it, expect } from "vitest";
import {
  evaluateStartTriage,
  deriveEmergencyStabilizationProtocols,
} from "../core/triage/startAlgorithm";
import { Casualty, TriageVitals } from "../core/triage/types";

describe("START Triage Algorithm", () => {
  it("E1: classifies non-ambulatory casualty with rapid respirations as Immediate (Red)", () => {
    const vitals: TriageVitals = {
      ambulatory: false,
      respirations: 36,
      perfusion: "normal",
      mentalStatus: "can_follow_commands",
    };

    const result = evaluateStartTriage(vitals);
    expect(result.category).toBe("immediate");
    expect(result.color).toBe("red");
    expect(result.priority).toBe(1);
    expect(result.rationale).toContain("Tachypnea");
  });

  it("E2: classifies ambulatory casualty as Minor (Green)", () => {
    const vitals: TriageVitals = {
      ambulatory: true,
      respirations: 18,
      perfusion: "normal",
      mentalStatus: "can_follow_commands",
    };

    const result = evaluateStartTriage(vitals);
    expect(result.category).toBe("minor");
    expect(result.color).toBe("green");
    expect(result.priority).toBe(3);
    expect(result.rationale).toContain("ambulatory");
  });

  it("E3: classifies casualty breathing only after airway repositioning as Immediate (Red)", () => {
    const vitals: TriageVitals = {
      ambulatory: false,
      respirations: "absent",
      repositionedAirwayBreathing: true,
      perfusion: "normal",
      mentalStatus: "cannot_follow_commands",
    };

    const result = evaluateStartTriage(vitals);
    expect(result.category).toBe("immediate");
    expect(result.color).toBe("red");
    expect(result.rationale).toContain("airway repositioning");
  });

  it("E4: classifies casualty with absent respirations not responsive to airway as Expectant (Black)", () => {
    const vitals: TriageVitals = {
      ambulatory: false,
      respirations: "absent",
      repositionedAirwayBreathing: false,
      perfusion: "absent",
      mentalStatus: "unresponsive",
    };

    const result = evaluateStartTriage(vitals);
    expect(result.category).toBe("expectant");
    expect(result.color).toBe("black");
    expect(result.priority).toBe(4);
  });

  it("E5: classifies non-ambulatory casualty with normal vitals and responsive mental status as Delayed (Yellow)", () => {
    const vitals: TriageVitals = {
      ambulatory: false,
      respirations: 18,
      perfusion: "normal",
      mentalStatus: "can_follow_commands",
    };

    const result = evaluateStartTriage(vitals);
    expect(result.category).toBe("delayed");
    expect(result.color).toBe("yellow");
    expect(result.priority).toBe(2);
  });

  it("classifies casualty with delayed capillary refill as Immediate (Red)", () => {
    const vitals: TriageVitals = {
      ambulatory: false,
      respirations: 20,
      perfusion: "delayed",
      mentalStatus: "can_follow_commands",
    };

    const result = evaluateStartTriage(vitals, "Arterial bleeding from arm");
    expect(result.category).toBe("immediate");
    expect(result.immediateStabilizationSteps.some((s) => s.includes("Tourniquet"))).toBe(true);
  });

  it("classifies casualty with altered mental status as Immediate (Red)", () => {
    const vitals: TriageVitals = {
      ambulatory: false,
      respirations: 20,
      perfusion: "normal",
      mentalStatus: "cannot_follow_commands",
    };

    const result = evaluateStartTriage(vitals);
    expect(result.category).toBe("immediate");
    expect(result.rationale).toContain("mental status");
  });

  it("derives tailored emergency stabilization protocols for burn and hemorrhage trauma", () => {
    const casualty: Casualty = {
      id: "cas-1",
      tagNumber: "TAG-001",
      timestamp: Date.now(),
      gender: "unknown",
      category: "immediate",
      injuries: ["Partial thickness burn right forearm", "Pulsatile arterial bleed"],
      traumaNotes: "Severe fire exposure and shrapnel laceration",
      allergies: [],
      medications: [],
      stabilizationActions: [],
      aiRationale: "",
      evaluatedBy: "deterministic_start",
      vitals: {
        ambulatory: false,
        respirations: 24,
        perfusion: "delayed",
        mentalStatus: "can_follow_commands",
      },
    };

    const protocols = deriveEmergencyStabilizationProtocols(casualty);
    expect(protocols.some((p) => p.includes("BLEEDING CONTROL"))).toBe(true);
    expect(protocols.some((p) => p.includes("BURN TRIAGE"))).toBe(true);
    expect(protocols.some((p) => p.includes("SHOCK"))).toBe(true);
  });
});
