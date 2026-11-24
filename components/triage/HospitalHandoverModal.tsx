import React, { useState } from "react";
import { X, Cloud, Copy, Check, ShieldCheck } from "lucide-react";
import { Casualty, TRIAGE_LABEL_MAP } from "../../core/triage/types";
import { HybridTriageRouter } from "../../core/triage/hybridRouter";

interface HospitalHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  casualties: Casualty[];
  router: HybridTriageRouter;
}

export const HospitalHandoverModal: React.FC<HospitalHandoverModalProps> = ({
  isOpen,
  onClose,
  casualties,
  router,
}) => {
  const [incidentContext, setIncidentContext] = useState(
    "Urban building collapse with trauma casualties",
  );
  const [handoverText, setHandoverText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pharma tab
  const [activeTab, setActiveTab] = useState<"handover" | "pharma">("handover");
  const [selectedCasualtyId, setSelectedCasualtyId] = useState(casualties[0]?.id || "");
  const [medicationInput, setMedicationInput] = useState("Morphine 10mg IV");
  const [pharmaResult, setPharmaResult] = useState("");
  const [pharmaLoading, setPharmaLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerateHandover = async () => {
    setLoading(true);
    try {
      const response = await router.generateHospitalHandover(casualties, incidentContext);
      setHandoverText(response);
    } catch (err) {
      console.warn("Handover failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPharma = async () => {
    const casualty = casualties.find((c) => c.id === selectedCasualtyId);
    if (!casualty) return;

    setPharmaLoading(true);
    try {
      const response = await router.checkContraindications(casualty, medicationInput);
      setPharmaResult(response);
    } catch (err) {
      console.warn("Pharma check failed:", err);
    } finally {
      setPharmaLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(handoverText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const immediateCount = casualties.filter((c) => c.category === "immediate").length;
  const delayedCount = casualties.filter((c) => c.category === "delayed").length;
  const minorCount = casualties.filter((c) => c.category === "minor").length;
  const expectantCount = casualties.filter((c) => c.category === "expectant").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" />
              Hospital Intake & Handover Dispatch (Cloud AI)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Powered by Cloud Gemini via Firebase AI Logic (with offline fallback)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 my-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("handover")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "handover"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            MIST & SBAR Hospital Report
          </button>
          <button
            onClick={() => setActiveTab("pharma")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pharma"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Pharmacology & Contraindication Auditor
          </button>
        </div>

        {activeTab === "handover" ? (
          <div className="space-y-4">
            {/* Incident Summary Stats */}
            <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Immediate</span>
                <span className="text-base font-black text-rose-500">{immediateCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Delayed</span>
                <span className="text-base font-black text-amber-400">{delayedCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Minor</span>
                <span className="text-base font-black text-emerald-400">{minorCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Expectant</span>
                <span className="text-base font-black text-zinc-400">{expectantCount}</span>
              </div>
            </div>

            {/* Context input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Context / Mechanism
              </label>
              <input
                type="text"
                value={incidentContext}
                onChange={(e) => setIncidentContext(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleGenerateHandover}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
            >
              <Cloud className="w-4 h-4" />
              <span>
                {loading ? "Synthesizing Handover via Gemini..." : "Generate MIST & SBAR Report"}
              </span>
            </button>

            {/* Generated Report Output */}
            {handoverText && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Generated Dispatch Output
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto font-sans">
                  {handoverText}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Pharma Tab */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Patient
                </label>
                <select
                  value={selectedCasualtyId}
                  onChange={(e) => setSelectedCasualtyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {casualties.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tagNumber} ({TRIAGE_LABEL_MAP[c.category]}) - {c.injuries[0] || "Trauma"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Proposed Medication / Dose
                </label>
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  placeholder="e.g. Ketamine 50mg, Morphine 10mg..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleCheckPharma}
              disabled={pharmaLoading}
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {pharmaLoading
                  ? "Auditing Contraindications..."
                  : "Verify Drug Safety & Contraindications"}
              </span>
            </button>

            {pharmaResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Clinical Pharmacology Audit
                </span>
                <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {pharmaResult}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
