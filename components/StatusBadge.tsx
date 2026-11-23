import React from "react";
import { Cpu, Cloud, WifiOff, CheckCircle2 } from "lucide-react";
import { ModelStatus } from "../core/types";

interface StatusBadgeProps {
  status: ModelStatus;
  lastExecution?: {
    model: "local-nano" | "cloud-gemini";
    durationMs: number;
    fallbackReason?: string;
  } | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, lastExecution }) => {
  if (lastExecution) {
    const isLocal = lastExecution.model === "local-nano";
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border shadow-sm transition-all ${
          isLocal
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
        }`}
        title={
          lastExecution.fallbackReason
            ? `Fallback Reason: ${lastExecution.fallbackReason}`
            : "Executed on preferred model"
        }
      >
        {isLocal ? (
          <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        )}
        <span>
          {isLocal ? "Gemini Nano (Local)" : "Gemini Cloud (Hybrid)"} • {lastExecution.durationMs}ms
        </span>
        {lastExecution.fallbackReason && (
          <span className="text-[10px] opacity-80 px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">
            Fallback
          </span>
        )}
      </div>
    );
  }

  if (status.nanoAvailable) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Gemini Nano Ready (On-Device)</span>
      </div>
    );
  }

  if (status.isOffline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
        <WifiOff className="w-3.5 h-3.5 text-amber-600" />
        <span>Offline (Nano Unready)</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
      <Cloud className="w-3.5 h-3.5 text-slate-500" />
      <span>Cloud Ready (Hybrid Active)</span>
    </div>
  );
};
