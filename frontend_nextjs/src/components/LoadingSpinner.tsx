"use client";

import React from "react";

// PUBLIC_INTERFACE
/**
 * Retro-themed loading spinner.
 * Displays a pulsing animation with an optional message.
 */
export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)]"
        style={{ borderTopColor: "var(--color-primary)" }}
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--color-secondary)]">
        {message}
      </p>
    </div>
  );
}
