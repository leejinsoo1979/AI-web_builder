import { readFile } from "node:fs/promises";
import path from "node:path";
import { PublishedCanvas, PublishedNav, normalizePages, normalizePublishedCanvasSize } from "../page";

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
  hiddenOnPageIds?: string[];
  positionMode?: "fixed" | "normal" | "sticky";
  scope?: "page" | "site";
  style?: Record<string, unknown>;
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
};

const publishDir = path.join(process.cwd(), ".webable-published");

export default async function PublishedSubPage({
  params
}: {
  params: Promise<{
    pagePath: string;
    siteId: string;
  }>;
}) {
  const { pagePath, siteId } = await params;
  const site = await readPublishedSite(siteId);
  const pages = normalizePages(site);
  const currentPage = pages.find((page) => page.path === `/${pagePath}`) || pages[0];

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

async function readPublishedSite(siteId: string) {
  const safeSiteId = siteId.replace(/[^a-zA-Z0-9-_]/g, "-");
  const file = await readFile(path.join(publishDir, `${safeSiteId}.json`), "utf8");
  return JSON.parse(file) as PublishedSite;
}
