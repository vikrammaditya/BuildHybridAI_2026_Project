export interface PromptCasualtyData {
  tagNumber: string;
  vitals: {
    ambulatory: boolean;
    respirations: number | string;
    repositionedAirwayBreathing?: boolean;
    perfusion: string;
    mentalStatus: string;
  };
  injuries: string[];
  traumaNotes: string;
  allergies?: string[];
  medications?: string[];
  stabilizationActions?: string[];
  category?: string;
}

export function buildTriageEvaluationPrompt(casualty: PromptCasualtyData): string {
  const v = casualty.vitals;
  return `You are FieldPulse AI, an expert emergency medical disaster triage assistant operating under international START (Simple Triage and Rapid Treatment) triage guidelines.

Evaluate the following casualty and assign a START triage category:
- Immediate (Red): Life-threatening compromised airway, breathing (>30/min), or perfusion (delayed refill/no pulse).
- Delayed (Yellow): Serious injuries requiring medical care, but vitals are stable.
- Minor (Green): Ambulatory (walking wounded) with minor wounds.
- Expectant (Black): Apneic despite airway repositioning; non-survivable injuries in mass-casualty conditions.

Casualty Details:
- Tag Number: ${casualty.tagNumber}
- Ambulatory (Can walk): ${v.ambulatory ? "Yes" : "No"}
- Respirations: ${v.respirations}
- Airway Repositioned Breathing: ${v.repositionedAirwayBreathing !== undefined ? (v.repositionedAirwayBreathing ? "Yes" : "No") : "Not applicable"}
- Perfusion (Capillary refill / Pulse): ${v.perfusion}
- Mental Status (Follows commands): ${v.mentalStatus}
- Observed Injuries: ${casualty.injuries.join(", ") || "None recorded"}
- Field Trauma Notes: ${casualty.traumaNotes || "None recorded"}

Format your response exactly as:
CATEGORY: [Immediate | Delayed | Minor | Expectant]
RATIONALE: [Concise clinical reasoning in 1-2 sentences]
IMMEDIATE ACTIONS:
- [Action 1]
- [Action 2]`;
}

export function buildEmergencyStabilizationPrompt(
  casualty: PromptCasualtyData,
  protocolType?: string,
): string {
  return `You are FieldPulse AI, an emergency trauma stabilization assistant. Provide urgent, prioritized, field-ready first-aid instructions for this casualty.
${protocolType ? `Focus on protocol: ${protocolType}` : ""}

Casualty: ${casualty.tagNumber}
Vitals: Ambulatory=${casualty.vitals.ambulatory}, Resp=${casualty.vitals.respirations}, Perfusion=${casualty.vitals.perfusion}, Mental=${casualty.vitals.mentalStatus}
Injuries: ${casualty.injuries.join(", ") || "Trauma"}
Notes: ${casualty.traumaNotes}

Output step-by-step instructions in numbered bullets. Include exact placement, timing (e.g. for tourniquets), and warning signs.`;
}

export function buildHospitalHandoverPrompt(
  casualties: PromptCasualtyData[],
  incidentContext: string,
): string {
  const summaryList = casualties
    .map(
      (c) =>
        `- ${c.tagNumber} [${(c.category || "UNASSESSED").toUpperCase()}]: Vitals (Resp: ${c.vitals.respirations}, Perf: ${c.vitals.perfusion}, Mental: ${c.vitals.mentalStatus}), Injuries: ${c.injuries.join(", ") || "N/A"}, Notes: ${c.traumaNotes || "N/A"}, Interventions: ${(c.stabilizationActions || []).join("; ") || "None"}`,
    )
    .join("\n");

  return `You are an Emergency Medical Services (EMS) Incident Coordinator synthesizing a formal hospital trauma center handover report.

Incident Context: ${incidentContext || "Mass-casualty field emergency"}
Total Casualties: ${casualties.length}

Casualty Registry:
${summaryList}

Generate a formal hospital intake dispatch report containing:
1. MIST Report:
   - Mechanism of injury
   - Injuries identified
   - Symptoms & Vital signs summary
   - Treatments given in field
2. SBAR Summary:
   - Situation
   - Background
   - Assessment (Priority triage breakdown: Immediate, Delayed, Minor, Expectant)
   - Recommendations for incoming trauma teams
3. High-Priority Handover Manifest (Critical immediate surgical candidates)`;
}

export function buildContraindicationPrompt(
  casualty: PromptCasualtyData,
  proposedMedication: string,
): string {
  return `You are a clinical pharmacology safety auditor for field emergencies.

Patient: ${casualty.tagNumber}
Vitals: Respirations=${casualty.vitals.respirations}, Perfusion=${casualty.vitals.perfusion}, Mental=${casualty.vitals.mentalStatus}
Injuries: ${casualty.injuries.join(", ")}
Trauma Notes: ${casualty.traumaNotes}
Recorded Allergies: ${(casualty.allergies || []).join(", ") || "None known"}
Current Medications: ${(casualty.medications || []).join(", ") || "None reported"}

Proposed Intervention/Medication: ${proposedMedication}

Assess safety, drug-drug interactions, and clinical contraindications.
Respond with:
SAFE: [Yes | Caution | Contraindicated]
WARNINGS: [List any severe risks, e.g. respiratory depression, bleeding risk, anaphylaxis]
RECOMMENDATION: [Safe dosage or alternative if contraindicated]`;
}
