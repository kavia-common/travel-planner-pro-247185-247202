"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Navigation links configuration. */
const NAV_LINKS = [
  { href: "/", label: "Trips", icon: "✈️" },
  { href: "/planner", label: "Planner", icon: "📋" },
  { href: "/packing", label: "Packing", icon: "🧳" },
  { href: "/budget", label: "Budget", icon: "💰" },
  { href: "/map", label: "Map", icon: "🗺️" },
  { href: "/notifications", label: "Alerts", icon: "🔔" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
] as const;

// PUBLIC_INTERFACE
/**
 * Top navigation bar with responsive hamburger-triggered side drawer.
 * Uses retro styling consistent with the app theme.
 */
export default function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Top Bar ── */}
      <nav
        className="sticky top-0 z-50 border-b-2 border-[var(--color-border)]"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo / brand */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🌍</span>
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ color: "var(--color-primary)" }}
            >
              Travel Planner Pro
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wide no-underline transition-colors ${
                    isActive(link.href)
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-secondary)] hover:bg-[var(--color-background)]"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="retro-btn retro-btn-secondary md:hidden"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* ── Mobile Side Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside
            className="absolute left-0 top-0 h-full w-64 border-r-2 border-[var(--color-border)] p-6"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <span
                className="text-lg font-extrabold"
                style={{ color: "var(--color-primary)" }}
              >
                🌍 Menu
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="retro-btn retro-btn-secondary text-xs"
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>

            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold uppercase no-underline transition-colors ${
                      isActive(link.href)
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-secondary)] hover:bg-[var(--color-background)]"
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}
