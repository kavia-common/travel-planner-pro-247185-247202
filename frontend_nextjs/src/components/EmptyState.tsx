"use client";

import React from "react";

// PUBLIC_INTERFACE
/**
 * Retro-themed empty state component.
 * Displays an icon, title, description, and optional action button.
 */
export default function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  description = "Get started by creating something new.",
  actionLabel,
  onAction,
}: {
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="retro-card flex flex-col items-center justify-center gap-4 p-12 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-xl font-extrabold text-[var(--color-text)]">{title}</h3>
      <p className="text-sm text-[var(--color-secondary)]">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="retro-btn retro-btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
