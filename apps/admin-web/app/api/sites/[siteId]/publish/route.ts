import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

type PublishedNode = {
  id: string;
  name: string;
  type:
    | "container"
    | "text"
    | "button"
    | "image"
    | "header"
    | "nav"
    | "gallery"
    | "slider"
    | "hero"
    | "products"
    | "form"
    | "map"
    | "video"
    | "testimonial"
    | "pricing"
    | "footer";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  hidden?: boolean;
  style?: Record<string, unknown>;
};

type PublishedPage = {
  id: string;
  name: string;
  path: string;
  nodes: PublishedNode[];
};

type PublishedCanvasSizes = {
  desktop?: { height: number; width: number };
  mobile?: { height: number; width: number };
  tablet?: { height: number; width: number };
};

const publishDir = path.join(process.cwd(), ".webable-published");

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      siteId: string;
    }>;
  }
) {
  const { siteId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    canvasSizes?: PublishedCanvasSizes;
    nodes?: PublishedNode[];
    pages?: PublishedPage[];
    selectedId?: string;
    selectedPageId?: string;
    siteName?: string;
  };
  const pages = Array.isArray(body.pages)
    ? body.pages
        .filter((page) => page && typeof page.id === "string" && typeof page.name === "string" && typeof page.path === "string" && Array.isArray(page.nodes))
        .map((page) => ({ ...page, nodes: page.nodes.filter(isPublishableNode) }))
    : [];
  const nodes = pages.length > 0 ? pages[0].nodes : Array.isArray(body.nodes) ? body.nodes.filter(isPublishableNode) : [];

  if (nodes.length === 0 && pages.length === 0) {
    return NextResponse.json({ message: "No publishable nodes were provided." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const publishedAt = new Date().toISOString();
  const slug = siteId.replace(/[^a-zA-Z0-9-_]/g, "-") || "site";
  const payload = {
    id: crypto.randomUUID(),
    siteId: slug,
    siteName: body.siteName || "WEBABLE Site",
    selectedId: body.selectedId,
    selectedPageId: body.selectedPageId,
    canvasSizes: normalizeCanvasSizes(body.canvasSizes),
    pages,
    nodes,
    publishedAt
  };

  await mkdir(publishDir, { recursive: true });
  await writeFile(path.join(publishDir, `${slug}.json`), JSON.stringify(payload, null, 2), "utf8");

  return NextResponse.json(
    {
      id: payload.id,
      siteId: slug,
      status: "published",
      liveUrl: `${origin}/p/${slug}`,
      publishedAt
    },
    { status: 201 }
  );
}

function normalizeCanvasSizes(value?: PublishedCanvasSizes) {
  return {
    desktop: normalizeCanvasSize(value?.desktop, { width: 1440, height: 1600 }),
    tablet: normalizeCanvasSize(value?.tablet, { width: 768, height: 1200 }),
    mobile: normalizeCanvasSize(value?.mobile, { width: 390, height: 844 })
  };
}

function normalizeCanvasSize(value: { height: number; width: number } | undefined, fallback: { height: number; width: number }) {
  return {
    height: clampSize(value?.height, fallback.height, 480, 5000),
    width: clampSize(value?.width, fallback.width, 320, 2560)
  };
}

function clampSize(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : fallback;

  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function isPublishableNode(node: PublishedNode) {
  return (
    node &&
    typeof node.id === "string" &&
    typeof node.name === "string" &&
    ["container", "text", "button", "image", "header", "nav", "gallery", "slider", "hero", "products", "form", "map", "video", "testimonial", "pricing", "footer"].includes(node.type) &&
    Number.isFinite(node.x) &&
    Number.isFinite(node.y) &&
    Number.isFinite(node.width) &&
    Number.isFinite(node.height) &&
    Number.isFinite(node.zIndex)
  );
}
