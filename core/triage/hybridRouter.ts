import { Casualty, TriageEvaluationResult, TRIAGE_COLOR_MAP } from "./types";
import { evaluateStartTriage, deriveEmergencyStabilizationProtocols } from "./startAlgorithm";
import {
  buildTriageEvaluationPrompt,
  buildEmergencyStabilizationPrompt,
  buildHospitalHandoverPrompt,
  buildContraindicationPrompt,
} from "../../prompts/triagePrompts";
import { NanoConnector, NanoPort } from "../../connectors/ai/nanoConnector";
import { FirebaseAiConnector, CloudAiPort } from "../../connectors/ai/firebaseAiConnector";

export type InferenceRoute = "on_device_nano" | "cloud_gemini" | "deterministic_fallback";

export interface TelemetryState {
  isOnline: boolean;
  nanoAvailable: boolean;
  activeRoute: InferenceRoute;
  lastExecutionMs: number;
  fallbackReason?: string;
}

export class HybridTriageRouter {
  private nanoConnector: NanoPort;
  private cloudConnector: CloudAiPort;
  private telemetry: TelemetryState = {
    isOnline: true,
    nanoAvailable: false,
    activeRoute: "deterministic_fallback",
    lastExecutionMs: 0,
  };

  constructor(nanoConnector?: NanoPort, cloudConnector?: CloudAiPort) {
    this.nanoConnector = nanoConnector || new NanoConnector();
    this.cloudConnector = cloudConnector || new FirebaseAiConnector();
  }

  public async probeCapabilities(): Promise<TelemetryState> {
    const isOnline = this.cloudConnector.isOnline();
    let nanoAvailable = false;

    try {
      nanoAvailable = await this.nanoConnector.isAvailable();
    } catch {
      nanoAvailable = false;
    }

    this.telemetry.isOnline = isOnline;
    this.telemetry.nanoAvailable = nanoAvailable;

    if (nanoAvailable) {
      this.telemetry.activeRoute = "on_device_nano";
      this.telemetry.fallbackReason = undefined;
    } else if (isOnline) {
      this.telemetry.activeRoute = "cloud_gemini";
      this.telemetry.fallbackReason = "Nano unready: routed to Cloud Gemini";
    } else {
      this.telemetry.activeRoute = "deterministic_fallback";
      this.telemetry.fallbackReason = "Offline and Nano unready: deterministic START fallback";
    }

    return { ...this.telemetry };
  }

  public getTelemetry(): TelemetryState {
    return { ...this.telemetry };
  }

  /**
   * Evaluates casualty triage, attempting local on-device Gemini Nano first.
   * If Nano is unavailable, safely falls back to deterministic START algorithm.
   */
  public async evaluateTriage(casualty: Casualty): Promise<TriageEvaluationResult> {
    const start = performance.now();
    await this.probeCapabilities();

    // 1. Attempt on-device Gemini Nano if available
    if (this.telemetry.nanoAvailable) {
      try {
        const prompt = buildTriageEvaluationPrompt(casualty);
        const responseText = await this.nanoConnector.generateText(prompt);

        const category =
          this.parseCategoryFromText(responseText) || evaluateStartTriage(casualty.vitals).category;
        const duration = Math.round(performance.now() - start);

        this.telemetry.activeRoute = "on_device_nano";
        this.telemetry.lastExecutionMs = duration;
        this.telemetry.fallbackReason = undefined;

        return {
          category,
          color: TRIAGE_COLOR_MAP[category],
          priority:
            category === "immediate"
              ? 1
              : category === "delayed"
                ? 2
                : category === "minor"
                  ? 3
                  : 4,
          rationale: responseText.trim(),
          immediateStabilizationSteps: deriveEmergencyStabilizationProtocols(casualty),
          evaluatedBy: "nano_on_device",
        };
      } catch (err) {
        console.warn("Nano inference failed, falling back to deterministic algorithm:", err);
        this.telemetry.fallbackReason = "Nano execution failed: fell back to START algorithm";
      }
    }

    // 2. Deterministic START algorithm fallback (guaranteed offline safety)
    const result = evaluateStartTriage(casualty.vitals, casualty.traumaNotes);
    const duration = Math.round(performance.now() - start);

    this.telemetry.activeRoute = "deterministic_fallback";
    this.telemetry.lastExecutionMs = duration;
    if (!this.telemetry.fallbackReason) {
      this.telemetry.fallbackReason = "Nano unavailable: executed deterministic START algorithm";
    }

    return result;
  }

