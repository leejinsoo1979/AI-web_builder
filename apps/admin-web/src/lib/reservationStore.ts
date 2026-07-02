const SUPABASE_URL = process.env.WEBABLE_SUPABASE_URL;
const SUPABASE_KEY = process.env.WEBABLE_SUPABASE_ANON_KEY;
const TABLE = "webable_reservations";

export type ReservationStatus = "cancelled" | "confirmed" | "done" | "requested";

export type ReservationRecord = {
  contact: string;
  created_at: string;
  customer_name: string;
  id: string;
  memo: string | null;
  node_id: string | null;
  page_id: string | null;
  reserved_date: string;
  site_id: string;
  source: string;
  status: ReservationStatus;
  time_slot: string;
};

export type ReservationInput = {
  contact: string;
  customer_name: string;
  memo?: string;
  node_id?: string;
  page_id?: string;
  reserved_date: string;
  site_id: string;
  source?: string;
  time_slot: string;
};

export class SlotTakenError extends Error {
  constructor() {
    super("Slot already reserved");
    this.name = "SlotTakenError";
  }
}

function assertConfig(): { key: string; url: string } {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase env missing — set WEBABLE_SUPABASE_URL and WEBABLE_SUPABASE_ANON_KEY in apps/admin-web/.env.local");
  }

  return { key: SUPABASE_KEY, url: SUPABASE_URL };
}

function buildHeaders(key: string, extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    apikey: key,
    ...extra
  };
}

export async function insertReservation(input: ReservationInput): Promise<ReservationRecord> {
  const { key, url } = assertConfig();
  const response = await fetch(`${url}/rest/v1/${TABLE}`, {
    body: JSON.stringify([input]),
    headers: buildHeaders(key, { Prefer: "return=representation" }),
    method: "POST"
  });

  if (response.status === 409) {
    throw new SlotTakenError();
  }

  if (!response.ok) {
    throw new Error(`Reservation insert failed (${response.status})`);
  }

  const rows = (await response.json()) as ReservationRecord[];
  return rows[0];
}

export async function listReservations(siteId?: string): Promise<ReservationRecord[]> {
  const { key, url } = assertConfig();
  const query = new URLSearchParams({ limit: "200", order: "created_at.desc", select: "*" });

  if (siteId) {
    query.set("site_id", `eq.${siteId}`);
  }

  const response = await fetch(`${url}/rest/v1/${TABLE}?${query.toString()}`, {
    cache: "no-store",
    headers: buildHeaders(key)
  });

  if (!response.ok) {
    throw new Error(`Reservation list failed (${response.status})`);
  }

  return (await response.json()) as ReservationRecord[];
}

export async function listBookedSlots(siteId: string, reservedDate: string): Promise<string[]> {
  const { key, url } = assertConfig();
  const query = new URLSearchParams({
    reserved_date: `eq.${reservedDate}`,
    select: "time_slot",
    site_id: `eq.${siteId}`,
    status: "in.(requested,confirmed)"
  });
  const response = await fetch(`${url}/rest/v1/${TABLE}?${query.toString()}`, {
    cache: "no-store",
    headers: buildHeaders(key)
  });

  if (!response.ok) {
    throw new Error(`Slot lookup failed (${response.status})`);
  }

  const rows = (await response.json()) as Array<{ time_slot: string }>;
  return rows.map((row) => row.time_slot);
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  const { key, url } = assertConfig();
  const response = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    body: JSON.stringify({ status }),
    headers: buildHeaders(key),
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error(`Reservation update failed (${response.status})`);
  }
}
