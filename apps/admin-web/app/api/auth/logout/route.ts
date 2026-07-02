import { NextResponse } from "next/server";
import { clearedSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", clearedSessionCookie());
  return response;
}
