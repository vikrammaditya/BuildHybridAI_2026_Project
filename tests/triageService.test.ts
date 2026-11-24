import { describe, it, expect, beforeEach } from "vitest";
import { TriageService } from "../core/triage/triageService";

describe("TriageService (State & Local Persistence)", () => {
  let service: TriageService;

  beforeEach(() => {
    service = new TriageService("test_casualties");
    service.clearAll();
  });

  it("E6: creates a casualty, calculates START category, and updates vitals", () => {
    const casualty = service.addCasualty({
      tagNumber: "TAG-101",
      name: "John Doe",
      vitals: {
        ambulatory: false,
        respirations: 34,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
      injuries: ["Chest trauma"],
      traumaNotes: "Blunt impact from collapsed wall",
    });

    expect(casualty.id).toBeDefined();
    expect(casualty.category).toBe("immediate");
    expect(casualty.aiRationale).toContain("Tachypnea");

    // Update vitals (patient stabilizes after needle decompression)
    const updated = service.updateCasualty(casualty.id, {
      vitals: {
        ambulatory: false,
        respirations: 18,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
    });

    expect(updated.vitals.respirations).toBe(18);
  });

  it("calculates triage breakdown across multiple casualties", () => {
    service.addCasualty({
      vitals: {
        ambulatory: true,
        respirations: 16,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
    });
    service.addCasualty({
      vitals: {
        ambulatory: false,
        respirations: 32,
        perfusion: "delayed",
        mentalStatus: "cannot_follow_commands",
      },
    });
    service.addCasualty({
      vitals: {
        ambulatory: false,
        respirations: 20,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
    });

    const breakdown = service.getTriageBreakdown();
    expect(breakdown.minor).toBe(1);
    expect(breakdown.immediate).toBe(1);
    expect(breakdown.delayed).toBe(1);
    expect(breakdown.expectant).toBe(0);
  });

  it("filters casualties by category", () => {
    service.addCasualty({
      tagNumber: "TAG-G",
      vitals: {
        ambulatory: true,
        respirations: 16,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
    });
    service.addCasualty({
      tagNumber: "TAG-R",
      vitals: {
        ambulatory: false,
        respirations: 38,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
    });

    const immediateList = service.filterByCategory("immediate");
    expect(immediateList.length).toBe(1);
    expect(immediateList[0].tagNumber).toBe("TAG-R");

    const allList = service.filterByCategory("all");
    expect(allList.length).toBe(2);
  });
});
