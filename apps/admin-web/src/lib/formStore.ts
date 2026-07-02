const SUPABASE_URL = process.env.WEBABLE_SUPABASE_URL;
const SUPABASE_KEY = process.env.WEBABLE_SUPABASE_ANON_KEY;
const TABLE = "webable_form_submissions";

export type SubmissionStatus = "done" | "new" | "read";

export type SubmissionRecord = {
  created_at: string;
  fields: Record<string, string>;
  form_title: string | null;
  id: string;
  node_id: string | null;
  page_id: string | null;
  site_id: string;
  source: string;
  status: SubmissionStatus;
};

export type SubmissionInput = {
  fields: Record<string, string>;
  form_title?: string;
  node_id?: string;
  page_id?: string;
  site_id: string;
  source?: string;
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

export async function insertSubmission(input: SubmissionInput): Promise<SubmissionRecord> {
  const { key, url } = assertConfig();
  const response = await fetch(`${url}/rest/v1/${TABLE}`, {
    body: JSON.stringify([input]),
    headers: buildHeaders(key, { Prefer: "return=representation" }),
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Submission insert failed (${response.status})`);
  }

  const rows = (await response.json()) as SubmissionRecord[];
  return rows[0];
}

export async function listSubmissions(siteId?: string): Promise<SubmissionRecord[]> {
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
    throw new Error(`Submission list failed (${response.status})`);
  }

  return (await response.json()) as SubmissionRecord[];
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
  const { key, url } = assertConfig();
  const response = await fetch(`${url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    body: JSON.stringify({ status }),
    headers: buildHeaders(key),
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error(`Submission update failed (${response.status})`);
  }
}
