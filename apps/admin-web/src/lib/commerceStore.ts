const SUPABASE_URL = process.env.WEBABLE_SUPABASE_URL;
const SUPABASE_KEY = process.env.WEBABLE_SUPABASE_ANON_KEY;

export type ProductRecord = {
  active: boolean;
  created_at: string;
  description: string | null;
  id: string;
  image_url: string | null;
  name: string;
  price: number;
  site_id: string;
  sort: number;
};

export type OrderStatus = "cancelled" | "done" | "paid" | "pending";

export type OrderRecord = {
  address: string | null;
  amount: number;
  contact: string;
  created_at: string;
  customer_name: string;
  id: string;
  payment_key: string | null;
  payment_method: "manual" | "toss";
  product_id: string | null;
  product_name: string;
  quantity: number;
  site_id: string;
  source: string;
  status: OrderStatus;
};

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

async function request<T>(path: string, init?: RequestInit & { prefer?: string }): Promise<T> {
  const { key, url } = assertConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: buildHeaders(key, init?.prefer ? { Prefer: init.prefer } : undefined)
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function listProducts(siteId: string, activeOnly: boolean): Promise<ProductRecord[]> {
  const query = new URLSearchParams({ order: "sort.asc,created_at.desc", select: "*", site_id: `eq.${siteId}` });

  if (activeOnly) {
    query.set("active", "eq.true");
  }

  return request<ProductRecord[]>(`webable_products?${query.toString()}`);
}

export async function getProduct(id: string): Promise<ProductRecord | null> {
  const rows = await request<ProductRecord[]>(`webable_products?id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] ?? null;
}

export async function createProduct(input: { description?: string; image_url?: string; name: string; price: number; site_id: string }): Promise<ProductRecord> {
  const rows = await request<ProductRecord[]>("webable_products", {
    body: JSON.stringify([input]),
    method: "POST",
    prefer: "return=representation"
  });
  return rows[0];
}

export async function updateProduct(id: string, patch: Partial<Pick<ProductRecord, "active" | "description" | "image_url" | "name" | "price" | "sort">>): Promise<void> {
  await request(`webable_products?id=eq.${encodeURIComponent(id)}`, {
    body: JSON.stringify(patch),
    method: "PATCH"
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await request(`webable_products?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function createOrder(input: {
  address?: string;
  amount: number;
  contact: string;
  customer_name: string;
  payment_method: "manual" | "toss";
  product_id?: string;
  product_name: string;
  quantity: number;
  site_id: string;
  source?: string;
}): Promise<OrderRecord> {
  const rows = await request<OrderRecord[]>("webable_orders", {
    body: JSON.stringify([input]),
    method: "POST",
    prefer: "return=representation"
  });
  return rows[0];
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  const rows = await request<OrderRecord[]>(`webable_orders?id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] ?? null;
}

export async function listOrders(siteId?: string): Promise<OrderRecord[]> {
  const query = new URLSearchParams({ limit: "200", order: "created_at.desc", select: "*" });

  if (siteId) {
    query.set("site_id", `eq.${siteId}`);
  }

  return request<OrderRecord[]>(`webable_orders?${query.toString()}`);
}

export async function updateOrder(id: string, patch: { payment_key?: string; status?: OrderStatus }): Promise<void> {
  await request(`webable_orders?id=eq.${encodeURIComponent(id)}`, {
    body: JSON.stringify(patch),
    method: "PATCH"
  });
}
