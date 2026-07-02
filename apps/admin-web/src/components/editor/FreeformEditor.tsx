"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BringToFront,
  ChevronDown,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  GalleryHorizontal,
  Group,
  Image as ImageIcon,
  Images,
  Layers,
  LayoutTemplate,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  Monitor,
  MousePointer2,
  PanelLeft,
  PanelRight,
  PanelBottom,
  PanelTop,
  Play,
  Redo2,
  RotateCcw,
  Rocket,
  Save,
  Search,
  ShoppingBag,
  Plus,
  Smartphone,
  Square,
  Tablet,
  Trash2,
  Type,
  Quote,
  Ungroup,
  Undo2,
  Upload,
  Unlock,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { Rnd } from "react-rnd";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjectIndex } from "@webable/code-model";

type EditorNodeType =
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
type CanvasMode = "design" | "code";
type DeviceMode = "desktop" | "tablet" | "mobile";
type LeftPanelMode = "assets" | "layers";
type PublishState = "idle" | "publishing" | "published" | "error";
type CanvasSize = {
  height: number;
  width: number;
};
type MarqueeSelection = {
  height: number;
  originX: number;
  originY: number;
  width: number;
  x: number;
  y: number;
};
type Viewport = {
  scale: number;
  x: number;
  y: number;
};
type FrameDragState = {
  originClientX: number;
  originClientY: number;
  originX: number;
  originY: number;
};
type PanelResizeState = {
  panel: "left" | "right";
  originClientX: number;
  originWidth: number;
};
type CodeTreeNode = {
  children: CodeTreeNode[];
  elementCount: number;
  filePath?: string;
  name: string;
  type: "directory" | "file";
};
type SnapGuide = {
  axis: "x" | "y";
  position: number;
};
type SnapMatch = {
  distance: number;
  offset: number;
  source: number;
};
type ContextMenuState = {
  ids: string[];
  x: number;
  y: number;
};
type WidgetCategory = "All" | "Layout" | "Basic" | "Media" | "Commerce" | "Section";
type WidgetTemplate = {
  category: Exclude<WidgetCategory, "All">;
  icon: React.ReactNode;
  label: string;
  type: EditorNodeType;
};
type MenuItem = {
  children: string[];
  label: string;
};
type ColorValue = {
  a: number;
  b: number;
  g: number;
  r: number;
};

