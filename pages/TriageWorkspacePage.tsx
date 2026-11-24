import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, Search, Activity, Plus } from "lucide-react";
import { Casualty, TriageCategory } from "../core/triage/types";
import { TriageService, CreateCasualtyInput } from "../core/triage/triageService";
import { HybridTriageRouter, TelemetryState } from "../core/triage/hybridRouter";
import { TriageHeader } from "../components/triage/TriageHeader";
import { CasualtyCard } from "../components/triage/CasualtyCard";
import { CasualtyIntakeModal } from "../components/triage/CasualtyIntakeModal";
import { StabilizationGuideDrawer } from "../components/triage/StabilizationGuideDrawer";
import { HospitalHandoverModal } from "../components/triage/HospitalHandoverModal";
import { TriageStatsBanner } from "../components/triage/TriageStatsBanner";
import { SettingsModal } from "../components/SettingsModal";

export const TriageWorkspacePage: React.FC = () => {
  const triageService = useMemo(() => new TriageService(), []);
  const hybridRouter = useMemo(() => new HybridTriageRouter(), []);

  const [casualties, setCasualties] = useState<Casualty[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryState>(hybridRouter.getTelemetry());
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [filter, setFilter] = useState<TriageCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Drawers state
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [activeStabilizationCasualty, setActiveStabilizationCasualty] = useState<Casualty | null>(
    null,
  );
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Status notification banner
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const refreshCasualties = () => {
    setCasualties(triageService.getCasualties());
  };

  useEffect(() => {
    refreshCasualties();
    hybridRouter.probeCapabilities().then(setTelemetry);

    const handleOnline = () => {
      hybridRouter.probeCapabilities().then(setTelemetry);
      showNotification("Network restored — Cloud Gemini synthesis re-enabled.");
    };
    const handleOffline = () => {
      hybridRouter.probeCapabilities().then(setTelemetry);
      showNotification("Network disconnected — On-device offline mode active.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [triageService, hybridRouter]);

  const handleToggleSimulatedOffline = () => {
    const nextState = !simulatedOffline;
    setSimulatedOffline(nextState);
    showNotification(
      nextState
        ? "Simulated Offline Mode Enabled: Testing on-device Gemini Nano inference."
        : "Online Mode Restored: Hybrid Cloud Gemini enabled.",
    );
  };

  const handleCreateCasualty = async (input: CreateCasualtyInput) => {
    const newCasualty = triageService.addCasualty(input);

    if (telemetry.nanoAvailable || (!simulatedOffline && telemetry.isOnline)) {
      try {
        const result = await hybridRouter.evaluateTriage(newCasualty);
        triageService.updateCasualty(newCasualty.id, {
          category: result.category,
          aiRationale: result.rationale,
          stabilizationActions: result.immediateStabilizationSteps,
          evaluatedBy: result.evaluatedBy,
        });
      } catch (err) {
        console.warn("AI evaluation error:", err);
      }
    }

    refreshCasualties();
    setTelemetry(hybridRouter.getTelemetry());
    showNotification(
      `Casualty ${newCasualty.tagNumber} triaged: ${newCasualty.category.toUpperCase()}`,
    );
  };

  const handleReassess = async (casualty: Casualty) => {
    try {
      const result = await hybridRouter.evaluateTriage(casualty);
      triageService.updateCasualty(casualty.id, {
        category: result.category,
        aiRationale: result.rationale,
        stabilizationActions: result.immediateStabilizationSteps,
        evaluatedBy: result.evaluatedBy,
      });
      refreshCasualties();
      setTelemetry(hybridRouter.getTelemetry());
      showNotification(
        `Re-assessed ${casualty.tagNumber}: ${result.category.toUpperCase()} (${result.evaluatedBy})`,
      );
    } catch (err) {
      console.warn("Reassess failed:", err);
    }
  };

  const handleDelete = (id: string) => {
    triageService.deleteCasualty(id);
    refreshCasualties();
    showNotification("Casualty removed from active registry.");
  };

  const handleAddStabilizationAction = (casualtyId: string, action: string) => {
    const casualty = triageService.getCasualty(casualtyId);
    if (!casualty) return;
    triageService.updateCasualty(casualtyId, {
      stabilizationActions: [action, ...casualty.stabilizationActions],
    });
    refreshCasualties();
    showNotification(`Intervention logged for ${casualty.tagNumber}`);
  };

  const handleLoadDemoDrill = () => {
    triageService.clearAll();

    // Patient 1: Immediate (Red)
    triageService.addCasualty({
      tagNumber: "TAG-001",
      name: "Alex Mercer",
      age: 29,
      gender: "male",
      vitals: {
        ambulatory: false,
        respirations: 34,
        perfusion: "delayed",
        mentalStatus: "can_follow_commands",
      },
      injuries: ["Arterial Bleed Right Femoral", "Blast Shrapnel Lacerations"],
      traumaNotes: "Pulsatile arterial bleed right thigh, pale and diaphoretic.",
      allergies: ["Penicillin"],
      stabilizationActions: [
        "Applied Combat Application Tourniquet (CAT) high & tight right thigh (08:14)",
        "Placed thermal hypothermia blanket",
      ],
    });

    // Patient 2: Delayed (Yellow)
    triageService.addCasualty({
      tagNumber: "TAG-002",
      name: "Sarah Connor",
      age: 42,
      gender: "female",
      vitals: {
        ambulatory: false,
        respirations: 18,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
      injuries: ["Closed Tibia/Fibula Fracture Left Leg"],
      traumaNotes: "Severe deformity left lower leg, distal pulse intact.",
      allergies: ["Sulfa"],
      stabilizationActions: ["Immobilized with SAM splint, elevated limb"],
    });

    // Patient 3: Minor (Green)
    triageService.addCasualty({
      tagNumber: "TAG-003",
      name: "David Miller",
      age: 23,
      gender: "male",
      vitals: {
        ambulatory: true,
        respirations: 16,
        perfusion: "normal",
        mentalStatus: "can_follow_commands",
      },
      injuries: ["Superficial Facial & Forearm Abrasions"],
      traumaNotes: "Walking wounded, walked from collapse zone.",
      allergies: [],
      stabilizationActions: ["Cleaned superficial abrasions, directed to secondary holding area"],
    });

    refreshCasualties();
    showNotification("Loaded 3-patient mass-casualty demo drill scenario.");
  };

  const breakdown = triageService.getTriageBreakdown();

  const filteredCasualties = casualties.filter((c) => {
    const matchesFilter = filter === "all" || c.category === filter;
    const matchesSearch =
      searchQuery === "" ||
      c.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.injuries.some((inj) => inj.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.traumaNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <TriageHeader
        telemetry={telemetry}
        simulatedOffline={simulatedOffline}
        onToggleSimulatedOffline={handleToggleSimulatedOffline}
        onOpenHandover={() => setIsHandoverOpen(true)}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="bg-cyan-950/90 border-b border-cyan-800/80 px-6 py-2 text-center text-xs font-semibold text-cyan-200 animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-6 space-y-6 flex-1">
        {/* Triage Stats Banner (Extracted Component) */}
        <TriageStatsBanner totalCount={casualties.length} breakdown={breakdown} />

        {/* Action & Filter Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {(["all", "immediate", "delayed", "minor", "expectant"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all border ${
                  filter === cat
                    ? cat === "immediate"
                      ? "bg-red-600 text-white border-red-500"
                      : cat === "delayed"
                        ? "bg-amber-500 text-black border-amber-400"
                        : cat === "minor"
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : cat === "expectant"
                            ? "bg-zinc-800 text-zinc-200 border-zinc-600"
                            : "bg-cyan-600 text-white border-cyan-500"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat === "all" ? `All (${casualties.length})` : `${cat} (${breakdown[cat] || 0})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tag, injury, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleLoadDemoDrill}
              title="Populate 3-patient mass casualty scenario for fast testing/video demo"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Drill (3 Patients)</span>
            </button>
          </div>
        </div>

        {/* Casualty Cards Grid */}
        {filteredCasualties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCasualties.map((casualty) => (
              <CasualtyCard
                key={casualty.id}
                casualty={casualty}
                onOpenStabilization={(c) => setActiveStabilizationCasualty(c)}
                onReassess={handleReassess}
                onDelete={handleDelete}
                onCheckPharma={() => setIsHandoverOpen(true)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Activity className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                No casualties logged in this filter
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Begin triage intake for incoming patients or load the 3-casualty disaster scenario
                to test on-device Gemini Nano and cloud handover.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-red-900/40"
              >
                <Plus className="w-4 h-4" />
                <span>Intake Casualty</span>
              </button>
              <button
                onClick={handleLoadDemoDrill}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold px-4 py-2 rounded-lg border border-slate-700"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Demo Drill (3 Patients)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sub-modals & Drawers */}
      <CasualtyIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSubmit={handleCreateCasualty}
        suggestedTag={`TAG-${String(casualties.length + 1).padStart(3, "0")}`}
      />

      <StabilizationGuideDrawer
        casualty={activeStabilizationCasualty}
        onClose={() => setActiveStabilizationCasualty(null)}
        router={hybridRouter}
        onAddAction={handleAddStabilizationAction}
      />

      <HospitalHandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        casualties={casualties}
        router={hybridRouter}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          hybridRouter.probeCapabilities().then(setTelemetry);
        }}
        isNanoAvailable={telemetry.nanoAvailable}
      />
    </div>
  );
};
