import React from "react";
import { Wifi, WifiOff, Cpu, Cloud, AlertTriangle } from "lucide-react";
import { TelemetryState } from "../core/triage/hybridRouter";

interface TelemetryPillProps {
  telemetry: TelemetryState;
  simulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
}

export const TelemetryPill: React.FC<TelemetryPillProps> = ({
  telemetry,
  simulatedOffline,
  onToggleSimulatedOffline,
}) => {
  const isActuallyOnline = telemetry.isOnline && !simulatedOffline;

  return (
    <div className="flex items-center gap-2">
      {/* Network & Simulation Toggle */}
      <button
        onClick={onToggleSimulatedOffline}
        title="Click to toggle simulated offline mode for airplane mode demo"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
          isActuallyOnline
            ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900"
            : "bg-amber-950/90 text-amber-300 border-amber-600/80 hover:bg-amber-900"
        }`}
      >
        {isActuallyOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>ONLINE</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>OFFLINE {simulatedOffline ? "(SIMULATED)" : ""}</span>
          </>
        )}
      </button>

      {/* Inference Engine Badge */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          telemetry.activeRoute === "on_device_nano"
            ? "bg-cyan-950/80 text-cyan-300 border-cyan-600/70"
            : telemetry.activeRoute === "cloud_gemini"
              ? "bg-blue-950/80 text-blue-300 border-blue-600/70"
              : "bg-slate-800 text-slate-300 border-slate-600"
        }`}
        title={telemetry.fallbackReason || "Inference engine status"}
      >
        {telemetry.activeRoute === "on_device_nano" ? (
          <>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini Nano (On-Device)</span>
          </>
        ) : telemetry.activeRoute === "cloud_gemini" ? (
          <>
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Cloud Gemini (Hybrid)</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Deterministic START (Offline)</span>
          </>
        )}

        {telemetry.lastExecutionMs > 0 && (
          <span className="text-[10px] opacity-75 font-mono ml-1">
            {telemetry.lastExecutionMs}ms
          </span>
        )}
      </div>
    </div>
  );
};
