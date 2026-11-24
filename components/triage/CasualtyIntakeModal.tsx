import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { CreateCasualtyInput } from "../../core/triage/triageService";
import { TriageVitals } from "../../core/triage/types";
import { VitalsQuickSelector } from "./VitalsQuickSelector";

interface CasualtyIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCasualtyInput) => void;
  suggestedTag: string;
}

const COMMON_INJURIES = [
  "Arterial Bleed",
  "Chest Trauma",
  "Head Injury / Altered GCS",
  "Partial Burn > 20%",
  "Limb Fracture",
  "Amputation",
  "Crush Injury",
  "Penetrating Shrapnel",
];

export const CasualtyIntakeModal: React.FC<CasualtyIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestedTag,
}) => {
  const [tagNumber, setTagNumber] = useState(suggestedTag);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "unknown">("unknown");

  // Vitals State
  const [ambulatory, setAmbulatory] = useState(false);
  const [respRate, setRespRate] = useState<"normal" | "rapid" | "absent">("normal");
  const [exactResp, setExactResp] = useState<number | "">("");
  const [repositionedAirwayBreathing, setRepositionedAirwayBreathing] = useState(false);
  const [perfusion, setPerfusion] = useState<"normal" | "delayed" | "absent">("normal");
  const [mentalStatus, setMentalStatus] = useState<
    "can_follow_commands" | "cannot_follow_commands" | "unresponsive"
  >("can_follow_commands");

  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);
  const [traumaNotes, setTraumaNotes] = useState("");
  const [allergiesText, setAllergiesText] = useState("");

  if (!isOpen) return null;

  const toggleInjury = (inj: string) => {
    setSelectedInjuries((prev) =>
      prev.includes(inj) ? prev.filter((i) => i !== inj) : [...prev, inj],
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const vitals: TriageVitals = {
      ambulatory,
      respirations: exactResp !== "" ? Number(exactResp) : respRate,
      repositionedAirwayBreathing: respRate === "absent" ? repositionedAirwayBreathing : undefined,
      perfusion,
      mentalStatus,
    };

    const allergies = allergiesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({
      tagNumber: tagNumber || suggestedTag,
      name: name || undefined,
      age: age !== "" ? Number(age) : undefined,
      gender,
      vitals,
      injuries: selectedInjuries,
      traumaNotes,
      allergies,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              Casualty Intake & Rapid Triage
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapid clinical START data entry for mass casualty response
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 mt-4">
          {/* Tag & Demographics */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Triage Tag #
              </label>
              <input
                type="text"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Name / Alias (Optional)
              </label>
              <input
                type="text"
                placeholder="Unknown"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Age</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={age}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as "male" | "female" | "other" | "unknown")
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* START PROTOCOL RAPID-TAP BUTTONS (Extracted subcomponent) */}
          <VitalsQuickSelector
            ambulatory={ambulatory}
            setAmbulatory={setAmbulatory}
            respRate={respRate}
            setRespRate={setRespRate}
            exactResp={exactResp}
            setExactResp={setExactResp}
            repositionedAirwayBreathing={repositionedAirwayBreathing}
            setRepositionedAirwayBreathing={setRepositionedAirwayBreathing}
            perfusion={perfusion}
            setPerfusion={setPerfusion}
            mentalStatus={mentalStatus}
            setMentalStatus={setMentalStatus}
          />

          {/* Quick Injury Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Observed Trauma Types (Quick Select)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_INJURIES.map((inj) => {
                const active = selectedInjuries.includes(inj);
                return (
                  <button
                    key={inj}
                    type="button"
                    onClick={() => toggleInjury(inj)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                      active
                        ? "bg-rose-950 text-rose-200 border-rose-500 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {active ? "✓ " : "+ "}
                    {inj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field Notes & Allergies */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Trauma Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Pulsatile thigh hemorrhage, crushed right lower leg..."
                value={traumaNotes}
                onChange={(e) => setTraumaNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Known Allergies
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Penicillin, Sulfa, Morphine..."
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-lg shadow-lg shadow-red-900/50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Run START Triage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
