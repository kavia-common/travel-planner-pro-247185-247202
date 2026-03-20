/**
 * Travel Planner Pro — API client service layer.
 *
 * All data fetching is client-side (static export mode).
 * The base URL is read from NEXT_PUBLIC_BACKEND_URL env variable.
 */

import type {
  Trip,
  TripPayload,
  ItineraryDay,
  Activity,
  ActivityPayload,
  Budget,
  Expense,
  ExpensePayload,
  PackingList,
  PackingItem,
  PackingItemPayload,
  SharePermission,
  SharePayload,
  Notification,
  User,
} from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

/* ───── helper ───── */

// PUBLIC_INTERFACE
/**
 * Generic fetch wrapper. Returns parsed JSON or throws an error with
 * the response status text.
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `API ${options.method ?? "GET"} ${path} failed (${res.status}): ${body}`
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

/* ═══════════════════════════════════════════
   Trips
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Fetch all trips for the current user. */
export async function getTrips(): Promise<Trip[]> {
  return request<Trip[]>("/api/trips");
}

// PUBLIC_INTERFACE
/** Fetch a single trip by ID. */
export async function getTrip(id: string): Promise<Trip> {
  return request<Trip>(`/api/trips/${id}`);
}

// PUBLIC_INTERFACE
/** Create a new trip. */
export async function createTrip(payload: TripPayload): Promise<Trip> {
  return request<Trip>("/api/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
/** Update an existing trip. */
export async function updateTrip(
  id: string,
  payload: Partial<TripPayload>
): Promise<Trip> {
  return request<Trip>(`/api/trips/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
/** Delete a trip. */
export async function deleteTrip(id: string): Promise<void> {
  return request<void>(`/api/trips/${id}`, { method: "DELETE" });
}

/* ═══════════════════════════════════════════
   Itinerary Days
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Fetch all itinerary days for a trip. */
export async function getItineraryDays(
  tripId: string
): Promise<ItineraryDay[]> {
  return request<ItineraryDay[]>(`/api/trips/${tripId}/itinerary`);
}

// PUBLIC_INTERFACE
/** Create a new itinerary day. */
export async function createItineraryDay(
  tripId: string,
  payload: { day_number: number; date: string; title?: string; notes?: string }
): Promise<ItineraryDay> {
  return request<ItineraryDay>(`/api/trips/${tripId}/itinerary`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
/** Delete an itinerary day. */
export async function deleteItineraryDay(
  tripId: string,
  dayId: string
): Promise<void> {
  return request<void>(`/api/trips/${tripId}/itinerary/${dayId}`, {
    method: "DELETE",
  });
}

/* ═══════════════════════════════════════════
   Activities
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Add an activity to an itinerary day. */
export async function createActivity(
  tripId: string,
  dayId: string,
  payload: ActivityPayload
): Promise<Activity> {
  return request<Activity>(
    `/api/trips/${tripId}/itinerary/${dayId}/activities`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

// PUBLIC_INTERFACE
/** Update an existing activity. */
export async function updateActivity(
  tripId: string,
  dayId: string,
  activityId: string,
  payload: Partial<ActivityPayload>
): Promise<Activity> {
  return request<Activity>(
    `/api/trips/${tripId}/itinerary/${dayId}/activities/${activityId}`,
    { method: "PUT", body: JSON.stringify(payload) }
  );
}

// PUBLIC_INTERFACE
/** Delete an activity. */
export async function deleteActivity(
  tripId: string,
  dayId: string,
  activityId: string
): Promise<void> {
  return request<void>(
    `/api/trips/${tripId}/itinerary/${dayId}/activities/${activityId}`,
    { method: "DELETE" }
  );
}

/* ═══════════════════════════════════════════
   Budget & Expenses
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Fetch budget for a trip. */
export async function getBudget(tripId: string): Promise<Budget> {
  return request<Budget>(`/api/trips/${tripId}/budget`);
}

// PUBLIC_INTERFACE
/** Create or update a trip budget. */
export async function upsertBudget(
  tripId: string,
  payload: { total_budget: number; currency: string }
): Promise<Budget> {
  return request<Budget>(`/api/trips/${tripId}/budget`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
/** Add an expense to a trip budget. */
export async function createExpense(
  tripId: string,
  payload: ExpensePayload
): Promise<Expense> {
  return request<Expense>(`/api/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
/** Delete an expense. */
export async function deleteExpense(
  tripId: string,
  expenseId: string
): Promise<void> {
  return request<void>(`/api/trips/${tripId}/expenses/${expenseId}`, {
    method: "DELETE",
  });
}

/* ═══════════════════════════════════════════
   Packing Lists
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Fetch packing list for a trip. */
export async function getPackingList(tripId: string): Promise<PackingList> {
  return request<PackingList>(`/api/trips/${tripId}/packing`);
}

// PUBLIC_INTERFACE
/** Add a packing item. */
export async function createPackingItem(
  tripId: string,
  payload: PackingItemPayload
): Promise<PackingItem> {
  return request<PackingItem>(`/api/trips/${tripId}/packing`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
/** Toggle packed status for a packing item. */
export async function togglePackingItem(
  tripId: string,
  itemId: string,
  isPacked: boolean
): Promise<PackingItem> {
  return request<PackingItem>(`/api/trips/${tripId}/packing/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_packed: isPacked }),
  });
}

// PUBLIC_INTERFACE
/** Delete a packing item. */
export async function deletePackingItem(
  tripId: string,
  itemId: string
): Promise<void> {
  return request<void>(`/api/trips/${tripId}/packing/${itemId}`, {
    method: "DELETE",
  });
}

/* ═══════════════════════════════════════════
   Sharing
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Get sharing permissions for a trip. */
export async function getSharePermissions(
  tripId: string
): Promise<SharePermission[]> {
  return request<SharePermission[]>(`/api/trips/${tripId}/share`);
}

// PUBLIC_INTERFACE
/** Share a trip with another user. */
export async function shareTrip(
  tripId: string,
  payload: SharePayload
): Promise<SharePermission> {
  return request<SharePermission>(`/api/trips/${tripId}/share`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
/** Revoke sharing permission. */
export async function revokeShare(
  tripId: string,
  shareId: string
): Promise<void> {
  return request<void>(`/api/trips/${tripId}/share/${shareId}`, {
    method: "DELETE",
  });
}

/* ═══════════════════════════════════════════
   Export
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Trigger PDF export for a trip. Returns a download URL. */
export async function exportTripPDF(
  tripId: string
): Promise<{ download_url: string }> {
  return request<{ download_url: string }>(
    `/api/trips/${tripId}/export/pdf`,
    { method: "POST" }
  );
}

/* ═══════════════════════════════════════════
   Notifications
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Fetch notifications for the current user. */
export async function getNotifications(): Promise<Notification[]> {
  return request<Notification[]>("/api/notifications");
}

// PUBLIC_INTERFACE
/** Mark a notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  return request<void>(`/api/notifications/${id}/read`, { method: "PATCH" });
}

// PUBLIC_INTERFACE
/** Mark all notifications as read. */
export async function markAllNotificationsRead(): Promise<void> {
  return request<void>("/api/notifications/read-all", { method: "PATCH" });
}

/* ═══════════════════════════════════════════
   Admin
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Fetch all users (admin only). */
export async function getUsers(): Promise<User[]> {
  return request<User[]>("/api/admin/users");
}

// PUBLIC_INTERFACE
/** Update a user's role (admin only). */
export async function updateUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<User> {
  return request<User>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

// PUBLIC_INTERFACE
/** Delete a user (admin only). */
export async function deleteUser(userId: string): Promise<void> {
  return request<void>(`/api/admin/users/${userId}`, { method: "DELETE" });
}

// PUBLIC_INTERFACE
/** Get admin dashboard stats. */
export async function getAdminStats(): Promise<{
  total_users: number;
  total_trips: number;
  active_trips: number;
}> {
  return request("/api/admin/stats");
}

/* ═══════════════════════════════════════════
   Health Check
   ═══════════════════════════════════════════ */

// PUBLIC_INTERFACE
/** Health check — ping the backend. */
export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>("/");
}
