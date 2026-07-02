import { NextResponse } from "next/server";
import { insertSubmission } from "@/lib/formStore";

export const runtime = "nodejs";

type SubmitBody = {
  fields?: Record<string, unknown>;
  formTitle?: string;
  nodeId?: string;
  pageId?: string;
  siteId?: string;
  source?: string;
};

const MAX_FIELDS = 12;
const MAX_VALUE_LENGTH = 2000;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SubmitBody;
  const siteId = typeof body.siteId === "string" ? body.siteId.trim().slice(0, 80) : "";
  const rawFields = body.fields && typeof body.fields === "object" ? body.fields : null;

  if (!siteId || !rawFields) {
    return NextResponse.json({ message: "siteId and fields are required." }, { status: 400 });
  }

  const entries = Object.entries(rawFields).slice(0, MAX_FIELDS);
  const fields: Record<string, string> = {};

  for (const [key, value] of entries) {
    const cleanKey = key.trim().slice(0, 120);

    if (!cleanKey) {
      continue;
    }

    fields[cleanKey] = String(value ?? "").slice(0, MAX_VALUE_LENGTH);
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ message: "At least one field is required." }, { status: 400 });
  }

  try {
    const record = await insertSubmission({
      fields,
      form_title: typeof body.formTitle === "string" ? body.formTitle.slice(0, 200) : undefined,
      node_id: typeof body.nodeId === "string" ? body.nodeId.slice(0, 120) : undefined,
      page_id: typeof body.pageId === "string" ? body.pageId.slice(0, 120) : undefined,
      site_id: siteId,
      source: body.source === "preview" ? "preview" : "published"
    });

    return NextResponse.json({ id: record.id, receivedAt: record.created_at }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