  /**
   * Generates step-by-step emergency stabilization guidance.
   */
  public async generateStabilizationGuidance(
    casualty: Casualty,
    protocolType?: string,
  ): Promise<string> {
    const start = performance.now();
    await this.probeCapabilities();

    if (this.telemetry.nanoAvailable) {
      try {
        const prompt = buildEmergencyStabilizationPrompt(casualty, protocolType);
        const response = await this.nanoConnector.generateText(prompt);
        this.telemetry.activeRoute = "on_device_nano";
        this.telemetry.lastExecutionMs = Math.round(performance.now() - start);
        return response;
      } catch (err) {
        console.warn("Nano stabilization prompt failed:", err);
      }
    }

    // Fallback: rule-based clinical guidance
    this.telemetry.activeRoute = "deterministic_fallback";
    this.telemetry.lastExecutionMs = Math.round(performance.now() - start);
    const protocols = deriveEmergencyStabilizationProtocols(casualty);
    return protocols.map((p, idx) => `${idx + 1}. ${p}`).join("\n\n");
  }

  /**
   * Synthesizes multi-casualty hospital handover dispatch (routes to Cloud Gemini).
   */
  public async generateHospitalHandover(
    casualties: Casualty[],
    incidentContext = "",
  ): Promise<string> {
    const start = performance.now();
    const prompt = buildHospitalHandoverPrompt(casualties, incidentContext);

    // Routes to Cloud Gemini via Firebase AI Logic connector
    try {
      const response = await this.cloudConnector.generateText(prompt);
      this.telemetry.activeRoute = "cloud_gemini";
      this.telemetry.lastExecutionMs = Math.round(performance.now() - start);
      return response;
    } catch (err) {
      console.warn("Cloud handover synthesis failed, providing local synthesis:", err);
      this.telemetry.fallbackReason = "Cloud unreachable: local dispatch summary generated";
      return this.generateOfflineHandoverSummary(casualties, incidentContext);
    }
  }

  /**
   * Verifies pharmacological contraindications for field medication (routes to Cloud Gemini).
   */
  public async checkContraindications(casualty: Casualty, medication: string): Promise<string> {
    const prompt = buildContraindicationPrompt(casualty, medication);
    try {
      const response = await this.cloudConnector.generateText(prompt);
      this.telemetry.activeRoute = "cloud_gemini";
      return response;
    } catch (err) {
      console.warn("Cloud contraindication check failed:", err);
      return `Offline Warning: Cannot connect to cloud pharmacology database. Verify standard contraindications manually. Ensure no respiratory depression or severe allergy before administering ${medication}.`;
    }
  }

  private parseCategoryFromText(text: string): Casualty["category"] | null {
    const lower = text.toLowerCase();
    if (lower.includes("category: immediate") || lower.includes("category: red"))
      return "immediate";
    if (lower.includes("category: delayed") || lower.includes("category: yellow")) return "delayed";
    if (lower.includes("category: minor") || lower.includes("category: green")) return "minor";
    if (lower.includes("category: expectant") || lower.includes("category: black"))
      return "expectant";
    return null;
  }

  private generateOfflineHandoverSummary(casualties: Casualty[], incidentContext: string): string {
    const immediateCount = casualties.filter((c) => c.category === "immediate").length;
    const delayedCount = casualties.filter((c) => c.category === "delayed").length;
    const minorCount = casualties.filter((c) => c.category === "minor").length;
    const expectantCount = casualties.filter((c) => c.category === "expectant").length;

    return `### Offline Emergency Handover Summary
Incident: ${incidentContext || "Field Mass-Casualty Event"}
Total Patients: ${casualties.length}
- Immediate (Red): ${immediateCount}
- Delayed (Yellow): ${delayedCount}
- Minor (Green): ${minorCount}
- Expectant (Black): ${expectantCount}

Generated locally while offline. Priority transport dispatched for ${immediateCount} immediate surgical candidates.`;
  }
}
