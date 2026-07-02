import { NextResponse } from "next/server";
import { createProduct, deleteProduct, listProducts, updateProduct } from "@/lib/commerceStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const siteId = params.get("siteId") ?? "";
  const scope = params.get("scope");

  if (!siteId) {
    return NextResponse.json({ message: "siteId is required." }, { status: 400 });
  }

  try {
    const products = await listProducts(siteId, scope !== "all");
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load products.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { description?: string; imageUrl?: string; name?: string; price?: number; siteId?: string };
  const siteId = typeof body.siteId === "string" ? body.siteId.trim().slice(0, 80) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const price = Number.isFinite(body.price) ? Math.max(0, Math.round(Number(body.price))) : NaN;

  if (!siteId || !name || !Number.isFinite(price)) {
    return NextResponse.json({ message: "siteId, name, price are required." }, { status: 400 });
  }

  try {
    const product = await createProduct({
      description: typeof body.description === "string" ? body.description.slice(0, 2000) : undefined,
      image_url: typeof body.imageUrl === "string" ? body.imageUrl.slice(0, 1000) : undefined,
      name,
      price,
      site_id: siteId
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { active?: boolean; description?: string; id?: string; name?: string; price?: number };
  const id = typeof body.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ message: "id is required." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim().slice(0, 200);
  if (typeof body.description === "string") patch.description = body.description.slice(0, 2000);
  if (Number.isFinite(body.price)) patch.price = Math.max(0, Math.round(Number(body.price)));

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ message: "Nothing to update." }, { status: 400 });
  }

  try {
    await updateProduct(id, patch);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";

  if (!id) {
    return NextResponse.json({ message: "id is required." }, { status: 400 });
  }

  try {
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
