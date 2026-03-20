"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import Modal from "@/components/Modal";
import type { Trip, TripPayload } from "@/types";
import { getTrips, createTrip, deleteTrip } from "@/services/api";

/** Status badge colors. */
const STATUS_COLORS: Record<Trip["status"], string> = {
  planning: "bg-blue-100 text-blue-700 border-blue-300",
  ongoing: "bg-cyan-100 text-cyan-700 border-cyan-300",
  completed: "bg-green-100 text-green-700 border-green-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
};

// PUBLIC_INTERFACE
/** Home page — Trip Dashboard showing all user trips. */
export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
      // Populate demo data when the backend is unavailable
      setTrips([
        {
          id: "demo-1",
          user_id: "u1",
          title: "Tokyo Adventure",
          description: "Exploring Japan's capital",
          destination: "Tokyo, Japan",
          start_date: "2025-03-01",
          end_date: "2025-03-10",
          status: "planning",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-2",
          user_id: "u1",
          title: "Paris Getaway",
          description: "Romantic week in France",
          destination: "Paris, France",
          start_date: "2025-06-15",
          end_date: "2025-06-22",
          status: "ongoing",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // Fallback for demo mode
      setTrips((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="page-header mb-0">✈️ My Trips</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="retro-btn retro-btn-primary"
        >
          + New Trip
        </button>
      </div>

      {loading && <LoadingSpinner message="Loading trips..." />}
      {!loading && error && trips.length === 0 && (
        <ErrorMessage message={error} onRetry={fetchTrips} />
      )}
      {!loading && trips.length === 0 && !error && (
        <EmptyState
          icon="🌎"
          title="No trips yet"
          description="Start planning your next adventure!"
          actionLabel="Create Trip"
          onAction={() => setShowCreate(true)}
        />
      )}

      {/* Trip cards grid */}
      {!loading && trips.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div key={trip.id} className="retro-card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-extrabold">{trip.title}</h3>
                <span
                  className={`retro-badge ${STATUS_COLORS[trip.status]}`}
                >
                  {trip.status}
                </span>
              </div>
              <p className="text-xs text-[var(--color-secondary)]">
                📍 {trip.destination}
              </p>
              <p className="text-xs text-[var(--color-secondary)]">
                📅 {trip.start_date} → {trip.end_date}
              </p>
              {trip.description && (
                <p className="text-xs text-[var(--color-muted)] line-clamp-2">
                  {trip.description}
                </p>
              )}
              <div className="mt-auto flex gap-2 pt-2">
                <Link
                  href={`/planner?tripId=${trip.id}`}
                  className="retro-btn retro-btn-accent text-xs flex-1 text-center no-underline"
                >
                  Plan
                </Link>
                <Link
                  href={`/budget?tripId=${trip.id}`}
                  className="retro-btn retro-btn-secondary text-xs flex-1 text-center no-underline"
                >
                  Budget
                </Link>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="retro-btn retro-btn-danger text-xs"
                  aria-label={`Delete trip ${trip.title}`}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (payload) => {
          try {
            const newTrip = await createTrip(payload);
            setTrips((prev) => [newTrip, ...prev]);
          } catch {
            // Fallback demo
            const demo: Trip = {
              id: `demo-${Date.now()}`,
              user_id: "u1",
              ...payload,
              status: payload.status ?? "planning",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setTrips((prev) => [demo, ...prev]);
          }
          setShowCreate(false);
        }}
      />
    </section>
  );
}

/* ── Create Trip Modal ── */
function CreateTripModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: TripPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<TripPayload>({
    title: "",
    destination: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.destination || !form.start_date || !form.end_date) return;
    setSubmitting(true);
    await onCreate(form);
    setForm({ title: "", destination: "", start_date: "", end_date: "", description: "" });
    setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🌍 New Trip">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Trip Title *
          <input
            className="retro-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Summer in Italy"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Destination *
          <input
            className="retro-input"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            placeholder="e.g. Rome, Italy"
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            Start Date *
            <input
              type="date"
              className="retro-input"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            End Date *
            <input
              type="date"
              className="retro-input"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Description
          <textarea
            className="retro-input min-h-[80px]"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief trip description..."
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="retro-btn retro-btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="retro-btn retro-btn-primary">
            {submitting ? "Creating..." : "Create Trip"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
