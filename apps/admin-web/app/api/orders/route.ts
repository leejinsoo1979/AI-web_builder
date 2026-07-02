import { NextResponse } from "next/server";
import { createOrder, getProduct, listOrders, updateOrder, type OrderStatus } from "@/lib/commerceStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const siteId = new URL(request.url).searchParams.get("siteId") ?? undefined;

  try {
    const orders = await listOrders(siteId);
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load orders.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    address?: string;
    contact?: string;
    name?: string;
    paymentMethod?: string;
    productId?: string;
    quantity?: number;
    siteId?: string;
    source?: string;
  };
  const siteId = typeof body.siteId === "string" ? body.siteId.trim().slice(0, 80) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 100) : "";
  const productId = typeof body.productId === "string" ? body.productId : "";
  const quantity = Number.isInteger(body.quantity) && Number(body.quantity) > 0 ? Math.min(99, Number(body.quantity)) : 1;

  if (!siteId || !name || !contact || !productId) {
    return NextResponse.json({ message: "siteId, productId, name, contact are required." }, { status: 400 });
  }

  try {
    const product = await getProduct(productId);

    if (!product || !product.active) {
      return NextResponse.json({ message: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    const order = await createOrder({
      address: typeof body.address === "string" ? body.address.slice(0, 500) : undefined,
      amount: product.price * quantity,
      contact,
      customer_name: name,
      payment_method: body.paymentMethod === "toss" ? "toss" : "manual",
      product_id: product.id,
      product_name: product.name,
      quantity,
      site_id: siteId,
      source: body.source === "preview" ? "preview" : "published"
    });

    return NextResponse.json({ amount: order.amount, orderId: order.id, orderName: `${order.product_name} x${order.quantity}` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
  const id = typeof body.id === "string" ? body.id : "";
  const isValidStatus = body.status === "cancelled" || body.status === "done" || body.status === "paid" || body.status === "pending";

  if (!id || !isValidStatus) {
    return NextResponse.json({ message: "id and a valid status are required." }, { status: 400 });
  }

  try {
    await updateOrder(id, { status: body.status as OrderStatus });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
