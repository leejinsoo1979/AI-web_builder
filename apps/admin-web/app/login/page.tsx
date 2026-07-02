"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"error" | "idle" | "sending">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state === "sending") {
      return;
    }

    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "로그인에 실패했습니다.");
      }

      router.replace(params.get("next") || "/");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    }
  }

  return (
    <main className="waLoginPage">
      <form className="waLoginCard" onSubmit={handleSubmit}>
        <span className="waBrandMark">W</span>
        <strong>WEBABLE</strong>
        <p>사이트 소유자 비밀번호를 입력하세요.</p>
        <input
          aria-label="비밀번호"
          autoFocus
          onChange={(event) => {
            setPassword(event.target.value);
            setState("idle");
          }}
          placeholder="비밀번호"
          type="password"
          value={password}
        />
        {message ? <em>{message}</em> : null}
        <button disabled={state === "sending" || !password} type="submit">
          {state === "sending" ? "확인 중..." : "로그인"}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
