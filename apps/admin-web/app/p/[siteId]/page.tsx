import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";

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
    imageUrl?: string;
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
      <PublishedCanvas canvasSize={normalizePublishedCanvasSize(site.canvasSizes?.desktop)} nodes={currentPage.nodes} siteName={site.siteName} />
    </main>
  );
}

export function PublishedCanvas({ canvasSize, nodes, siteName }: { canvasSize?: { height: number; width: number }; nodes: PublishedNode[]; siteName: string }) {
  const visibleNodes = nodes.filter((node) => !node.hidden).sort((a, b) => a.zIndex - b.zIndex);
  const size = normalizePublishedCanvasSize(canvasSize);

  return (
    <div className="publishedArtboard" aria-label={siteName} style={{ height: size.height, width: size.width }}>
      {visibleNodes.map((node) => (
        <div
          className="publishedNode"
          key={node.id}
          style={{
            height: node.height,
            left: node.x,
            top: node.y,
            width: node.width,
            zIndex: node.zIndex
          }}
        >
          <RenderPublishedNode node={node} />
        </div>
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
  const style = {
    background: node.style?.background,
    border: node.style?.border,
    borderRadius: node.style?.radius,
    color: node.style?.color,
    fontSize: node.style?.fontSize,
    fontWeight: node.style?.fontWeight,
    padding: node.style?.padding,
    textAlign: node.style?.align
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
        {node.style?.imageUrl ? <img alt={node.name} src={node.style.imageUrl} /> : <span />}
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
    const products = getPairs(node.style?.text, [
      ["Signature", "₩49,000"],
      ["Bundle", "₩89,000"],
      ["Premium", "₩129,000"]
    ]);
    return (
      <div className="ffProductsWidget" style={style}>
        {products.map(([item, price]) => (
          <article key={item}>
            <span />
            <strong>{item}</strong>
            <em>{price}</em>
          </article>
        ))}
      </div>
    );
  }

  if (node.type === "form") {
    const form = getFormContent(node.style?.text);
    return (
      <div className="ffFormWidget" style={style}>
        <strong>{form.title}</strong>
        {form.fields.map((field) => (
          <span key={field}>{field}</span>
        ))}
        <button type="button">{form.action}</button>
      </div>
    );
  }

  if (node.type === "map") {
    return (
      <div className="ffMapWidget" style={style}>
        <span />
        <strong>{node.style?.text || "Location map"}</strong>
      </div>
    );
  }

  if (node.type === "video") {
    return (
      <div className="ffVideoWidget" style={style}>
        <button type="button">▶</button>
        <strong>{node.style?.text || "Brand film"}</strong>
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

function MenuItems({ items }: { items: MenuItem[] }) {
  return (
    <>
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
    </>
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
