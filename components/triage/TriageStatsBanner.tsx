import React from "react";
import { TriageCategory } from "../../core/triage/types";

interface TriageStatsBannerProps {
  totalCount: number;
  breakdown: Record<TriageCategory, number>;
}

export const TriageStatsBanner: React.FC<TriageStatsBannerProps> = ({ totalCount, breakdown }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-sm">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
          Total Casualties
        </span>
        <span className="text-2xl font-black text-white">{totalCount}</span>
      </div>

      <div className="bg-slate-900 border border-red-900/60 p-3 rounded-xl shadow-sm bg-gradient-to-br from-red-950/20 to-transparent">
        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block flex items-center justify-between">
          Immediate (Red)
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </span>
        <span className="text-2xl font-black text-red-500">{breakdown.immediate}</span>
      </div>

      <div className="bg-slate-900 border border-amber-900/60 p-3 rounded-xl shadow-sm bg-gradient-to-br from-amber-950/20 to-transparent">
        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
          Delayed (Yellow)
        </span>
        <span className="text-2xl font-black text-amber-400">{breakdown.delayed}</span>
      </div>

      <div className="bg-slate-900 border border-emerald-900/60 p-3 rounded-xl shadow-sm bg-gradient-to-br from-emerald-950/20 to-transparent">
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
          Minor (Green)
        </span>
        <span className="text-2xl font-black text-emerald-400">{breakdown.minor}</span>
      </div>

      <div className="bg-slate-900 border border-zinc-800 p-3 rounded-xl shadow-sm col-span-2 sm:col-span-1">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
          Expectant (Black)
        </span>
        <span className="text-2xl font-black text-zinc-400">{breakdown.expectant}</span>
      </div>
    </div>
  );
};
