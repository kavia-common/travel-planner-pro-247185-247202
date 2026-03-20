import React from "react";
import Link from "next/link";

// PUBLIC_INTERFACE
/** Custom 404 page with retro-themed styling. */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="text-7xl">🧭</span>
      <h1 className="text-4xl font-extrabold text-[var(--color-text)]">404</h1>
      <p className="text-lg font-bold text-[var(--color-secondary)]">
        Looks like you wandered off the map!
      </p>
      <p className="text-sm text-[var(--color-muted)] max-w-md">
        The page you are looking for does not exist or has been moved to a different destination.
      </p>
      <Link href="/" className="retro-btn retro-btn-primary no-underline">
        ✈️ Back to Trips
      </Link>
    </div>
  );
}
