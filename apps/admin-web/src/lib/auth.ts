import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.WEBABLE_AUTH_SECRET || "";
const PASSWORD = process.env.WEBABLE_ADMIN_PASSWORD || "";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE = "webable_session";

export function isAuthConfigured() {
  return Boolean(SECRET && PASSWORD);
}

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export function checkPassword(input: string) {
  return isAuthConfigured() && safeEqual(input, PASSWORD);
}

export function createSessionToken() {
  const expires = String(Date.now() + SESSION_TTL_MS);
  return `${expires}.${sign(expires)}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [expires, signature] = token.split(".");

  if (!expires || !signature || !safeEqual(signature, sign(expires))) {
    return false;
  }

  return Number(expires) > Date.now();
}

/** Route-handler guard. Open when auth env is missing (local fallback) so a lost .env never bricks the editor. */
export function isAuthorizedRequest(request: Request) {
  if (!isAuthConfigured()) {
    return true;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.split(/;\s*/).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return verifySessionToken(match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null);
}

export function sessionCookieValue(token: string) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; SameSite=Lax`;
}

export function clearedSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
