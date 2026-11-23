import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface OfflineBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ message, onRetry, onDismiss }) => {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-900/60 dark:text-amber-200 text-xs sm:text-sm transition-all animate-fadeIn">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 dark:bg-amber-800 dark:hover:bg-amber-700 font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        )}
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
