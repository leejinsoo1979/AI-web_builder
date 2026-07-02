"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { bindInteractions, getAppearInteraction, runAppearAnimation, type Interaction, type InteractionContext } from "@webable/interaction-runtime";
import { BookingWidget } from "@/components/published/BookingWidget";
import { MediaGalleryWidget, MediaSliderWidget } from "@/components/published/MediaWidgets";
import { ShopWidget } from "@/components/published/ShopWidget";

type PreviewNodeType =
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

type PreviewNode = {
  height: number;
  hiddenOnPageIds?: string[];
  hidden?: boolean;
  id: string;
  interactions?: Interaction[];
  name: string;
  style?: {
    align?: "left" | "center" | "right";
    background?: string;
    border?: string;
    borderOpacity?: number;
    borderPosition?: "center" | "inside" | "outside";
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    letterSpacing?: number;
    lineHeight?: number;
    imageOffsetX?: number;
    imageOffsetY?: number;
    imageScale?: number;
    imageUrl?: string;
    mapUrl?: string;
    padding?: number;
    radius?: number;
    text?: string;
    videoUrl?: string;
  };
  type: PreviewNodeType;
  width: number;
  x: number;
  y: number;
  zIndex: number;
  positionMode?: "fixed" | "normal" | "sticky";
  scope?: "page" | "site";
};

type PreviewProject = {
  canvasSizes?: Record<string, { height: number; width: number }>;
  pages: Array<{
    id: string;
    name: string;
    nodes: PreviewNode[];
    path: string;
  }>;
  selectedPageId?: string;
  siteNodes?: PreviewNode[];
  siteName: string;
};
type MenuItem = {
  children: string[];
  label: string;
};

const STORAGE_KEY = "webable.freeform.editor.v1";

