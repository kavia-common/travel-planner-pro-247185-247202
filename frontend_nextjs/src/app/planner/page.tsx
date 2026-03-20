"use client";

import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import type { ItineraryDay, Activity, ActivityPayload } from "@/types";
import {
  getItineraryDays,
  createItineraryDay,
  deleteItineraryDay,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/services/api";

const CATEGORIES: Activity["category"][] = [
  "transport",
  "food",
  "sightseeing",
  "accommodation",
  "shopping",
  "entertainment",
  "other",
];

const CATEGORY_ICONS: Record<Activity["category"], string> = {
  transport: "🚌",
  food: "🍽️",
  sightseeing: "🏛️",
  accommodation: "🏨",
  shopping: "🛍️",
  entertainment: "🎭",
  other: "📌",
};

// PUBLIC_INTERFACE
/** Day-by-day itinerary planner page with activity management. */
export default function PlannerPage() {
  const [tripId, setTripId] = useState<string>("");
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDay, setShowAddDay] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState<{
    dayId: string;
    activity: Activity;
  } | null>(null);

  /* Extract tripId from URL search params client-side */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTripId(params.get("tripId") ?? "demo-1");
  }, []);

  const fetchDays = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const data = await getItineraryDays(tripId);
      setDays(data);
    } catch {
      /* Demo fallback */
      setDays([
        {
          id: "day-1",
          trip_id: tripId,
          day_number: 1,
          date: "2025-03-01",
          title: "Arrival Day",
          notes: "Check-in & explore the area",
          activities: [
            {
              id: "act-1",
              itinerary_day_id: "day-1",
              title: "Airport Transfer",
              category: "transport",
              order: 1,
              start_time: "09:00",
              end_time: "11:00",
              location: "Narita Airport",
            },
            {
              id: "act-2",
              itinerary_day_id: "day-1",
              title: "Hotel Check-in",
              category: "accommodation",
              order: 2,
              start_time: "12:00",
              end_time: "13:00",
              location: "Shinjuku Hotel",
            },
          ],
        },
        {
          id: "day-2",
          trip_id: tripId,
          day_number: 2,
          date: "2025-03-02",
          title: "Temple Tour",
          notes: "Visit historical temples",
          activities: [
            {
              id: "act-3",
              itinerary_day_id: "day-2",
              title: "Senso-ji Temple",
              category: "sightseeing",
              order: 1,
              start_time: "09:00",
              end_time: "12:00",
              location: "Asakusa",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchDays();
  }, [fetchDays]);

  /* ── Handlers ── */
  const handleAddDay = async (date: string, title: string) => {
    const dayNumber = days.length + 1;
    try {
      const newDay = await createItineraryDay(tripId, {
        day_number: dayNumber,
        date,
        title,
      });
      setDays((prev) => [...prev, newDay]);
    } catch {
      const demo: ItineraryDay = {
        id: `day-${Date.now()}`,
        trip_id: tripId,
        day_number: dayNumber,
        date,
        title,
        activities: [],
      };
      setDays((prev) => [...prev, demo]);
    }
    setShowAddDay(false);
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Delete this day and all its activities?")) return;
    try {
      await deleteItineraryDay(tripId, dayId);
    } catch {
      /* continue in demo mode */
    }
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  };

  const handleAddActivity = async (dayId: string, payload: ActivityPayload) => {
    try {
      const act = await createActivity(tripId, dayId, payload);
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, activities: [...d.activities, act] } : d
        )
      );
    } catch {
      const demo: Activity = {
        id: `act-${Date.now()}`,
        itinerary_day_id: dayId,
        ...payload,
        order: payload.order ?? 99,
      };
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId ? { ...d, activities: [...d.activities, demo] } : d
        )
      );
    }
    setShowAddActivity(null);
  };

  const handleUpdateActivity = async (
    dayId: string,
    actId: string,
    payload: Partial<ActivityPayload>
  ) => {
    try {
      const updated = await updateActivity(tripId, dayId, actId, payload);
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId
            ? {
                ...d,
                activities: d.activities.map((a) =>
                  a.id === actId ? { ...a, ...updated } : a
                ),
              }
            : d
        )
      );
    } catch {
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId
            ? {
                ...d,
                activities: d.activities.map((a) =>
                  a.id === actId ? { ...a, ...payload } : a
                ),
              }
            : d
        )
      );
    }
    setEditActivity(null);
  };

  const handleDeleteActivity = async (dayId: string, actId: string) => {
    try {
      await deleteActivity(tripId, dayId, actId);
    } catch {
      /* demo */
    }
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
          : d
      )
    );
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="page-header mb-0">📋 Itinerary Planner</h1>
        <button
          onClick={() => setShowAddDay(true)}
          className="retro-btn retro-btn-primary"
        >
          + Add Day
        </button>
      </div>

      {loading && <LoadingSpinner message="Loading itinerary..." />}

      {!loading && days.length === 0 && (
        <EmptyState
          icon="📅"
          title="No days planned"
          description="Add your first itinerary day to get started."
          actionLabel="Add Day"
          onAction={() => setShowAddDay(true)}
        />
      )}

      {/* Day cards */}
      <div className="flex flex-col gap-6">
        {days.map((day) => (
          <div key={day.id} className="retro-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg font-extrabold">
                  Day {day.day_number}: {day.title || "Untitled"}
                </h2>
                <p className="text-xs text-[var(--color-secondary)]">📅 {day.date}</p>
                {day.notes && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">{day.notes}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddActivity(day.id)}
                  className="retro-btn retro-btn-accent text-xs"
                >
                  + Activity
                </button>
                <button
                  onClick={() => handleDeleteDay(day.id)}
                  className="retro-btn retro-btn-danger text-xs"
                  aria-label={`Delete day ${day.day_number}`}
                >
                  🗑
                </button>
              </div>
            </div>

            {/* Activities list */}
            {day.activities.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] italic">
                No activities yet — add one above.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {day.activities
                  .sort((a, b) => a.order - b.order)
                  .map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
                    >
                      <span className="text-xl">{CATEGORY_ICONS[act.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{act.title}</p>
                        <p className="text-xs text-[var(--color-secondary)]">
                          {act.start_time && `${act.start_time}`}
                          {act.end_time && ` – ${act.end_time}`}
                          {act.location && ` · 📍 ${act.location}`}
                        </p>
                      </div>
                      {act.cost != null && act.cost > 0 && (
                        <span className="retro-badge bg-green-100 text-green-700 border-green-300">
                          ${act.cost}
                        </span>
                      )}
                      <button
                        onClick={() => setEditActivity({ dayId: day.id, activity: act })}
                        className="retro-btn retro-btn-secondary text-xs"
                        aria-label={`Edit activity ${act.title}`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(day.id, act.id)}
                        className="retro-btn retro-btn-danger text-xs"
                        aria-label={`Delete activity ${act.title}`}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Day Modal */}
      <AddDayModal
        isOpen={showAddDay}
        onClose={() => setShowAddDay(false)}
        onAdd={handleAddDay}
      />

      {/* Add Activity Modal */}
      {showAddActivity && (
        <ActivityFormModal
          isOpen={true}
          title="Add Activity"
          onClose={() => setShowAddActivity(null)}
          onSubmit={(p) => handleAddActivity(showAddActivity, p)}
        />
      )}

      {/* Edit Activity Modal */}
      {editActivity && (
        <ActivityFormModal
          isOpen={true}
          title="Edit Activity"
          initial={editActivity.activity}
          onClose={() => setEditActivity(null)}
          onSubmit={(p) =>
            handleUpdateActivity(editActivity.dayId, editActivity.activity.id, p)
          }
        />
      )}
    </section>
  );
}

/* ── Add Day Modal ── */
function AddDayModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (date: string, title: string) => Promise<void>;
}) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    await onAdd(date, title);
    setDate("");
    setTitle("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📅 Add Itinerary Day">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Date *
          <input type="date" className="retro-input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Title
          <input className="retro-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Arrival Day" />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="retro-btn retro-btn-secondary">Cancel</button>
          <button type="submit" className="retro-btn retro-btn-primary">Add Day</button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Activity Form Modal (Add / Edit) ── */
function ActivityFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ActivityPayload) => Promise<void>;
  title: string;
  initial?: Partial<Activity>;
}) {
  const [form, setForm] = useState<ActivityPayload>({
    title: initial?.title ?? "",
    category: initial?.category ?? "other",
    location: initial?.location ?? "",
    start_time: initial?.start_time ?? "",
    end_time: initial?.end_time ?? "",
    cost: initial?.cost ?? 0,
    notes: initial?.notes ?? "",
    description: initial?.description ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    await onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Activity Title *
          <input className="retro-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Category
          <select className="retro-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Activity["category"] })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Location
          <input className="retro-input" value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Shinjuku" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            Start Time
            <input type="time" className="retro-input" value={form.start_time ?? ""} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            End Time
            <input type="time" className="retro-input" value={form.end_time ?? ""} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Cost ($)
          <input type="number" step="0.01" min="0" className="retro-input" value={form.cost ?? 0} onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Notes
          <textarea className="retro-input min-h-[60px]" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="retro-btn retro-btn-secondary">Cancel</button>
          <button type="submit" className="retro-btn retro-btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
