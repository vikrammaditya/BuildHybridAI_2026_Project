export type TriageCategory = "immediate" | "delayed" | "minor" | "expectant" | "unassessed";

export type TriageColor = "red" | "yellow" | "green" | "black" | "gray";

export interface TriageVitals {
  ambulatory: boolean;
  respirations: number | "absent" | "normal" | "rapid";
  repositionedAirwayBreathing?: boolean;
  perfusion: "normal" | "delayed" | "absent";
  mentalStatus: "can_follow_commands" | "cannot_follow_commands" | "unresponsive";
}

export interface Casualty {
  id: string;
  tagNumber: string;
  timestamp: number;
  name?: string;
  age?: number;
  gender: "male" | "female" | "other" | "unknown";
  vitals: TriageVitals;
  category: TriageCategory;
  injuries: string[];
  traumaNotes: string;
  allergies: string[];
  medications: string[];
  stabilizationActions: string[];
  aiRationale: string;
  evaluatedBy: "nano_on_device" | "deterministic_start" | "gemini_cloud" | "manual";
}

export interface TriageEvaluationResult {
  category: TriageCategory;
  color: TriageColor;
  priority: number;
  rationale: string;
  immediateStabilizationSteps: string[];
  evaluatedBy: "nano_on_device" | "deterministic_start" | "gemini_cloud" | "manual";
}

export interface MistReport {
  mechanismOfInjury: string;
  injuriesIdentified: string[];
  symptomsAndSigns: string;
  treatmentsGiven: string[];
}

export interface SbarReport {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export interface HospitalHandoverReport {
  incidentId: string;
  timestamp: number;
  totalCasualties: number;
  triageBreakdown: Record<TriageCategory, number>;
  mistReport: MistReport;
  sbarReport: SbarReport;
  criticalCasualties: Array<{
    tagNumber: string;
    category: TriageCategory;
    injuries: string[];
    vitalsSummary: string;
    stabilizationGiven: string[];
  }>;
}

export interface ContraindicationCheckResult {
  safe: boolean;
  riskLevel: "low" | "moderate" | "high" | "severe";
  warnings: string[];
  recommendedAlternative?: string;
}

export const TRIAGE_COLOR_MAP: Record<TriageCategory, TriageColor> = {
  immediate: "red",
  delayed: "yellow",
  minor: "green",
  expectant: "black",
  unassessed: "gray",
};

export const TRIAGE_LABEL_MAP: Record<TriageCategory, string> = {
  immediate: "Immediate (Red)",
  delayed: "Delayed (Yellow)",
  minor: "Minor (Green)",
  expectant: "Expectant (Black)",
  unassessed: "Unassessed",
};