export default function PreviewPage() {
  const [project, setProject] = useState<PreviewProject | null>(null);
  const [activePageId, setActivePageId] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const nextProject = JSON.parse(raw) as PreviewProject;
      setProject(nextProject);
      setActivePageId(nextProject.selectedPageId || nextProject.pages[0]?.id || "");
    } catch {
      setProject(null);
    }
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const activePage = useMemo(() => {
    if (!project?.pages.length) {
      return null;
    }

    return project.pages.find((page) => page.id === activePageId) || project.pages.find((page) => page.id === project.selectedPageId) || project.pages[0];
  }, [activePageId, project]);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }

  function goToPage(label: string) {
    if (!project) {
      return;
    }

    const target = label.trim().toLowerCase();
    const match = project.pages.find(
      (page) => page.name.trim().toLowerCase() === target || page.path.replace(/\//g, "").toLowerCase() === target
    );

    if (match) {
      setActivePageId(match.id);
      window.scrollTo({ behavior: "smooth", top: 0 });
      return;
    }

    showToast(`"${label}" 페이지가 아직 연결되지 않았습니다`);
  }

  function goToPageId(pageId: string) {
    if (!project) {
      return;
    }

    const match = project.pages.find((page) => page.id === pageId) || project.pages.find((page) => page.name === pageId);

    if (match) {
      setActivePageId(match.id);
      window.scrollTo({ behavior: "smooth", top: 0 });
      return;
    }

    showToast("연결된 페이지를 찾을 수 없습니다");
  }

  if (!project || !activePage) {
    return (
      <main className="webablePreviewMissing">
        <div>
          <strong>Preview unavailable</strong>
          <p>현재 편집 중인 캔버스 데이터를 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  const responsiveSizes = normalizeResponsiveCanvasSizes(project.canvasSizes);
  const visibleNodes = [...(project.siteNodes || []).filter((node) => !node.hiddenOnPageIds?.includes(activePage.id)), ...activePage.nodes]
    .filter((node) => !node.hidden)
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <main className="webablePreviewPage">
      <header className="wpChrome">
        <div className="wpChromeDots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <strong>{project.siteName}</strong>
        {project.pages.length > 1 ? (
          <nav aria-label="Preview pages">
            {project.pages.map((page) => (
              <button className={page.id === activePage.id ? "active" : ""} key={page.id} onClick={() => setActivePageId(page.id)} type="button">
                {page.name}
              </button>
            ))}
          </nav>
        ) : null}
        <em>미리보기</em>
      </header>
      <section className="webablePreviewStage" key={activePage.id}>
        <div className="webablePreviewArtboard" style={getResponsiveCanvasStyle(responsiveSizes)}>
          {visibleNodes.map((node, index) => (
            <RevealNode canvasSizes={responsiveSizes} delay={Math.min(index * 70, 420)} goToPageId={goToPageId} key={node.id} node={node}>
              <PreviewNodeRenderer goToPage={goToPage} node={node} showToast={showToast} />
            </RevealNode>
          ))}
        </div>
      </section>
      {toast ? <div className="wpToast" role="status">{toast}</div> : null}
    </main>
  );
}

function RevealNode({
  canvasSizes,
  children,
  delay,
  goToPageId,
  node
}: {
  canvasSizes: ResponsiveCanvasSizes;
  children: React.ReactNode;
  delay: number;
  goToPageId: (pageId: string) => void;
  node: PreviewNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const appear = useMemo(() => getAppearInteraction(node.interactions), [node.interactions]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const context: InteractionContext = {
      navigate: (kind, target, newTab) => {
        if (kind === "page") {
          goToPageId(target);
          return;
        }

        if (kind === "url") {
          window.open(target, newTab ? "_blank" : "_self", "noopener");
          return;
        }

        if (kind === "anchor") {
          document.querySelector(`[data-node-id="${target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        window.location.href = `mailto:${target}`;
      },
      resolveNode: (nodeId) => document.querySelector(`[data-node-id="${nodeId}"]`)
    };
    const rest = (node.interactions ?? []).filter((interaction) => getAppearInteraction([interaction]) === null);
    const unbind = bindInteractions(element, rest, context);
    let observer: IntersectionObserver | null = null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setVisible(true);
    } else if (appear) {
      setVisible(true);
      element.style.opacity = "0";
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              element.style.opacity = "";
              runAppearAnimation(element, appear);
              observer?.disconnect();
            }
          }
        },
        { threshold: 0.12 }
      );
      observer.observe(element);
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              observer?.disconnect();
            }
          }
        },
        { threshold: 0.12 }
      );
      observer.observe(element);
    }

    return () => {
      unbind();
      observer?.disconnect();
    };
  }, [appear, goToPageId, node.interactions]);

  return (
    <div
      className={appear || visible ? "webablePreviewNode wpRevealed" : "webablePreviewNode wpHidden"}
      data-node-id={node.id}
      ref={ref}
      style={{
        position: node.positionMode === "fixed" ? "fixed" : node.positionMode === "sticky" ? "sticky" : undefined,
        ...getResponsiveNodeStyle(node, canvasSizes),
        transitionDelay: !appear && visible ? `${delay}ms` : undefined,
        zIndex: node.positionMode === "fixed" || node.positionMode === "sticky" ? 10000 + node.zIndex : node.zIndex
      }}
    >
      {children}
    </div>
  );
}

function PreviewNodeRenderer({ goToPage, node, showToast }: { goToPage: (label: string) => void; node: PreviewNode; showToast: (message: string) => void }) {
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
      <button className="publishedButtonNode wpActionButton" onClick={() => showToast(`"${node.style?.text || node.name}" 버튼 — 링크를 연결하면 이동합니다`)} style={style} type="button">
        {node.style?.text}
      </button>
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
          <MenuItems goToPage={goToPage} items={header.links} />
        </nav>
        <button onClick={() => showToast(`"${header.action}" 액션이 실행되었습니다 (미리보기)`)} type="button">
          {header.action}
        </button>
      </div>
    );
  }

  if (node.type === "nav") {
    const items = parseMenuItems(node.style?.text || "Home,Shop>Flowers;Plants;Gifts,About,Contact");
    return (
      <div className="ffNavWidget" style={style}>
        <MenuItems goToPage={goToPage} items={items} />
      </div>
    );
  }

  if (node.type === "gallery") {
    return <MediaGalleryWidget style={style} />;
  }

  if (node.type === "slider") {
    return <MediaSliderWidget style={style} text={node.style?.text} />;
  }

  if (node.type === "hero") {
    const hero = splitContent(node.style?.text, ["Build a sharper landing page", "브랜드 메시지와 CTA를 한 화면에 배치하는 히어로 섹션입니다.", "Explore"]);
    return (
      <div className="ffHeroWidget" style={style}>
        <section>
          <span>NEW COLLECTION</span>
          <strong>{hero[0]}</strong>
          <p>{hero[1]}</p>
          <button onClick={() => goToPage(hero[2])} type="button">
            {hero[2]}
          </button>
        </section>
        <aside>
          <i />
        </aside>
      </div>
    );
  }

  if (node.type === "products") {
    return <ShopWidget nodeId={node.id} siteId="webable-main" source="preview" style={style} />;
  }

  if (node.type === "form") {
    return <InteractiveForm node={node} showToast={showToast} style={style} />;
  }

  if (node.type === "booking") {
    const booking = splitContent(node.style?.text, ["방문 예약", "원하는 날짜와 시간을 선택하세요."]);
    return <BookingWidget nodeId={node.id} siteId="webable-main" source="preview" style={style} subtitle={booking[1]} title={booking[0]} />;
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
    return <InteractiveVideo node={node} style={style} />;
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
            <button onClick={() => showToast(`${item} 플랜이 선택되었습니다 (미리보기)`)} type="button">
              Choose
            </button>
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
          <span className="wpFooterLink" key={item} onClick={() => goToPage(item)}>
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="publishedFrameNode" style={style}>
      {node.style?.text}
    </div>
  );
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

function getImageCropTransform(style?: PreviewNode["style"]): React.CSSProperties {
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

function normalizeResponsiveCanvasSizes(value?: PreviewProject["canvasSizes"]): ResponsiveCanvasSizes {
  return {
    desktop: normalizeCanvasSize(value?.desktop, { height: 1600, width: 1440 }),
    mobile: normalizeCanvasSize(value?.mobile, { height: 844, width: 390 }),
    tablet: normalizeCanvasSize(value?.tablet, { height: 1200, width: 768 })
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

function getResponsiveNodeStyle(node: PreviewNode, sizes: ResponsiveCanvasSizes): React.CSSProperties {
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

function getBorderRenderStyle(style?: PreviewNode["style"]): React.CSSProperties {
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

function InteractiveSlider({ node, style }: { node: PreviewNode; style: React.CSSProperties }) {
  const base = splitContent(node.style?.text, ["Featured collection", ""]);
  const slides = useMemo(() => [base[0], "New arrivals", "Editor's pick"], [base]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 3200);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <div className="ffSliderWidget wpSlider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={style}>
      <div className="wpSlideText" key={index}>
        <strong>{slides[index]}</strong>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
      <section>
        <button aria-label="Previous slide" onClick={() => setIndex((index - 1 + slides.length) % slides.length)} type="button">
          ‹
        </button>
        <button aria-label="Next slide" onClick={() => setIndex((index + 1) % slides.length)} type="button">
          ›
        </button>
      </section>
      <footer>
        {slides.map((slide, dotIndex) => (
          <i className={dotIndex === index ? "active" : ""} key={slide} onClick={() => setIndex(dotIndex)} />
        ))}
      </footer>
    </div>
  );
}

function InteractiveGallery({ style }: { style: React.CSSProperties }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (lightbox === null) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightbox(null);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox]);

  return (
    <>
      <div className="ffGalleryWidget" style={style}>
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} onClick={() => setLightbox(index)}>
            <em />
          </span>
        ))}
      </div>
      {lightbox !== null ? (
        <div className="wpLightbox" onClick={() => setLightbox(null)}>
          <figure>
            <figcaption>Gallery item {lightbox + 1} / 6 — 클릭하여 닫기</figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}

function InteractiveForm({ node, showToast, style }: { node: PreviewNode; showToast: (message: string) => void; style: React.CSSProperties }) {
  const form = getFormContent(node.style?.text);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const values: Record<string, string> = {};

    for (const field of form.fields) {
      values[field] = String(data.get(field) ?? "");
    }

    try {
      const response = await fetch("/api/forms/submit", {
        body: JSON.stringify({ fields: values, formTitle: form.title, nodeId: node.id, pageId: "preview", siteId: "webable-main", source: "preview" }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("submit failed");
      }

      setSubmitted(true);
      showToast("문의가 접수되었습니다 — 에디터 접수함에서 확인하세요");
      window.setTimeout(() => setSubmitted(false), 2400);
      formElement.reset();
    } catch {
      showToast("접수에 실패했습니다. 잠시 후 다시 시도하세요.");
    }
  }

  return (
    <form className="ffFormWidget" onSubmit={handleSubmit} style={style}>
      <strong>{form.title}</strong>
      {form.fields.map((field, index) => (
        <label key={field}>
          <span>{field}</span>
          {index >= 2 ? <textarea aria-label={field} name={field} /> : <input aria-label={field} name={field} />}
        </label>
      ))}
      <button className={submitted ? "wpFormDone" : ""} type="submit">
        {submitted ? "전송 완료 ✓" : form.action}
      </button>
    </form>
  );
}

function InteractiveVideo({ node, style }: { node: PreviewNode; style: React.CSSProperties }) {
  const [playing, setPlaying] = useState(false);
  const video = getVideoEmbed(node.style?.videoUrl);

  if (video?.type === "iframe") {
    return (
      <div className="ffVideoWidget wpPlaying" style={style}>
        <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen src={video.src} title={node.style?.text || node.name} />
      </div>
    );
  }

  if (video?.type === "video") {
    return (
      <div className="ffVideoWidget wpPlaying" style={style}>
        <video controls src={video.src} title={node.style?.text || node.name} />
      </div>
    );
  }

  return (
    <div className={playing ? "ffVideoWidget wpPlaying" : "ffVideoWidget"} onClick={() => setPlaying((current) => !current)} style={style}>
      <button aria-label={playing ? "Pause" : "Play"} type="button">
        {playing ? "❚❚" : "▶"}
      </button>
      <strong>{playing ? "재생 중…" : node.style?.text || "Brand film"}</strong>
    </div>
  );
}

function MenuItems({ goToPage, items }: { goToPage: (label: string) => void; items: MenuItem[] }) {
  return (
    <span className="ffMenuTrack">
      {items.map((item) => (
        <span
          className={item.children.length > 0 ? "ffNavItem hasDropdown" : "ffNavItem"}
          key={item.label}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              goToPage(item.label);
            }
          }}
        >
          {item.label}
          {item.children.length > 0 ? (
            <>
              <b>⌄</b>
              <i className="ffDropdown">
                {item.children.map((child) => (
                  <em key={child} onClick={() => goToPage(child)}>
                    {child}
                  </em>
                ))}
              </i>
            </>
          ) : null}
        </span>
      ))}
    </span>
  );
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
