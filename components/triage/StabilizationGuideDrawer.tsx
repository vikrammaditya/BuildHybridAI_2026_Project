import React, { useState } from "react";
import { X, ShieldAlert, Cpu, CheckCircle2, Clock } from "lucide-react";
import { Casualty, TRIAGE_LABEL_MAP } from "../../core/triage/types";
import { HybridTriageRouter } from "../../core/triage/hybridRouter";

interface StabilizationGuideDrawerProps {
  casualty: Casualty | null;
  onClose: () => void;
  router: HybridTriageRouter;
  onAddAction: (casualtyId: string, action: string) => void;
}

export const StabilizationGuideDrawer: React.FC<StabilizationGuideDrawerProps> = ({
  casualty,
  onClose,
  router,
  onAddAction,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<string>("All");
  const [guidanceText, setGuidanceText] = useState<string>("");
  const [customAction, setCustomAction] = useState("");

  if (!casualty) return null;

  const handleFetchGuidance = async (protocolType?: string) => {
    setLoading(true);
    setActiveProtocol(protocolType || "All");
    try {
      const result = await router.generateStabilizationGuidance(casualty, protocolType);
      setGuidanceText(result);
    } catch (err) {
      console.warn("Failed to generate guidance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdministerAction = (action: string) => {
    const timestamped = `[${new Date().toLocaleTimeString()}] ${action}`;
    onAddAction(casualty.id, timestamped);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-700 w-full max-w-xl h-full p-6 shadow-2xl overflow-y-auto flex flex-col justify-between text-white">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-black tracking-wide text-white">
                  Emergency Stabilization Guide
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Casualty: <span className="text-cyan-300 font-bold">{casualty.tagNumber}</span> |{" "}
                {TRIAGE_LABEL_MAP[casualty.category]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Protocol Triggers */}
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Focus Emergency Protocol:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                "All Recommended",
                "Bleeding Control / CAT",
                "Airway & Breathing",
                "Shock & Hypothermia",
                "Burn Triage",
              ].map((proto) => (
                <button
                  key={proto}
                  onClick={() =>
                    handleFetchGuidance(proto === "All Recommended" ? undefined : proto)
                  }
                  className={`px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    activeProtocol === proto ||
                    (proto === "All Recommended" && activeProtocol === "All")
                      ? "bg-red-900 text-red-200 border-red-600 font-bold shadow-md"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>

          {/* Guidance Content Area */}
          <div className="mt-5 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
              <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                On-Device Clinical Guidance (Gemini Nano)
              </span>
              {loading && (
                <span className="text-xs text-cyan-300 animate-pulse">Generating...</span>
              )}
            </div>

            <div className="text-xs text-slate-200 space-y-2 whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto font-sans">
              {guidanceText || (
                <div className="space-y-3">
                  {casualty.stabilizationActions.length > 0 ? (
                    casualty.stabilizationActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-2"
                      >
                        <span className="text-slate-200">{action}</span>
                        <button
                          onClick={() => handleAdministerAction(action)}
                          title="Record as administered in field"
                          className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 rounded text-[11px] font-bold shrink-0 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">
                      Click a protocol above to generate tailored step-by-step guidance on-device.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Administered Actions Log */}
          <div className="mt-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Recorded Field Interventions ({casualty.stabilizationActions.length})
            </h3>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {casualty.stabilizationActions.map((act, i) => (
                <div
                  key={i}
                  className="text-[11px] text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800/80 font-mono"
                >
                  {act}
                </div>
              ))}
            </div>

            {/* Custom Action Entry */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Custom intervention (e.g. 14G Needle decompression)..."
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (customAction.trim()) {
                    handleAdministerAction(customAction.trim());
                    setCustomAction("");
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg border border-slate-700"
              >
                Log
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
