import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { PublishedFormWidget } from "@/components/published/PublishedFormWidget";
import { BookingWidget } from "@/components/published/BookingWidget";
import { ShopWidget } from "@/components/published/ShopWidget";
import { PublishedInteractionNode } from "@/components/published/PublishedInteractionNode";
import type { Interaction } from "@webable/interaction-runtime";

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
    | "footer"
    | "booking";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  hidden?: boolean;
  interactions?: Interaction[];
  hiddenOnPageIds?: string[];
  positionMode?: "fixed" | "normal" | "sticky";
  scope?: "page" | "site";
  style?: {
    text?: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    background?: string;
    radius?: number;
    align?: "left" | "center" | "right";
    padding?: number;
    border?: string;
    borderOpacity?: number;
    borderPosition?: "center" | "inside" | "outside";
    fontFamily?: string;
    imageOffsetX?: number;
    imageOffsetY?: number;
    imageScale?: number;
    letterSpacing?: number;
    lineHeight?: number;
    imageUrl?: string;
    mapUrl?: string;
    videoUrl?: string;
  };
};

type PublishedSite = {
  canvasSizes?: {
    desktop?: { height: number; width: number };
    mobile?: { height: number; width: number };
    tablet?: { height: number; width: number };
  };
  siteName: string;
  nodes: PublishedNode[];
  siteNodes?: PublishedNode[];
  pages?: Array<{
    id: string;
    name: string;
    path: string;
    nodes: PublishedNode[];
  }>;
  publishedAt?: string;
};
type MenuItem = {
  children: string[];
  label: string;
};

const publishDir = path.join(process.cwd(), ".webable-published");

export default async function PublishedPage({
  params
}: {
  params: Promise<{
    siteId: string;
  }>;
}) {
  const { siteId } = await params;
  const site = await readPublishedSite(siteId);

  if (!site) {
    return (
      <main className="publishedMissing">
        <div>
          <strong>Published site not found</strong>
          <p>아직 이 주소로 배포된 사이트가 없습니다.</p>
          <Link href="/">Back to editor</Link>
        </div>
      </main>
    );
  }

  const pages = normalizePages(site);
  const currentPage = pages[0];

  return (
    <main className="publishedPage">
      <PublishedNav pages={pages} siteId={siteId} />
      <PublishedCanvas
        canvasSizes={site.canvasSizes}
        nodes={[...(site.siteNodes || []).filter((node) => !node.hiddenOnPageIds?.includes(currentPage.id)), ...currentPage.nodes]}
        pages={pages}
        siteName={site.siteName}
      />
    </main>
  );
}

export function PublishedCanvas({
  canvasSizes,
  nodes,
  pages = [],
  siteName
}: {
  canvasSizes?: PublishedSite["canvasSizes"];
  nodes: PublishedNode[];
  pages?: Array<{ id: string; name: string; path: string; nodes: PublishedNode[] }>;
  siteName: string;
}) {
  const visibleNodes = nodes.filter((node) => !node.hidden).sort((a, b) => a.zIndex - b.zIndex);
  const responsiveSizes = normalizeResponsiveCanvasSizes(canvasSizes);
  const pagePaths = Object.fromEntries(pages.map((page) => [page.id, page.path]));

  return (
    <div className="publishedArtboard" aria-label={siteName} style={getResponsiveCanvasStyle(responsiveSizes)}>
      {visibleNodes.map((node) => (
        <PublishedInteractionNode
          className="publishedNode"
          interactions={node.interactions}
          key={node.id}
          nodeId={node.id}
          pagePaths={pagePaths}
          style={{
            position: node.positionMode === "fixed" ? "fixed" : node.positionMode === "sticky" ? "sticky" : undefined,
            ...getResponsiveNodeStyle(node, responsiveSizes),
            zIndex: node.positionMode === "fixed" || node.positionMode === "sticky" ? 10000 + node.zIndex : node.zIndex
          }}
        >
          <RenderPublishedNode node={node} />
        </PublishedInteractionNode>
      ))}
    </div>
  );
}

