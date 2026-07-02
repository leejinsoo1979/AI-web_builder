import { NextResponse } from "next/server";
import { listSubmissions, updateSubmissionStatus, type SubmissionStatus } from "@/lib/formStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const siteId = new URL(request.url).searchParams.get("siteId") ?? undefined;

  try {
    const submissions = await listSubmissions(siteId ?? undefined);
    return NextResponse.json({ submissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load submissions.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status === "done" || body.status === "new" || body.status === "read" ? (body.status as SubmissionStatus) : null;

  if (!id || !status) {
    return NextResponse.json({ message: "id and a valid status are required." }, { status: 400 });
  }

  try {
    await updateSubmissionStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update submission.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
