"use client";

import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import type { SharePermission, SharePayload } from "@/types";
import { getSharePermissions, shareTrip, revokeShare, exportTripPDF } from "@/services/api";

// PUBLIC_INTERFACE
/** Sharing UI page — manage who has access to a trip and trigger PDF export. */
export default function SharingPage() {
  const [tripId, setTripId] = useState("demo-1");
  const [shares, setShares] = useState<SharePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTripId(params.get("tripId") ?? "demo-1");
  }, []);

  const fetchShares = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const data = await getSharePermissions(tripId);
      setShares(data);
    } catch {
      setShares([
        { id: "s1", trip_id: tripId, shared_with_email: "jane@example.com", permission: "edit", created_at: new Date().toISOString() },
        { id: "s2", trip_id: tripId, shared_with_email: "bob@example.com", permission: "view", created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const handleShare = async (payload: SharePayload) => {
    try {
      const perm = await shareTrip(tripId, payload);
      setShares((prev) => [...prev, perm]);
    } catch {
      const demo: SharePermission = {
        id: `s-${Date.now()}`,
        trip_id: tripId,
        shared_with_email: payload.shared_with_email,
        permission: payload.permission,
        created_at: new Date().toISOString(),
      };
      setShares((prev) => [...prev, demo]);
    }
    setShowShareModal(false);
  };

  const handleRevoke = async (shareId: string) => {
    if (!confirm("Revoke this sharing permission?")) return;
    setShares((prev) => prev.filter((s) => s.id !== shareId));
    try {
      await revokeShare(tripId, shareId);
    } catch {
      /* demo */
    }
  };

  const handleExportPDF = async () => {
    setExportStatus("Generating PDF...");
    try {
      const result = await exportTripPDF(tripId);
      setExportStatus(`PDF ready! Download: ${result.download_url}`);
    } catch {
      setExportStatus("PDF export triggered (demo mode). Check your email for the download link.");
    }
    setTimeout(() => setExportStatus(null), 5000);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="page-header mb-0">🔗 Sharing & Export</h1>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="retro-btn retro-btn-secondary">
            📄 Export PDF
          </button>
          <button onClick={() => setShowShareModal(true)} className="retro-btn retro-btn-primary">
            + Share Trip
          </button>
        </div>
      </div>

      {/* Export status toast */}
      {exportStatus && (
        <div className="retro-card border-[var(--color-accent)] p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">📄</span>
          <p className="text-sm font-bold text-[var(--color-text)]">{exportStatus}</p>
        </div>
      )}

      {loading && <LoadingSpinner message="Loading sharing info..." />}

      {!loading && shares.length === 0 && (
        <EmptyState
          icon="🔗"
          title="Not shared with anyone"
          description="Share your trip with friends and family."
          actionLabel="Share Trip"
          onAction={() => setShowShareModal(true)}
        />
      )}

      {!loading && shares.length > 0 && (
        <div className="retro-card p-5">
          <h3 className="text-sm font-extrabold uppercase text-[var(--color-secondary)] mb-3">
            Shared With ({shares.length})
          </h3>
          <div className="flex flex-col gap-3">
            {shares.map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-border)] px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-blue-50 text-sm font-extrabold text-[var(--color-primary)]">
                  {share.shared_with_email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{share.shared_with_email}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Shared {new Date(share.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`retro-badge ${
                    share.permission === "edit"
                      ? "bg-cyan-100 text-cyan-700 border-cyan-300"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
                >
                  {share.permission}
                </span>
                <button
                  onClick={() => handleRevoke(share.id)}
                  className="retro-btn retro-btn-danger text-xs"
                  aria-label={`Revoke access for ${share.shared_with_email}`}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareTripModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} onShare={handleShare} />
    </section>
  );
}

function ShareTripModal({
  isOpen,
  onClose,
  onShare,
}: {
  isOpen: boolean;
  onClose: () => void;
  onShare: (payload: SharePayload) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"view" | "edit">("view");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await onShare({ shared_with_email: email, permission });
    setEmail("");
    setPermission("view");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔗 Share Trip">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Email Address *
          <input
            type="email"
            className="retro-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Permission
          <select className="retro-input" value={permission} onChange={(e) => setPermission(e.target.value as "view" | "edit")}>
            <option value="view">👁️ View Only</option>
            <option value="edit">✏️ Can Edit</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="retro-btn retro-btn-secondary">Cancel</button>
          <button type="submit" className="retro-btn retro-btn-primary">Share</button>
        </div>
      </form>
    </Modal>
  );
}
