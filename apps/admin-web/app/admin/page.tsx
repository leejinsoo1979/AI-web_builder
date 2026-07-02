"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  RefreshCw,
  ShoppingBag,
  Tag
} from "lucide-react";

const SITE_ID = "webable-main";

type AdminSection = "dashboard" | "forms" | "orders" | "products" | "reservations";

type FormItem = {
  created_at: string;
  fields: Record<string, string>;
  form_title: string | null;
  id: string;
  source: string;
  status: "done" | "new" | "read";
};

type ReservationItem = {
  contact: string;
  created_at: string;
  customer_name: string;
  id: string;
  memo: string | null;
  reserved_date: string;
  source: string;
  status: "cancelled" | "confirmed" | "done" | "requested";
  time_slot: string;
};

type OrderItem = {
  address: string | null;
  amount: number;
  contact: string;
  created_at: string;
  customer_name: string;
  id: string;
  payment_method: "manual" | "toss";
  product_name: string;
  quantity: number;
  status: "cancelled" | "done" | "paid" | "pending";
};

type ProductItem = {
  active: boolean;
  created_at: string;
  description: string | null;
  id: string;
  name: string;
  price: number;
};

const NAV_ITEMS: Array<{ icon: React.ReactNode; key: AdminSection; label: string }> = [
  { icon: <LayoutDashboard size={16} />, key: "dashboard", label: "대시보드" },
  { icon: <Inbox size={16} />, key: "forms", label: "문의" },
  { icon: <Calendar size={16} />, key: "reservations", label: "예약" },
  { icon: <ShoppingBag size={16} />, key: "orders", label: "주문" },
  { icon: <Tag size={16} />, key: "products", label: "상품" }
];

const FORM_STATUS_LABEL: Record<FormItem["status"], string> = { done: "완료", new: "신규", read: "읽음" };
const RESV_STATUS_LABEL: Record<ReservationItem["status"], string> = { cancelled: "취소", confirmed: "확정", done: "완료", requested: "요청" };
const ORDER_STATUS_LABEL: Record<OrderItem["status"], string> = { cancelled: "취소", done: "완료", paid: "결제됨", pending: "대기" };

