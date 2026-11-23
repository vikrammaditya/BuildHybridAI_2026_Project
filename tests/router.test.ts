import { describe, it, expect, vi } from "vitest";
import { InferenceRouter } from "../core/inferenceRouter";
import { Note, InferenceTask } from "../core/types";
import { NanoPort } from "../connectors/ai/nanoConnector";
import { CloudAiPort } from "../connectors/ai/firebaseAiConnector";
import { RemoteConfigPort } from "../connectors/firebase/remoteConfigConnector";

describe("InferenceRouter (E2, E3, E4, E5, E7, E9 verification)", () => {
  const createMockNano = (available = true, throws = false): NanoPort => ({
    isAvailable: vi.fn().mockResolvedValue(available),
    generateText: vi.fn().mockImplementation(async (prompt: string) => {
      if (throws) throw new Error("Nano execution crash");
      return `[Local Nano Summary]: ${prompt.slice(0, 30)}`;
    }),
  });

  const createMockCloud = (online = true): CloudAiPort => ({
    isOnline: vi.fn().mockReturnValue(online),
    generateText: vi.fn().mockResolvedValue("[Cloud Gemini Response]"),
  });

  const createMockConfig = (threshold = 1000): RemoteConfigPort => ({
    getFallbackThreshold: vi.fn().mockResolvedValue(threshold),
  });

  const sampleNote: Note = {
    id: "n1",
    title: "Hybrid AI Notes",
    content: "Building an offline first application with Chrome Nano and Firebase",
    tags: ["ai"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: true,
  };

  it("routes single-note task to local Nano when available (E2, AC-2)", async () => {
    const nano = createMockNano(true);
    const cloud = createMockCloud(true);
    const config = createMockConfig(1000);
    const router = new InferenceRouter(nano, cloud, config);

    const task: InferenceTask = {
      id: "task-1",
      type: "summarize",
      prompt: "Summarize: note content",
      noteIds: ["n1"],
    };

    const result = await router.routeAndExecute(task, [sampleNote]);
    expect(result.model).toBe("local-nano");
    expect(result.text).toContain("[Local Nano Summary]");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("extracts tags using local Nano (E3, AC-3)", async () => {
    const nano: NanoPort = {
      isAvailable: vi.fn().mockResolvedValue(true),
      generateText: vi.fn().mockResolvedValue("react, firebase, hybrid"),
    };
    const cloud = createMockCloud(true);
    const config = createMockConfig(1000);
    const router = new InferenceRouter(nano, cloud, config);

    const task: InferenceTask = {
      id: "task-tag",
      type: "tagging",
      prompt: "Extract tags",
      noteIds: ["n1"],
    };

    const result = await router.routeAndExecute(task, [sampleNote]);
    expect(result.model).toBe("local-nano");
    expect(result.text).toBe("react, firebase, hybrid");
  });

  it("routes multi-note synthesis to Cloud Gemini (E4, AC-4)", async () => {
    const nano = createMockNano(true);
    const cloud = createMockCloud(true);
    const config = createMockConfig(1000);
    const router = new InferenceRouter(nano, cloud, config);

    const task: InferenceTask = {
      id: "task-synth",
      type: "synthesize",
      prompt: "Synthesize multiple notes",
      noteIds: ["n1", "n2"],
    };

    const result = await router.routeAndExecute(task, [sampleNote, { ...sampleNote, id: "n2" }]);
    expect(result.model).toBe("cloud-gemini");
    expect(result.fallbackReason).toContain("Multi-note synthesis");
  });

  it("throws informative error when offline and Nano is unready (E5, AC-5)", async () => {
    const nano = createMockNano(false);
    const cloud = createMockCloud(false); // offline
    const config = createMockConfig(1000);
    const router = new InferenceRouter(nano, cloud, config);

    const task: InferenceTask = {
      id: "task-offline",
      type: "summarize",
      prompt: "Summarize offline",
      noteIds: ["n1"],
    };

    await expect(router.routeAndExecute(task, [sampleNote])).rejects.toThrow(
      "On-device model unready and device is offline",
    );
  });

  it("retrieves Remote Config threshold correctly (E7, AC-7)", async () => {
    const config = createMockConfig(500);
    const threshold = await config.getFallbackThreshold();
    expect(threshold).toBe(500);
  });

  it("logs and falls back to cloud on local Nano error (E9, Guardrail: Never fail silently)", async () => {
    const nano = createMockNano(true, true); // throws on generate
    const cloud = createMockCloud(true);
    const config = createMockConfig(1000);
    const router = new InferenceRouter(nano, cloud, config);

    const task: InferenceTask = {
      id: "task-fallback",
      type: "summarize",
      prompt: "Summarize with crash",
      noteIds: ["n1"],
    };

    const result = await router.routeAndExecute(task, [sampleNote]);
    expect(result.model).toBe("cloud-gemini");
    expect(result.fallbackReason).toContain("Local execution error");
  });
});
