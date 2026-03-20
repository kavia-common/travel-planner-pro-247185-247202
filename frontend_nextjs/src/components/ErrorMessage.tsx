"use client";

import React from "react";

// PUBLIC_INTERFACE
/**
 * Retro-themed error message display.
 * Shows an error message with an optional retry action.
 */
export default function ErrorMessage({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="retro-card flex flex-col items-center gap-3 border-[var(--color-error)] p-6 text-center"
    >
      <span className="text-3xl">⚠️</span>
      <p className="text-sm font-bold text-[var(--color-error)]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retro-btn retro-btn-secondary">
          Retry
        </button>
      )}
    </div>
  );
}
