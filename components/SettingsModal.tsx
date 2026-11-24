import React, { useState, useEffect } from "react";
import { X, Key, Cpu, HelpCircle, Check, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isNanoAvailable: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isNanoAvailable,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      setApiKey(window.localStorage.getItem("gemini_api_key") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("gemini_api_key", apiKey.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
              Hybrid AI Configuration & Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* On-Device Nano Status */}
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                Chrome Gemini Nano (On-Device)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isNanoAvailable
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {isNanoAvailable ? "Active & Ready" : "Not Detected in this Browser"}
              </span>
            </div>

            {!isNanoAvailable && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <p>To enable zero-latency on-device inference using Chrome's built-in model:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>
                    Open Chrome Canary or Dev and navigate to{" "}
                    <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">
                      chrome://flags
                    </code>
                  </li>
                  <li>
                    Enable{" "}
                    <strong className="text-slate-700 dark:text-slate-200">
                      #prompt-api-for-gemini-nano
                    </strong>
                  </li>
                  <li>
                    Set{" "}
                    <strong className="text-slate-700 dark:text-slate-200">
                      #optimization-guide-on-device-model
                    </strong>{" "}
                    to <em>"Enabled BypassPerfRequirement"</em>
                  </li>
                  <li>Relaunch Chrome and refresh this page.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Cloud Gemini Free Tier Key */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>Google Gemini API Key (Optional for Cloud Live Models)</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                title="Get a free key from Google AI Studio"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When on-device Gemini Nano is unavailable or when synthesizing across multiple notes,
              the hybrid router calls Cloud Gemini. Enter a free API key to enable live cloud
              inference:
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Stored locally in your browser.
            </span>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? "Saved!" : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
