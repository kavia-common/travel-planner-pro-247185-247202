"use client";

import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import type { Notification } from "@/types";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/api";

const TYPE_ICONS: Record<Notification["type"], string> = {
  info: "ℹ️",
  reminder: "⏰",
  warning: "⚠️",
  success: "✅",
};

const TYPE_COLORS: Record<Notification["type"], string> = {
  info: "border-blue-300 bg-blue-50",
  reminder: "border-cyan-300 bg-cyan-50",
  warning: "border-yellow-300 bg-yellow-50",
  success: "border-green-300 bg-green-50",
};

// PUBLIC_INTERFACE
/** Notifications panel page — lists user notifications with read/unread toggling. */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      /* Demo fallback */
      setNotifications([
        {
          id: "n1",
          user_id: "u1",
          title: "Trip Reminder",
          message: "Your Tokyo Adventure starts in 3 days! Don't forget to pack.",
          type: "reminder",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "n2",
          user_id: "u1",
          title: "Budget Alert",
          message: "You've spent 80% of your Paris Getaway budget.",
          type: "warning",
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "n3",
          user_id: "u1",
          title: "Trip Shared",
          message: "Jane shared 'Summer in Italy' with you.",
          type: "info",
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "n4",
          user_id: "u1",
          title: "Packing Complete",
          message: "All items on your Tokyo packing list are checked off!",
          type: "success",
          is_read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch {
      /* demo */
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      /* demo */
    }
  };

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="page-header mb-0">🔔 Notifications</h1>
          {unreadCount > 0 && (
            <span className="retro-badge bg-red-100 text-red-700 border-red-300">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            className="retro-btn retro-btn-secondary"
          >
            {filter === "all" ? "Show Unread" : "Show All"}
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="retro-btn retro-btn-accent">
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner message="Loading notifications..." />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon="🔔"
          title={filter === "unread" ? "No unread notifications" : "No notifications"}
          description="You're all caught up!"
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 rounded-lg border-2 px-4 py-4 transition-colors ${
                TYPE_COLORS[notif.type]
              } ${!notif.is_read ? "border-l-4" : ""}`}
            >
              <span className="text-2xl mt-0.5">{TYPE_ICONS[notif.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-extrabold ${!notif.is_read ? "" : "text-[var(--color-muted)]"}`}>
                    {notif.title}
                  </h3>
                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  )}
                </div>
                <p className={`text-xs mt-1 ${!notif.is_read ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {formatTime(notif.created_at)}
                </p>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="retro-btn retro-btn-secondary text-xs"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
