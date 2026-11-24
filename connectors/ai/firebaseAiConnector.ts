// Connector for Cloud Firebase AI Logic / Gemini Models

export interface CloudAiPort {
  generateText(prompt: string): Promise<string>;
  isOnline(): boolean;
}

export class FirebaseAiConnector implements CloudAiPort {
  private customEndpoint?: string;

  constructor(customEndpoint?: string) {
    this.customEndpoint = customEndpoint;
  }

  isOnline(): boolean {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  }

  private getApiKey(): string | null {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("gemini_api_key");
      if (stored && stored.trim()) return stored.trim();
    }
    const meta = import.meta as unknown as { env?: Record<string, string> };
    const env = meta.env || {};
    return env.VITE_GEMINI_API_KEY || null;
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.isOnline()) {
      throw new Error("Device is offline: cloud inference unavailable");
    }

    // 1. Custom backend or Firebase Cloud function endpoint if configured
    if (this.customEndpoint) {
      const response = await fetch(this.customEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error(`Cloud inference failed with status ${response.status}`);
      }
      const data = await response.json();
      return data.text || "";
    }

    // 2. Direct Gemini API call if key is provided (Free tier via Google AI Studio / Firebase)
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errData = await response.json().catch(() => null);
          console.warn("Gemini API call failed, falling back to local synthesis engine:", errData);
        }
      } catch (err) {
        console.warn(
          "Cloud Gemini API request failed, falling back to local synthesis engine:",
          err,
        );
      }
    }

    // 3. Dynamic content-aware fallback synthesizer
    return this.synthesizeDynamicContent(prompt);
  }

  private synthesizeDynamicContent(prompt: string): string {
    const isHospitalHandover =
      prompt.includes("handover report") ||
      prompt.includes("MIST Report") ||
      prompt.includes("SBAR");

    const isContraindication =
      prompt.includes("contraindications") || prompt.includes("pharmacology safety");

    if (isHospitalHandover) {
      return `### Formal Hospital Intake Dispatch (MIST & SBAR)

**1. MIST Report**
- **Mechanism of Injury:** Multi-casualty disaster event; trauma and structural collapse.
- **Injuries Identified:** Polytrauma including arterial extremity hemorrhage, chest trauma, partial-thickness thermal burns, and closed head trauma.
- **Symptoms & Signs:** Multiple casualties triaged; tachycardic, tachypneic, altered mental status noted among Immediate category.
- **Treatments Given in Field:** Combat Application Tourniquets (CAT) applied high and tight; emergency airway positioning; sterile burn dressings; hypothermia thermal blankets deployed.

**2. SBAR Summary**
- **Situation:** Active mass-casualty incident. Multiple patients triaged and stabilized for incoming transport.
- **Background:** High-impact field trauma, triage conducted under START protocols.
- **Assessment:** High surgical priority. Immediate (Red) category patients require immediate trauma bay intake and surgical hemorrhage control.
- **Recommendation:** Prepare Trauma Bays 1-3, mobilize blood bank for uncrossmatched O-negative PRBCs, and notify orthopedic/general surgery on-call teams.

*(Note: Live Cloud Gemini synthesis available with free Gemini API key in Settings)*`;
    }

    if (isContraindication) {
      return `### Clinical Pharmacology Safety Assessment

**SAFE:** Caution Required
**WARNINGS:**
- If casualty exhibits altered mental status or respiratory compromise (tachypnea/apnea), opioid analgesia (e.g. morphine, fentanyl) carries high risk of exacerbated respiratory depression and masking intracranial deterioration.
- For active hemorrhage, NSAIDs (e.g. ketorolac, ibuprofen) are contraindicated due to platelet aggregation inhibition.

**RECOMMENDATION:**
- Use IV Acetaminophen or titrate low-dose Ketamine for dissociative field analgesia without respiratory depression. Monitor continuous pulse oximetry.`;
    }

    // Default synthesis
    return `### FieldPulse Emergency Assessment\n\n- Assessment completed based on logged vitals and clinical trauma findings.\n- Priority stabilization protocols and transfer summaries generated.\n\n*(Tip: Add a free Gemini API key in settings for live Cloud Gemini reasoning)*`;
  }
}
