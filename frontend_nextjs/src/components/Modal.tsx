"use client";

import React from "react";

// PUBLIC_INTERFACE
/**
 * Retro-themed modal dialog.
 * Renders children in a centered overlay with a close button.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className="retro-card relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[var(--color-text)]">{title}</h2>
          <button
            onClick={onClose}
            className="retro-btn retro-btn-secondary text-xs"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
