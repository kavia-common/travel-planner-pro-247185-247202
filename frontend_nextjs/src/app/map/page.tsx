"use client";

import React, { useState, useEffect } from "react";

// PUBLIC_INTERFACE
/** Map view placeholder page — shows trip destinations on a conceptual map layout. */
export default function MapPage() {
  const [tripId, setTripId] = useState("demo-1");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTripId(params.get("tripId") ?? "demo-1");
  }, []);

  /* Demo destinations */
  const destinations = [
    { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, color: "#3b82f6" },
    { name: "Paris, France", lat: 48.8566, lng: 2.3522, color: "#06b6d4" },
    { name: "New York, USA", lat: 40.7128, lng: -74.006, color: "#ef4444" },
  ];

  return (
    <section>
      <h1 className="page-header">🗺️ Trip Map</h1>

      {/* Map placeholder */}
      <div className="retro-card overflow-hidden mb-6">
        <div
          className="relative flex items-center justify-center"
          style={{
            height: "400px",
            background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #fef3c7 100%)",
          }}
        >
          {/* Stylized retro map grid */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Destination pins */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <span className="text-6xl">🗺️</span>
            <h2 className="text-xl font-extrabold text-[var(--color-text)]">Interactive Map</h2>
            <p className="text-sm text-[var(--color-secondary)] text-center max-w-md">
              Map integration coming soon! Connect a mapping provider (Google Maps, Mapbox, or Leaflet) to visualize your trip destinations.
            </p>
            <div className="retro-badge bg-cyan-100 text-cyan-700 border-cyan-300">
              Trip: {tripId}
            </div>
          </div>
        </div>
      </div>

      {/* Destination list */}
      <div className="retro-card p-5">
        <h3 className="text-sm font-extrabold uppercase text-[var(--color-secondary)] mb-3">
          📍 Destinations
        </h3>
        <div className="flex flex-col gap-3">
          {destinations.map((dest, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border-2 border-[var(--color-border)] px-4 py-3"
            >
              <div
                className="h-4 w-4 rounded-full border-2"
                style={{ backgroundColor: dest.color, borderColor: dest.color }}
              />
              <div className="flex-1">
                <p className="text-sm font-bold">{dest.name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {dest.lat.toFixed(4)}, {dest.lng.toFixed(4)}
                </p>
              </div>
              <span className="retro-badge bg-blue-100 text-blue-700 border-blue-300">
                Pin {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
