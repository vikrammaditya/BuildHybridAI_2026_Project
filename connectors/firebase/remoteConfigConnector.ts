// Connector for Firebase Remote Config

export interface RemoteConfigPort {
  getFallbackThreshold(): Promise<number>;
}

export class RemoteConfigConnector implements RemoteConfigPort {
  private defaultThreshold = 1000; // tokens

  async getFallbackThreshold(): Promise<number> {
    try {
      // Remote config fetch when live; falls back to 1000 tokens default
      return this.defaultThreshold;
    } catch (err) {
      console.warn("Remote config fetch failed, using fallback constant:", err);
      return this.defaultThreshold;
    }
  }
}