export function PublishedNav({
  pages,
  siteId
}: {
  pages: Array<{ id: string; name: string; path: string; nodes: PublishedNode[] }>;
  siteId: string;
}) {
  if (pages.length <= 1) {
    return null;
  }

  return (
    <nav className="publishedNav">
      {pages.map((page) => (
        <Link href={page.path === "/" ? `/p/${siteId}` : `/p/${siteId}${page.path}`} key={page.id}>
          {page.name}
        </Link>
      ))}
    </nav>
  );
}

function RenderPublishedNode({ node }: { node: PublishedNode }) {
  const horizontalAlign = getTextHorizontalAlignment(node.style?.align);
  const imageTransform = getImageCropTransform(node.style);
  const style = {
    background: node.style?.background,
    borderRadius: node.style?.radius,
    color: node.style?.color,
    fontFamily: node.style?.fontFamily,
    fontSize: node.style?.fontSize,
    fontWeight: node.style?.fontWeight,
    letterSpacing: typeof node.style?.letterSpacing === "number" ? node.style.letterSpacing : undefined,
    lineHeight: node.style?.lineHeight,
    padding: node.style?.padding,
    textAlign: node.style?.align,
    ...getBorderRenderStyle(node.style),
    ...horizontalAlign,
    ...imageTransform
  } as React.CSSProperties;

  if (node.type === "text") {
    return (
      <div className="publishedTextNode" style={style}>
        {node.style?.text}
      </div>
    );
  }

  if (node.type === "button") {
    return (
      <div className="publishedButtonNode" style={style}>
        {node.style?.text}
      </div>
    );
  }

  if (node.type === "image") {
    return (
      <div className="publishedImageNode" style={style}>
        {node.style?.imageUrl ? (
          <div className="publishedImageMask">
            <img alt={node.name} className="publishedImageCropImage" src={node.style.imageUrl} />
          </div>
        ) : (
          <span />
        )}
      </div>
    );
  }

  if (node.type === "header") {
    const header = getHeaderContent(node.style?.text);
    return (
      <div className="ffHeaderWidget" style={style}>
        <strong>{header.brand}</strong>
        <nav>
          <MenuItems items={header.links} />
        </nav>
        <button type="button">{header.action}</button>
      </div>
    );
  }

  if (node.type === "nav") {
    const items = parseMenuItems(node.style?.text || "Home,Shop>Flowers;Plants;Gifts,About,Contact");
    return (
      <div className="ffNavWidget" style={style}>
        <MenuItems items={items} />
      </div>
    );
  }

  if (node.type === "gallery") {
    return (
      <div className="ffGalleryWidget" style={style}>
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index}>
            <em />
          </span>
        ))}
      </div>
    );
  }

  if (node.type === "slider") {
    const slider = splitContent(node.style?.text, ["Featured collection", "01 / 03"]);
    return (
      <div className="ffSliderWidget" style={style}>
        <div>
          <strong>{slider[0]}</strong>
          <span>{slider[1]}</span>
        </div>
        <section>
          <button type="button">‹</button>
          <button type="button">›</button>
        </section>
        <footer>
          <i />
          <i />
          <i />
        </footer>
      </div>
    );
  }

  if (node.type === "hero") {
    const hero = splitContent(node.style?.text, ["Build a sharper landing page", "브랜드 메시지와 CTA를 한 화면에 배치하는 히어로 섹션입니다.", "Explore"]);
    return (
      <div className="ffHeroWidget" style={style}>
        <section>
          <span>NEW COLLECTION</span>
          <strong>{hero[0]}</strong>
          <p>{hero[1]}</p>
          <button type="button">{hero[2]}</button>
        </section>
        <aside>
          <i />
        </aside>
      </div>
    );
  }

  if (node.type === "products") {
    return <ShopWidget nodeId={node.id} style={style} />;
  }

  if (node.type === "form") {
    const form = getFormContent(node.style?.text);
    return <PublishedFormWidget action={form.action} fields={form.fields} nodeId={node.id} style={style} title={form.title} />;
  }

  if (node.type === "booking") {
    const booking = splitContent(node.style?.text, ["방문 예약", "원하는 날짜와 시간을 선택하세요."]);
    return <BookingWidget nodeId={node.id} style={style} subtitle={booking[1]} title={booking[0]} />;
  }

  if (node.type === "map") {
    const mapUrl = getMapEmbedUrl(node.style?.mapUrl);

    return (
      <div className="ffMapWidget" style={style}>
        {mapUrl ? <iframe loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapUrl} title={node.style?.text || node.name} /> : <span />}
        <strong>{node.style?.text || "Location map"}</strong>
      </div>
    );
  }

  if (node.type === "video") {
    const video = getVideoEmbed(node.style?.videoUrl);

    return (
      <div className="ffVideoWidget" style={style}>
        {video?.type === "iframe" ? <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen src={video.src} title={node.style?.text || node.name} /> : null}
        {video?.type === "video" ? <video controls src={video.src} title={node.style?.text || node.name} /> : null}
        {!video ? (
          <>
            <button type="button">▶</button>
            <strong>{node.style?.text || "Brand film"}</strong>
          </>
        ) : null}
      </div>
    );
  }

  if (node.type === "testimonial") {
    return (
      <div className="ffTestimonialWidget" style={style}>
        <strong>“</strong>
        <p>{node.style?.text || "고객 후기를 시각적으로 배치하는 리뷰 섹션입니다."}</p>
        <span>Customer review</span>
      </div>
    );
  }

  if (node.type === "pricing") {
    const plans = getPairs(node.style?.text, [
      ["Basic", "₩19k"],
      ["Pro", "₩49k"],
      ["Scale", "₩99k"]
    ]);
    return (
      <div className="ffPricingWidget" style={style}>
        {plans.map(([item, price]) => (
          <article key={item}>
            <strong>{item}</strong>
            <span>{price}</span>
            <em />
            <button type="button">Choose</button>
          </article>
        ))}
      </div>
    );
  }

  if (node.type === "footer") {
    const footer = getFooterContent(node.style?.text);
    return (
      <div className="ffFooterWidget" style={style}>
        <strong>{footer.brand}</strong>
        {footer.links.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    );
  }

  return <div className="publishedFrameNode" style={style} />;
}

