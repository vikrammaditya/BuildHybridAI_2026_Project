import { Note, InferenceTask, InferenceResult, ModelStatus } from "./types";
import { NanoPort } from "../connectors/ai/nanoConnector";
import { CloudAiPort } from "../connectors/ai/firebaseAiConnector";
import { RemoteConfigPort } from "../connectors/firebase/remoteConfigConnector";

export class InferenceRouter {
  constructor(
    private nano: NanoPort,
    private cloud: CloudAiPort,
    private remoteConfig: RemoteConfigPort,
  ) {}

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  async getStatus(): Promise<ModelStatus> {
    const isOnline = this.cloud.isOnline();
    let nanoAvailable = false;
    try {
      nanoAvailable = await this.nano.isAvailable();
    } catch {
      nanoAvailable = false;
    }

    const activeModel = nanoAvailable ? "local-nano" : isOnline ? "cloud-gemini" : "none";

    return {
      nanoAvailable,
      cloudAvailable: isOnline,
      activeModel,
      isOffline: !isOnline,
    };
  }

  async routeAndExecute(task: InferenceTask, notes: Note[]): Promise<InferenceResult> {
    const startTime = Date.now();
    const tokenCount = task.tokenEstimate ?? this.estimateTokens(task.prompt);
    const threshold = await this.remoteConfig.getFallbackThreshold();
    const isOnline = this.cloud.isOnline();
    const isMultiNote = task.type === "synthesize" || notes.length > 1;

    // Rule 1: Multi-note synthesis demands cloud model capability
    if (isMultiNote) {
      if (!isOnline) {
        throw new Error("Cloud connection required for multi-note synthesis (offline)");
      }
      const text = await this.cloud.generateText(task.prompt);
      return {
        text,
        model: "cloud-gemini",
        durationMs: Date.now() - startTime,
        fallbackReason: "Multi-note synthesis routed to cloud",
        timestamp: Date.now(),
      };
    }

    // Rule 2: Token limit exceeded -> route to cloud
    if (tokenCount > threshold) {
      if (!isOnline) {
        throw new Error(
          `Token limit exceeded (${tokenCount} > ${threshold}) and device is offline`,
        );
      }
      const text = await this.cloud.generateText(task.prompt);
      return {
        text,
        model: "cloud-gemini",
        durationMs: Date.now() - startTime,
        fallbackReason: `Token count exceeds local limit (${tokenCount} > ${threshold})`,
        timestamp: Date.now(),
      };
    }

    // Rule 3: Single-note task fits within local context -> attempt on-device Nano first
    let nanoReady = false;
    try {
      nanoReady = await this.nano.isAvailable();
    } catch {
      nanoReady = false;
    }

    if (nanoReady) {
      try {
        const text = await this.nano.generateText(task.prompt);
        return {
          text,
          model: "local-nano",
          durationMs: Date.now() - startTime,
          timestamp: Date.now(),
        };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        // Guardrail: Never fail silently on fallback! Log and route to cloud
        console.warn("Local Nano execution failed, falling back to cloud:", errMsg);

        if (!isOnline) {
          throw new Error(`On-device inference failed (${errMsg}) and device is offline`);
        }

        const text = await this.cloud.generateText(task.prompt);
        return {
          text,
          model: "cloud-gemini",
          durationMs: Date.now() - startTime,
          fallbackReason: `Local execution error (${errMsg})`,
          timestamp: Date.now(),
        };
      }
    }

    // Rule 4: Local Nano is unready / downloading
    if (!isOnline) {
      throw new Error("On-device model unready and device is offline");
    }

    const text = await this.cloud.generateText(task.prompt);
    return {
      text,
      model: "cloud-gemini",
      durationMs: Date.now() - startTime,
      fallbackReason: "On-device Gemini Nano unready or unsupported",
      timestamp: Date.now(),
    };
  }
}
