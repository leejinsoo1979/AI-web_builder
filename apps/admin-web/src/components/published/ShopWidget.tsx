"use client";

import { useEffect, useMemo, useState } from "react";

type ShopProduct = {
  active: boolean;
  description: string | null;
  id: string;
  image_url: string | null;
  name: string;
  price: number;
};

type ShopWidgetProps = {
  nodeId: string;
  siteId?: string;
  source?: "preview" | "published";
  style: React.CSSProperties;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (method: string, options: Record<string, unknown>) => Promise<void>;
    };
  }
}

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_WEBABLE_TOSS_CLIENT_KEY;

function formatPrice(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

function loadTossSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.TossPayments) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Toss SDK load failed"));
    document.head.appendChild(script);
  });
}

export function ShopWidget({ nodeId, siteId, source = "published", style }: ShopWidgetProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [buying, setBuying] = useState<ShopProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<"error" | "idle" | "sending" | "sent">("idle");
  const [message, setMessage] = useState("");

  const resolvedSiteId = useMemo(() => {
    if (siteId) {
      return siteId;
    }

    if (typeof window === "undefined") {
      return "unknown";
    }

    const segments = window.location.pathname.split("/").filter(Boolean);
    return segments[0] === "p" && segments[1] ? segments[1] : "webable-main";
  }, [siteId]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/products?siteId=${encodeURIComponent(resolvedSiteId)}`)
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: ShopProduct[] }) => {
        if (!cancelled) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(true));

    return () => {
      cancelled = true;
    };
  }, [resolvedSiteId]);

  function openCheckout(product: ShopProduct) {
    setBuying(product);
    setQuantity(1);
    setMessage("");
    setState("idle");
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>, method: "manual" | "toss") {
    event.preventDefault();

    if (!buying || state === "sending") {
      return;
    }

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();

    if (!name || !contact) {
      setMessage("이름과 연락처를 입력해주세요.");
      return;
    }

    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        body: JSON.stringify({ address, contact, name, paymentMethod: method, productId: buying.id, quantity, siteId: resolvedSiteId, source }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(error.message || "주문에 실패했습니다.");
      }

      const order = (await response.json()) as { amount: number; orderId: string; orderName: string };

      if (method === "toss") {
        if (!TOSS_CLIENT_KEY) {
          throw new Error("결제 키가 설정되지 않았습니다.");
        }

        await loadTossSdk();
        const toss = window.TossPayments?.(TOSS_CLIENT_KEY);
        await toss?.requestPayment("카드", {
          amount: order.amount,
          customerName: name,
          failUrl: `${window.location.origin}/pay/fail`,
          orderId: order.orderId,
          orderName: order.orderName,
          successUrl: `${window.location.origin}/pay/success`
        });
        setState("idle");
        return;
      }

      setState("sent");
      setMessage(`주문이 접수되었습니다. 주문번호 ${order.orderId.slice(0, 8)} · ${formatPrice(order.amount)}`);
      window.setTimeout(() => {
        setBuying(null);
        setState("idle");
      }, 2600);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "주문에 실패했습니다.");
      window.setTimeout(() => setState("idle"), 2600);
    }
  }

  return (
    <div className="wbShopWidget" data-shop-node={nodeId} style={style}>
      {!loaded ? <p className="wbShopEmpty">상품을 불러오는 중...</p> : null}
      {loaded && products.length === 0 ? <p className="wbShopEmpty">등록된 상품이 없습니다. 에디터의 상품 탭에서 추가하세요.</p> : null}
      <div className="wbShopGrid">
        {products.map((product) => (
          <article key={product.id}>
            <span className="wbShopThumb">{product.image_url ? <img alt={product.name} src={product.image_url} /> : null}</span>
            <strong>{product.name}</strong>
            {product.description ? <p>{product.description}</p> : null}
            <em>{formatPrice(product.price)}</em>
            <button onClick={() => openCheckout(product)} type="button">
              구매하기
            </button>
          </article>
        ))}
      </div>
      {buying ? (
        <div className="wbCheckoutOverlay" onClick={() => setBuying(null)}>
          <form className="wbCheckout" onClick={(event) => event.stopPropagation()} onSubmit={(event) => submitOrder(event, "manual")}>
            <header>
              <strong>{buying.name}</strong>
              <button aria-label="닫기" onClick={() => setBuying(null)} type="button">
                ×
              </button>
            </header>
            <div className="wbCheckoutQty">
              <span>수량</span>
              <div>
                <button onClick={() => setQuantity((current) => Math.max(1, current - 1))} type="button">
                  −
                </button>
                <em>{quantity}</em>
                <button onClick={() => setQuantity((current) => Math.min(99, current + 1))} type="button">
                  +
                </button>
              </div>
              <strong>{formatPrice(buying.price * quantity)}</strong>
            </div>
            <input aria-label="이름" name="name" placeholder="이름" />
            <input aria-label="연락처" name="contact" placeholder="연락처" />
            <input aria-label="배송지" name="address" placeholder="배송지 (선택)" />
            {message ? <p className={state === "error" ? "wbShopMessage error" : "wbShopMessage"}>{message}</p> : null}
            <div className="wbCheckoutActions">
              <button className="toss" disabled={state === "sending"} onClick={(event) => submitOrder(event.currentTarget.form ? ({ currentTarget: event.currentTarget.form, preventDefault: () => undefined } as unknown as React.FormEvent<HTMLFormElement>) : (event as never), "toss")} type="button">
                토스로 결제
              </button>
              <button disabled={state === "sending"} type="submit">
                {state === "sending" ? "처리 중..." : state === "sent" ? "접수 완료 ✓" : "무통장 주문"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
