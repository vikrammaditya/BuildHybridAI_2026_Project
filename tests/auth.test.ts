import { describe, it, expect } from "vitest";
import { FirebaseAuthConnector } from "../connectors/firebase/authConnector";
import { getFirebaseConfig } from "../config/firebase";

describe("Auth & Security (E6, E8 verification)", () => {
  it("creates immediate anonymous user on init without login barrier (E6, AC-6)", async () => {
    const auth = new FirebaseAuthConnector();
    const user = await auth.initAnonymousAuth();

    expect(user.uid).toBeTruthy();
    expect(user.isAnonymous).toBe(true);
    expect(auth.getCurrentUser()?.uid).toBe(user.uid);
  });

  it("signs in with Google account and updates user status", async () => {
    const auth = new FirebaseAuthConnector();
    const user = await auth.signInWithGoogle();

    expect(user.isAnonymous).toBe(false);
    expect(user.email).toBe("responder@fieldpulse.local");
    expect(user.displayName).toBe("Field Responder");
  });

  it("guarantees zero private administrative credentials exposed in client config (E8, Guardrail)", () => {
    const config = getFirebaseConfig();

    // Verify no private service account keys or private server tokens exist in client config
    const configString = JSON.stringify(config);
    expect(configString).not.toContain("private_key");
    expect(configString).not.toContain("service_account");
    expect(configString).not.toContain("PRIVATE_KEY");
    expect(config.apiKey).toBeDefined();
    expect(config.projectId).toBeDefined();
  });
});