type EditorNode = {
  id: string;
  name: string;
  type: EditorNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  groupId?: string;
  locked?: boolean;
  hidden?: boolean;
  style: {
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

type EditorPage = {
  id: string;
  name: string;
  path: string;
  nodes: EditorNode[];
};

type EditorProject = {
  canvasSizes?: Record<DeviceMode, CanvasSize>;
  pages: EditorPage[];
  selectedPageId?: string;
  selectedIds?: string[];
  siteName: string;
};

function getLayerLabel(node: EditorNode) {
  if ((node.type === "text" || node.type === "button") && node.style.text?.trim()) {
    return node.style.text.trim();
  }

  return node.name;
}


const GRID_SIZE = 8;
const ZOOM_STEPS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8, 12, 16, 25, 32, 50, 64, 100, 128, 200, 256];
const SNAP_THRESHOLD = 6;
const STORAGE_KEY = "webable.freeform.editor.v1";
const PUBLISH_STORAGE_KEY = "webable.freeform.publish.v1";
const SITE_ID = "webable-main";
const PROJECT_API = `/api/projects/${SITE_ID}`;
const COLOR_SWATCHES = [
  "#ffffff",
  "#000000",
  "#12b21f",
  "#3b3f51",
  "#0b4738",
  "#eef1f2",
  "#514b4b",
  "#bdb6a8",
  "#ead7b0",
  "#68b49c",
  "#626567",
  "#245554",
  "#343638",
  "#35bc75",
  "#ccefe0",
  "#aeb2bd",
  "#c2cec5",
  "#eceff1",
  "#a5a7a9",
  "#7ddfb5",
  "#f2f25d",
  "#222222",
  "#cfcfcf",
  "#eeeeee",
  "#0e3d35",
  "#050819",
  "#17313a",
  "#22344f",
  "#f3f4f6",
  "#e2e5e7",
  "#4caf50",
  "#111111",
  "#7b7d80",
  "#d8d8d8",
  "#cfeee0"
];
const defaultCanvasSizes: Record<DeviceMode, CanvasSize> = {
  desktop: { width: 1440, height: 1600 },
  tablet: { width: 768, height: 1200 },
  mobile: { width: 390, height: 844 }
};
const deviceConfig: Record<DeviceMode, { label: string; icon: React.ReactNode }> = {
  desktop: { label: "Desktop", icon: <Monitor size={15} /> },
  tablet: { label: "Tablet", icon: <Tablet size={15} /> },
  mobile: { label: "Mobile", icon: <Smartphone size={15} /> }
};
const handleStyle: React.CSSProperties = {
  width: 5,
  height: 5,
  background: "#ffffff",
  border: "1px solid #1495ff",
  borderRadius: 2,
  boxShadow: "0 1px 3px rgba(20,149,255,.2)"
};
const edgeHandleStyle: React.CSSProperties = {
  background: "#1495ff",
  borderRadius: 999,
  opacity: 0.78,
  boxShadow: "none"
};

const initialNodes: EditorNode[] = [
  {
    id: "hero-bg",
    name: "Hero container",
    type: "container",
    x: 48,
    y: 52,
    width: 760,
    height: 420,
    zIndex: 1,
    style: {
      background: "#111111",
      radius: 18,
      padding: 32,
      border: "1px solid rgba(255,255,255,.12)"
    }
  },
  {
    id: "hero-title",
    name: "Headline",
    type: "text",
    x: 92,
    y: 118,
    width: 520,
    height: 142,
    zIndex: 3,
    style: {
      text: "프리미엄 꽃, 원하는 순간에 어울리는 공간 연출",
      fontSize: 44,
      fontWeight: 850,
      color: "#ffffff",
      align: "left"
    }
  },
  {
    id: "hero-copy",
    name: "Description",
    type: "text",
    x: 96,
    y: 286,
    width: 430,
    height: 72,
    zIndex: 3,
    style: {
      text: "정기구독, 선물, 행사 연출까지 한 번에 예약할 수 있는 브랜드 사이트입니다.",
      fontSize: 17,
      fontWeight: 500,
      color: "#d7d7d7",
      align: "left"
    }
  },
  {
    id: "hero-cta",
    name: "Primary button",
    type: "button",
    x: 96,
    y: 378,
    width: 142,
    height: 48,
    zIndex: 4,
    style: {
      text: "상담 예약",
      fontSize: 16,
      fontWeight: 800,
      color: "#111111",
      background: "#ffffff",
      radius: 12,
      align: "center"
    }
  },
  {
    id: "hero-image",
    name: "Visual block",
    type: "image",
    x: 584,
    y: 112,
    width: 178,
    height: 280,
    zIndex: 2,
    style: {
      background: "#e5e5e5",
      radius: 18,
      border: "1px solid rgba(255,255,255,.26)"
    }
  }
];

const widgetCategories: WidgetCategory[] = ["All", "Layout", "Basic", "Media", "Commerce", "Section"];
const blockTemplates: WidgetTemplate[] = [
  { type: "header", label: "Header", category: "Layout", icon: <PanelTop size={16} /> },
  { type: "nav", label: "Nav menu", category: "Layout", icon: <Menu size={16} /> },
  { type: "footer", label: "Footer", category: "Layout", icon: <PanelBottom size={16} /> },
  { type: "hero", label: "Hero", category: "Section", icon: <LayoutTemplate size={16} /> },
  { type: "testimonial", label: "Review", category: "Section", icon: <Quote size={16} /> },
  { type: "container", label: "Frame", category: "Basic", icon: <Square size={16} /> },
  { type: "text", label: "Text", category: "Basic", icon: <Type size={16} /> },
  { type: "button", label: "Button", category: "Basic", icon: <MousePointer2 size={16} /> },
  { type: "image", label: "Image", category: "Media", icon: <ImageIcon size={16} /> },
  { type: "gallery", label: "Gallery", category: "Media", icon: <Images size={16} /> },
  { type: "slider", label: "Slider", category: "Media", icon: <GalleryHorizontal size={16} /> },
  { type: "video", label: "Video", category: "Media", icon: <Play size={16} /> },
  { type: "products", label: "Products", category: "Commerce", icon: <ShoppingBag size={16} /> },
  { type: "pricing", label: "Pricing", category: "Commerce", icon: <CreditCard size={16} /> },
  { type: "form", label: "Form", category: "Section", icon: <Mail size={16} /> },
  { type: "map", label: "Map", category: "Section", icon: <MapPin size={16} /> }
];

const initialPages: EditorPage[] = [
  { id: "home", name: "Home", path: "/", nodes: initialNodes },
  {
    id: "about",
    name: "About",
    path: "/about",
    nodes: [
      {
        id: "about-bg",
        name: "About container",
        type: "container",
        x: 64,
        y: 72,
        width: 720,
        height: 360,
        zIndex: 1,
        style: { background: "#f7f7f7", border: "1px solid #d0d0d0", radius: 18 }
      },
      {
        id: "about-title",
        name: "About headline",
        type: "text",
        x: 108,
        y: 130,
        width: 520,
        height: 112,
        zIndex: 2,
        style: { align: "left", color: "#111111", fontSize: 42, fontWeight: 850, text: "브랜드의 감각과 운영 방식을 소개하세요" }
      },
      {
        id: "about-copy",
        name: "About copy",
        type: "text",
        x: 112,
        y: 270,
        width: 520,
        height: 82,
        zIndex: 2,
        style: { align: "left", color: "#555555", fontSize: 18, fontWeight: 520, text: "전문성, 제작 과정, 고객에게 제공하는 차별점을 짧고 설득력 있게 담을 수 있습니다." }
      }
    ]
  },
  {
    id: "contact",
    name: "Contact",
    path: "/contact",
    nodes: [
      {
        id: "contact-bg",
        name: "Contact container",
        type: "container",
        x: 72,
        y: 88,
        width: 700,
        height: 340,
        zIndex: 1,
        style: { background: "#111111", border: "1px solid #2a2a2a", radius: 18 }
      },
      {
        id: "contact-title",
        name: "Contact title",
        type: "text",
        x: 120,
        y: 150,
        width: 450,
        height: 92,
        zIndex: 2,
        style: { align: "left", color: "#ffffff", fontSize: 38, fontWeight: 850, text: "상담과 주문을 한 곳에서 받으세요" }
      },
      {
        id: "contact-button",
        name: "Contact button",
        type: "button",
        x: 120,
        y: 302,
        width: 168,
        height: 52,
        zIndex: 2,
        style: { align: "center", background: "#ffffff", color: "#111111", fontSize: 16, fontWeight: 820, radius: 12, text: "문의하기" }
      }
    ]
  }
];

export function FreeformEditor() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<Viewport>({ scale: getFitZoom("desktop"), x: 0, y: 0 });
  const viewportRafRef = useRef(0);
  const [pages, setPages] = useState<EditorPage[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState("home");
  const [nodes, setNodes] = useState<EditorNode[]>(initialNodes);
  const [selectedIds, setSelectedIds] = useState<string[]>(["hero-title"]);
  const [past, setPast] = useState<EditorNode[][]>([]);
  const [future, setFuture] = useState<EditorNode[][]>([]);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "restored">("saved");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("design");
  const [codeIndex, setCodeIndex] = useState<ProjectIndex | null>(null);
  const [codeIndexState, setCodeIndexState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [codeIndexMessage, setCodeIndexMessage] = useState("");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [publishMessage, setPublishMessage] = useState("아직 배포되지 않았습니다.");
  const [marquee, setMarquee] = useState<MarqueeSelection | null>(null);
  const [frameDrag, setFrameDrag] = useState<FrameDragState | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [panelResize, setPanelResize] = useState<PanelResizeState | null>(null);
  const [canvasSizes, setCanvasSizes] = useState<Record<DeviceMode, CanvasSize>>(defaultCanvasSizes);
  const [viewport, setViewport] = useState<Viewport>({ scale: getFitZoom("desktop"), x: 0, y: 0 });
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [leftPanelMode, setLeftPanelMode] = useState<LeftPanelMode>("layers");
  const [collapsedLayerIds, setCollapsedLayerIds] = useState<string[]>([]);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState("");
  const [assetCategory, setAssetCategory] = useState<WidgetCategory>("All");
  const [assetSearch, setAssetSearch] = useState("");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const zoom = viewport.scale;
  const selectedId = selectedIds.at(-1) ?? null;
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedId), [nodes, selectedId]);
  const selectedNodes = useMemo(() => nodes.filter((node) => selectedIds.includes(node.id)), [nodes, selectedIds]);
  const visibleNodes = useMemo(() => nodes.filter((node) => !node.hidden), [nodes]);
  const selectionBounds = useMemo(() => getBounds(selectedNodes), [selectedNodes]);
  const activeDevice = deviceConfig[deviceMode];
  const activeCanvasSize = canvasSizes[deviceMode];
  const activePage = useMemo(() => pages.find((page) => page.id === selectedPageId) || pages[0], [pages, selectedPageId]);
  const showPixelGrid = canvasMode === "design" && zoom >= 4;
  const pagesForSave = useMemo(
    () => pages.map((page) => (page.id === selectedPageId ? { ...page, nodes } : page)),
    [nodes, pages, selectedPageId]
  );
  const filteredTemplates = useMemo(() => {
    const query = assetSearch.trim().toLowerCase();

    return blockTemplates.filter((block) => {
      const matchesCategory = assetCategory === "All" || block.category === assetCategory;
      const matchesSearch = !query || `${block.label} ${block.type} ${block.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [assetCategory, assetSearch]);

  const selectedGroups = useMemo(() => Array.from(new Set(selectedNodes.map((node) => node.groupId).filter(Boolean))), [selectedNodes]);
  const layerTree = useMemo(() => {
    const sortedNodes = [...nodes].sort((a, b) => b.zIndex - a.zIndex);
    const grouped = new Map<string, EditorNode[]>();
    const loose: EditorNode[] = [];

    sortedNodes.forEach((node) => {
      if (!node.groupId) {
        loose.push(node);
        return;
      }

      const groupNodes = grouped.get(node.groupId) || [];
      groupNodes.push(node);
      grouped.set(node.groupId, groupNodes);
    });

    return {
      groups: Array.from(grouped.entries()).map(([groupId, groupNodes]) => ({ groupId, nodes: groupNodes })),
      loose
    };
  }, [nodes]);

  useEffect(() => {
    const published = window.localStorage.getItem(PUBLISH_STORAGE_KEY);

    if (published) {
      try {
        const parsed = JSON.parse(published) as { liveUrl?: string; message?: string };

        if (parsed.liveUrl) {
          setPublishedUrl(parsed.liveUrl);
          setPublishState("published");
          setPublishMessage(parsed.message || "이전에 배포된 라이브 사이트가 있습니다.");
        }
      } catch {
        window.localStorage.removeItem(PUBLISH_STORAGE_KEY);
      }
    }

    void restoreProject();
  }, []);

  useEffect(() => {
    if (canvasMode === "code" && codeIndexState === "idle") {
      void loadCodeIndex();
    }
  }, [canvasMode, codeIndexState]);

  useEffect(() => {
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      const project: EditorProject = {
        canvasSizes,
        pages: pagesForSave,
        selectedIds,
        selectedPageId,
        siteName: "WEBABLE Demo Site"
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      void fetch(PROJECT_API, {
        body: JSON.stringify(project),
        headers: { "Content-Type": "application/json" },
        method: "PUT"
      }).catch(() => undefined);
      setSaveState("saved");
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [canvasSizes, nodes, pagesForSave, selectedIds, selectedPageId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (target && (target.isContentEditable || target.closest("[contenteditable='true']") || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setSelectedIds(nodes.filter((node) => !node.hidden).map((node) => node.id));
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelection();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && (event.key === "=" || event.key === "+")) {
        event.preventDefault();
        changeZoom(1);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "-") {
        event.preventDefault();
        changeZoom(-1);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "0") {
        event.preventDefault();
        fitZoom();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        clearSelection();
        return;
      }

      const movableSelected = nodes.filter((node) => selectedIds.includes(node.id) && !node.locked);

      if (movableSelected.length === 0) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
        return;
      }

      const step = event.shiftKey ? 10 : 1;
      const movement: Record<string, { x: number; y: number }> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step }
      };

      if (event.key in movement) {
        event.preventDefault();
        const delta = movement[event.key];
        commitNodes((current) =>
          current.map((node) =>
            selectedIds.includes(node.id) && !node.locked
              ? {
                  ...node,
                  x: snap(node.x + delta.x),
                  y: snap(node.y + delta.y)
                }
              : node
          )
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, selectedId, selectedIds, past, future, zoom, deviceMode]);

  useEffect(() => {
    fitViewport("desktop");

    return () => {
      if (viewportRafRef.current) {
        window.cancelAnimationFrame(viewportRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || canvasMode === "code") {
      return;
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1;
      const deltaX = event.deltaX * unit;
      const deltaY = event.deltaY * unit;

      if (event.ctrlKey || event.metaKey) {
        zoomViewportAtPoint(getWheelZoom(viewportRef.current.scale, deltaY), event.clientX, event.clientY);
        return;
      }

      const current = viewportRef.current;
      applyViewport({ scale: current.scale, x: current.x - deltaX, y: current.y - deltaY });
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [canvasMode]);

  useEffect(() => {
    function closeContextMenu() {
      setContextMenu(null);
    }

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("keydown", closeContextMenu);
    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("keydown", closeContextMenu);
    };
  }, []);

  useEffect(() => {
    if (!frameDrag) {
      return;
    }

    const drag = frameDrag;

    function moveFrame(event: MouseEvent) {
      event.preventDefault();
      applyViewport({
        scale: viewportRef.current.scale,
        x: drag.originX + event.clientX - drag.originClientX,
        y: drag.originY + event.clientY - drag.originClientY
      });
    }

    function stopFrameDrag() {
      setFrameDrag(null);
    }

    window.addEventListener("mousemove", moveFrame);
    window.addEventListener("mouseup", stopFrameDrag);
    return () => {
      window.removeEventListener("mousemove", moveFrame);
      window.removeEventListener("mouseup", stopFrameDrag);
    };
  }, [frameDrag]);

  useEffect(() => {
    if (!panelResize) {
      return;
    }

    const resize = panelResize;

    function movePanel(event: MouseEvent) {
      event.preventDefault();
      const delta = event.clientX - resize.originClientX;

      if (resize.panel === "left") {
        setLeftPanelWidth(clamp(resize.originWidth + delta, 220, 420));
        return;
      }

      setRightPanelWidth(clamp(resize.originWidth - delta, 260, 520));
    }

    function stopPanelResize() {
      setPanelResize(null);
    }

    window.addEventListener("mousemove", movePanel);
    window.addEventListener("mouseup", stopPanelResize);
    return () => {
      window.removeEventListener("mousemove", movePanel);
      window.removeEventListener("mouseup", stopPanelResize);
    };
  }, [panelResize]);

  function commitNodes(updater: (current: EditorNode[]) => EditorNode[]) {
    setNodes((current) => {
      const next = updater(current);
      setPast((items) => [current, ...items].slice(0, 40));
      setFuture([]);
      return next;
    });
  }

  async function restoreProject() {
    const localProject = readLocalProject();

    try {
      const response = await fetch(PROJECT_API);

      if (response.ok) {
        const project = (await response.json()) as EditorProject;
        applyProject(project);
        setSaveState("restored");
        return;
      }
    } catch {
      // Local fallback below keeps the editor usable when the API is unavailable.
    }

    if (localProject) {
      applyProject(localProject);
      setSaveState("restored");
    }
  }

  async function loadCodeIndex() {
    setCodeIndexState("loading");
    setCodeIndexMessage("");

    try {
      const response = await fetch("/api/code/index", {
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(error.message || "Project indexing failed");
      }

      const index = (await response.json()) as ProjectIndex;
      setCodeIndex(index);
      setCodeIndexState("ready");
    } catch (error) {
      setCodeIndex(null);
      setCodeIndexMessage(error instanceof Error ? error.message : "Project indexing failed");
      setCodeIndexState("error");
    }
  }

  function applyProject(project: EditorProject) {
    if (!Array.isArray(project.pages) || project.pages.length === 0) {
      return;
    }

    const nextPageId = project.selectedPageId && project.pages.some((page) => page.id === project.selectedPageId) ? project.selectedPageId : project.pages[0].id;
    const nextPage = project.pages.find((page) => page.id === nextPageId) || project.pages[0];
    setPages(project.pages);
    setSelectedPageId(nextPage.id);
    setNodes(nextPage.nodes);
    setCanvasSizes(normalizeCanvasSizes(project.canvasSizes));
    setSelectedIds(Array.isArray(project.selectedIds) ? project.selectedIds.filter((id) => nextPage.nodes.some((node) => node.id === id)) : []);
  }

  function switchPage(pageId: string) {
    const nextPage = pagesForSave.find((page) => page.id === pageId);

    if (!nextPage) {
      return;
    }

    setPages(pagesForSave);
    setSelectedPageId(nextPage.id);
    setNodes(nextPage.nodes);
    setPast([]);
    setFuture([]);
    setSelectedIds(nextPage.nodes[0] ? [nextPage.nodes[0].id] : []);
    setCanvasMode("design");
  }

  function addPage() {
    const index = pagesForSave.length + 1;
    const id = `page-${Date.now()}`;
    const newPage: EditorPage = {
      id,
      name: `Page ${index}`,
      path: `/page-${index}`,
      nodes: [
        {
          id: `${id}-title`,
          name: "Page title",
          type: "text",
          x: 96,
          y: 120,
          width: 560,
          height: 110,
          zIndex: 1,
          style: { align: "left", color: "#111111", fontSize: 44, fontWeight: 850, text: `새 페이지 ${index}` }
        }
      ]
    };

    setPages([...pagesForSave, newPage]);
    setSelectedPageId(id);
    setNodes(newPage.nodes);
    setPast([]);
    setFuture([]);
    setSelectedIds([newPage.nodes[0].id]);
  }

  function duplicatePage() {
    const id = `${activePage.id}-copy-${Date.now()}`;
    const copy: EditorPage = {
      id,
      name: `${activePage.name} copy`,
      path: `${activePage.path === "/" ? "/home" : activePage.path}-copy`,
      nodes: nodes.map((node) => ({ ...node, id: `${node.id}-copy-${Date.now()}` }))
    };

    setPages([...pagesForSave, copy]);
    setSelectedPageId(copy.id);
    setNodes(copy.nodes);
    setSelectedIds(copy.nodes[0] ? [copy.nodes[0].id] : []);
  }

  function deletePage(pageId: string) {
    if (pagesForSave.length <= 1) {
      return;
    }

    const nextPages = pagesForSave.filter((page) => page.id !== pageId);
    const nextPage = nextPages[0];
    setPages(nextPages);
    setSelectedPageId(nextPage.id);
    setNodes(nextPage.nodes);
    setPast([]);
    setFuture([]);
    setSelectedIds(nextPage.nodes[0] ? [nextPage.nodes[0].id] : []);
  }

  function undo() {
    const [previous, ...rest] = past;

    if (!previous) {
      return;
    }

    setFuture((items) => [nodes, ...items].slice(0, 40));
    setNodes(previous);
    setPast(rest);
    setSelectedIds((current) => current.filter((id) => previous.some((node) => node.id === id)));
  }

  function redo() {
    const [next, ...rest] = future;

    if (!next) {
      return;
    }

    setPast((items) => [nodes, ...items].slice(0, 40));
    setNodes(next);
    setFuture(rest);
    setSelectedIds((current) => current.filter((id) => next.some((node) => node.id === id)));
  }

  function selectNode(id: string, additive = false) {
    const node = nodes.find((item) => item.id === id);
    const targetIds = node?.groupId ? nodes.filter((item) => item.groupId === node.groupId).map((item) => item.id) : [id];

    setSelectedIds((current) => {
      if (!additive) {
        return targetIds;
      }

      if (targetIds.every((item) => current.includes(item))) {
        return current.filter((item) => !targetIds.includes(item));
      }

      return Array.from(new Set([...current, ...targetIds]));
    });
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function updateNode(id: string, changes: Partial<EditorNode>) {
    commitNodes((current) => current.map((node) => (node.id === id ? { ...node, ...changes } : node)));
  }

  function updateStyle(id: string, changes: Partial<EditorNode["style"]>) {
    commitNodes((current) =>
      current.map((node) =>
        node.id === id
          ? {
              ...node,
              style: {
                ...node.style,
                ...changes
              }
            }
          : node
      )
    );
  }

  function startInlineTextEdit(node: EditorNode) {
    if (!["text", "button"].includes(node.type) || node.locked) {
      return;
    }

    setSelectedIds([node.id]);
    setEditingNodeId(node.id);
  }

  function commitInlineText(id: string, text: string) {
    const nextText = text.trim();

    if (nextText) {
      updateStyle(id, { text: nextText });
    }

    setEditingNodeId(null);
  }

  function toggleLayerCollapse(id: string) {
    setCollapsedLayerIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function startLayerRename(node: EditorNode) {
    setEditingLayerId(node.id);
    setEditingLayerName(getLayerLabel(node));
  }

  function commitLayerRename(node: EditorNode) {
    const nextName = editingLayerName.trim();

    if (nextName) {
      if (node.type === "text" || node.type === "button") {
        updateStyle(node.id, { text: nextName });
      } else {
        updateNode(node.id, { name: nextName });
      }
    }

    setEditingLayerId(null);
    setEditingLayerName("");
  }

  function addNode(type: EditorNodeType) {
    const id = `${type}-${Date.now()}`;
    const nextZ = Math.max(...nodes.map((node) => node.zIndex), 0) + 1;
    const widget = getWidgetDefaults(type);
    const base: EditorNode = {
      id,
      name: widget.name,
      type,
      x: snap(160 + nodes.length * 14),
      y: snap(120 + nodes.length * 14),
      width: widget.width,
      height: widget.height,
      zIndex: nextZ,
      style: widget.style
    };

    commitNodes((current) => [...current, base]);
    setSelectedIds([id]);
  }

  function addImageNode(imageUrl: string) {
    const id = `image-${Date.now()}`;
    const nextZ = Math.max(...nodes.map((node) => node.zIndex), 0) + 1;
    const node: EditorNode = {
      id,
      name: "Uploaded image",
      type: "image",
      x: snap(180 + nodes.length * 10),
      y: snap(140 + nodes.length * 10),
      width: 280,
      height: 190,
      zIndex: nextZ,
      style: {
        background: "#e5e5e5",
        border: "1px solid #d0d0d0",
        imageUrl,
        radius: 12
      }
    };

    commitNodes((current) => [...current, node]);
    setSelectedIds([id]);
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = String(reader.result || "");

      if (!imageUrl) {
        return;
      }

      if (selectedNode?.type === "image") {
        updateStyle(selectedNode.id, { imageUrl });
      } else {
        addImageNode(imageUrl);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function deleteNode(id: string) {
    if (nodes.length <= 1) {
      return;
    }

    const nextNodes = nodes.filter((node) => node.id !== id);
    commitNodes(() => nextNodes);
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function deleteSelection() {
    if (selectedIds.length === 0 || nodes.length <= selectedIds.length) {
      return;
    }

    commitNodes((current) => current.filter((node) => !selectedIds.includes(node.id)));
    setSelectedIds([]);
  }

  function duplicateNode(node: EditorNode) {
    const copy: EditorNode = {
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      name: `${node.name} copy`,
      x: snap(node.x + 24),
      y: snap(node.y + 24),
      zIndex: Math.max(...nodes.map((item) => item.zIndex), 0) + 1
    };

    commitNodes((current) => [...current, copy]);
    setSelectedIds([copy.id]);
  }

  function duplicateSelection() {
    if (selectedNodes.length === 0) {
      return;
    }

    duplicateIds(selectedIds);
  }

  function duplicateIds(ids: string[]) {
    const nodesToCopy = nodes.filter((node) => ids.includes(node.id));

    if (nodesToCopy.length === 0) {
      return;
    }

    const topZ = Math.max(...nodes.map((item) => item.zIndex), 0);
    const copies = nodesToCopy.map((node, index) => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}-${index}`,
      name: `${node.name} copy`,
      x: snap(node.x + 24),
      y: snap(node.y + 24),
      zIndex: topZ + index + 1
    }));

    commitNodes((current) => [...current, ...copies]);
    setSelectedIds(copies.map((node) => node.id));
  }

  function bringForward(node: EditorNode) {
    updateNode(node.id, { zIndex: Math.max(...nodes.map((item) => item.zIndex), 0) + 1 });
  }

  function bringSelectionForward() {
    bringIdsForward(selectedIds);
  }

  function bringIdsForward(ids: string[]) {
    const topZ = Math.max(...nodes.map((item) => item.zIndex), 0);
    commitNodes((current) =>
      current.map((node) => {
        const selectedIndex = ids.indexOf(node.id);
        return selectedIndex >= 0 ? { ...node, zIndex: topZ + selectedIndex + 1 } : node;
      })
    );
  }

  function moveNodeSelection(node: EditorNode, nextX: number, nextY: number) {
    const snapped = getSmartSnap(node, nextX, nextY);
    const deltaX = snap(snapped.x) - node.x;
    const deltaY = snap(snapped.y) - node.y;

    if (deltaX === 0 && deltaY === 0) {
      setSnapGuides([]);
      return;
    }

    const idsToMove =
      selectedIds.includes(node.id) && selectedIds.length > 1
        ? selectedIds
        : node.groupId
          ? nodes.filter((item) => item.groupId === node.groupId).map((item) => item.id)
          : [node.id];

    commitNodes((current) =>
      current.map((item) =>
        idsToMove.includes(item.id) && !item.locked
          ? {
              ...item,
              x: snap(item.x + deltaX),
              y: snap(item.y + deltaY)
            }
          : item
      )
    );
    setSnapGuides([]);
  }

  function previewNodeSnap(node: EditorNode, nextX: number, nextY: number) {
    setSnapGuides(getSmartSnap(node, nextX, nextY).guides);
  }

  function groupSelection() {
    if (selectedNodes.length < 2) {
      return;
    }

    const groupId = `group-${Date.now()}`;
    commitNodes((current) => current.map((node) => (selectedIds.includes(node.id) ? { ...node, groupId } : node)));
  }

  function ungroupSelection() {
    const groupIds = new Set(selectedNodes.map((node) => node.groupId).filter(Boolean));

    if (groupIds.size === 0) {
      return;
    }

    commitNodes((current) => current.map((node) => (node.groupId && groupIds.has(node.groupId) ? { ...node, groupId: undefined } : node)));
  }

  function toggleLock(node: EditorNode) {
    updateNode(node.id, { locked: !node.locked });
  }

  function toggleHidden(node: EditorNode) {
    updateNode(node.id, { hidden: !node.hidden });
  }

  function toggleLockSelection() {
    toggleLockIds(selectedIds);
  }

  function toggleLockIds(ids: string[]) {
    const nodesToToggle = nodes.filter((node) => ids.includes(node.id));
    const shouldLock = nodesToToggle.some((node) => !node.locked);
    commitNodes((current) => current.map((node) => (ids.includes(node.id) ? { ...node, locked: shouldLock } : node)));
  }

  function toggleHiddenIds(ids: string[]) {
    const nodesToToggle = nodes.filter((node) => ids.includes(node.id));
    const shouldHide = nodesToToggle.some((node) => !node.hidden);
    commitNodes((current) => current.map((node) => (ids.includes(node.id) ? { ...node, hidden: shouldHide } : node)));
    if (shouldHide) {
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    }
  }

  function deleteIds(ids: string[]) {
    if (ids.length === 0 || nodes.length <= ids.length) {
      return;
    }

    commitNodes((current) => current.filter((node) => !ids.includes(node.id)));
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
  }

  function alignSelection(edge: "left" | "center" | "right" | "top" | "middle" | "bottom") {
    if (!selectionBounds || selectedNodes.length < 2) {
      return;
    }

    commitNodes((current) =>
      current.map((node) => {
        if (!selectedIds.includes(node.id) || node.locked) {
          return node;
        }

        if (edge === "left") return { ...node, x: selectionBounds.x };
        if (edge === "center") return { ...node, x: snap(selectionBounds.x + selectionBounds.width / 2 - node.width / 2) };
        if (edge === "right") return { ...node, x: selectionBounds.x + selectionBounds.width - node.width };
        if (edge === "top") return { ...node, y: selectionBounds.y };
        if (edge === "middle") return { ...node, y: snap(selectionBounds.y + selectionBounds.height / 2 - node.height / 2) };
        return { ...node, y: selectionBounds.y + selectionBounds.height - node.height };
      })
    );
  }

  function startFrameDrag(event: React.MouseEvent<HTMLElement>) {
    if (canvasMode !== "design") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    clearSelection();
    setMarquee(null);
    setFrameDrag({
      originClientX: event.clientX,
      originClientY: event.clientY,
      originX: viewportRef.current.x,
      originY: viewportRef.current.y
    });
  }

  function startPanelResize(panel: PanelResizeState["panel"], event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setPanelResize({
      panel,
      originClientX: event.clientX,
      originWidth: panel === "left" ? leftPanelWidth : rightPanelWidth
    });
  }

  function handleArtboardMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (canvasMode !== "design" || event.currentTarget !== event.target) {
      return;
    }

    if (event.shiftKey) {
      startMarquee(event);
      return;
    }

    startFrameDrag(event);
  }

  function startMarquee(event: React.MouseEvent<HTMLDivElement>) {
    if (canvasMode !== "design" || event.currentTarget !== event.target) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const scale = viewportRef.current.scale;
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    clearSelection();
    setMarquee({ height: 0, originX: x, originY: y, width: 0, x, y });
  }

  function updateMarquee(event: React.MouseEvent<HTMLDivElement>) {
    if (!marquee) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const scale = viewportRef.current.scale;
    const pointerX = (event.clientX - rect.left) / scale;
    const pointerY = (event.clientY - rect.top) / scale;
    setMarquee({
      ...marquee,
      height: Math.abs(pointerY - marquee.originY),
      width: Math.abs(pointerX - marquee.originX),
      x: Math.min(pointerX, marquee.originX),
      y: Math.min(pointerY, marquee.originY)
    });
  }

  function finishMarquee() {
    if (!marquee) {
      return;
    }

    if (marquee.width < 6 && marquee.height < 6) {
      setMarquee(null);
      clearSelection();
      return;
    }

    setSelectedIds(
      nodes
        .filter((node) => !node.hidden && intersects(marquee, { height: node.height, width: node.width, x: node.x, y: node.y }))
        .map((node) => node.id)
    );
    setMarquee(null);
  }

  function openContextMenu(event: React.MouseEvent, node?: EditorNode) {
    if (canvasMode !== "design") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const ids = node ? getContextIds(node) : selectedIds;

    if (node && !ids.every((id) => selectedIds.includes(id))) {
      setSelectedIds(ids);
    }

    setContextMenu({ ids, x: event.clientX, y: event.clientY });
  }

  function getContextIds(node: EditorNode) {
    if (selectedIds.includes(node.id)) {
      return selectedIds;
    }

    if (node.groupId) {
      return nodes.filter((item) => item.groupId === node.groupId).map((item) => item.id);
    }

    return [node.id];
  }

  function runContextAction(action: (ids: string[]) => void) {
    if (!contextMenu) {
      return;
    }

    action(contextMenu.ids);
    setContextMenu(null);
  }

  function getSmartSnap(node: EditorNode, nextX: number, nextY: number) {
    let x = snap(nextX);
    let y = snap(nextY);
    const guides: SnapGuide[] = [];
    const sourceX = [0, activeCanvasSize.width / 2, activeCanvasSize.width];
    const sourceY = [0, activeCanvasSize.height / 2, activeCanvasSize.height];

    nodes.forEach((item) => {
      if (item.id === node.id || item.hidden || selectedIds.includes(item.id)) {
        return;
      }

      sourceX.push(item.x, item.x + item.width / 2, item.x + item.width);
      sourceY.push(item.y, item.y + item.height / 2, item.y + item.height);
    });

    const targetX = [
      { edge: x, offset: 0 },
      { edge: x + node.width / 2, offset: node.width / 2 },
      { edge: x + node.width, offset: node.width }
    ];
    const targetY = [
      { edge: y, offset: 0 },
      { edge: y + node.height / 2, offset: node.height / 2 },
      { edge: y + node.height, offset: node.height }
    ];
    const xSnap = findClosestSnap(targetX, sourceX);
    const ySnap = findClosestSnap(targetY, sourceY);

    if (xSnap) {
      x = snap(xSnap.source - xSnap.offset);
      guides.push({ axis: "x", position: xSnap.source });
    }

    if (ySnap) {
      y = snap(ySnap.source - ySnap.offset);
      guides.push({ axis: "y", position: ySnap.source });
    }

    return { guides, x, y };
  }

  function resetDocument() {
    commitNodes(() => initialNodes);
    setSelectedIds(["hero-title"]);
    setCanvasSizes(defaultCanvasSizes);
    setDeviceMode("desktop");
    fitViewport("desktop");
    setCanvasMode("design");
  }

  function changeZoom(delta: number) {
    zoomViewportAtCenter(getSteppedZoom(viewportRef.current.scale, delta));
  }

  function fitZoom() {
    fitViewport(deviceMode);
  }

  function scheduleViewportCommit() {
    if (viewportRafRef.current) {
      return;
    }

    viewportRafRef.current = window.requestAnimationFrame(() => {
      viewportRafRef.current = 0;
      setViewport(viewportRef.current);
    });
  }

  function applyViewport(next: Viewport) {
    const normalized = { scale: clampZoom(next.scale), x: next.x, y: next.y };
    viewportRef.current = normalized;

    const stage = stageRef.current;
    const artboard = artboardRef.current;

    if (stage) {
      stage.style.transform = `translate(${normalized.x}px, ${normalized.y}px)`;
    }

    if (artboard) {
      artboard.style.transform = `scale(${normalized.scale})`;
    }

    scheduleViewportCommit();
  }

  function zoomViewportAtCenter(nextScale: number) {
    const canvas = canvasRef.current;

    if (!canvas) {
      const current = viewportRef.current;
      applyViewport({ scale: nextScale, x: current.x, y: current.y });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    zoomViewportAtPoint(nextScale, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function zoomViewportAtPoint(nextScale: number, clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const current = viewportRef.current;
    const normalizedScale = clampZoom(nextScale);

    if (!canvas || normalizedScale === current.scale) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const pointerX = clientX - rect.left;
    const pointerY = clientY - rect.top;
    const ratio = normalizedScale / current.scale;

    applyViewport({
      scale: normalizedScale,
      x: pointerX - (pointerX - current.x) * ratio,
      y: pointerY - (pointerY - current.y) * ratio
    });
  }

  function fitViewport(device: DeviceMode) {
    const canvas = canvasRef.current;
    const size = canvasSizes[device];

    if (!canvas) {
      applyViewport({ scale: getFitZoom(device), x: 0, y: 0 });
      return;
    }

    const margin = 48;
    const rect = canvas.getBoundingClientRect();
    const scale = clampZoom(Math.min(1, (rect.width - margin * 2) / size.width));

    applyViewport({
      scale,
      x: (rect.width - size.width * scale) / 2,
      y: margin
    });
  }

  function switchDevice(device: DeviceMode) {
    setDeviceMode(device);
    fitViewport(device);
  }

  function updateCanvasSize(axis: keyof CanvasSize, value: number) {
    const min = axis === "width" ? 320 : 480;
    const max = axis === "width" ? 2560 : 5000;
    const nextValue = Math.min(max, Math.max(min, Math.round(value || min)));

    setCanvasSizes((current) => ({
      ...current,
      [deviceMode]: {
        ...current[deviceMode],
        [axis]: nextValue
      }
    }));
  }

  async function publishSite() {
    setPublishState("publishing");
    setPublishMessage("배포 중입니다...");

    try {
      const response = await fetch(`/api/sites/${SITE_ID}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          canvasSizes,
          nodes,
          pages: pagesForSave,
          selectedId,
          selectedPageId,
          siteName: "WEBABLE Demo Site"
        })
      });

      if (!response.ok) {
        throw new Error("Publish failed");
      }

      const result = (await response.json()) as { liveUrl: string; publishedAt: string };
      setPublishedUrl(result.liveUrl);
      setPublishState("published");
      const message = `배포 완료 · ${new Date(result.publishedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`;
      setPublishMessage(message);
      window.localStorage.setItem(PUBLISH_STORAGE_KEY, JSON.stringify({ liveUrl: result.liveUrl, message }));
    } catch {
      setPublishState("error");
      setPublishMessage("배포에 실패했습니다. 다시 시도하세요.");
    }
  }

  return (
    <section
      className={panelResize ? "freeformShell resizingPanels" : "freeformShell"}
      style={{ gridTemplateColumns: `54px ${leftPanelWidth}px minmax(520px, 1fr) ${rightPanelWidth}px` }}
    >
      <aside className="ffToolRail" aria-label="Tools">
        <div className="ffRailBrand">W</div>
        <button className="active" title="Select" type="button">
          <MousePointer2 size={18} />
        </button>
        <button onClick={() => addNode("container")} title="Frame" type="button">
          <Square size={18} />
        </button>
        <button onClick={() => addNode("text")} title="Text" type="button">
          <Type size={18} />
        </button>
        <button onClick={() => addNode("image")} title="Image" type="button">
          <ImageIcon size={18} />
        </button>
        <button onClick={() => imageInputRef.current?.click()} title="Upload" type="button">
          <Upload size={18} />
        </button>
        <span />
        <button onClick={publishSite} title="Publish" type="button">
          <Rocket size={18} />
        </button>
      </aside>
      <aside className="ffPanel ffLayers" aria-label="Layers">
        <div className="ffPanelResizeHandle right" onMouseDown={(event) => startPanelResize("left", event)} role="separator" aria-orientation="vertical" aria-label="Resize layers panel" />
        <div className="ffPanelHeader">
          <Layers size={17} />
          <div>
            <strong>WEBABLE</strong>
            <span>{visibleNodes.length} objects</span>
          </div>
        </div>
        <div className="ffPanelTabs" aria-label="Workspace panels">
          <button className={leftPanelMode === "layers" ? "active" : ""} onClick={() => setLeftPanelMode("layers")} type="button">
            <PanelLeft size={14} />
            Layers
          </button>
          <button className={leftPanelMode === "assets" ? "active" : ""} onClick={() => setLeftPanelMode("assets")} type="button">
            <Square size={14} />
            Assets
          </button>
        </div>
        <div className="ffMiniToolbar">
          <button disabled={past.length === 0} onClick={undo} title="Undo" type="button">
            <Undo2 size={15} />
          </button>
          <button disabled={future.length === 0} onClick={redo} title="Redo" type="button">
            <Redo2 size={15} />
          </button>
          <button onClick={resetDocument} title="Reset" type="button">
            <RotateCcw size={15} />
          </button>
          <span>
            <Save size={14} />
            {saveState}
          </span>
        </div>
        <div className="ffPages">
          <div className="ffPagesHeader">
            <span>Pages</span>
            <button onClick={addPage} title="Add page" type="button">
              <Plus size={14} />
            </button>
          </div>
          <div className="ffPageList">
            {pagesForSave.map((page) => (
              <div className={page.id === selectedPageId ? "ffPageRow active" : "ffPageRow"} key={page.id}>
                <button className="ffPageSelect" onClick={() => switchPage(page.id)} type="button">
                  <FileText size={14} />
                  <span>{page.name}</span>
                  <em>{page.path}</em>
                </button>
                {page.id === selectedPageId ? (
                  <button className="ffPageIcon" onClick={duplicatePage} title="Duplicate page" type="button">
                    <Copy size={13} />
                  </button>
                ) : null}
                {pagesForSave.length > 1 ? (
                  <button className="ffPageIcon" onClick={() => deletePage(page.id)} title="Delete page" type="button">
                    <Trash2 size={13} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        {leftPanelMode === "assets" ? (
          <div className="ffAssetsPanel">
            <div className="ffWidgetSearch">
              <Search size={14} />
              <input aria-label="Search widgets" placeholder="Search widgets" value={assetSearch} onChange={(event) => setAssetSearch(event.target.value)} />
            </div>
            <div className="ffWidgetCategories" aria-label="Widget categories">
              {widgetCategories.map((category) => (
                <button className={assetCategory === category ? "active" : ""} key={category} onClick={() => setAssetCategory(category)} type="button">
                  {category}
                </button>
              ))}
            </div>
            <div className="ffAddGrid">
              {filteredTemplates.map((block) => (
                <button className="ffWidgetCard" key={block.type} onClick={() => addNode(block.type)} type="button">
                  <WidgetPreview type={block.type} />
                  <span>
                    {block.icon}
                    <strong>{block.label}</strong>
                  </span>
                  <em>{block.category}</em>
                </button>
              ))}
            </div>
            <button className="ffUploadButton" onClick={() => imageInputRef.current?.click()} type="button">
              <Upload size={15} />
              Upload image
            </button>
          </div>
        ) : (
          <div className="ffLayerTree" aria-label="Layer tree">
            <div className="ffLayerTreeRoot">
              <button className={collapsedLayerIds.includes("page-root") ? "ffTreeToggle collapsed" : "ffTreeToggle"} onClick={() => toggleLayerCollapse("page-root")} title="Toggle page layers" type="button">
                <ChevronDown size={13} />
              </button>
              <FileText size={14} />
              <span>{activePage.name}</span>
              <em>{nodes.length}</em>
            </div>
            {!collapsedLayerIds.includes("page-root") && layerTree.groups.map((group, index) => {
              const ids = group.nodes.map((node) => node.id);
              const isGroupSelected = ids.every((id) => selectedIds.includes(id));
              const isGroupHidden = group.nodes.every((node) => node.hidden);
              const isGroupLocked = group.nodes.every((node) => node.locked);
              const isGroupCollapsed = collapsedLayerIds.includes(group.groupId);

              return (
                <div className="ffLayerGroup" key={group.groupId}>
                  <div className={isGroupSelected ? "ffLayerRow tree group active" : "ffLayerRow tree group"}>
                    <button className="ffLayerSelect" onClick={() => setSelectedIds(ids)} type="button">
                      <span
                        className={isGroupCollapsed ? "ffTreeToggle collapsed" : "ffTreeToggle"}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleLayerCollapse(group.groupId);
                        }}
                      >
                        <ChevronDown size={13} />
                      </span>
                      <Group size={14} />
                      <span>{`Group ${index + 1}`}</span>
                      <em>{group.nodes.length}</em>
                    </button>
                    <button className="ffLayerIcon" onClick={() => toggleHiddenIds(ids)} title={isGroupHidden ? "Show group" : "Hide group"} type="button">
                      {isGroupHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button className="ffLayerIcon" onClick={() => toggleLockIds(ids)} title={isGroupLocked ? "Unlock group" : "Lock group"} type="button">
                      {isGroupLocked ? <Lock size={13} /> : <Unlock size={13} />}
                    </button>
                  </div>
                  {!isGroupCollapsed && group.nodes.map((node) => (
                    <div className={selectedIds.includes(node.id) ? "ffLayerRow tree child active" : "ffLayerRow tree child"} key={node.id}>
                      <button className="ffLayerSelect" onClick={(event) => selectNode(node.id, event.shiftKey)} onDoubleClick={() => startLayerRename(node)} type="button">
                        <span className="ffTreeIndent" />
                        <NodeIcon type={node.type} />
                        {editingLayerId === node.id ? (
                          <input
                            autoFocus
                            className="ffLayerNameInput"
                            onBlur={() => commitLayerRename(node)}
                            onChange={(event) => setEditingLayerName(event.currentTarget.value)}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => {
                              event.stopPropagation();
                              if (event.key === "Enter") {
                                event.preventDefault();
                                commitLayerRename(node);
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                setEditingLayerId(null);
                              }
                            }}
                            value={editingLayerName}
                          />
                        ) : (
                          <span>{getLayerLabel(node)}</span>
                        )}
                      </button>
                      <button className="ffLayerIcon" onClick={() => toggleHidden(node)} title={node.hidden ? "Show" : "Hide"} type="button">
                        {node.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button className="ffLayerIcon" onClick={() => toggleLock(node)} title={node.locked ? "Unlock" : "Lock"} type="button">
                        {node.locked ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
            {!collapsedLayerIds.includes("page-root") && layerTree.loose.map((node) => (
              <div className={selectedIds.includes(node.id) ? "ffLayerRow tree active" : "ffLayerRow tree"} key={node.id}>
                <button className="ffLayerSelect" onClick={(event) => selectNode(node.id, event.shiftKey)} onDoubleClick={() => startLayerRename(node)} type="button">
                  <span className="ffTreeIndent compact" />
                  <NodeIcon type={node.type} />
                  {editingLayerId === node.id ? (
                    <input
                      autoFocus
                      className="ffLayerNameInput"
                      onBlur={() => commitLayerRename(node)}
                      onChange={(event) => setEditingLayerName(event.currentTarget.value)}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => {
                        event.stopPropagation();
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitLayerRename(node);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setEditingLayerId(null);
                        }
                      }}
                      value={editingLayerName}
                    />
                  ) : (
                    <span>{getLayerLabel(node)}</span>
                  )}
                </button>
                <button className="ffLayerIcon" onClick={() => toggleHidden(node)} title={node.hidden ? "Show" : "Hide"} type="button">
                  {node.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button className="ffLayerIcon" onClick={() => toggleLock(node)} title={node.locked ? "Unlock" : "Lock"} type="button">
                  {node.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
        <input ref={imageInputRef} className="ffHiddenInput" accept="image/*" onChange={handleImageUpload} type="file" />
      </aside>

      <div className="ffCanvasWrap">
        <div className="ffToolbar">
          <div className="ffModeSwitch" aria-label="Canvas mode">
            <button className={canvasMode === "design" ? "active" : ""} onClick={() => setCanvasMode("design")} type="button">
              <MousePointer2 size={15} />
              Design
            </button>
            <button className={canvasMode === "code" ? "active" : ""} onClick={() => setCanvasMode("code")} type="button">
              <FileText size={15} />
              Code
            </button>
          </div>
          <div className="ffDeviceSwitch" aria-label="Responsive canvas">
            {(Object.keys(deviceConfig) as DeviceMode[]).map((device) => (
              <button className={deviceMode === device ? "active" : ""} key={device} onClick={() => switchDevice(device)} title={deviceConfig[device].label} type="button">
                {deviceConfig[device].icon}
              </button>
            ))}
          </div>
          <div className="ffCanvasSizeControl" aria-label="Canvas size">
            <span>{activeDevice.label}</span>
            <label>
              W
              <input value={activeCanvasSize.width} type="number" min={320} max={2560} step={8} onChange={(event) => updateCanvasSize("width", Number(event.target.value))} />
            </label>
            <label>
              H
              <input value={activeCanvasSize.height} type="number" min={480} max={5000} step={8} onChange={(event) => updateCanvasSize("height", Number(event.target.value))} />
            </label>
          </div>
          <span className="ffPageCrumb">{activePage.name}</span>
          <strong>{selectedNodes.length > 1 ? `${selectedNodes.length} selected` : selectedNode ? selectedNode.name : "No selection"}</strong>
          <em>
            {selectedNodes.length > 1 && selectionBounds
              ? `X ${selectionBounds.x} · Y ${selectionBounds.y} · W ${selectionBounds.width} · H ${selectionBounds.height}`
              : selectedNode
              ? `X ${selectedNode.x} · Y ${selectedNode.y} · W ${selectedNode.width} · H ${selectedNode.height}`
              : `${visibleNodes.length} objects on canvas`}
          </em>
          <button className="ffPublishButton" disabled={publishState === "publishing"} onClick={publishSite} type="button">
            {publishState === "published" ? <CheckCircle2 size={15} /> : <Rocket size={15} />}
            {publishState === "publishing" ? "Publishing" : "Publish"}
          </button>
        </div>
        <div
          className={`${canvasMode === "code" ? "ffCanvas code" : "ffCanvas"}${frameDrag ? " panning" : ""}`}
          ref={canvasRef}
          onContextMenu={(event) => openContextMenu(event)}
          onMouseDown={(event) => {
            if (canvasMode === "design" && event.currentTarget === event.target) {
              startFrameDrag(event);
            }
          }}
        >
          {canvasMode === "code" ? (
            <CodeWorkspace
              index={codeIndex}
              message={codeIndexMessage}
              nodes={nodes}
              onReload={loadCodeIndex}
              state={codeIndexState}
            />
          ) : (
          <>
          <div
            className="ffArtboardStage"
            ref={stageRef}
            style={{ transform: `translate(${viewport.x}px, ${viewport.y}px)` }}
          >
          <div className="ffFrameLabel" onMouseDown={startFrameDrag} title="Drag frame">
            {activePage.name}
          </div>
          <div
            className={`ffArtboard ${deviceMode}${frameDrag ? " draggingFrame" : ""}`}
            ref={artboardRef}
            onContextMenu={(event) => openContextMenu(event)}
            onMouseDown={handleArtboardMouseDown}
            onMouseMove={updateMarquee}
            onMouseUp={finishMarquee}
            style={
              {
                height: activeCanvasSize.height,
                transform: `scale(${zoom})`,
                width: activeCanvasSize.width
              } as React.CSSProperties
            }
          >
            {showPixelGrid ? (
              <div
                aria-hidden="true"
                className="ffPixelGrid"
                style={
                  {
                    backgroundSize: `${zoom}px ${zoom}px`,
                    height: activeCanvasSize.height * zoom,
                    transform: `scale(${1 / zoom})`,
                    width: activeCanvasSize.width * zoom
                  } as React.CSSProperties
                }
              />
            ) : null}
            {nodes.map((node) =>
                  node.hidden ? null : (
                <Rnd
                  bounds="parent"
                  className={selectedIds.includes(node.id) ? "ffNode selected" : "ffNode"}
                  disableDragging={node.locked || editingNodeId === node.id}
                  dragGrid={[GRID_SIZE, GRID_SIZE]}
                  enableResizing={Boolean(!node.locked && selectedIds.length === 1 && selectedNode && node.id === selectedNode.id)}
                  key={node.id}
                  minHeight={24}
                  minWidth={42}
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    selectNode(node.id, event.shiftKey);
                  }}
                  onContextMenu={(event: React.MouseEvent) => openContextMenu(event, node)}
                  onDrag={(_, data) => previewNodeSnap(node, data.x, data.y)}
                  onDragStop={(_, data) => moveNodeSelection(node, data.x, data.y)}
                  onResizeStop={(_, __, ref, ___, position) =>
                    updateNode(node.id, {
                      width: snap(ref.offsetWidth),
                      height: snap(ref.offsetHeight),
                      x: snap(position.x),
                      y: snap(position.y)
                    })
                  }
                  position={{ x: node.x, y: node.y }}
                  resizeGrid={[GRID_SIZE, GRID_SIZE]}
                  scale={zoom}
                  resizeHandleStyles={{
                    bottom: { ...edgeHandleStyle, bottom: -1, height: 1 },
                    bottomLeft: { ...handleStyle, bottom: -3, left: -3 },
                    bottomRight: { ...handleStyle, bottom: -3, right: -3 },
                    left: { ...edgeHandleStyle, left: -1, width: 1 },
                    right: { ...edgeHandleStyle, right: -1, width: 1 },
                    top: { ...edgeHandleStyle, height: 1, top: -1 },
                    topLeft: { ...handleStyle, left: -3, top: -3 },
                    topRight: { ...handleStyle, right: -3, top: -3 }
                  }}
                  size={{ width: node.width, height: node.height }}
                  style={{ zIndex: selectedIds.includes(node.id) ? 10002 + node.zIndex : node.zIndex }}
                >
                  <RenderNode
                    isEditing={editingNodeId === node.id}
                    node={node}
                    onCommitText={(text) => commitInlineText(node.id, text)}
                    onStartEditing={() => startInlineTextEdit(node)}
                  />
                </Rnd>
                  )
                )}
            {canvasMode === "design" && selectionBounds && selectedIds.length > 0 ? (
              <>
                {selectedIds.length > 1 ? (
                  <div
                    className="ffSelectionBounds"
                    onMouseDown={(event) => event.stopPropagation()}
                    style={{
                      height: selectionBounds.height,
                      left: selectionBounds.x,
                      top: selectionBounds.y,
                      width: selectionBounds.width
                    }}
                  />
                ) : null}
                <div
                  className="ffFloatingBar"
                  onMouseDown={(event) => event.stopPropagation()}
                  style={{
                    left: Math.max(8, selectionBounds.x),
                    top: Math.max(8, selectionBounds.y - 42)
                  }}
                >
                  <span>{selectedIds.length > 1 ? `${selectedIds.length} selected` : selectedNode?.name}</span>
                  {selectedIds.length > 1 ? (
                    <>
                      <button onClick={groupSelection} title="Group" type="button">
                        <Group size={13} />
                      </button>
                      <button disabled={selectedGroups.length === 0} onClick={ungroupSelection} title="Ungroup" type="button">
                        <Ungroup size={13} />
                      </button>
                    </>
                  ) : null}
                  <button onClick={duplicateSelection} title="Duplicate" type="button">
                    <Copy size={13} />
                  </button>
                  <button onClick={bringSelectionForward} title="Bring front" type="button">
                    <BringToFront size={13} />
                  </button>
                  <button onClick={toggleLockSelection} title="Lock" type="button">
                    <Lock size={13} />
                  </button>
                  <button className="danger" onClick={deleteSelection} title="Delete" type="button">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div
                  className="ffSizeBadge"
                  onMouseDown={(event) => event.stopPropagation()}
                  style={{
                    left: selectionBounds.x + selectionBounds.width / 2,
                    top: selectionBounds.y + selectionBounds.height + 12,
                    transform: `translateX(-50%) scale(${1 / zoom})`
                  }}
                >
                  {Math.round(selectionBounds.width)} × {Math.round(selectionBounds.height)}
                </div>
              </>
            ) : null}
            {marquee ? (
              <div
                className="ffMarquee"
                style={{
                  height: marquee.height,
                  left: marquee.x,
                  top: marquee.y,
                  width: marquee.width
                }}
              />
            ) : null}
            {snapGuides.map((guide, index) => (
              <div
                className={guide.axis === "x" ? "ffSmartGuide vertical" : "ffSmartGuide horizontal"}
                key={`${guide.axis}-${guide.position}-${index}`}
                style={guide.axis === "x" ? { left: guide.position } : { top: guide.position }}
              />
            ))}
            </div>
          </div>
          </>
          )}
          {canvasMode === "design" ? (
            <div className="ffCanvasHud">
              <button onClick={() => changeZoom(-1)} title="Zoom out" type="button">
                <ZoomOut size={14} />
              </button>
              <button onClick={fitZoom} title="Fit" type="button">
                <Maximize2 size={14} />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button onClick={() => changeZoom(1)} title="Zoom in" type="button">
                <ZoomIn size={14} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="ffPanel ffInspector" aria-label="Inspector">
        <div className="ffPanelResizeHandle left" onMouseDown={(event) => startPanelResize("right", event)} role="separator" aria-orientation="vertical" aria-label="Resize inspector panel" />
        <div className="ffPanelHeader">
          <PanelRight size={17} />
          <div>
            <strong>Inspector</strong>
            <span>{canvasMode === "code" ? "Code model" : "Edit properties"}</span>
          </div>
        </div>
        <div className={`ffPublishCard ${publishState}`}>
          <div>
            <span>Publish</span>
            <strong>{publishMessage}</strong>
          </div>
          {publishedUrl ? (
            <a href={publishedUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={14} />
              Live
            </a>
          ) : (
            <button disabled={publishState === "publishing"} onClick={publishSite} type="button">
              <Rocket size={14} />
              Publish
            </button>
          )}
        </div>
        {selectedNodes.length > 1 && selectionBounds ? (
          <div className="ffMultiInspector">
            <div className="ffMultiSummary">
              <strong>{selectedNodes.length} objects selected</strong>
              <span>
                X {selectionBounds.x} · Y {selectionBounds.y} · W {selectionBounds.width} · H {selectionBounds.height}
              </span>
            </div>
            <div className="ffBatchGrid">
              <button onClick={() => alignSelection("left")} type="button">
                <AlignLeft size={15} />
                Left
              </button>
              <button onClick={() => alignSelection("center")} type="button">
                <AlignCenter size={15} />
                Center
              </button>
              <button onClick={() => alignSelection("right")} type="button">
                <AlignRight size={15} />
                Right
              </button>
              <button onClick={() => alignSelection("top")} type="button">
                Top
              </button>
              <button onClick={() => alignSelection("middle")} type="button">
                Middle
              </button>
              <button onClick={() => alignSelection("bottom")} type="button">
                Bottom
              </button>
            </div>
            <div className="ffActions">
              <button onClick={groupSelection} type="button">
                <Group size={15} />
                Group
              </button>
              <button disabled={selectedGroups.length === 0} onClick={ungroupSelection} type="button">
                <Ungroup size={15} />
                Ungroup
              </button>
              <button onClick={toggleLockSelection} type="button">
                <Lock size={15} />
                Lock selection
              </button>
              <button onClick={duplicateSelection} type="button">
                <Copy size={15} />
                Duplicate all
              </button>
              <button onClick={bringSelectionForward} type="button">
                <BringToFront size={15} />
                Bring front
              </button>
              <button className="danger" onClick={deleteSelection} type="button">
                <Trash2 size={15} />
                Delete all
              </button>
            </div>
          </div>
        ) : selectedNode ? (
          <>
            <InspectorSectionTitle label="Identity" />
            <InspectorField label="Name">
              <input value={selectedNode.name} onChange={(event) => updateNode(selectedNode.id, { name: event.target.value })} />
            </InspectorField>
            {hasContentSettings(selectedNode.type) ? (
              <>
                <InspectorSectionTitle label="Content" />
              <InspectorField label={selectedNode.type === "text" || selectedNode.type === "button" ? "Text" : "Content"}>
                <textarea value={selectedNode.style.text || ""} onChange={(event) => updateStyle(selectedNode.id, { text: event.target.value })} />
              </InspectorField>
              </>
            ) : null}
            {getWidgetPresets(selectedNode.type).length > 0 ? (
              <div className="ffPresetButtons">
                {getWidgetPresets(selectedNode.type).map((preset) => (
                  <button key={preset.label} onClick={() => updateStyle(selectedNode.id, { text: preset.text })} type="button">
                    {preset.label}
                  </button>
                ))}
              </div>
            ) : null}
            <InspectorSectionTitle label="Layout" />
            <div className="ffQuad">
              <NumberField label="X" value={selectedNode.x} onChange={(value) => updateNode(selectedNode.id, { x: snap(value) })} />
              <NumberField label="Y" value={selectedNode.y} onChange={(value) => updateNode(selectedNode.id, { y: snap(value) })} />
              <NumberField label="W" value={selectedNode.width} onChange={(value) => updateNode(selectedNode.id, { width: snap(value) })} />
              <NumberField label="H" value={selectedNode.height} onChange={(value) => updateNode(selectedNode.id, { height: snap(value) })} />
            </div>
            <InspectorSectionTitle label="Appearance" />
            <div className="ffAlignGrid">
              <button onClick={() => updateStyle(selectedNode.id, { align: "left" })} type="button">
                <AlignLeft size={15} />
              </button>
              <button onClick={() => updateStyle(selectedNode.id, { align: "center" })} type="button">
                <AlignCenter size={15} />
              </button>
              <button onClick={() => updateStyle(selectedNode.id, { align: "right" })} type="button">
                <AlignRight size={15} />
              </button>
            </div>
            <div className="ffQuad">
              <NumberField label="Font" value={selectedNode.style.fontSize || 16} onChange={(value) => updateStyle(selectedNode.id, { fontSize: value })} />
              <NumberField label="Weight" value={selectedNode.style.fontWeight || 500} onChange={(value) => updateStyle(selectedNode.id, { fontWeight: value })} />
              <NumberField label="Radius" value={selectedNode.style.radius || 0} onChange={(value) => updateStyle(selectedNode.id, { radius: value })} />
              <NumberField label="Z" value={selectedNode.zIndex} onChange={(value) => updateNode(selectedNode.id, { zIndex: value })} />
            </div>
            <ColorField label="Color" value={selectedNode.style.color} onChange={(value) => updateStyle(selectedNode.id, { color: value })} />
            <ColorField label="Background" value={selectedNode.style.background} onChange={(value) => updateStyle(selectedNode.id, { background: value })} />
            {selectedNode.type === "image" ? (
              <button className="ffReplaceImage" onClick={() => imageInputRef.current?.click()} type="button">
                <Upload size={15} />
                Replace image
              </button>
            ) : null}
            <InspectorSectionTitle label="Actions" />
            <div className="ffActions">
              <button onClick={() => toggleLock(selectedNode)} type="button">
                {selectedNode.locked ? <Unlock size={15} /> : <Lock size={15} />}
                {selectedNode.locked ? "Unlock" : "Lock"}
              </button>
              <button onClick={() => toggleHidden(selectedNode)} type="button">
                {selectedNode.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                {selectedNode.hidden ? "Show" : "Hide"}
              </button>
              <button onClick={() => duplicateNode(selectedNode)} type="button">
                <Copy size={15} />
                Duplicate
              </button>
              <button onClick={() => bringForward(selectedNode)} type="button">
                <BringToFront size={15} />
                Front
              </button>
              <button className="danger" onClick={() => deleteNode(selectedNode.id)} type="button">
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="ffEmptyInspector">
            <MousePointer2 size={18} />
            <strong>No selection</strong>
            <span>캔버스의 요소를 선택하면 속성을 편집할 수 있습니다.</span>
          </div>
        )}
      </aside>
      {contextMenu ? (
        <div
          className="ffContextMenu"
          onClick={(event) => event.stopPropagation()}
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <strong>{contextMenu.ids.length > 1 ? `${contextMenu.ids.length} objects` : "Object"}</strong>
          <button onClick={() => runContextAction(duplicateIds)} type="button">
            <Copy size={14} />
            Duplicate
          </button>
          <button onClick={() => runContextAction(bringIdsForward)} type="button">
            <BringToFront size={14} />
            Bring front
          </button>
          <button onClick={() => runContextAction(toggleLockIds)} type="button">
            <Lock size={14} />
            Lock / Unlock
          </button>
          <button onClick={() => runContextAction(toggleHiddenIds)} type="button">
            <EyeOff size={14} />
            Hide / Show
          </button>
          <button className="danger" onClick={() => runContextAction(deleteIds)} type="button">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ) : null}
    </section>
  );
}

function RenderNode({
  isEditing = false,
  node,
  onCommitText,
  onStartEditing
}: {
  isEditing?: boolean;
  node: EditorNode;
  onCommitText?: (text: string) => void;
  onStartEditing?: () => void;
}) {
  const style = {
    color: node.style.color,
    background: node.style.background,
    borderRadius: node.style.radius,
    border: node.style.border,
    padding: node.style.padding,
    textAlign: node.style.align,
    fontSize: node.style.fontSize,
    fontWeight: node.style.fontWeight
  } as React.CSSProperties;

  if (node.type === "text") {
    return (
      <InlineEditableNode
        className="ffTextNode"
        isEditing={isEditing}
        onCommit={onCommitText}
        onStartEditing={onStartEditing}
        style={style}
        text={node.style.text || ""}
      />
    );
  }

  if (node.type === "button") {
    return (
      <InlineEditableNode
        className="ffButtonNode"
        isEditing={isEditing}
        onCommit={onCommitText}
        onStartEditing={onStartEditing}
        singleLine
        style={style}
        text={node.style.text || ""}
      />
    );
  }

  if (node.type === "image") {
    return (
      <div className="ffImageNode" style={style}>
        {node.style.imageUrl ? <img alt={node.name} src={node.style.imageUrl} /> : <span />}
      </div>
    );
  }

  if (node.type === "header") {
    const header = getHeaderContent(node.style.text);
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
    const items = parseMenuItems(node.style.text || "Home,Shop>Flowers;Plants;Gifts,About,Contact");
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
    const slider = splitContent(node.style.text, ["Featured collection", "01 / 03"]);
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
    const hero = splitContent(node.style.text, ["Build a sharper landing page", "브랜드 메시지와 CTA를 한 화면에 배치하는 히어로 섹션입니다.", "Explore"]);
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
    const products = getPairs(node.style.text, [
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
    const form = getFormContent(node.style.text);
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
        <strong>{node.style.text || "Location map"}</strong>
      </div>
    );
  }

  if (node.type === "video") {
    return (
      <div className="ffVideoWidget" style={style}>
        <button type="button">▶</button>
        <strong>{node.style.text || "Brand film"}</strong>
      </div>
    );
  }

  if (node.type === "testimonial") {
    return (
      <div className="ffTestimonialWidget" style={style}>
        <strong>“</strong>
        <p>{node.style.text || "고객 후기를 시각적으로 배치하는 리뷰 섹션입니다."}</p>
        <span>Customer review</span>
      </div>
    );
  }

  if (node.type === "pricing") {
    const plans = getPairs(node.style.text, [
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
    const footer = getFooterContent(node.style.text);
    return (
      <div className="ffFooterWidget" style={style}>
        <strong>{footer.brand}</strong>
        {footer.links.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    );
  }

  return <div className="ffFrameNode" style={style} />;
}

function InlineEditableNode({
  className,
  isEditing,
  onCommit,
  onStartEditing,
  singleLine = false,
  style,
  text
}: {
  className: string;
  isEditing: boolean;
  onCommit?: (text: string) => void;
  onStartEditing?: () => void;
  singleLine?: boolean;
  style: React.CSSProperties;
  text: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing || !ref.current) {
      return;
    }

    const element = ref.current;
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [isEditing]);

  function commit() {
    onCommit?.(ref.current?.innerText || text);
  }

  return (
    <div
      className={isEditing ? `${className} editing` : className}
      contentEditable={isEditing}
      onBlur={commit}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onStartEditing?.();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();

        if (event.key === "Escape") {
          event.preventDefault();
          ref.current?.blur();
        }

        if (singleLine && event.key === "Enter") {
          event.preventDefault();
          ref.current?.blur();
        }
      }}
      ref={ref}
      role={isEditing ? "textbox" : undefined}
      spellCheck={false}
      style={style}
      suppressContentEditableWarning
      tabIndex={isEditing ? 0 : undefined}
    >
      {text}
    </div>
  );
}

function CodeWorkspace({
  index,
  message,
  nodes,
  onReload,
  state
}: {
  index: ProjectIndex | null;
  message: string;
  nodes: EditorNode[];
  onReload: () => void;
  state: "idle" | "loading" | "ready" | "error";
}) {
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const selectedFile = index?.files.find((file) => file.filePath === selectedFilePath) ?? index?.files[0] ?? null;
  const codeLines = selectedFile ? createSourceCodeLines(selectedFile.sourceText) : createCanvasCodeLines(nodes);
  const codeTree = useMemo(() => buildCodeTree(index?.files ?? []), [index]);

  useEffect(() => {
    if (index?.files.length && !index.files.some((file) => file.filePath === selectedFilePath)) {
      setSelectedFilePath(index.files[0].filePath);
    }
  }, [index, selectedFilePath]);

  return (
    <div className="ffCodeWorkspace">
      <aside className="ffCodeActivityBar" aria-label="Code navigation">
        <button className="active" title="Explorer" type="button">
          <FileText size={20} />
        </button>
        <button title="Search" type="button">
          <Search size={20} />
        </button>
      </aside>
      <aside className="ffCodeSidebar">
        <div className="ffCodeHeader">
          <strong>WEBABLE CODE</strong>
          <button onClick={onReload} type="button">
            Re-index
          </button>
        </div>
        {index ? (
          <>
            <div className="ffOpenEditors">
              <div className="ffCodeSectionLabel">Open Editors</div>
              {selectedFile ? (
                <button className="ffCodeOpenFile" type="button">
                  <FileText size={13} />
                  <span>{selectedFile.filePath.split("/").at(-1)}</span>
                </button>
              ) : null}
            </div>
            <div className="ffCodeSectionLabel">Explorer</div>
            <div className="ffCodeSummary">
              <span>{index.framework}</span>
              <em>{index.summary.fileCount} files</em>
              <em>{index.summary.elementCount} elements</em>
            </div>
            <div className="ffCodeFileList">
              {codeTree.children.map((node) => (
                <CodeTreeItem key={node.name} node={node} selectedFilePath={selectedFile?.filePath || ""} onSelectFile={setSelectedFilePath} />
              ))}
            </div>
          </>
        ) : (
          <div className="ffCodeEmpty">{state === "loading" ? "Indexing project..." : message || "No project index loaded."}</div>
        )}
      </aside>
      <section className="ffCodeEditor">
        <div className="ffCodeTabs">
          <button className="active" type="button">
            <FileText size={13} />
            {selectedFile?.filePath.split("/").at(-1) || "canvas.generated.tsx"}
          </button>
        </div>
        <div className="ffCodeEditorTop">
          <span>{selectedFile?.filePath.split("/").join(" / ") || "canvas.generated.tsx"}</span>
          <em>{selectedFile ? `${selectedFile.elements.length} mapped elements` : state}</em>
        </div>
        <pre aria-label="Source code">
          {codeLines.map((line, index) => (
            <code key={`${index}-${line}`}>
              <span className="ffCodeLineNumber">{index + 1}</span>
              <span className="ffCodeLineText">{highlightCodeLine(line)}</span>
            </code>
          ))}
        </pre>
        <div className="ffCodeStatusBar">
          <span>{index?.framework || "unknown"}</span>
          <span>TSX</span>
          <span>{selectedFile ? `${selectedFile.elements.length} elements` : `${nodes.length} canvas nodes`}</span>
        </div>
      </section>
    </div>
  );
}

function CodeTreeItem({
  node,
  onSelectFile,
  selectedFilePath
}: {
  node: CodeTreeNode;
  onSelectFile: (path: string) => void;
  selectedFilePath: string;
}) {
  if (node.type === "directory") {
    return (
      <details className="ffCodeFolder" open>
        <summary>
          <ChevronDown size={13} />
          <span>{node.name}</span>
        </summary>
        <div>
          {node.children.map((child) => (
            <CodeTreeItem key={`${node.name}-${child.name}-${child.filePath || ""}`} node={child} selectedFilePath={selectedFilePath} onSelectFile={onSelectFile} />
          ))}
        </div>
      </details>
    );
  }

  return (
    <button className={node.filePath === selectedFilePath ? "ffCodeFile active" : "ffCodeFile"} onClick={() => node.filePath && onSelectFile(node.filePath)} type="button">
      <FileText size={13} />
      <span>{node.name}</span>
      <em>{node.elementCount}</em>
    </button>
  );
}

function buildCodeTree(files: ProjectIndex["files"]): CodeTreeNode {
  const root: CodeTreeNode = { children: [], elementCount: 0, name: "root", type: "directory" };

  files.forEach((file) => {
    const parts = file.filePath.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let next = current.children.find((child) => child.name === part && child.type === (isFile ? "file" : "directory"));

      if (!next) {
        next = {
          children: [],
          elementCount: isFile ? file.elements.length : 0,
          filePath: isFile ? file.filePath : undefined,
          name: part,
          type: isFile ? "file" : "directory"
        };
        current.children.push(next);
        current.children.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1));
      }

      current = next;
    });
  });

  return root;
}

function highlightCodeLine(line: string) {
  if (line.trim().startsWith("//")) {
    return <span className="tok-comment">{line}</span>;
  }

  const tokens = line.split(/(<\/?[A-Za-z][\w.:-]*|"[^\"]*"|'[^']*'|`[^`]*`|\b(?:const|let|function|return|import|export|from|type|interface|if|else|async|await)\b)/g);

  return tokens.map((token, index) => {
    if (!token) return null;
    if (/^<\/?[A-Za-z]/.test(token)) return <span className="tok-tag" key={index}>{token}</span>;
    if (/^["'`]/.test(token)) return <span className="tok-string" key={index}>{token}</span>;
    if (/^(const|let|function|return|import|export|from|type|interface|if|else|async|await)$/.test(token)) return <span className="tok-keyword" key={index}>{token}</span>;
    return token;
  });
}

function createSourceCodeLines(sourceText: string) {
  return sourceText.replace(/\n$/, "").split("\n");
}

function createCanvasCodeLines(nodes: EditorNode[]) {
  return [
    "export const canvasNodes = [",
    ...nodes.map((node) => `  ${JSON.stringify({ id: node.id, type: node.type, x: node.x, y: node.y, width: node.width, height: node.height, style: node.style })},`),
    "];"
  ];
}

function NodeIcon({ type }: { type: EditorNodeType }) {
  if (type === "text") return <Type size={15} />;
  if (type === "button") return <MousePointer2 size={15} />;
  if (type === "image") return <ImageIcon size={15} />;
  if (type === "header") return <PanelTop size={15} />;
  if (type === "nav") return <Menu size={15} />;
  if (type === "gallery") return <Images size={15} />;
  if (type === "slider") return <GalleryHorizontal size={15} />;
  if (type === "hero") return <LayoutTemplate size={15} />;
  if (type === "products") return <ShoppingBag size={15} />;
  if (type === "form") return <Mail size={15} />;
  if (type === "map") return <MapPin size={15} />;
  if (type === "video") return <Play size={15} />;
  if (type === "testimonial") return <Quote size={15} />;
  if (type === "pricing") return <CreditCard size={15} />;
  if (type === "footer") return <PanelBottom size={15} />;
  return <Square size={15} />;
}

function WidgetPreview({ type }: { type: EditorNodeType }) {
  return (
    <i className={`ffWidgetPreview ${type}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </i>
  );
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

function hasContentSettings(type: EditorNodeType) {
  return !["container", "image", "gallery"].includes(type);
}

function getWidgetPresets(type: EditorNodeType) {
  const presets: Partial<Record<EditorNodeType, Array<{ label: string; text: string }>>> = {
    header: [
      { label: "Store", text: "WEBABLE|Home,Shop>Flowers;Plants;Gifts,Lookbook,Contact|Buy" },
      { label: "Studio", text: "Studio|Work>Branding;Web;Content,Services,About,Contact|Book" }
    ],
    nav: [
      { label: "Dropdown", text: "Home,Shop>Flowers;Plants;Gifts,About,Contact" },
      { label: "Service", text: "Home,Services>Design;Booking;Support,Portfolio,Contact" }
    ],
    hero: [
      { label: "Landing", text: "Build a sharper landing page|브랜드 메시지와 CTA를 한 화면에 배치하는 히어로 섹션입니다.|Explore" },
      { label: "Commerce", text: "Launch your next collection|상품과 프로모션을 강하게 보여주는 판매형 섹션입니다.|Shop now" }
    ],
    products: [
      { label: "Retail", text: "Signature:₩49,000,Bundle:₩89,000,Premium:₩129,000" },
      { label: "Service", text: "Starter:₩190k,Growth:₩490k,Enterprise:문의" }
    ],
    form: [
      { label: "Contact", text: "Contact form|Name,Email,Message|Submit" },
      { label: "Booking", text: "Booking request|Name,Date,Request|Reserve" }
    ],
    pricing: [
      { label: "SaaS", text: "Basic:₩19k,Pro:₩49k,Scale:₩99k" },
      { label: "Agency", text: "Lite:₩300k,Brand:₩800k,Custom:상담" }
    ],
    footer: [
      { label: "Simple", text: "WEBABLE|Company,Terms,Contact" },
      { label: "Shop", text: "WEBABLE|Shop,Shipping,Privacy,Instagram" }
    ]
  };

  return presets[type] || [];
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

function getWidgetDefaults(type: EditorNodeType): Pick<EditorNode, "height" | "name" | "style" | "width"> {
  if (type === "header") {
    return {
      name: "Header",
      width: 1040,
      height: 88,
      style: { align: "left", background: "#ffffff", border: "1px solid #d0d0d0", color: "#111111", fontSize: 15, fontWeight: 820, padding: 18, radius: 0, text: "WEBABLE|Home,Shop>Flowers;Plants;Gifts,About,Contact|Start" }
    };
  }

  if (type === "nav") {
    return {
      name: "Nav menu",
      width: 520,
      height: 58,
      style: { align: "center", background: "#ffffff", border: "1px solid #d0d0d0", color: "#111111", fontSize: 15, fontWeight: 780, padding: 10, radius: 999, text: "Home,Shop>Flowers;Plants;Gifts,About,Contact" }
    };
  }

  if (type === "gallery") {
    return {
      name: "Gallery",
      width: 680,
      height: 360,
      style: { background: "#ffffff", border: "1px solid #d0d0d0", radius: 10, padding: 12 }
    };
  }

  if (type === "slider") {
    return {
      name: "Slider gallery",
      width: 760,
      height: 360,
      style: { background: "#111111", border: "1px solid #111111", color: "#ffffff", fontSize: 26, fontWeight: 850, padding: 24, radius: 10, text: "Featured collection|01 / 03" }
    };
  }

  if (type === "hero") {
    return {
      name: "Hero section",
      width: 920,
      height: 420,
      style: { background: "#111111", border: "1px solid #111111", color: "#ffffff", fontSize: 42, fontWeight: 900, padding: 36, radius: 12, text: "Build a sharper landing page|브랜드 메시지와 CTA를 한 화면에 배치하는 히어로 섹션입니다.|Explore" }
    };
  }

  if (type === "products") {
    return {
      name: "Product grid",
      width: 760,
      height: 320,
      style: { background: "#ffffff", border: "1px solid #d0d0d0", color: "#111111", padding: 14, radius: 10, text: "Signature:₩49,000,Bundle:₩89,000,Premium:₩129,000" }
    };
  }

  if (type === "form") {
    return {
      name: "Contact form",
      width: 420,
      height: 360,
      style: { background: "#ffffff", border: "1px solid #d0d0d0", color: "#111111", fontSize: 18, fontWeight: 850, padding: 20, radius: 10, text: "Contact form|Name,Email,Message|Submit" }
    };
  }

  if (type === "map") {
    return {
      name: "Map",
      width: 520,
      height: 300,
      style: { background: "#eeeeee", border: "1px solid #d0d0d0", color: "#111111", fontSize: 18, fontWeight: 850, padding: 20, radius: 10, text: "Location map" }
    };
  }

  if (type === "video") {
    return {
      name: "Video",
      width: 560,
      height: 315,
      style: { background: "#111111", border: "1px solid #111111", color: "#ffffff", fontSize: 20, fontWeight: 850, padding: 20, radius: 10, text: "Brand film" }
    };
  }

  if (type === "testimonial") {
    return {
      name: "Review",
      width: 520,
      height: 240,
      style: { background: "#ffffff", border: "1px solid #d0d0d0", color: "#111111", fontSize: 17, fontWeight: 760, padding: 24, radius: 10, text: "고객 후기를 시각적으로 배치하는 리뷰 섹션입니다." }
    };
  }

  if (type === "pricing") {
    return {
      name: "Pricing",
      width: 780,
      height: 340,
      style: { background: "#ffffff", border: "1px solid #d0d0d0", color: "#111111", padding: 14, radius: 10, text: "Basic:₩19k,Pro:₩49k,Scale:₩99k" }
    };
  }

  if (type === "footer") {
    return {
      name: "Footer",
      width: 1040,
      height: 120,
      style: { background: "#111111", border: "1px solid #111111", color: "#ffffff", fontSize: 16, fontWeight: 820, padding: 24, radius: 0, text: "WEBABLE|Company,Terms,Contact" }
    };
  }

  return {
    name: `${type[0].toUpperCase()}${type.slice(1)}`,
    width: type === "text" ? 280 : type === "button" ? 132 : 240,
    height: type === "text" ? 88 : type === "button" ? 46 : 160,
    style: {
      text: type === "text" ? "새 텍스트를 입력하세요" : type === "button" ? "버튼" : undefined,
      fontSize: type === "text" ? 24 : 15,
      fontWeight: type === "text" ? 760 : 800,
      color: type === "container" || type === "image" ? undefined : "#111111",
      background: type === "container" ? "#f7f7f7" : type === "button" ? "#111111" : type === "image" ? "#dedede" : "transparent",
      radius: type === "text" ? 0 : 12,
      align: "left",
      padding: type === "container" ? 18 : 0,
      border: type === "container" || type === "image" ? "1px solid #d0d0d0" : undefined
    }
  };
}

function InspectorField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="ffField">
      <span>{label}</span>
      {children}
    </label>
  );
}

function InspectorSectionTitle({ label }: { label: string }) {
  return <div className="ffInspectorSectionTitle">{label}</div>;
}

function NumberField({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) {
  return (
    <label className="ffField">
      <span>{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ColorField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value?: string }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const parsedColor = parseCssColor(value);
  const hsv = rgbToHsv(parsedColor.r, parsedColor.g, parsedColor.b);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0 });
  const [draftHex, setDraftHex] = useState(rgbToHex(parsedColor.r, parsedColor.g, parsedColor.b).slice(1).toUpperCase());

  useEffect(() => {
    setDraftHex(rgbToHex(parsedColor.r, parsedColor.g, parsedColor.b).slice(1).toUpperCase());
  }, [parsedColor.r, parsedColor.g, parsedColor.b]);

  const hexValue = rgbToHex(parsedColor.r, parsedColor.g, parsedColor.b);
  const alphaPercent = Math.round(parsedColor.a * 100);
  const colorValue = formatColor(parsedColor.r, parsedColor.g, parsedColor.b, parsedColor.a);

  function commitColor(next: ColorValue) {
    onChange(formatColor(next.r, next.g, next.b, next.a));
  }

  function commitHsv(nextHue: number, nextSaturation: number, nextValue: number, nextAlpha = parsedColor.a) {
    const rgb = hsvToRgb(nextHue, nextSaturation, nextValue);
    commitColor({ ...rgb, a: nextAlpha });
  }

  function pickFromPanel(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextSaturation = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const nextValue = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
    commitHsv(hsv.h, nextSaturation, nextValue);
  }

  function openPalette() {
    const rect = swatchRef.current?.getBoundingClientRect();
    const popoverWidth = 320;
    const topGap = 10;

    if (!rect) {
      setPopoverPosition({ left: 24, top: 72 });
      setIsOpen(true);
      return;
    }

    setPopoverPosition({
      left: clamp(rect.right - popoverWidth, 16, window.innerWidth - popoverWidth - 16),
      top: clamp(rect.bottom + topGap, 16, Math.max(16, window.innerHeight - 520))
    });
    setIsOpen(true);
  }

  return (
    <InspectorField label={label}>
      <div className="ffColorControl">
        <button
          aria-label={`${label} color palette`}
          className="ffColorSwatchButton"
          ref={swatchRef}
          onClick={(event) => {
            event.preventDefault();
            openPalette();
          }}
          style={{ background: colorValue }}
          type="button"
        />
        <input aria-label={label} type="text" value={value || ""} placeholder={hexValue} onChange={(event) => onChange(event.currentTarget.value)} />
        {isOpen ? (
          <div className="ffColorPopover" ref={popoverRef} onClick={(event) => event.stopPropagation()} style={popoverPosition}>
            <div className="ffColorPopoverHeader">
              <button className="active" type="button">
                사용자 지정
              </button>
              <button type="button">라이브러리</button>
              <span />
              <button aria-label="Add color" type="button">
                <Plus size={17} />
              </button>
              <button aria-label="Close color palette" onClick={() => setIsOpen(false)} type="button">
                ×
              </button>
            </div>
            <div className="ffColorModeRow">
              {["▣", "▦", "▤", "▧", "▶", "≋", "◌", "◒"].map((icon, index) => (
                <button className={index === 0 ? "active" : ""} key={`${label}-mode-${index}`} type="button">
                  {icon}
                </button>
              ))}
            </div>
            <div
              className="ffColorPlane"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                pickFromPanel(event);
              }}
              onPointerMove={(event) => {
                if (event.buttons === 1) {
                  pickFromPanel(event);
                }
              }}
              style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
            >
              <span style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
            </div>
            <div className="ffColorSliderRow">
              <button aria-label="Eyedropper" type="button">
                ◖
              </button>
              <input
                aria-label={`${label} hue`}
                className="ffHueSlider"
                max={360}
                min={0}
                onChange={(event) => commitHsv(Number(event.currentTarget.value), hsv.s, hsv.v)}
                type="range"
                value={Math.round(hsv.h)}
              />
            </div>
            <div className="ffColorSliderRow">
              <span />
              <input
                aria-label={`${label} opacity`}
                className="ffAlphaSlider"
                max={100}
                min={0}
                onChange={(event) => commitColor({ ...parsedColor, a: Number(event.currentTarget.value) / 100 })}
                style={{ ["--alpha-color" as string]: hexValue }}
                type="range"
                value={alphaPercent}
              />
            </div>
            <div className="ffColorValueRow">
              <button type="button">Hex⌄</button>
              <input
                aria-label={`${label} hex value`}
                value={draftHex}
                onBlur={() => {
                  const normalized = normalizeHexInput(draftHex);
                  if (normalized) {
                    const next = parseCssColor(normalized);
                    commitColor({ ...next, a: parsedColor.a });
                    setDraftHex(normalized.slice(1).toUpperCase());
                  }
                }}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase();
                  setDraftHex(nextValue);
                  const normalized = normalizeHexInput(nextValue);
                  if (normalized) {
                    const next = parseCssColor(normalized);
                    commitColor({ ...next, a: parsedColor.a });
                  }
                }}
              />
              <input
                aria-label={`${label} opacity value`}
                max={100}
                min={0}
                onChange={(event) => commitColor({ ...parsedColor, a: clamp(Number(event.currentTarget.value) / 100, 0, 1) })}
                type="number"
                value={alphaPercent}
              />
              <em>%</em>
            </div>
            <label className="ffColorScope">
              <span>이 페이지에서</span>
              <select defaultValue="page">
                <option value="page">이 페이지에서</option>
                <option value="site">이 사이트에서</option>
              </select>
            </label>
            <div className="ffColorSwatchGrid">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  aria-label={`Use ${swatch}`}
                  key={swatch}
                  onClick={(event) => {
                    event.preventDefault();
                    const next = parseCssColor(swatch);
                    commitColor({ ...next, a: parsedColor.a });
                  }}
                  style={{ background: swatch }}
                  type="button"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </InspectorField>
  );
}

function clampZoom(value: number) {
  return Math.min(256, Math.max(0.1, value));
}

function getSteppedZoom(current: number, delta: number) {
  if (delta > 0) {
    return ZOOM_STEPS.find((step) => step > current + 0.001) ?? ZOOM_STEPS.at(-1) ?? current;
  }

  for (let index = ZOOM_STEPS.length - 1; index >= 0; index -= 1) {
    if (ZOOM_STEPS[index] < current - 0.001) {
      return ZOOM_STEPS[index];
    }
  }

  return ZOOM_STEPS[0];
}

function getWheelZoom(current: number, delta: number) {
  const normalizedDelta = clamp(delta, -220, 220);
  return clampZoom(current * Math.exp(-normalizedDelta * 0.0075));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatColor(r: number, g: number, b: number, a = 1) {
  const hex = rgbToHex(r, g, b);

  if (a >= 0.995) {
    return hex;
  }

  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(2))})`;
}

function normalizeHexInput(value: string) {
  const clean = value.replace(/^#/, "").trim();

  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean
      .split("")
      .map((part) => `${part}${part}`)
      .join("")}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `#${clean}`;
  }

  return "";
}

function parseCssColor(value?: string): ColorValue {
  if (!value || value === "transparent") {
    return { a: 1, b: 255, g: 255, r: 255 };
  }

  const hex = normalizeHexInput(value);
  if (hex) {
    return {
      a: 1,
      b: Number.parseInt(hex.slice(5, 7), 16),
      g: Number.parseInt(hex.slice(3, 5), 16),
      r: Number.parseInt(hex.slice(1, 3), 16)
    };
  }

  const rgba = value.match(/rgba?\(([^)]+)\)/i);
  if (rgba) {
    const parts = rgba[1].split(",").map((part) => Number(part.trim()));
    return {
      a: Number.isFinite(parts[3]) ? clamp(parts[3], 0, 1) : 1,
      b: clamp(parts[2] || 0, 0, 255),
      g: clamp(parts[1] || 0, 0, 255),
      r: clamp(parts[0] || 0, 0, 255)
    };
  }

  return { a: 1, b: 255, g: 255, r: 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((part) =>
      Math.round(clamp(part, 0, 255))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

function rgbToHsv(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6;
    if (max === green) h = (blue - red) / delta + 2;
    if (max === blue) h = (red - green) / delta + 4;
    h *= 60;
  }

  if (h < 0) h += 360;

  return {
    h,
    s: max === 0 ? 0 : delta / max,
    v: max
  };
}

function hsvToRgb(h: number, s: number, v: number) {
  const chroma = v * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - chroma;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (h < 60) [red, green, blue] = [chroma, x, 0];
  else if (h < 120) [red, green, blue] = [x, chroma, 0];
  else if (h < 180) [red, green, blue] = [0, chroma, x];
  else if (h < 240) [red, green, blue] = [0, x, chroma];
  else if (h < 300) [red, green, blue] = [x, 0, chroma];
  else [red, green, blue] = [chroma, 0, x];

  return {
    b: Math.round((blue + m) * 255),
    g: Math.round((green + m) * 255),
    r: Math.round((red + m) * 255)
  };
}

function getFitZoom(device: DeviceMode) {
  if (device === "desktop") return 0.48;
  if (device === "tablet") return 0.76;
  return 1;
}

function normalizeCanvasSizes(value?: Partial<Record<DeviceMode, Partial<CanvasSize>>>) {
  return (Object.keys(defaultCanvasSizes) as DeviceMode[]).reduce<Record<DeviceMode, CanvasSize>>((sizes, device) => {
    const saved = value?.[device];
    sizes[device] = {
      height: clampCanvasSize(saved?.height, defaultCanvasSizes[device].height, "height"),
      width: clampCanvasSize(saved?.width, defaultCanvasSizes[device].width, "width")
    };
    return sizes;
  }, { ...defaultCanvasSizes });
}

function clampCanvasSize(value: unknown, fallback: number, axis: keyof CanvasSize) {
  const min = axis === "width" ? 320 : 480;
  const max = axis === "width" ? 2560 : 5000;
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : fallback;

  return Math.min(max, Math.max(min, Math.round(numeric)));
}

function readLocalProject() {
  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<EditorProject> & { nodes?: EditorNode[]; selectedId?: string | null };

    if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
      return parsed as EditorProject;
    }

    if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
      return {
        pages: [{ id: "home", name: "Home", nodes: parsed.nodes, path: "/" }],
        selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : parsed.selectedId ? [parsed.selectedId] : [],
        selectedPageId: "home",
        siteName: "WEBABLE Demo Site"
      };
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

function snap(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function getBounds(items: EditorNode[]) {
  if (items.length === 0) {
    return null;
  }

  const left = Math.min(...items.map((node) => node.x));
  const top = Math.min(...items.map((node) => node.y));
  const right = Math.max(...items.map((node) => node.x + node.width));
  const bottom = Math.max(...items.map((node) => node.y + node.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}

function findClosestSnap(targets: Array<{ edge: number; offset: number }>, sources: number[]): SnapMatch | null {
  let best: SnapMatch | null = null;

  for (const target of targets) {
    for (const source of sources) {
      const distance = Math.abs(source - target.edge);

      if (distance <= SNAP_THRESHOLD && (!best || distance < best.distance)) {
        best = { distance, offset: target.offset, source };
      }
    }
  }

  return best;
}

function intersects(a: { height: number; width: number; x: number; y: number }, b: { height: number; width: number; x: number; y: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
