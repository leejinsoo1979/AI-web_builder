"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PaySuccessContent() {
  const params = useSearchParams();
  const [state, setState] = useState<"confirming" | "done" | "error">("confirming");
  const [message, setMessage] = useState("결제를 승인하는 중입니다...");

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = Number(params.get("amount"));

    if (!paymentKey || !orderId || !Number.isFinite(amount)) {
      setState("error");
      setMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    fetch("/api/payments/confirm", {
      body: JSON.stringify({ amount, orderId, paymentKey }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message || "결제 승인에 실패했습니다.");
        }

        setState("done");
        setMessage(`결제가 완료되었습니다. 주문번호 ${orderId.slice(0, 8)}`);
      })
      .catch((error: Error) => {
        setState("error");
        setMessage(error.message);
      });
  }, [params]);

  return (
    <main className="wbPayResult">
      <div className={state === "error" ? "wbPayCard error" : "wbPayCard"}>
        <strong>{state === "confirming" ? "결제 승인 중" : state === "done" ? "결제 완료" : "결제 실패"}</strong>
        <p>{message}</p>
        <button onClick={() => window.history.length > 1 ? window.history.back() : window.close()} type="button">
          돌아가기
        </button>
      </div>
    </main>
  );
}

export default function PaySuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaySuccessContent />
    </Suspense>
  );
}
