// Connector for Chrome Built-in AI / Gemini Nano (window.ai)

export interface NanoPort {
  isAvailable(): Promise<boolean>;
  generateText(prompt: string): Promise<string>;
}

// Window type augmentation for Chrome Prompt API
declare global {
  interface Window {
    ai?: {
      languageModel?: {
        capabilities(): Promise<{
          available: "readily" | "after-download" | "no";
        }>;
        create(options?: { systemPrompt?: string }): Promise<{
          prompt(text: string): Promise<string>;
          promptStreaming?(text: string): ReadableStream;
          destroy(): void;
        }>;
      };
      assistant?: {
        capabilities(): Promise<{
          available: "readily" | "after-download" | "no";
        }>;
        create(options?: { systemPrompt?: string }): Promise<{
          prompt(text: string): Promise<string>;
          destroy(): void;
        }>;
      };
    };
  }
}

export class NanoConnector implements NanoPort {
  async isAvailable(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    // Check Chrome 128+ standard Prompt API: window.ai.languageModel
    if (window.ai?.languageModel) {
      try {
        const caps = await window.ai.languageModel.capabilities();
        return caps.available === "readily" || caps.available === "after-download";
      } catch (err) {
        console.warn("Chrome window.ai.languageModel probe failed:", err);
      }
    }

    // Check early Chrome 126-127 experiment: window.ai.assistant
    if (window.ai?.assistant) {
      try {
        const caps = await window.ai.assistant.capabilities();
        return caps.available === "readily" || caps.available === "after-download";
      } catch (err) {
        console.warn("Chrome window.ai.assistant probe failed:", err);
      }
    }

    return false;
  }

  async generateText(prompt: string): Promise<string> {
    if (typeof window === "undefined") {
      throw new Error("Chrome Built-in AI (Gemini Nano) is not available");
    }

    // Standard Chrome 128+ API
    if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create();
      try {
        const response = await session.prompt(prompt);
        return response;
      } finally {
        session.destroy();
      }
    }

    // Legacy Chrome 126-127 experiment API
    if (window.ai?.assistant) {
      const session = await window.ai.assistant.create();
      try {
        const response = await session.prompt(prompt);
        return response;
      } finally {
        session.destroy();
      }
    }

    throw new Error("Chrome Built-in AI (Gemini Nano) is not available in this browser");
  }
}
