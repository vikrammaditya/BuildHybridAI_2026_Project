import React from "react";
import { Activity, Plus, Cloud, Settings } from "lucide-react";
import { TelemetryPill } from "../TelemetryPill";
import { TelemetryState } from "../../core/triage/hybridRouter";

interface TriageHeaderProps {
  telemetry: TelemetryState;
  simulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  onOpenHandover: () => void;
  onOpenIntake: () => void;
  onOpenSettings: () => void;
}

export const TriageHeader: React.FC<TriageHeaderProps> = ({
  telemetry,
  simulatedOffline,
  onToggleSimulatedOffline,
  onOpenHandover,
  onOpenIntake,
  onOpenSettings,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Logo & Sector Tag */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-900/50">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                FieldPulse{" "}
                <span className="text-xs text-red-500 font-extrabold font-mono uppercase">AI</span>
              </h1>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                SECTOR #2026-ALPHA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Offline-First Hybrid Emergency Triage & Hospital Handover
            </p>
          </div>
        </div>

        {/* Telemetry and Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <TelemetryPill
            telemetry={telemetry}
            simulatedOffline={simulatedOffline}
            onToggleSimulatedOffline={onToggleSimulatedOffline}
          />

          <button
            onClick={onOpenHandover}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Hospital Handover</span>
          </button>

          <button
            onClick={onOpenIntake}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black px-3.5 py-1.5 rounded-lg shadow-lg shadow-red-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Intake Casualty</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
            title="Settings & Gemini API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
