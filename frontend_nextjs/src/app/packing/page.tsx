"use client";

import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import type { PackingItem, PackingItemPayload } from "@/types";
import {
  getPackingList,
  createPackingItem,
  togglePackingItem,
  deletePackingItem,
} from "@/services/api";

const DEFAULT_CATEGORIES = ["Clothing", "Toiletries", "Electronics", "Documents", "Snacks", "Other"];

// PUBLIC_INTERFACE
/** Packing checklist page — group items by category, toggle packed status. */
export default function PackingPage() {
  const [tripId, setTripId] = useState("demo-1");
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTripId(params.get("tripId") ?? "demo-1");
  }, []);

  const fetchItems = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const list = await getPackingList(tripId);
      setItems(list.items ?? []);
    } catch {
      setItems([
        { id: "p1", packing_list_id: "pl1", name: "Passport", quantity: 1, is_packed: true, category: "Documents" },
        { id: "p2", packing_list_id: "pl1", name: "T-shirts (5)", quantity: 5, is_packed: false, category: "Clothing" },
        { id: "p3", packing_list_id: "pl1", name: "Phone Charger", quantity: 1, is_packed: false, category: "Electronics" },
        { id: "p4", packing_list_id: "pl1", name: "Sunscreen", quantity: 1, is_packed: true, category: "Toiletries" },
        { id: "p5", packing_list_id: "pl1", name: "Toothbrush", quantity: 1, is_packed: false, category: "Toiletries" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleToggle = async (item: PackingItem) => {
    const newVal = !item.is_packed;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_packed: newVal } : i)));
    try {
      await togglePackingItem(tripId, item.id, newVal);
    } catch {
      /* demo mode — already updated locally */
    }
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deletePackingItem(tripId, id);
    } catch {
      /* demo */
    }
  };

  const handleAdd = async (payload: PackingItemPayload) => {
    try {
      const item = await createPackingItem(tripId, payload);
      setItems((prev) => [...prev, item]);
    } catch {
      const demo: PackingItem = {
        id: `p-${Date.now()}`,
        packing_list_id: "pl1",
        ...payload,
        is_packed: payload.is_packed ?? false,
      };
      setItems((prev) => [...prev, demo]);
    }
    setShowAdd(false);
  };

  /* Group items by category */
  const grouped = items.reduce<Record<string, PackingItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const packedItems = items.filter((i) => i.is_packed).length;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="page-header mb-0">🧳 Packing List</h1>
        <button onClick={() => setShowAdd(true)} className="retro-btn retro-btn-primary">
          + Add Item
        </button>
      </div>

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="retro-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">
              {packedItems} / {totalItems} packed
            </span>
            <span className="text-sm font-extrabold" style={{ color: "var(--color-accent)" }}>
              {progress}%
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-[var(--color-background)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "var(--color-accent)" }}
            />
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Loading packing list..." />}

      {!loading && items.length === 0 && (
        <EmptyState
          icon="🧳"
          title="Packing list is empty"
          description="Add items you need to pack for your trip."
          actionLabel="Add Item"
          onAction={() => setShowAdd(true)}
        />
      )}

      {/* Grouped items */}
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-secondary)] mb-2 border-b-2 border-[var(--color-border)] pb-1">
            {category} ({catItems.filter((i) => i.is_packed).length}/{catItems.length})
          </h3>
          <div className="flex flex-col gap-2">
            {catItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 transition-colors ${
                  item.is_packed
                    ? "border-green-300 bg-green-50"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
              >
                <button
                  onClick={() => handleToggle(item)}
                  className={`flex h-6 w-6 items-center justify-center rounded border-2 text-xs font-bold transition-colors ${
                    item.is_packed
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-[var(--color-border)] bg-white"
                  }`}
                  aria-label={`Toggle ${item.name}`}
                >
                  {item.is_packed && "✓"}
                </button>
                <span
                  className={`flex-1 text-sm font-bold ${
                    item.is_packed ? "line-through text-[var(--color-muted)]" : ""
                  }`}
                >
                  {item.name}
                </span>
                {item.quantity > 1 && (
                  <span className="retro-badge bg-blue-100 text-blue-700 border-blue-300">
                    x{item.quantity}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-[var(--color-error)] font-bold hover:underline"
                  aria-label={`Delete ${item.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Item Modal */}
      <AddPackingItemModal isOpen={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
    </section>
  );
}

function AddPackingItemModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: PackingItemPayload) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("Other");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onAdd({ name, quantity, category, is_packed: false });
    setName("");
    setQuantity(1);
    setCategory("Other");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧳 Add Packing Item">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Item Name *
          <input className="retro-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Passport" required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            Quantity
            <input type="number" min="1" className="retro-input" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            Category
            <select className="retro-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="retro-btn retro-btn-secondary">Cancel</button>
          <button type="submit" className="retro-btn retro-btn-primary">Add Item</button>
        </div>
      </form>
    </Modal>
  );
}