function formatWon(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`;
}

function dayKey(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? 100 / (values.length - 1) : 100;
  const points = values.map((value, index) => `${index * step},${26 - (value / max) * 20}`).join(" ");

  return (
    <svg aria-hidden="true" className="waSpark" preserveAspectRatio="none" viewBox="0 0 100 28">
      <polygon className="waSparkFill" points={`0,28 ${points} 100,28`} />
      <polyline className="waSparkLine" fill="none" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Donut({ segments }: { segments: Array<{ className: string; label: string; value: number }> }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 25;

  return (
    <div className="waDonutWrap">
      <svg className="waDonut" viewBox="0 0 36 36">
        <circle className="waDonutTrack" cx="18" cy="18" fill="none" r="15.9155" strokeWidth="3.6" />
        {total > 0
          ? segments
              .filter((segment) => segment.value > 0)
              .map((segment) => {
                const percent = (segment.value / total) * 100;
                const circle = (
                  <circle
                    className={`waDonutSeg ${segment.className}`}
                    cx="18"
                    cy="18"
                    fill="none"
                    key={segment.label}
                    r="15.9155"
                    strokeDasharray={`${percent} ${100 - percent}`}
                    strokeDashoffset={offset}
                    strokeWidth="3.6"
                  />
                );
                offset -= percent;
                return circle;
              })
          : null}
      </svg>
      <div className="waDonutCenter">
        <strong>{total}</strong>
        <span>총 주문</span>
      </div>
    </div>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", { day: "numeric", hour: "2-digit", minute: "2-digit", month: "short" });
}

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");

  async function loadAll() {
    setLoading(true);

    const [formsRes, resvRes, ordersRes, productsRes] = await Promise.all([
      fetch(`/api/forms/submissions?siteId=${SITE_ID}`).then((r) => (r.ok ? r.json() : { submissions: [] })).catch(() => ({ submissions: [] })),
      fetch(`/api/reservations?siteId=${SITE_ID}`).then((r) => (r.ok ? r.json() : { reservations: [] })).catch(() => ({ reservations: [] })),
      fetch(`/api/orders?siteId=${SITE_ID}`).then((r) => (r.ok ? r.json() : { orders: [] })).catch(() => ({ orders: [] })),
      fetch(`/api/products?siteId=${SITE_ID}&scope=all`).then((r) => (r.ok ? r.json() : { products: [] })).catch(() => ({ products: [] }))
    ]);

    setForms(formsRes.submissions ?? []);
    setReservations(resvRes.reservations ?? []);
    setOrders(ordersRes.orders ?? []);
    setProducts(productsRes.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  function patchForm(id: string, status: FormItem["status"]) {
    setForms((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    void fetch("/api/forms/submissions", { body: JSON.stringify({ id, status }), headers: { "Content-Type": "application/json" }, method: "PATCH" }).catch(() => undefined);
  }

  function patchReservation(id: string, status: ReservationItem["status"]) {
    setReservations((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    void fetch("/api/reservations", { body: JSON.stringify({ id, status }), headers: { "Content-Type": "application/json" }, method: "PATCH" }).catch(() => undefined);
  }

  function patchOrder(id: string, status: OrderItem["status"]) {
    setOrders((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    void fetch("/api/orders", { body: JSON.stringify({ id, status }), headers: { "Content-Type": "application/json" }, method: "PATCH" }).catch(() => undefined);
  }

  async function addProduct() {
    const name = newName.trim();
    const price = Math.round(Number(newPrice));

    if (!name || !Number.isFinite(price) || price < 0) {
      return;
    }

    const response = await fetch("/api/products", {
      body: JSON.stringify({ description: newDesc.trim() || undefined, name, price, siteId: SITE_ID }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    }).catch(() => null);

    if (response?.ok) {
      setNewName("");
      setNewPrice("");
      setNewDesc("");
      void loadAll();
    }
  }

  function toggleProduct(item: ProductItem) {
    setProducts((current) => current.map((product) => (product.id === item.id ? { ...product, active: !product.active } : product)));
    void fetch("/api/products", { body: JSON.stringify({ active: !item.active, id: item.id }), headers: { "Content-Type": "application/json" }, method: "PATCH" }).catch(() => undefined);
  }

  function removeProduct(id: string) {
    setProducts((current) => current.filter((product) => product.id !== id));
    void fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => undefined);
  }

  const stats = useMemo(() => {
    const paidTotal = orders.filter((order) => order.status === "paid" || order.status === "done").reduce((sum, order) => sum + order.amount, 0);
    return {
      newForms: forms.filter((item) => item.status === "new").length,
      paidTotal,
      pendingOrders: orders.filter((item) => item.status === "pending").length,
      requestedReservations: reservations.filter((item) => item.status === "requested").length
    };
  }, [forms, orders, reservations]);

  const daily = useMemo(() => {
    const days: Array<{ count: number; key: string; label: string; revenue: number }> = [];

    for (let back = 6; back >= 0; back -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - back);
      const key = dayKey(date);
      const dayOrders = orders.filter((item) => dayKey(new Date(item.created_at)) === key);
      const activity =
        forms.filter((item) => dayKey(new Date(item.created_at)) === key).length +
        reservations.filter((item) => dayKey(new Date(item.created_at)) === key).length +
        dayOrders.length;

      days.push({
        count: activity,
        key,
        label: back === 0 ? "오늘" : date.toLocaleDateString("ko-KR", { weekday: "short" }),
        revenue: dayOrders.filter((item) => item.status !== "cancelled").reduce((sum, item) => sum + item.amount, 0)
      });
    }

    return days;
  }, [forms, orders, reservations]);

  const orderStatusSegments = useMemo(
    () => [
      { className: "amber", label: "결제 대기", value: orders.filter((item) => item.status === "pending").length },
      { className: "blue", label: "결제 완료", value: orders.filter((item) => item.status === "paid").length },
      { className: "green", label: "배송 완료", value: orders.filter((item) => item.status === "done").length },
      { className: "gray", label: "취소", value: orders.filter((item) => item.status === "cancelled").length }
    ],
    [orders]
  );

  const recentActivity = useMemo(() => {
    const merged = [
      ...forms.map((item) => ({ at: item.created_at, id: `f-${item.id}`, kind: "문의", title: item.form_title || "문의", detail: Object.values(item.fields)[0] || "" })),
      ...reservations.map((item) => ({ at: item.created_at, id: `r-${item.id}`, kind: "예약", title: item.customer_name, detail: `${item.reserved_date} ${item.time_slot}` })),
      ...orders.map((item) => ({ at: item.created_at, id: `o-${item.id}`, kind: "주문", title: `${item.product_name} ×${item.quantity}`, detail: formatWon(item.amount) }))
    ];
    return merged.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
  }, [forms, orders, reservations]);

  const active = NAV_ITEMS.find((item) => item.key === section);

  return (
    <div className="waShell">
      <aside className="waSidebar">
        <div className="waBrand">
          <span className="waBrandMark">W</span>
          <div>
            <strong>WEBABLE</strong>
            <em>사이트 관리</em>
          </div>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button className={section === item.key ? "active" : ""} key={item.key} onClick={() => setSection(item.key)} type="button">
              {item.icon}
              <span>{item.label}</span>
              {item.key === "forms" && stats.newForms > 0 ? <em>{stats.newForms}</em> : null}
              {item.key === "reservations" && stats.requestedReservations > 0 ? <em>{stats.requestedReservations}</em> : null}
              {item.key === "orders" && stats.pendingOrders > 0 ? <em>{stats.pendingOrders}</em> : null}
            </button>
          ))}
        </nav>
        <a className="waBackToEditor" href="/">
          <ChevronLeft size={15} />
          에디터로 돌아가기
        </a>
        <button
          className="waLogout"
          onClick={() => {
            void fetch("/api/auth/logout", { method: "POST" }).then(() => {
              window.location.href = "/login";
            });
          }}
          type="button"
        >
          로그아웃
        </button>
      </aside>

      <main className="waMain">
        <header className="waHeader">
          <div>
            <h1>{active?.label}</h1>
            <p>
              {section === "dashboard"
                ? "사이트 운영 현황을 한눈에 확인하세요."
                : section === "forms"
                ? "게시된 사이트에서 접수된 문의를 관리합니다."
                : section === "reservations"
                ? "예약 요청을 확정하고 일정을 관리합니다."
                : section === "orders"
                ? "주문과 결제 상태를 관리합니다."
                : "쇼핑몰에 노출되는 상품을 관리합니다."}
            </p>
          </div>
          <div className="waHeaderActions">
            <button disabled={loading} onClick={() => void loadAll()} type="button">
              <RefreshCw size={14} />
              {loading ? "불러오는 중" : "새로고침"}
            </button>
            <a href={`/p/${SITE_ID}`} rel="noreferrer" target="_blank">
              사이트 보기
              <ArrowUpRight size={14} />
            </a>
          </div>
        </header>

        {section === "dashboard" ? (
          <>
            <div className="waStatGrid v2">
              <div className="waStatCard v2 accent">
                <div className="waStatTop">
                  <span>결제 완료 매출</span>
                  <em>7일 {formatWon(daily.reduce((sum, day) => sum + day.revenue, 0))}</em>
                </div>
                <strong>{formatWon(stats.paidTotal)}</strong>
                <Sparkline values={daily.map((day) => day.revenue)} />
              </div>
              <div className="waStatCard v2">
                <div className="waStatTop">
                  <span>주문</span>
                  <em>대기 {stats.pendingOrders}</em>
                </div>
                <strong>{orders.length}</strong>
                <Sparkline values={daily.map((day) => day.count)} />
              </div>
              <div className="waStatCard v2">
                <div className="waStatTop">
                  <span>예약</span>
                  <em>요청 {stats.requestedReservations}</em>
                </div>
                <strong>{reservations.length}</strong>
                <Sparkline values={daily.map((day) => day.count)} />
              </div>
              <div className="waStatCard v2">
                <div className="waStatTop">
                  <span>문의</span>
                  <em>신규 {stats.newForms}</em>
                </div>
                <strong>{forms.length}</strong>
                <Sparkline values={daily.map((day) => day.count)} />
              </div>
            </div>

            <div className="waDashGrid">
              <section className="waPanel waChartPanel">
                <div className="waPanelHead">
                  <h2>최근 7일 주문 금액</h2>
                  <span>{formatWon(daily.reduce((sum, day) => sum + day.revenue, 0))}</span>
                </div>
                <div className="waBarChart">
                  {daily.map((day) => {
                    const max = Math.max(...daily.map((item) => item.revenue), 1);
                    return (
                      <div className="waBarCol" key={day.key}>
                        <em>{day.revenue > 0 ? formatWon(day.revenue) : ""}</em>
                        <div className="waBarTrack">
                          <div className={day.revenue > 0 ? "waBar" : "waBar empty"} style={{ height: `${Math.max(3, (day.revenue / max) * 100)}%` }} />
                        </div>
                        <span className={day.label === "오늘" ? "today" : ""}>{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="waPanel waTodoPanel">
                <div className="waPanelHead">
                  <h2>처리 대기</h2>
                </div>
                {[
                  { count: stats.newForms, key: "forms" as AdminSection, label: "신규 문의 확인" },
                  { count: stats.requestedReservations, key: "reservations" as AdminSection, label: "예약 확정 대기" },
                  { count: stats.pendingOrders, key: "orders" as AdminSection, label: "입금 확인 대기" }
                ].map((todo) => (
                  <button className={todo.count > 0 ? "waTodo" : "waTodo clear"} key={todo.key} onClick={() => setSection(todo.key)} type="button">
                    <strong>{todo.count}</strong>
                    <span>{todo.label}</span>
                    <ChevronRight size={15} />
                  </button>
                ))}
                <p className="waTodoHint">
                  {stats.newForms + stats.requestedReservations + stats.pendingOrders === 0 ? "모든 요청을 처리했습니다 ✨" : "클릭하면 해당 목록으로 이동합니다."}
                </p>
              </section>
            </div>

            <div className="waDashGrid bottom">
              <section className="waPanel">
                <div className="waPanelHead">
                  <h2>최근 활동</h2>
                </div>
                {recentActivity.length === 0 ? (
                  <p className="waEmpty">아직 활동이 없습니다. 사이트를 게시하고 첫 방문자를 맞이해보세요.</p>
                ) : (
                  <ul className="waActivity">
                    {recentActivity.map((item) => (
                      <li key={item.id}>
                        <em data-kind={item.kind}>{item.kind}</em>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                        <time>{formatTime(item.at)}</time>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="waPanel waDonutPanel">
                <div className="waPanelHead">
                  <h2>주문 상태</h2>
                </div>
                <div className="waDonutLayout">
                  <Donut segments={orderStatusSegments} />
                  <ul className="waDonutLegend">
                    {orderStatusSegments.map((segment) => (
                      <li key={segment.label}>
                        <i className={segment.className} />
                        <span>{segment.label}</span>
                        <strong>{segment.value}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </>
        ) : null}

        {section === "forms" ? (
          <section className="waPanel">
            {forms.length === 0 ? (
              <p className="waEmpty">접수된 문의가 없습니다.</p>
            ) : (
              <table className="waTable">
                <thead>
                  <tr>
                    <th>폼</th>
                    <th>내용</th>
                    <th>출처</th>
                    <th>접수 시각</th>
                    <th>상태</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {forms.map((item) => (
                    <tr className={item.status === "new" ? "isNew" : ""} key={item.id}>
                      <td>{item.form_title || "문의"}</td>
                      <td className="waFields">
                        {Object.entries(item.fields).map(([key, value]) => (
                          <span key={key}>
                            <em>{key}</em> {value || "-"}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span className={`waPill ${item.source === "preview" ? "gray" : "green"}`}>{item.source === "preview" ? "프리뷰" : "게시"}</span>
                      </td>
                      <td>{formatTime(item.created_at)}</td>
                      <td>
                        <span className={`waPill ${item.status === "new" ? "blue" : item.status === "done" ? "green" : "gray"}`}>{FORM_STATUS_LABEL[item.status]}</span>
                      </td>
                      <td className="waRowActions">
                        {item.status === "new" ? (
                          <button onClick={() => patchForm(item.id, "read")} type="button">
                            읽음
                          </button>
                        ) : null}
                        {item.status !== "done" ? (
                          <button className="primary" onClick={() => patchForm(item.id, "done")} type="button">
                            완료
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : null}

        {section === "reservations" ? (
          <section className="waPanel">
            {reservations.length === 0 ? (
              <p className="waEmpty">예약이 없습니다.</p>
            ) : (
              <table className="waTable">
                <thead>
                  <tr>
                    <th>고객</th>
                    <th>일시</th>
                    <th>연락처</th>
                    <th>요청사항</th>
                    <th>상태</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((item) => (
                    <tr key={item.id}>
                      <td>{item.customer_name}</td>
                      <td>
                        {item.reserved_date} <strong>{item.time_slot}</strong>
                      </td>
                      <td>{item.contact}</td>
                      <td className="waMuted">{item.memo || "-"}</td>
                      <td>
                        <span className={`waPill ${item.status === "requested" ? "amber" : item.status === "confirmed" ? "blue" : item.status === "done" ? "green" : "gray"}`}>
                          {RESV_STATUS_LABEL[item.status]}
                        </span>
                      </td>
                      <td className="waRowActions">
                        {item.status === "requested" ? (
                          <button className="primary" onClick={() => patchReservation(item.id, "confirmed")} type="button">
                            확정
                          </button>
                        ) : null}
                        {item.status === "confirmed" ? (
                          <button className="primary" onClick={() => patchReservation(item.id, "done")} type="button">
                            완료
                          </button>
                        ) : null}
                        {item.status === "requested" || item.status === "confirmed" ? (
                          <button onClick={() => patchReservation(item.id, "cancelled")} type="button">
                            취소
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : null}

        {section === "orders" ? (
          <section className="waPanel">
            {orders.length === 0 ? (
              <p className="waEmpty">주문이 없습니다.</p>
            ) : (
              <table className="waTable">
                <thead>
                  <tr>
                    <th>상품</th>
                    <th>금액</th>
                    <th>주문자</th>
                    <th>결제</th>
                    <th>주문 시각</th>
                    <th>상태</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.product_name} <span className="waMuted">×{item.quantity}</span>
                      </td>
                      <td>
                        <strong>{formatWon(item.amount)}</strong>
                      </td>
                      <td>
                        {item.customer_name}
                        <div className="waMuted">{item.contact}</div>
                      </td>
                      <td>
                        <span className={`waPill ${item.payment_method === "toss" ? "blue" : "purple"}`}>{item.payment_method === "toss" ? "토스" : "무통장"}</span>
                      </td>
                      <td>{formatTime(item.created_at)}</td>
                      <td>
                        <span className={`waPill ${item.status === "pending" ? "amber" : item.status === "paid" ? "blue" : item.status === "done" ? "green" : "gray"}`}>
                          {ORDER_STATUS_LABEL[item.status]}
                        </span>
                      </td>
                      <td className="waRowActions">
                        {item.status === "pending" ? (
                          <button className="primary" onClick={() => patchOrder(item.id, "paid")} type="button">
                            입금 확인
                          </button>
                        ) : null}
                        {item.status === "paid" ? (
                          <button className="primary" onClick={() => patchOrder(item.id, "done")} type="button">
                            배송 완료
                          </button>
                        ) : null}
                        {item.status === "pending" || item.status === "paid" ? (
                          <button onClick={() => patchOrder(item.id, "cancelled")} type="button">
                            취소
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : null}

        {section === "products" ? (
          <>
            <section className="waPanel waProductForm">
              <h2>새 상품</h2>
              <div>
                <input onChange={(event) => setNewName(event.target.value)} placeholder="상품명" value={newName} />
                <input onChange={(event) => setNewPrice(event.target.value)} placeholder="가격 (원)" type="number" value={newPrice} />
                <input className="wide" onChange={(event) => setNewDesc(event.target.value)} placeholder="설명 (선택)" value={newDesc} />
                <button disabled={!newName.trim() || !newPrice} onClick={() => void addProduct()} type="button">
                  상품 추가
                </button>
              </div>
            </section>
            <section className="waPanel">
              {products.length === 0 ? (
                <p className="waEmpty">등록된 상품이 없습니다. 위에서 첫 상품을 추가하세요.</p>
              ) : (
                <table className="waTable">
                  <thead>
                    <tr>
                      <th>상품명</th>
                      <th>가격</th>
                      <th>설명</th>
                      <th>상태</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr className={item.active ? "" : "isInactive"} key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          <strong>{formatWon(item.price)}</strong>
                        </td>
                        <td className="waMuted">{item.description || "-"}</td>
                        <td>
                          <span className={`waPill ${item.active ? "green" : "gray"}`}>{item.active ? "판매 중" : "중지"}</span>
                        </td>
                        <td className="waRowActions">
                          <button onClick={() => toggleProduct(item)} type="button">
                            {item.active ? "판매 중지" : "판매 재개"}
                          </button>
                          <button className="danger" onClick={() => removeProduct(item.id)} type="button">
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
