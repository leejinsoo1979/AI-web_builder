import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, isAuthConfigured, sessionCookieValue } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ message: "인증이 설정되지 않았습니다. .env.local의 WEBABLE_ADMIN_PASSWORD를 확인하세요." }, { status: 500 });
  }

  const body = (await request.json().catch(() => ({}))) as { password?: string };

  if (typeof body.password !== "string" || !checkPassword(body.password)) {
    return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", sessionCookieValue(createSessionToken()));
  return response;
}