function getTextHorizontalAlignment(align?: "left" | "center" | "right"): React.CSSProperties {
  if (align === "center") {
    return { "--webable-menu-justify": "center", justifyContent: "center", justifyItems: "center" } as React.CSSProperties;
  }

  if (align === "right") {
    return { "--webable-menu-justify": "flex-end", justifyContent: "flex-end", justifyItems: "end" } as React.CSSProperties;
  }

  return { "--webable-menu-justify": "flex-start", justifyContent: "flex-start", justifyItems: "start" } as React.CSSProperties;
}

function getImageCropTransform(style?: PublishedNode["style"]): React.CSSProperties {
  return {
    "--webable-image-scale": style?.imageScale || 1,
    "--webable-image-x": `${style?.imageOffsetX || 0}px`,
    "--webable-image-y": `${style?.imageOffsetY || 0}px`
  } as React.CSSProperties;
}

type ResponsiveCanvasSizes = {
  desktop: { height: number; width: number };
  mobile: { height: number; width: number };
  tablet: { height: number; width: number };
};

function normalizeResponsiveCanvasSizes(value?: PublishedSite["canvasSizes"]): ResponsiveCanvasSizes {
  return {
    desktop: normalizePublishedCanvasSizeWithFallback(value?.desktop, { height: 1600, width: 1440 }),
    mobile: normalizePublishedCanvasSizeWithFallback(value?.mobile, { height: 844, width: 390 }),
    tablet: normalizePublishedCanvasSizeWithFallback(value?.tablet, { height: 1200, width: 768 })
  };
}

function normalizePublishedCanvasSizeWithFallback(value: { height: number; width: number } | undefined, fallback: { height: number; width: number }) {
  return {
    height: clampPublishedSize(value?.height, fallback.height, 480, 5000),
    width: clampPublishedSize(value?.width, fallback.width, 320, 2560)
  };
}

