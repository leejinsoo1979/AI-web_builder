import { NextResponse } from "next/server";
import { insertReservation, listBookedSlots, listReservations, SlotTakenError, type ReservationStatus } from "@/lib/reservationStore";
import { updateReservationStatus } from "@/lib/reservationStore";

export const runtime = "nodejs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SLOT_PATTERN = /^\d{2}:\d{2}$/;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const siteId = params.get("siteId") ?? undefined;
  const date = params.get("date");

  try {
    if (date) {
      if (!siteId || !DATE_PATTERN.test(date)) {
        return NextResponse.json({ message: "siteId and a valid date are required." }, { status: 400 });
      }

      const booked = await listBookedSlots(siteId, date);
      return NextResponse.json({ booked });
    }

    const reservations = await listReservations(siteId);
    return NextResponse.json({ reservations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reservations.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    contact?: string;
    date?: string;
    memo?: string;
    name?: string;
    nodeId?: string;
    pageId?: string;
    siteId?: string;
    slot?: string;
    source?: string;
  };
  const siteId = typeof body.siteId === "string" ? body.siteId.trim().slice(0, 80) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 100) : "";
  const date = typeof body.date === "string" ? body.date : "";
  const slot = typeof body.slot === "string" ? body.slot : "";

  if (!siteId || !name || !contact || !DATE_PATTERN.test(date) || !SLOT_PATTERN.test(slot)) {
    return NextResponse.json({ message: "siteId, name, contact, date, slot are required." }, { status: 400 });
  }

  try {
    const record = await insertReservation({
      contact,
      customer_name: name,
      memo: typeof body.memo === "string" ? body.memo.slice(0, 1000) : undefined,
      node_id: typeof body.nodeId === "string" ? body.nodeId.slice(0, 120) : undefined,
      page_id: typeof body.pageId === "string" ? body.pageId.slice(0, 120) : undefined,
      reserved_date: date,
      site_id: siteId,
      source: body.source === "preview" ? "preview" : "published",
      time_slot: slot
    });

    return NextResponse.json({ id: record.id, receivedAt: record.created_at }, { status: 201 });
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return NextResponse.json({ message: "이미 예약된 시간입니다. 다른 시간을 선택하세요." }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : "Reservation failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
  const id = typeof body.id === "string" ? body.id : "";
  const isValidStatus = body.status === "cancelled" || body.status === "confirmed" || body.status === "done" || body.status === "requested";

  if (!id || !isValidStatus) {
    return NextResponse.json({ message: "id and a valid status are required." }, { status: 400 });
  }

  try {
    await updateReservationStatus(id, body.status as ReservationStatus);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update reservation.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
