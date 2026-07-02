"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PayFailContent() {
  const params = useSearchParams();
  const message = params.get("message") || "결제가 취소되었거나 실패했습니다.";

  return (
    <main className="wbPayResult">
      <div className="wbPayCard error">
        <strong>결제 실패</strong>
        <p>{message}</p>
        <button onClick={() => (window.history.length > 1 ? window.history.back() : window.close())} type="button">
          돌아가기
        </button>
      </div>
    </main>
  );
}

export default function PayFailPage() {
  return (
    <Suspense fallback={null}>
      <PayFailContent />
    </Suspense>
  );
}