function getResponsiveCanvasStyle(sizes: ResponsiveCanvasSizes): React.CSSProperties {
  return {
    "--webable-desktop-height": `${sizes.desktop.height}px`,
    "--webable-desktop-width": `${sizes.desktop.width}px`,
    "--webable-mobile-height": `${sizes.mobile.height}px`,
    "--webable-mobile-width": `${sizes.mobile.width}px`,
    "--webable-tablet-height": `${sizes.tablet.height}px`,
    "--webable-tablet-width": `${sizes.tablet.width}px`
  } as React.CSSProperties;
}

function getResponsiveNodeStyle(node: PublishedNode, sizes: ResponsiveCanvasSizes): React.CSSProperties {
  const tabletX = sizes.tablet.width / sizes.desktop.width;
  const tabletY = sizes.tablet.height / sizes.desktop.height;
  const mobileX = sizes.mobile.width / sizes.desktop.width;
  const mobileY = sizes.mobile.height / sizes.desktop.height;

  return {
    "--webable-desktop-node-height": `${node.height}px`,
    "--webable-desktop-node-left": `${node.x}px`,
    "--webable-desktop-node-top": `${node.y}px`,
    "--webable-desktop-node-width": `${node.width}px`,
    "--webable-mobile-node-height": `${Math.round(node.height * mobileY)}px`,
    "--webable-mobile-node-left": `${Math.round(node.x * mobileX)}px`,
    "--webable-mobile-node-top": `${Math.round(node.y * mobileY)}px`,
    "--webable-mobile-node-width": `${Math.round(node.width * mobileX)}px`,
    "--webable-tablet-node-height": `${Math.round(node.height * tabletY)}px`,
    "--webable-tablet-node-left": `${Math.round(node.x * tabletX)}px`,
    "--webable-tablet-node-top": `${Math.round(node.y * tabletY)}px`,
    "--webable-tablet-node-width": `${Math.round(node.width * tabletX)}px`
  } as React.CSSProperties;
}

function getBorderRenderStyle(style?: PublishedNode["style"]): React.CSSProperties {
  const border = parseBorderValue(style?.border);

  if (border.style === "none" || border.width <= 0) {
    return { border: undefined, boxShadow: undefined, outline: undefined };
  }

  const color = withCssOpacity(border.color, style?.borderOpacity ?? 100);
  const borderValue = `${border.width}px ${border.style} ${color}`;
  const position = style?.borderPosition || "center";

  if (position === "inside") {
    return { border: undefined, boxShadow: `inset 0 0 0 ${border.width}px ${color}`, outline: undefined };
  }

  if (position === "outside") {
    return { border: undefined, boxShadow: undefined, outline: borderValue, outlineOffset: 0 };
  }

  return { border: borderValue, boxShadow: undefined, outline: undefined };
}

function parseBorderValue(value: string | undefined) {
  const input = value?.trim();

  if (!input || input === "0" || input === "none") {
    return { color: "#d4d4d4", style: "none", width: 0 };
  }

  return {
    color: input.match(/#[0-9a-fA-F]{3,8}\b/)?.[0] || input.match(/rgba?\([^)]+\)/)?.[0] || "#d4d4d4",
    style: input.match(/\b(solid|dashed|dotted|none)\b/)?.[1] || "solid",
    width: Number(input.match(/(\d+(?:\.\d+)?)px/)?.[1] || 1)
  };
}

function withCssOpacity(color: string, opacity: number) {
  const parsed = parseCssColor(color);
  const alpha = Math.min(1, Math.max(0, opacity / 100));
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
}

function parseCssColor(color: string) {
  if (color.startsWith("#")) {
    const raw = color.slice(1);
    const hex = raw.length === 3 ? raw.split("").map((item) => item + item).join("") : raw.padEnd(6, "0").slice(0, 6);
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16)
    };
  }

  const rgb = color.match(/rgba?\(([^)]+)\)/)?.[1]?.split(",").map((part) => Number(part.trim()));
  return { r: rgb?.[0] || 212, g: rgb?.[1] || 212, b: rgb?.[2] || 212 };
}

