import { Casualty, TriageCategory, TriageEvaluationResult, TriageVitals } from "./types";
import { evaluateStartTriage, deriveEmergencyStabilizationProtocols } from "./startAlgorithm";

export interface CreateCasualtyInput {
  tagNumber?: string;
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "unknown";
  vitals: TriageVitals;
  category?: TriageCategory;
  injuries?: string[];
  traumaNotes?: string;
  allergies?: string[];
  medications?: string[];
  stabilizationActions?: string[];
}

export class TriageService {
  private casualties: Map<string, Casualty> = new Map();
  private storageKey: string;

  constructor(storageKey = "fieldpulse_casualties") {
    this.storageKey = storageKey;
    this.loadFromLocalStorage();
  }

  public getCasualties(): Casualty[] {
    return Array.from(this.casualties.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public getCasualty(id: string): Casualty | undefined {
    return this.casualties.get(id);
  }

  public addCasualty(input: CreateCasualtyInput): Casualty {
    const id = `cas-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const tagNumber = input.tagNumber || `TAG-${String(this.casualties.size + 1).padStart(3, "0")}`;

    // Auto-evaluate with deterministic START algorithm if unassessed
    const autoEvaluation = evaluateStartTriage(input.vitals, input.traumaNotes || "");
    const category = input.category || autoEvaluation.category;

    const casualty: Casualty = {
      id,
      tagNumber,
      timestamp: Date.now(),
      name: input.name,
      age: input.age,
      gender: input.gender || "unknown",
      vitals: input.vitals,
      category,
      injuries: input.injuries || [],
      traumaNotes: input.traumaNotes || "",
      allergies: input.allergies || [],
      medications: input.medications || [],
      stabilizationActions:
        input.stabilizationActions || autoEvaluation.immediateStabilizationSteps,
      aiRationale: autoEvaluation.rationale,
      evaluatedBy: "deterministic_start",
    };

    this.casualties.set(id, casualty);
    this.saveToLocalStorage();
    return casualty;
  }

  public updateCasualty(id: string, updates: Partial<Casualty>): Casualty {
    const existing = this.casualties.get(id);
    if (!existing) {
      throw new Error(`Casualty with ID ${id} not found.`);
    }

    const updated: Casualty = {
      ...existing,
      ...updates,
      vitals: updates.vitals ? { ...existing.vitals, ...updates.vitals } : existing.vitals,
    };

    // If vitals or trauma notes updated, refresh stabilization actions if not customized
    if (updates.vitals || updates.traumaNotes) {
      updated.stabilizationActions = deriveEmergencyStabilizationProtocols(updated);
    }

    this.casualties.set(id, updated);
    this.saveToLocalStorage();
    return updated;
  }

  public deleteCasualty(id: string): boolean {
    const existed = this.casualties.delete(id);
    if (existed) {
      this.saveToLocalStorage();
    }
    return existed;
  }

  public filterByCategory(category: TriageCategory | "all"): Casualty[] {
    const all = this.getCasualties();
    if (category === "all") return all;
    return all.filter((c) => c.category === category);
  }

  public getTriageBreakdown(): Record<TriageCategory, number> {
    const counts: Record<TriageCategory, number> = {
      immediate: 0,
      delayed: 0,
      minor: 0,
      expectant: 0,
      unassessed: 0,
    };

    for (const casualty of this.casualties.values()) {
      counts[casualty.category] = (counts[casualty.category] || 0) + 1;
    }

    return counts;
  }

  public assessWithDeterministicAlgorithm(id: string): TriageEvaluationResult {
    const casualty = this.getCasualty(id);
    if (!casualty) {
      throw new Error(`Casualty ${id} not found`);
    }

    const result = evaluateStartTriage(casualty.vitals, casualty.traumaNotes);
    this.updateCasualty(id, {
      category: result.category,
      aiRationale: result.rationale,
      stabilizationActions: result.immediateStabilizationSteps,
      evaluatedBy: "deterministic_start",
    });

    return result;
  }

  public loadInitial(casualties: Casualty[]): void {
    this.casualties.clear();
    for (const c of casualties) {
      this.casualties.set(c.id, c);
    }
    this.saveToLocalStorage();
  }

  public clearAll(): void {
    this.casualties.clear();
    this.saveToLocalStorage();
  }

  private saveToLocalStorage(): void {
    if (typeof localStorage !== "undefined") {
      try {
        const serialized = JSON.stringify(Array.from(this.casualties.values()));
        localStorage.setItem(this.storageKey, serialized);
      } catch (err) {
        console.warn("Failed to save casualties to localStorage:", err);
      }
    }
  }

  private loadFromLocalStorage(): void {
    if (typeof localStorage !== "undefined") {
      try {
        const item = localStorage.getItem(this.storageKey);
        if (item) {
          const parsed = JSON.parse(item) as Casualty[];
          for (const c of parsed) {
            this.casualties.set(c.id, c);
          }
        }
      } catch (err) {
        console.warn("Failed to load casualties from localStorage:", err);
      }
    }
  }
}
