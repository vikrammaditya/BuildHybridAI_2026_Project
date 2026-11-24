import { Casualty, TriageEvaluationResult, TriageVitals, TRIAGE_COLOR_MAP } from "./types";

/**
 * Deterministic START (Simple Triage and Rapid Treatment) algorithm implementation.
 * Used for instant on-device clinical categorization and fallback when AI models are unavailable.
 */
export function evaluateStartTriage(
  vitals: TriageVitals,
  traumaNotes = "",
): TriageEvaluationResult {
  // Step 1: Ambulatory (Walking Wounded)
  if (vitals.ambulatory) {
    return {
      category: "minor",
      color: TRIAGE_COLOR_MAP.minor,
      priority: 3,
      rationale: "Patient is ambulatory (walking wounded) and able to follow basic directives.",
      immediateStabilizationSteps: [
        "Direct patient to secondary casualty collection point.",
        "Perform secondary assessment when acute casualties are stabilized.",
      ],
      evaluatedBy: "deterministic_start",
    };
  }

  // Step 2: Spontaneous Respirations
  const resp = vitals.respirations;
  if (resp === 0 || resp === "absent") {
    if (vitals.repositionedAirwayBreathing) {
      return {
        category: "immediate",
        color: TRIAGE_COLOR_MAP.immediate,
        priority: 1,
        rationale:
          "Apneic prior to airway maneuver; spontaneous breathing restored after airway repositioning.",
        immediateStabilizationSteps: [
          "Maintain airway patency (jaw-thrust / recovery position / nasopharyngeal airway).",
          "Monitor continuous respiratory rate and oxygenation.",
        ],
        evaluatedBy: "deterministic_start",
      };
    }

    return {
      category: "expectant",
      color: TRIAGE_COLOR_MAP.expectant,
      priority: 4,
      rationale:
        "Apneic despite airway repositioning. In mass casualty conditions, classified as expectant.",
      immediateStabilizationSteps: [
        "Palliative comfort care if resources allow.",
        "Focus immediate field resources on viable Immediate casualties.",
      ],
      evaluatedBy: "deterministic_start",
    };
  }

  // Step 3: Respiratory Rate (> 30 breaths/min = Immediate)
  const isRapidBreathing = resp === "rapid" || (typeof resp === "number" && resp > 30);
  if (isRapidBreathing) {
    return {
      category: "immediate",
      color: TRIAGE_COLOR_MAP.immediate,
      priority: 1,
      rationale:
        "Tachypnea (>30 breaths/min) indicates respiratory compromise, severe trauma, or impending shock.",
      immediateStabilizationSteps: [
        "Ensure open airway and assess for tension pneumothorax / flail chest.",
        "High-flow supplemental oxygen if available.",
        "Urgent priority evacuation to definitive surgical trauma center.",
      ],
      evaluatedBy: "deterministic_start",
    };
  }

  // Step 4: Perfusion (Capillary refill > 2s or absent radial pulse = Immediate)
  if (vitals.perfusion === "delayed" || vitals.perfusion === "absent") {
    const isBleeding = /bleed|arteri|hemorrhag|cut|wound|lacerat/i.test(traumaNotes);
    const bleedingGuide = isBleeding
      ? "Apply direct wound pressure; immediately apply Combat Application Tourniquet (CAT) high and tight on extremity."
      : "Control any occult hemorrhage, maintain supine positioning with legs elevated.";

    return {
      category: "immediate",
      color: TRIAGE_COLOR_MAP.immediate,
      priority: 1,
      rationale:
        "Impaired perfusion (capillary refill >2s or absent radial pulse) indicates decompensated shock.",
      immediateStabilizationSteps: [
        bleedingGuide,
        "Cover with thermal blanket to prevent hypothermia-induced coagulopathy.",
        "Expedite immediate category evacuation.",
      ],
      evaluatedBy: "deterministic_start",
    };
  }

  // Step 5: Mental Status (Cannot follow commands / unresponsive = Immediate)
  if (vitals.mentalStatus === "cannot_follow_commands" || vitals.mentalStatus === "unresponsive") {
    return {
      category: "immediate",
      color: TRIAGE_COLOR_MAP.immediate,
      priority: 1,
      rationale:
        "Altered mental status / inability to follow simple commands signifies intracranial injury or severe hypoxia.",
      immediateStabilizationSteps: [
        "Protect airway; place in recovery position if cervical spine cleared.",
        "Continuous neurological reassessment (AVPU / GCS check).",
        "Immediate surgical trauma center transport.",
      ],
      evaluatedBy: "deterministic_start",
    };
  }

  // Step 6: All parameters normal -> Delayed (Yellow)
  return {
    category: "delayed",
    color: TRIAGE_COLOR_MAP.delayed,
    priority: 2,
    rationale:
      "Non-ambulatory but normal respiratory rate (10-30/min), adequate perfusion (<2s refill), and alert mental status.",
    immediateStabilizationSteps: [
      "Dress and splint secondary fractures/wounds.",
      "Re-triage every 15-30 minutes or immediately if condition deteriorates.",
      "Prepare for delayed secondary evacuation.",
    ],
    evaluatedBy: "deterministic_start",
  };
}

/**
 * Generates tailored emergency first-aid stabilization actions based on clinical notes and vitals.
 */
export function deriveEmergencyStabilizationProtocols(casualty: Casualty): string[] {
  const notes = (casualty.traumaNotes + " " + casualty.injuries.join(" ")).toLowerCase();
  const protocols: string[] = [];

  if (/bleed|arteri|hemorrhag|amputat|pulsat/i.test(notes)) {
    protocols.push(
      "BLEEDING CONTROL: Apply immediate direct digital pressure over wound. If life-threatening arterial extremity hemorrhage, apply Combat Application Tourniquet (CAT) 2-3 inches proximal to injury site, tighten until bleeding and distal pulse cease, note exact application time.",
    );
  }

  if (/airway|stridor|chok|gurgle|apnea/i.test(notes) || casualty.vitals.respirations === "rapid") {
    protocols.push(
      "AIRWAY / RESPIRATORY: Clear oropharynx of debris. Perform jaw-thrust maneuver keeping cervical spine in-line. If unconscious and breathing restored, position in lateral recovery position.",
    );
  }

  if (/burn|fire|chemical|scald/i.test(notes)) {
    protocols.push(
      "BURN TRIAGE: Stop the burning process. Remove non-adherent smoldering clothing. Cover burns with clean dry sterile dressings. Do NOT apply ice or water for extensive burns (>10% BSA) to prevent hypothermia.",
    );
  }

  if (/fracture|deform|dislocat|bone/i.test(notes)) {
    protocols.push(
      "MUSCULOSKELETAL: Immobilize limb in position of comfort with field splinting. Check and document distal neurovascular status (pulse, sensation, motor) before and after splinting.",
    );
  }

  if (casualty.vitals.perfusion === "delayed" || casualty.category === "immediate") {
    protocols.push(
      "SHOCK & HYPOTHERMIA PREVENTION: Keep patient warm with reflective rescue foil/blanket. Minimize movement. Keep flat or elevate legs 12 inches if no spinal/head injury.",
    );
  }

  if (protocols.length === 0) {
    protocols.push(
      "GENERAL STABILIZATION: Position casualty comfortably, monitor vitals every 15 minutes, keep warm and hydrated if conscious and non-surgical.",
    );
  }

  return protocols;
}
