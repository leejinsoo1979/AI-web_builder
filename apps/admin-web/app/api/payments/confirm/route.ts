import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/commerceStore";

export const runtime = "nodejs";

const TOSS_SECRET_KEY = process.env.WEBABLE_TOSS_SECRET_KEY;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { amount?: number; orderId?: string; paymentKey?: string };
  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const paymentKey = typeof body.paymentKey === "string" ? body.paymentKey : "";
  const amount = Number(body.amount);

  if (!orderId || !paymentKey || !Number.isFinite(amount)) {
    return NextResponse.json({ message: "orderId, paymentKey, amount are required." }, { status: 400 });
  }

  if (!TOSS_SECRET_KEY) {
    return NextResponse.json({ message: "Toss secret key missing — set WEBABLE_TOSS_SECRET_KEY in .env.local" }, { status: 500 });
  }

  try {
    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ message: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    if (order.amount !== amount) {
      return NextResponse.json({ message: "결제 금액이 주문 금액과 일치하지 않습니다." }, { status: 400 });
    }

    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      body: JSON.stringify({ amount, orderId, paymentKey }),
      headers: {
        Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const tossResult = (await tossResponse.json()) as { code?: string; message?: string };

    if (!tossResponse.ok) {
      return NextResponse.json({ message: tossResult.message || "결제 승인에 실패했습니다.", tossCode: tossResult.code }, { status: 502 });
    }

    await updateOrder(orderId, { payment_key: paymentKey, status: "paid" });
    return NextResponse.json({ ok: true, orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment confirmation failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
