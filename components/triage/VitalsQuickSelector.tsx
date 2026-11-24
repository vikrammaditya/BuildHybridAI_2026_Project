import React from "react";

interface VitalsQuickSelectorProps {
  ambulatory: boolean;
  setAmbulatory: (val: boolean) => void;
  respRate: "normal" | "rapid" | "absent";
  setRespRate: (val: "normal" | "rapid" | "absent") => void;
  exactResp: number | "";
  setExactResp: (val: number | "") => void;
  repositionedAirwayBreathing: boolean;
  setRepositionedAirwayBreathing: (val: boolean) => void;
  perfusion: "normal" | "delayed" | "absent";
  setPerfusion: (val: "normal" | "delayed" | "absent") => void;
  mentalStatus: "can_follow_commands" | "cannot_follow_commands" | "unresponsive";
  setMentalStatus: (val: "can_follow_commands" | "cannot_follow_commands" | "unresponsive") => void;
}

export const VitalsQuickSelector: React.FC<VitalsQuickSelectorProps> = ({
  ambulatory,
  setAmbulatory,
  respRate,
  setRespRate,
  exactResp,
  setExactResp,
  repositionedAirwayBreathing,
  setRepositionedAirwayBreathing,
  perfusion,
  setPerfusion,
  mentalStatus,
  setMentalStatus,
}) => {
  return (
    <div className="space-y-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
      <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
        START Primary Vitals Assessment
      </h3>

      {/* Step 1: Walking */}
      <div>
        <span className="block text-xs font-semibold text-slate-300 mb-1.5">
          1. Ambulatory (Able to walk?)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAmbulatory(true)}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              ambulatory
                ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            YES — Walking Wounded (Minor)
          </button>
          <button
            type="button"
            onClick={() => setAmbulatory(false)}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              !ambulatory
                ? "bg-rose-900/80 text-rose-200 border-rose-600 shadow-md"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            NO — Non-Ambulatory
          </button>
        </div>
      </div>

      {/* Step 2: Respirations */}
      <div>
        <span className="block text-xs font-semibold text-slate-300 mb-1.5">
          2. Spontaneous Breathing / Respiratory Rate
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRespRate("absent")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              respRate === "absent"
                ? "bg-zinc-800 text-zinc-100 border-zinc-500"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            ABSENT (Apneic)
          </button>
          <button
            type="button"
            onClick={() => setRespRate("normal")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              respRate === "normal"
                ? "bg-emerald-600 text-white border-emerald-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            NORMAL (10–30/min)
          </button>
          <button
            type="button"
            onClick={() => setRespRate("rapid")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              respRate === "rapid"
                ? "bg-red-600 text-white border-red-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            RAPID (&gt; 30/min - Red)
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Exact Rate (optional):</span>
          <input
            type="number"
            placeholder="breaths/min"
            value={exactResp}
            onChange={(e) => setExactResp(e.target.value ? Number(e.target.value) : "")}
            className="w-28 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
          />
        </div>

        {respRate === "absent" && (
          <div className="mt-2.5 p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
            <span className="text-xs text-amber-300 font-semibold block mb-1">
              Reposition Airway: Did breathing spontaneously restart?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepositionedAirwayBreathing(true)}
                className={`py-1.5 px-3 rounded text-xs font-bold border ${
                  repositionedAirwayBreathing
                    ? "bg-red-600 text-white border-red-400"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                YES — Immediate (Red)
              </button>
              <button
                type="button"
                onClick={() => setRepositionedAirwayBreathing(false)}
                className={`py-1.5 px-3 rounded text-xs font-bold border ${
                  !repositionedAirwayBreathing
                    ? "bg-black text-zinc-300 border-zinc-600"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                NO — Expectant (Black)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Perfusion */}
      <div>
        <span className="block text-xs font-semibold text-slate-300 mb-1.5">
          3. Perfusion (Radial Pulse / Capillary Refill)
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPerfusion("normal")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              perfusion === "normal"
                ? "bg-emerald-600 text-white border-emerald-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            Normal (&lt; 2s / Pulse +)
          </button>
          <button
            type="button"
            onClick={() => setPerfusion("delayed")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              perfusion === "delayed"
                ? "bg-red-600 text-white border-red-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            Delayed (&gt; 2s - Red)
          </button>
          <button
            type="button"
            onClick={() => setPerfusion("absent")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              perfusion === "absent"
                ? "bg-rose-950 text-rose-200 border-rose-500"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            No Radial Pulse (Red)
          </button>
        </div>
      </div>

      {/* Step 4: Mental Status */}
      <div>
        <span className="block text-xs font-semibold text-slate-300 mb-1.5">4. Mental Status</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMentalStatus("can_follow_commands")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              mentalStatus === "can_follow_commands"
                ? "bg-emerald-600 text-white border-emerald-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            Can Follow Simple Commands
          </button>
          <button
            type="button"
            onClick={() => setMentalStatus("cannot_follow_commands")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
              mentalStatus === "cannot_follow_commands"
                ? "bg-red-600 text-white border-red-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
            }`}
          >
            Cannot Follow Commands / Unresponsive
          </button>
        </div>
      </div>
    </div>
  );
};
