import React from "react";
import { Casualty, TRIAGE_LABEL_MAP } from "../../core/triage/types";
import { Activity, ShieldAlert, Brain, Trash2, Crosshair } from "lucide-react";

interface CasualtyCardProps {
  casualty: Casualty;
  onOpenStabilization: (casualty: Casualty) => void;
  onReassess: (casualty: Casualty) => void;
  onDelete: (id: string) => void;
  onCheckPharma: (casualty: Casualty) => void;
}

export const CasualtyCard: React.FC<CasualtyCardProps> = ({
  casualty,
  onOpenStabilization,
  onReassess,
  onDelete,
  onCheckPharma,
}) => {
  const getBadgeStyle = (category: Casualty["category"]) => {
    switch (category) {
      case "immediate":
        return "bg-red-600 text-white border-red-500 shadow-red-900/40";
      case "delayed":
        return "bg-amber-500 text-black border-amber-400 shadow-amber-900/30";
      case "minor":
        return "bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30";
      case "expectant":
        return "bg-zinc-800 text-zinc-300 border-zinc-600 shadow-black/50";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const v = casualty.vitals;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        {/* Header: Tag and Triage Category Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-wide text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
              {casualty.tagNumber}
            </span>
            {casualty.name && (
              <span className="text-sm font-medium text-slate-300 truncate max-w-[140px]">
                {casualty.name}
              </span>
            )}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md ${getBadgeStyle(
              casualty.category,
            )}`}
          >
            {TRIAGE_LABEL_MAP[casualty.category]}
          </div>
        </div>

        {/* Vitals Quick Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 mb-3 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Walk</span>
            <span className={`font-bold ${v.ambulatory ? "text-emerald-400" : "text-rose-400"}`}>
              {v.ambulatory ? "YES" : "NO"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Resp</span>
            <span className="font-bold text-slate-200">
              {typeof v.respirations === "number"
                ? `${v.respirations}/m`
                : v.respirations.toUpperCase()}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Perfusion</span>
            <span
              className={`font-bold ${
                v.perfusion === "normal"
                  ? "text-emerald-400"
                  : v.perfusion === "delayed"
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {v.perfusion.toUpperCase()}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Mental</span>
            <span
              className={`font-bold truncate block ${
                v.mentalStatus === "can_follow_commands" ? "text-emerald-400" : "text-rose-400"
              }`}
              title={v.mentalStatus}
            >
              {v.mentalStatus === "can_follow_commands" ? "ALERT" : "ALTERED"}
            </span>
          </div>
        </div>

        {/* Trauma & Injury Notes */}
        {casualty.injuries.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {casualty.injuries.map((inj, idx) => (
              <span
                key={idx}
                className="bg-rose-950/60 text-rose-300 border border-rose-800/60 text-[11px] px-2 py-0.5 rounded-md font-medium"
              >
                {inj}
              </span>
            ))}
          </div>
        )}

        {casualty.traumaNotes && (
          <p className="text-xs text-slate-300 line-clamp-2 italic mb-3 bg-slate-950/40 p-2 rounded border border-slate-800/40">
            "{casualty.traumaNotes}"
          </p>
        )}

        {/* AI Rationale Snippet */}
        {casualty.aiRationale && (
          <div className="text-[11px] text-slate-400 mb-3 bg-slate-800/30 p-2 rounded border border-slate-800 flex items-start gap-1.5">
            <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{casualty.aiRationale}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-xs">
        <button
          onClick={() => onOpenStabilization(casualty)}
          className="flex-1 flex items-center justify-center gap-1 bg-red-900/60 hover:bg-red-800/80 text-red-200 border border-red-700/60 py-1.5 px-2 rounded-lg font-semibold transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Stabilize</span>
        </button>

        <button
          onClick={() => onCheckPharma(casualty)}
          title="Verify drug safety & contraindications"
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
        >
          <Crosshair className="w-4 h-4 text-cyan-400" />
        </button>

        <button
          onClick={() => onReassess(casualty)}
          title="Re-run START triage assessment"
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
        >
          <Activity className="w-4 h-4 text-emerald-400" />
        </button>

        <button
          onClick={() => onDelete(casualty.id)}
          title="Delete casualty record"
          className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 hover:border-rose-800 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
