"use client";

import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import type { User } from "@/types";
import { getUsers, updateUserRole, deleteUser, getAdminStats } from "@/services/api";

// PUBLIC_INTERFACE
/** Admin interface page — user management, moderation, and dashboard stats. */
export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total_users: 0, total_trips: 0, active_trips: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([getUsers(), getAdminStats()]);
      setUsers(usersData);
      setStats(statsData);
    } catch {
      /* Demo fallback */
      setUsers([
        { id: "u1", email: "admin@travelplanner.com", name: "Admin User", role: "admin", created_at: "2025-01-01T00:00:00Z" },
        { id: "u2", email: "jane@example.com", name: "Jane Doe", role: "user", created_at: "2025-01-15T00:00:00Z" },
        { id: "u3", email: "bob@example.com", name: "Bob Smith", role: "user", created_at: "2025-02-01T00:00:00Z" },
        { id: "u4", email: "alice@example.com", name: "Alice Johnson", role: "user", created_at: "2025-02-10T00:00:00Z" },
      ]);
      setStats({ total_users: 4, total_trips: 12, active_trips: 5 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    try {
      await updateUserRole(userId, newRole);
    } catch {
      /* demo */
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await deleteUser(userId);
    } catch {
      /* demo */
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section>
      <h1 className="page-header">⚙️ Admin Dashboard</h1>

      {loading && <LoadingSpinner message="Loading admin data..." />}

      {/* Stats cards */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="retro-card p-5 text-center">
            <p className="text-xs font-bold uppercase text-[var(--color-secondary)]">Total Users</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-primary)" }}>
              {stats.total_users}
            </p>
          </div>
          <div className="retro-card p-5 text-center">
            <p className="text-xs font-bold uppercase text-[var(--color-secondary)]">Total Trips</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-accent)" }}>
              {stats.total_trips}
            </p>
          </div>
          <div className="retro-card p-5 text-center">
            <p className="text-xs font-bold uppercase text-[var(--color-secondary)]">Active Trips</p>
            <p className="text-3xl font-extrabold" style={{ color: "var(--color-success)" }}>
              {stats.active_trips}
            </p>
          </div>
        </div>
      )}

      {/* User management */}
      {!loading && (
        <div className="retro-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-extrabold uppercase text-[var(--color-secondary)]">
              User Management ({filteredUsers.length})
            </h3>
            <input
              className="retro-input max-w-xs"
              placeholder="🔍 Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredUsers.length === 0 && (
            <EmptyState icon="👤" title="No users found" description="Try a different search term." />
          )}

          {/* Users table */}
          {filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[var(--color-border)]">
                    <th className="py-2 pr-4 font-extrabold text-xs uppercase text-[var(--color-secondary)]">User</th>
                    <th className="py-2 pr-4 font-extrabold text-xs uppercase text-[var(--color-secondary)]">Email</th>
                    <th className="py-2 pr-4 font-extrabold text-xs uppercase text-[var(--color-secondary)]">Role</th>
                    <th className="py-2 pr-4 font-extrabold text-xs uppercase text-[var(--color-secondary)]">Joined</th>
                    <th className="py-2 font-extrabold text-xs uppercase text-[var(--color-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[var(--color-border)]">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-blue-50 text-xs font-bold text-[var(--color-primary)]">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[var(--color-secondary)]">{user.email}</td>
                      <td className="py-3 pr-4">
                        <select
                          className="retro-input py-1 text-xs max-w-[100px]"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as "user" | "admin")}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-xs text-[var(--color-muted)]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="retro-btn retro-btn-danger text-xs"
                          aria-label={`Delete user ${user.name}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
