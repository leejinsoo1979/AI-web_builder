import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, isAuthConfigured, verifySessionToken } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isAuthConfigured()) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;

    if (!verifySessionToken(token)) {
      redirect("/login?next=/admin");
    }
  }

  return children;
}
