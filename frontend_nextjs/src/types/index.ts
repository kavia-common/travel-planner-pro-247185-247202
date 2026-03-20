/**
 * Travel Planner Pro — shared TypeScript type definitions.
 * All API response shapes and UI state types live here.
 */

/* ====== User ====== */
// PUBLIC_INTERFACE
/** Represents a user account. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar_url?: string;
  created_at: string;
}

/* ====== Trip ====== */
// PUBLIC_INTERFACE
/** Represents a travel trip. */
export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  status: "planning" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

// PUBLIC_INTERFACE
/** Payload for creating / updating a trip. */
export interface TripPayload {
  title: string;
  description?: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  status?: Trip["status"];
}

/* ====== Itinerary Day ====== */
// PUBLIC_INTERFACE
/** Represents one day in an itinerary. */
export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title?: string;
  notes?: string;
  activities: Activity[];
}

/* ====== Activity ====== */
// PUBLIC_INTERFACE
/** Represents an activity within an itinerary day. */
export interface Activity {
  id: string;
  itinerary_day_id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  category: "transport" | "food" | "sightseeing" | "accommodation" | "shopping" | "entertainment" | "other";
  cost?: number;
  notes?: string;
  order: number;
}

// PUBLIC_INTERFACE
/** Payload for creating / updating an activity. */
export interface ActivityPayload {
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  category: Activity["category"];
  cost?: number;
  notes?: string;
  order?: number;
}

/* ====== Budget ====== */
// PUBLIC_INTERFACE
/** Represents a budget for a trip. */
export interface Budget {
  id: string;
  trip_id: string;
  total_budget: number;
  currency: string;
  expenses: Expense[];
}

// PUBLIC_INTERFACE
/** Represents a single expense entry. */
export interface Expense {
  id: string;
  budget_id: string;
  title: string;
  amount: number;
  category: "transport" | "food" | "accommodation" | "activities" | "shopping" | "other";
  date: string;
  notes?: string;
}

// PUBLIC_INTERFACE
/** Payload for creating / updating an expense. */
export interface ExpensePayload {
  title: string;
  amount: number;
  category: Expense["category"];
  date: string;
  notes?: string;
}

/* ====== Packing ====== */
// PUBLIC_INTERFACE
/** Represents a packing checklist for a trip. */
export interface PackingList {
  id: string;
  trip_id: string;
  items: PackingItem[];
}

// PUBLIC_INTERFACE
/** A single packing list item. */
export interface PackingItem {
  id: string;
  packing_list_id: string;
  name: string;
  quantity: number;
  is_packed: boolean;
  category: string;
}

// PUBLIC_INTERFACE
/** Payload for creating / updating a packing item. */
export interface PackingItemPayload {
  name: string;
  quantity: number;
  is_packed?: boolean;
  category: string;
}

/* ====== Sharing ====== */
// PUBLIC_INTERFACE
/** Represents a sharing permission for a trip. */
export interface SharePermission {
  id: string;
  trip_id: string;
  shared_with_email: string;
  permission: "view" | "edit";
  created_at: string;
}

// PUBLIC_INTERFACE
/** Payload for sharing a trip. */
export interface SharePayload {
  shared_with_email: string;
  permission: "view" | "edit";
}

/* ====== Notifications ====== */
// PUBLIC_INTERFACE
/** Represents a notification entry. */
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "reminder" | "warning" | "success";
  is_read: boolean;
  created_at: string;
}

/* ====== Generic API response wrapper ====== */
// PUBLIC_INTERFACE
/** Standard paginated API response. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  total?: number;
}
