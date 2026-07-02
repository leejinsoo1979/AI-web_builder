"use client";

import { useState } from "react";

type PublishedFormWidgetProps = {
  action: string;
  fields: string[];
  nodeId: string;
  style: React.CSSProperties;
  title: string;
};

/**
 * Live form for published pages. Reads the site slug from the /p/<siteId>/... URL
 * so the shared published renderer does not need to thread siteId through props.
 */
export function PublishedFormWidget({ action, fields, nodeId, style, title }: PublishedFormWidgetProps) {
  const [state, setState] = useState<"error" | "idle" | "sending" | "sent">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state === "sending") {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    const values: Record<string, string> = {};

    for (const field of fields) {
      values[field] = String(data.get(field) ?? "");
    }

    const segments = window.location.pathname.split("/").filter(Boolean);
    const siteId = segments[0] === "p" && segments[1] ? segments[1] : "unknown";
    const pageId = segments.slice(2).join("/") || "home";

    setState("sending");

    try {
      const response = await fetch("/api/forms/submit", {
        body: JSON.stringify({ fields: values, formTitle: title, nodeId, pageId, siteId, source: "published" }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("submit failed");
      }

      setState("sent");
      form.reset();
      window.setTimeout(() => setState("idle"), 3200);
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 3200);
    }
  }

  return (
    <form className="ffFormWidget publishedFormWidget" onSubmit={handleSubmit} style={style}>
      <strong>{title}</strong>
      {fields.map((field, index) => (
        <label key={field}>
          <span>{field}</span>
          {index >= 2 ? <textarea aria-label={field} name={field} /> : <input aria-label={field} name={field} />}
        </label>
      ))}
      <button className={state === "sent" ? "publishedFormDone" : ""} disabled={state === "sending"} type="submit">
        {state === "sending" ? "전송 중..." : state === "sent" ? "전송 완료 ✓" : state === "error" ? "전송 실패 — 다시 시도" : action}
      </button>
    </form>
  );
}