function MenuItems({ items }: { items: MenuItem[] }) {
  return (
    <span className="ffMenuTrack">
      {items.map((item) => (
        <span className={item.children.length > 0 ? "ffNavItem hasDropdown" : "ffNavItem"} key={item.label}>
          {item.label}
          {item.children.length > 0 ? (
            <>
              <b>⌄</b>
              <i className="ffDropdown">
                {item.children.map((child) => (
                  <em key={child}>{child}</em>
                ))}
              </i>
            </>
          ) : null}
        </span>
      ))}
    </span>
  );
}

async function readPublishedSite(siteId: string) {
  const safeSiteId = siteId.replace(/[^a-zA-Z0-9-_]/g, "-");

  try {
    const file = await readFile(path.join(publishDir, `${safeSiteId}.json`), "utf8");
    return JSON.parse(file) as PublishedSite;
  } catch {
    return null;
  }
}

export function normalizePages(site: PublishedSite) {
  if (Array.isArray(site.pages) && site.pages.length > 0) {
    return site.pages;
  }

  return [{ id: "home", name: "Home", path: "/", nodes: site.nodes || [] }];
}

function splitContent(value: string | undefined, fallback: string[]) {
  const parts = (value || "").split("|").map((item) => item.trim()).filter(Boolean);
  return fallback.map((item, index) => parts[index] || item);
}

function splitList(value: string | undefined, fallback: string[]) {
  const items = (value || "").split(",").map((item) => item.trim()).filter(Boolean);
  return items.length > 0 ? items : fallback;
}

function parseMenuItems(value: string | undefined): MenuItem[] {
  return splitList(value, ["Home", "Shop>Flowers;Plants;Gifts", "About", "Contact"]).map((item) => {
    const [label, children = ""] = item.split(">");
    return {
      children: children.split(";").map((child) => child.trim()).filter(Boolean),
      label: label.trim()
    };
  });
}

function getPairs(value: string | undefined, fallback: Array<[string, string]>) {
  const pairs = (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, price] = item.split(":");
      return [name?.trim(), price?.trim()] as [string | undefined, string | undefined];
    })
    .filter((item): item is [string, string] => Boolean(item[0] && item[1]));

  return pairs.length > 0 ? pairs : fallback;
}

function getHeaderContent(value: string | undefined) {
  const [brand, links, action] = splitContent(value, ["WEBABLE", "Home,Shop>Flowers;Plants;Gifts,About,Contact", "Start"]);
  return {
    action,
    brand,
    links: parseMenuItems(links)
  };
}

function getFooterContent(value: string | undefined) {
  const [brand, links] = splitContent(value, ["WEBABLE", "Company,Terms,Contact"]);
  return {
    brand,
    links: splitList(links, ["Company", "Terms", "Contact"])
  };
}

function getFormContent(value: string | undefined) {
  const [title, fields, action] = splitContent(value, ["Contact form", "Name,Email,Message", "Submit"]);
  return {
    action,
    fields: splitList(fields, ["Name", "Email", "Message"]).slice(0, 4),
    title
  };
}

function getMapEmbedUrl(value: string | undefined) {
  const input = value?.trim();

  if (!input) {
    return "";
  }

  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(input)}&output=embed`;
}

function getVideoEmbed(value: string | undefined): { src: string; type: "iframe" | "video" } | null {
  const input = value?.trim();

  if (!input) {
    return null;
  }

  const youtube = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/);
  if (youtube?.[1]) {
    return { src: `https://www.youtube.com/embed/${youtube[1]}`, type: "iframe" };
  }

  const vimeo = input.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) {
    return { src: `https://player.vimeo.com/video/${vimeo[1]}`, type: "iframe" };
  }

  if (/\.(mp4|webm|ogg)(?:\?.*)?$/i.test(input)) {
    return { src: input, type: "video" };
  }

  if (/^https?:\/\//i.test(input)) {
    return { src: input, type: "iframe" };
  }

  return null;
}

export function normalizePublishedCanvasSize(value?: { height: number; width: number }) {
  return {
    height: clampPublishedSize(value?.height, 1600, 480, 5000),
    width: clampPublishedSize(value?.width, 1440, 320, 2560)
  };
}

function clampPublishedSize(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : fallback;

  return Math.min(max, Math.max(min, Math.round(numeric)));
}
