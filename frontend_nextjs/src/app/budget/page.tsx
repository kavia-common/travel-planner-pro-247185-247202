"use client";

import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import type { Expense, ExpensePayload } from "@/types";
import { getBudget, upsertBudget, createExpense, deleteExpense } from "@/services/api";

const EXPENSE_CATEGORIES: Expense["category"][] = [
  "transport",
  "food",
  "accommodation",
  "activities",
  "shopping",
  "other",
];

const CATEGORY_ICONS: Record<Expense["category"], string> = {
  transport: "🚌",
  food: "🍽️",
  accommodation: "🏨",
  activities: "🎯",
  shopping: "🛍️",
  other: "📦",
};

const CATEGORY_COLORS: Record<Expense["category"], string> = {
  transport: "bg-blue-100 text-blue-700 border-blue-300",
  food: "bg-orange-100 text-orange-700 border-orange-300",
  accommodation: "bg-purple-100 text-purple-700 border-purple-300",
  activities: "bg-cyan-100 text-cyan-700 border-cyan-300",
  shopping: "bg-pink-100 text-pink-700 border-pink-300",
  other: "bg-gray-100 text-gray-700 border-gray-300",
};

// PUBLIC_INTERFACE
/** Budget and expense tracker page with visual breakdown. */
export default function BudgetPage() {
  const [tripId, setTripId] = useState("demo-1");
  const [totalBudget, setTotalBudget] = useState(2000);
  const [currency, setCurrency] = useState("USD");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTripId(params.get("tripId") ?? "demo-1");
  }, []);

  const fetchBudget = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const budget = await getBudget(tripId);
      setTotalBudget(budget.total_budget);
      setCurrency(budget.currency);
      setExpenses(budget.expenses ?? []);
    } catch {
      /* Demo fallback data */
      setExpenses([
        { id: "e1", budget_id: "b1", title: "Flight tickets", amount: 450, category: "transport", date: "2025-03-01", notes: "Round trip" },
        { id: "e2", budget_id: "b1", title: "Hotel (5 nights)", amount: 600, category: "accommodation", date: "2025-03-01" },
        { id: "e3", budget_id: "b1", title: "Sushi dinner", amount: 85, category: "food", date: "2025-03-02" },
        { id: "e4", budget_id: "b1", title: "Temple entry fees", amount: 30, category: "activities", date: "2025-03-02" },
        { id: "e5", budget_id: "b1", title: "Souvenirs", amount: 120, category: "shopping", date: "2025-03-03" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  /* Category breakdown */
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  const handleAddExpense = async (payload: ExpensePayload) => {
    try {
      const exp = await createExpense(tripId, payload);
      setExpenses((prev) => [...prev, exp]);
    } catch {
      const demo: Expense = {
        id: `e-${Date.now()}`,
        budget_id: "b1",
        ...payload,
      };
      setExpenses((prev) => [...prev, demo]);
    }
    setShowAddExpense(false);
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteExpense(tripId, id);
    } catch {
      /* demo */
    }
  };

  const handleUpdateBudget = async (newBudget: number, newCurrency: string) => {
    setTotalBudget(newBudget);
    setCurrency(newCurrency);
    try {
      await upsertBudget(tripId, { total_budget: newBudget, currency: newCurrency });
    } catch {
      /* demo */
    }
    setShowEditBudget(false);
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="page-header mb-0">💰 Budget Tracker</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowEditBudget(true)} className="retro-btn retro-btn-secondary">
            ✏️ Budget
          </button>
          <button onClick={() => setShowAddExpense(true)} className="retro-btn retro-btn-primary">
            + Add Expense
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading budget..." />}

      {/* Budget summary cards */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="retro-card p-5 text-center">
            <p className="text-xs font-bold uppercase text-[var(--color-secondary)]">Total Budget</p>
            <p className="text-2xl font-extrabold" style={{ color: "var(--color-primary)" }}>
              {currency} {totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="retro-card p-5 text-center">
            <p className="text-xs font-bold uppercase text-[var(--color-secondary)]">Spent</p>
            <p className="text-2xl font-extrabold" style={{ color: "var(--color-error)" }}>
              {currency} {totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="retro-card p-5 text-center">
            <p className="text-xs font-bold uppercase text-[var(--color-secondary)]">Remaining</p>
            <p
              className="text-2xl font-extrabold"
              style={{ color: remaining >= 0 ? "var(--color-success)" : "var(--color-error)" }}
            >
              {currency} {remaining.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {!loading && totalBudget > 0 && (
        <div className="retro-card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--color-secondary)]">Budget Usage</span>
            <span
              className="text-xs font-extrabold"
              style={{ color: spentPercent > 90 ? "var(--color-error)" : "var(--color-primary)" }}
            >
              {spentPercent}%
            </span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-[var(--color-background)]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${spentPercent}%`,
                background: spentPercent > 90 ? "var(--color-error)" : "var(--color-primary)",
              }}
            />
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {!loading && categoryTotals.length > 0 && (
        <div className="retro-card p-5 mb-6">
          <h3 className="text-sm font-extrabold uppercase mb-3">Breakdown by Category</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categoryTotals.map((ct) => (
              <div
                key={ct.category}
                className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-border)] px-4 py-3"
              >
                <span className="text-xl">{CATEGORY_ICONS[ct.category]}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase">{ct.category}</p>
                  <p className="text-sm font-extrabold">
                    {currency} {ct.total.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--color-muted)]">
                  {totalSpent > 0 ? Math.round((ct.total / totalSpent) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense list */}
      {!loading && expenses.length === 0 && (
        <EmptyState
          icon="💸"
          title="No expenses yet"
          description="Track your spending by adding expenses."
          actionLabel="Add Expense"
          onAction={() => setShowAddExpense(true)}
        />
      )}

      {!loading && expenses.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-extrabold uppercase text-[var(--color-secondary)] mb-2">
            All Expenses ({expenses.length})
          </h3>
          {expenses
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((exp) => (
              <div
                key={exp.id}
                className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <span className="text-xl">{CATEGORY_ICONS[exp.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{exp.title}</p>
                  <p className="text-xs text-[var(--color-secondary)]">
                    📅 {exp.date}
                    {exp.notes && ` · ${exp.notes}`}
                  </p>
                </div>
                <span className={`retro-badge ${CATEGORY_COLORS[exp.category]}`}>
                  {exp.category}
                </span>
                <span className="text-sm font-extrabold" style={{ color: "var(--color-error)" }}>
                  -{currency} {exp.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => handleDeleteExpense(exp.id)}
                  className="text-xs text-[var(--color-error)] font-bold hover:underline"
                  aria-label={`Delete expense ${exp.title}`}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} onAdd={handleAddExpense} />

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={showEditBudget}
        onClose={() => setShowEditBudget(false)}
        currentBudget={totalBudget}
        currentCurrency={currency}
        onSave={handleUpdateBudget}
      />
    </section>
  );
}

/* ── Add Expense Modal ── */
function AddExpenseModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (payload: ExpensePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<ExpensePayload>({
    title: "",
    amount: 0,
    category: "other",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.amount <= 0) return;
    await onAdd(form);
    setForm({ title: "", amount: 0, category: "other", date: new Date().toISOString().split("T")[0], notes: "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💸 Add Expense">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Title *
          <input className="retro-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            Amount *
            <input type="number" step="0.01" min="0.01" className="retro-input" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
            Category
            <select className="retro-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Expense["category"] })}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Date
          <input type="date" className="retro-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Notes
          <input className="retro-input" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="retro-btn retro-btn-secondary">Cancel</button>
          <button type="submit" className="retro-btn retro-btn-primary">Add Expense</button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Edit Budget Modal ── */
function EditBudgetModal({
  isOpen,
  onClose,
  currentBudget,
  currentCurrency,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  currentCurrency: string;
  onSave: (budget: number, currency: string) => Promise<void>;
}) {
  const [budget, setBudget] = useState(currentBudget);
  const [cur, setCur] = useState(currentCurrency);

  useEffect(() => {
    setBudget(currentBudget);
    setCur(currentCurrency);
  }, [currentBudget, currentCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(budget, cur);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Edit Budget">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Total Budget
          <input type="number" step="1" min="0" className="retro-input" value={budget} onChange={(e) => setBudget(parseFloat(e.target.value) || 0)} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[var(--color-secondary)]">
          Currency
          <select className="retro-input" value={cur} onChange={(e) => setCur(e.target.value)}>
            {["USD", "EUR", "GBP", "JPY", "CAD", "AUD"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="retro-btn retro-btn-secondary">Cancel</button>
          <button type="submit" className="retro-btn retro-btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
