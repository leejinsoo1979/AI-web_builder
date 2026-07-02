"use client";

import { useEffect, useMemo, useState } from "react";

type BookingWidgetProps = {
  nodeId: string;
  siteId?: string;
  source?: "preview" | "published";
  style: React.CSSProperties;
  subtitle: string;
  title: string;
};

const TIME_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BookingWidget({ nodeId, siteId, source = "published", style, subtitle, title }: BookingWidgetProps) {
  const days = useMemo(() => {
    const list: Date[] = [];
    const now = new Date();

    for (let offset = 0; offset < 14; offset += 1) {
      list.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));
    }

    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
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
    setBookedSlots([]);
    setSelectedSlot("");

    fetch(`/api/reservations?siteId=${encodeURIComponent(resolvedSiteId)}&date=${selectedDate}`)
      .then((response) => (response.ok ? response.json() : { booked: [] }))
      .then((data: { booked?: string[] }) => {
        if (!cancelled) {
          setBookedSlots(Array.isArray(data.booked) ? data.booked : []);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [resolvedSiteId, selectedDate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state === "sending") {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const contact = String(data.get("contact") ?? "").trim();
    const memo = String(data.get("memo") ?? "").trim();

    if (!name || !contact) {
      setMessage("이름과 연락처를 입력해주세요.");
      return;
    }

    if (!selectedSlot) {
      setMessage("예약 시간을 선택해주세요.");
      return;
    }

    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/reservations", {
        body: JSON.stringify({
          contact,
          date: selectedDate,
          memo,
          name,
          nodeId,
          pageId: "home",
          siteId: resolvedSiteId,
          slot: selectedSlot,
          source
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (response.status === 409) {
        setBookedSlots((current) => [...current, selectedSlot]);
        setSelectedSlot("");
        setState("idle");
        setMessage("방금 마감된 시간입니다. 다른 시간을 선택해주세요.");
        return;
      }

      if (!response.ok) {
        throw new Error("reservation failed");
      }

      setState("sent");
      setBookedSlots((current) => [...current, selectedSlot]);
      setMessage(`${selectedDate} ${selectedSlot} 예약이 접수되었습니다.`);
      form.reset();
      setSelectedSlot("");
      window.setTimeout(() => setState("idle"), 3600);
    } catch {
      setState("error");
      setMessage("예약에 실패했습니다. 잠시 후 다시 시도해주세요.");
      window.setTimeout(() => setState("idle"), 3200);
    }
  }

  return (
    <form className="wbBookingWidget" onSubmit={handleSubmit} style={style}>
      <strong>{title}</strong>
      <p>{subtitle}</p>
      <div className="wbBookingDates" role="listbox" aria-label="예약 날짜">
        {days.map((day) => {
          const key = toDateKey(day);
          return (
            <button
              className={key === selectedDate ? "active" : ""}
              key={key}
              onClick={() => setSelectedDate(key)}
              type="button"
            >
              <em>{DAY_LABELS[day.getDay()]}</em>
              <span>{day.getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className="wbBookingSlots" role="listbox" aria-label="예약 시간">
        {TIME_SLOTS.map((slot) => {
          const taken = bookedSlots.includes(slot);
          return (
            <button
              className={slot === selectedSlot ? "active" : taken ? "taken" : ""}
              disabled={taken}
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              type="button"
            >
              {slot}
            </button>
          );
        })}
      </div>
      <div className="wbBookingFields">
        <input aria-label="이름" name="name" placeholder="이름" />
        <input aria-label="연락처" name="contact" placeholder="연락처" />
      </div>
      <textarea aria-label="요청사항" name="memo" placeholder="요청사항 (선택)" />
      {message ? <p className={state === "error" ? "wbBookingMessage error" : "wbBookingMessage"}>{message}</p> : null}
      <button className="wbBookingSubmit" disabled={state === "sending"} type="submit">
        {state === "sending" ? "예약 중..." : state === "sent" ? "예약 완료 ✓" : "예약하기"}
      </button>
    </form>
  );
}
