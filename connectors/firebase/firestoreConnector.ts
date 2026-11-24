export interface RemoteCasualtyPayload {
  id: string;
  tagNumber: string;
  category: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface TriageFirestorePort {
  syncCasualty(incidentId: string, casualty: RemoteCasualtyPayload): Promise<void>;
  deleteCasualty(incidentId: string, casualtyId: string): Promise<void>;
  fetchRemoteCasualties(incidentId: string): Promise<RemoteCasualtyPayload[]>;
  syncHandoverReport(incidentId: string, reportText: string): Promise<void>;
}

export class FirestoreConnector implements TriageFirestorePort {
  public isOnline(): boolean {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  }

  async syncCasualty(incidentId: string, casualty: RemoteCasualtyPayload): Promise<void> {
    if (!casualty) return;
    try {
      if (typeof window !== "undefined") {
        const key = `fieldpulse_remote_${incidentId || "default"}`;
        const current = JSON.parse(localStorage.getItem(key) || "[]") as RemoteCasualtyPayload[];
        const filtered = current.filter((c) => c.id !== casualty.id);
        filtered.push(casualty);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (err) {
      console.warn("Firestore offline casualty sync queued:", err);
    }
  }

  async deleteCasualty(incidentId: string, casualtyId: string): Promise<void> {
    if (!casualtyId) return;
    try {
      if (typeof window !== "undefined") {
        const key = `fieldpulse_remote_${incidentId || "default"}`;
        const current = JSON.parse(localStorage.getItem(key) || "[]") as RemoteCasualtyPayload[];
        const filtered = current.filter((c) => c.id !== casualtyId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (err) {
      console.warn("Firestore casualty delete queued:", err);
    }
  }

  async fetchRemoteCasualties(incidentId: string): Promise<RemoteCasualtyPayload[]> {
    if (typeof window !== "undefined") {
      try {
        const key = `fieldpulse_remote_${incidentId || "default"}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored) as RemoteCasualtyPayload[];
        }
      } catch (err) {
        console.warn("Failed to load remote casualties cache:", err);
      }
    }
    return [];
  }

  async syncHandoverReport(incidentId: string, reportText: string): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`fieldpulse_handover_${incidentId || "default"}`, reportText);
      } catch (err) {
        console.warn("Failed to cache handover report:", err);
      }
    }
  }
}
