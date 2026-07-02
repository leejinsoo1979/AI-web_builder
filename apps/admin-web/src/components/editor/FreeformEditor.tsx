"use client";

import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  BringToFront,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Copy,
  CreditCard,
  Download,
  Droplet,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FlipHorizontal,
  FlipVertical,
  Frame,
  GalleryHorizontal,
  Group,
  Hand,
  Image as ImageIcon,
  Images,
  Inbox,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  Minimize2,
  Minus,
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
  Scan,
  Search,
  ShoppingBag,
  Plus,
  Smartphone,
  Sparkles,
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
import type { SiteSpec } from "@webable/builder-schema";
import { createInteractionId, type AnimationSpec, type Interaction, type InteractionAction, type InteractionCondition } from "@webable/interaction-runtime";
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
  | "footer"
  | "booking";
type CanvasMode = "design" | "code";
type DeviceMode = "desktop" | "tablet" | "mobile";
type LeftPanelMode = "ai" | "assets" | "file" | "inbox" | "products";
type InboxSubmission = {
  created_at: string;
  fields: Record<string, string>;
  form_title: string | null;
  id: string;
  site_id: string;
  source: string;
  status: "done" | "new" | "read";
};
type ProductItem = {
  active: boolean;
  description: string | null;
  id: string;
  name: string;
  price: number;
};
type OrderItem = {
  address: string | null;
  amount: number;
  contact: string;
  created_at: string;
  customer_name: string;
  id: string;
  payment_method: "manual" | "toss";
  product_name: string;
  quantity: number;
  source: string;
  status: "cancelled" | "done" | "paid" | "pending";
};
type ReservationItem = {
  contact: string;
  created_at: string;
  customer_name: string;
  id: string;
  memo: string | null;
  reserved_date: string;
  source: string;
  status: "cancelled" | "confirmed" | "done" | "requested";
  time_slot: string;
};
type AiProposal = {
  cost: number;
  id: string;
  outputDiff: { siteSpec: SiteSpec };
  status: string;
};
type PublishState = "idle" | "publishing" | "published" | "error";
type CanvasSize = {
  height: number;
  width: number;
};
type FramePreset = CanvasSize & {
  category: "Desktop" | "Document" | "Mobile" | "Tablet";
  device: DeviceMode;
  name: string;
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
type FrameResizeHandle = "bottom" | "bottomLeft" | "bottomRight" | "left" | "right" | "top" | "topLeft" | "topRight";
type FrameResizeState = {
  handle: FrameResizeHandle;
  originClientX: number;
  originClientY: number;
  originHeight: number;
  originViewportX: number;
  originViewportY: number;
  originWidth: number;
};
type NodeResizeSession = {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
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
type CodePaneFile = {
  elementCount: number;
  filePath: string;
  sourceText: string;
};
type CodeApplyResult = {
  message: string;
  ok: boolean;
};
type CodeParseResult = { message: string; nodes: EditorNode[]; ok: true } | { message: string; ok: false };
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
type ImageCropDragState = {
  baseHeight: number;
  baseWidth: number;
  centerClientX: number;
  centerClientY: number;
  id: string;
  mode: "move" | "scale";
  originClientX: number;
  originClientY: number;
  originOffsetX: number;
  originOffsetY: number;
  originPointerDistance: number;
  originScale: number;
  width: number;
  height: number;
};
type WidgetCategory = "전체" | "레이아웃" | "섹션" | "커머스" | "미디어" | "폼·CTA" | "기본";
type BlockNodeSpec = {
  dx: number;
  dy: number;
  height: number;
  name: string;
  style: EditorNode["style"];
  type: EditorNodeType;
  width: number;
};
type WidgetTemplate = {
  category: Exclude<WidgetCategory, "전체">;
  description: string;
  icon: React.ReactNode;
  key: string;
  label: string;
  nodes?: BlockNodeSpec[];
  preview: string;
  size?: { height: number; width: number };
  style?: EditorNode["style"];
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
  hiddenOnPageIds?: string[];
  locked?: boolean;
  hidden?: boolean;
  interactions?: Interaction[];
  positionMode?: "fixed" | "normal" | "sticky";
  scope?: "page" | "site";
  style: {
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    letterSpacing?: number;
    color?: string;
    background?: string;
    radius?: number;
    align?: "left" | "center" | "right";
    padding?: number;
    border?: string;
    borderCorner?: "bevel" | "miter" | "round";
    borderMiterAngle?: number;
    borderOpacity?: number;
    borderPosition?: "center" | "inside" | "outside";
    borderProfile?: "thin" | "uniform" | "wide";
    imageUrl?: string;
    imageOffsetX?: number;
    imageOffsetY?: number;
    imageScale?: number;
    mapUrl?: string;
    videoUrl?: string;
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
  siteNodes?: EditorNode[];
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
const framePresets: FramePreset[] = [
  { category: "Desktop", device: "desktop", height: 1600, name: "Desktop", width: 1440 },
  { category: "Desktop", device: "desktop", height: 982, name: "MacBook Pro 14", width: 1512 },
  { category: "Desktop", device: "desktop", height: 1080, name: "Desktop HD", width: 1920 },
  { category: "Tablet", device: "tablet", height: 1024, name: "iPad", width: 768 },
  { category: "Tablet", device: "tablet", height: 1366, name: "iPad Pro 12.9", width: 1024 },
  { category: "Mobile", device: "mobile", height: 844, name: "iPhone 15", width: 390 },
  { category: "Mobile", device: "mobile", height: 852, name: "iPhone 15 Pro", width: 393 },
  { category: "Mobile", device: "mobile", height: 800, name: "Android", width: 360 },
  { category: "Document", device: "desktop", height: 1123, name: "A4", width: 794 }
];
const deviceConfig: Record<DeviceMode, { label: string; icon: React.ReactNode }> = {
  desktop: { label: "Desktop", icon: <Monitor size={15} /> },
  tablet: { label: "Tablet", icon: <Tablet size={15} /> },
  mobile: { label: "Mobile", icon: <Smartphone size={15} /> }
};
const defaultFontStack = '"Inter", "Pretendard", "Noto Sans KR", sans-serif';
const fontPresets = [
  { label: "Inter / Pretendard", value: defaultFontStack },
  { label: "Pretendard", value: '"Pretendard", "Noto Sans KR", sans-serif' },
  { label: "Noto Sans KR", value: '"Noto Sans KR", "Pretendard", sans-serif' },
  { label: "Nanum Gothic", value: '"Nanum Gothic", "Noto Sans KR", sans-serif' },
  { label: "Gowun Dodum", value: '"Gowun Dodum", "Noto Sans KR", sans-serif' },
  { label: "Black Han Sans", value: '"Black Han Sans", "Noto Sans KR", sans-serif' },
  { label: "Inter", value: '"Inter", "Pretendard", "Noto Sans KR", sans-serif' },
  { label: "Roboto", value: '"Roboto", "Pretendard", "Noto Sans KR", sans-serif' },
  { label: "Montserrat", value: '"Montserrat", "Pretendard", "Noto Sans KR", sans-serif' },
  { label: "Poppins", value: '"Poppins", "Pretendard", "Noto Sans KR", sans-serif' },
  { label: "Playfair Display", value: '"Playfair Display", "Noto Sans KR", serif' },
  { label: "Lora", value: '"Lora", "Noto Sans KR", serif' },
  { label: "System Sans", value: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Pretendard", "Noto Sans KR", sans-serif' },
  { label: "System Serif", value: 'Georgia, "Times New Roman", "Noto Sans KR", serif' },
  { label: "Mono", value: '"SFMono-Regular", Consolas, "Liberation Mono", monospace' }
];
const handleStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  background: "#ffffff",
  border: "1px solid #1495ff",
  borderRadius: 3,
  boxShadow: "0 1px 3px rgba(20,149,255,.2)"
};
const edgeHandleStyle: React.CSSProperties = {
  background: "transparent",
  borderRadius: 999,
  opacity: 1,
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

const widgetCategories: WidgetCategory[] = ["전체", "레이아웃", "섹션", "커머스", "미디어", "폼·CTA", "기본"];
const blockTemplates: WidgetTemplate[] = [
  { category: "레이아웃", description: "로고 · 메뉴 · CTA 헤더", icon: <PanelTop size={16} />, key: "header", label: "헤더", preview: "header", type: "header" },
  { category: "레이아웃", description: "드롭다운 내비게이션", icon: <Menu size={16} />, key: "nav", label: "내비 메뉴", preview: "nav", type: "nav" },
  {
    category: "레이아웃",
    description: "상단 프로모션 스트립",
    icon: <Menu size={16} />,
    key: "announce",
    label: "공지 바",
    nodes: [
      { dx: 0, dy: 0, height: 44, name: "공지 바", style: { align: "center", background: "#111111", color: "#ffffff", fontSize: 13, fontWeight: 700, text: "5만원 이상 구매 시 무료 배송 — 오늘만!" }, type: "text", width: 1440 }
    ],
    preview: "announce",
    type: "text"
  },
  { category: "레이아웃", description: "멀티 링크 푸터", icon: <PanelBottom size={16} />, key: "footer", label: "푸터", preview: "footer", type: "footer" },
  {
    category: "섹션",
    description: "다크 히어로 + 이미지",
    icon: <LayoutTemplate size={16} />,
    key: "hero-dark",
    label: "히어로 · 다크",
    nodes: [
      { dx: 0, dy: 0, height: 460, name: "히어로 배경", style: { background: "#111111", radius: 24 }, type: "container", width: 1280 },
      { dx: 64, dy: 72, height: 24, name: "아이브로우", style: { align: "left", color: "#9ca3af", fontSize: 13, fontWeight: 800, text: "NEW SEASON" }, type: "text", width: 320 },
      { dx: 64, dy: 108, height: 124, name: "히어로 제목", style: { align: "left", color: "#ffffff", fontSize: 46, fontWeight: 850, text: "감각적인 브랜드 경험을 만드는 가장 빠른 방법" }, type: "text", width: 640 },
      { dx: 64, dy: 250, height: 52, name: "히어로 설명", style: { align: "left", color: "#d1d5db", fontSize: 16, fontWeight: 500, text: "섹션 블록을 조합해 몇 분 만에 페이지를 완성하세요." }, type: "text", width: 520 },
      { dx: 64, dy: 332, height: 52, name: "히어로 버튼", style: { align: "center", background: "#ffffff", color: "#111111", fontSize: 15, fontWeight: 800, radius: 12, text: "시작하기" }, type: "button", width: 176 },
      { dx: 764, dy: 56, height: 348, name: "히어로 이미지", style: { background: "#27272a", border: "1px solid #3f3f46", radius: 16 }, type: "image", width: 452 }
    ],
    preview: "heroDark",
    type: "hero"
  },
  {
    category: "섹션",
    description: "센터 정렬 라이트 히어로",
    icon: <LayoutTemplate size={16} />,
    key: "hero-light",
    label: "히어로 · 라이트",
    nodes: [
      { dx: 0, dy: 0, height: 380, name: "히어로 배경", style: { background: "#f8fafc", border: "1px solid #e2e8f0", radius: 24 }, type: "container", width: 1280 },
      { dx: 240, dy: 72, height: 116, name: "히어로 제목", style: { align: "center", color: "#0f172a", fontSize: 44, fontWeight: 850, text: "당신의 아이디어를 오늘 웹으로" }, type: "text", width: 800 },
      { dx: 320, dy: 204, height: 48, name: "히어로 설명", style: { align: "center", color: "#475569", fontSize: 16, fontWeight: 500, text: "코드 없이 만들고, 클릭 한 번으로 게시하세요." }, type: "text", width: 640 },
      { dx: 484, dy: 276, height: 52, name: "메인 버튼", style: { align: "center", background: "#111111", color: "#ffffff", fontSize: 15, fontWeight: 800, radius: 12, text: "무료로 시작" }, type: "button", width: 150 },
      { dx: 650, dy: 276, height: 52, name: "보조 버튼", style: { align: "center", background: "#ffffff", border: "1px solid #cbd5e1", color: "#0f172a", fontSize: 15, fontWeight: 700, radius: 12, text: "둘러보기" }, type: "button", width: 146 }
    ],
    preview: "heroLight",
    type: "hero"
  },
  {
    category: "섹션",
    description: "아이콘 카드 3열",
    icon: <LayoutGrid size={16} />,
    key: "features",
    label: "특징 3열",
    nodes: [
      { dx: 0, dy: 0, height: 220, name: "특징 카드 1", style: { background: "#ffffff", border: "1px solid #e5e7eb", radius: 16 }, type: "container", width: 400 },
      { dx: 32, dy: 40, height: 32, name: "특징 제목 1", style: { align: "left", color: "#111111", fontSize: 20, fontWeight: 800, text: "빠른 제작" }, type: "text", width: 336 },
      { dx: 32, dy: 84, height: 72, name: "특징 설명 1", style: { align: "left", color: "#6b7280", fontSize: 14, fontWeight: 500, text: "블록을 끌어다 놓는 것만으로 페이지가 완성됩니다." }, type: "text", width: 336 },
      { dx: 440, dy: 0, height: 220, name: "특징 카드 2", style: { background: "#ffffff", border: "1px solid #e5e7eb", radius: 16 }, type: "container", width: 400 },
      { dx: 472, dy: 40, height: 32, name: "특징 제목 2", style: { align: "left", color: "#111111", fontSize: 20, fontWeight: 800, text: "AI 어시스턴트" }, type: "text", width: 336 },
      { dx: 472, dy: 84, height: 72, name: "특징 설명 2", style: { align: "left", color: "#6b7280", fontSize: 14, fontWeight: 500, text: "브리프만 입력하면 초안을 자동으로 제안합니다." }, type: "text", width: 336 },
      { dx: 880, dy: 0, height: 220, name: "특징 카드 3", style: { background: "#ffffff", border: "1px solid #e5e7eb", radius: 16 }, type: "container", width: 400 },
      { dx: 912, dy: 40, height: 32, name: "특징 제목 3", style: { align: "left", color: "#111111", fontSize: 20, fontWeight: 800, text: "원클릭 게시" }, type: "text", width: 336 },
      { dx: 912, dy: 84, height: 72, name: "특징 설명 3", style: { align: "left", color: "#6b7280", fontSize: 14, fontWeight: 500, text: "검토가 끝나면 버튼 하나로 실사이트에 반영됩니다." }, type: "text", width: 336 }
    ],
    preview: "features",
    type: "container"
  },
  {
    category: "섹션",
    description: "신뢰 지표 스트립",
    icon: <Sparkles size={16} />,
    key: "stats",
    label: "통계 배너",
    nodes: [
      { dx: 0, dy: 0, height: 150, name: "통계 배경", style: { background: "#0f172a", radius: 20 }, type: "container", width: 1280 },
      { dx: 100, dy: 42, height: 44, name: "통계 1", style: { align: "center", color: "#ffffff", fontSize: 32, fontWeight: 850, text: "12,000+" }, type: "text", width: 260 },
      { dx: 100, dy: 92, height: 20, name: "통계 라벨 1", style: { align: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600, text: "누적 고객" }, type: "text", width: 260 },
      { dx: 510, dy: 42, height: 44, name: "통계 2", style: { align: "center", color: "#ffffff", fontSize: 32, fontWeight: 850, text: "98%" }, type: "text", width: 260 },
      { dx: 510, dy: 92, height: 20, name: "통계 라벨 2", style: { align: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600, text: "고객 만족도" }, type: "text", width: 260 },
      { dx: 920, dy: 42, height: 44, name: "통계 3", style: { align: "center", color: "#ffffff", fontSize: 32, fontWeight: 850, text: "24시간" }, type: "text", width: 260 },
      { dx: 920, dy: 92, height: 20, name: "통계 라벨 3", style: { align: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600, text: "응답 시간" }, type: "text", width: 260 }
    ],
    preview: "stats",
    type: "container"
  },
  {
    category: "섹션",
    description: "자주 묻는 질문 목록",
    icon: <Quote size={16} />,
    key: "faq",
    label: "FAQ",
    nodes: [
      { dx: 0, dy: 0, height: 48, name: "FAQ 제목", style: { align: "left", color: "#111111", fontSize: 32, fontWeight: 850, text: "자주 묻는 질문" }, type: "text", width: 480 },
      { dx: 0, dy: 76, height: 64, name: "질문 1", style: { background: "#ffffff", border: "1px solid #e5e7eb", radius: 12 }, type: "container", width: 1280 },
      { dx: 28, dy: 96, height: 24, name: "질문 텍스트 1", style: { align: "left", color: "#111111", fontSize: 15, fontWeight: 700, text: "무료 플랜으로도 사이트를 게시할 수 있나요?" }, type: "text", width: 1000 },
      { dx: 0, dy: 152, height: 64, name: "질문 2", style: { background: "#ffffff", border: "1px solid #e5e7eb", radius: 12 }, type: "container", width: 1280 },
      { dx: 28, dy: 172, height: 24, name: "질문 텍스트 2", style: { align: "left", color: "#111111", fontSize: 15, fontWeight: 700, text: "내 도메인을 연결할 수 있나요?" }, type: "text", width: 1000 },
      { dx: 0, dy: 228, height: 64, name: "질문 3", style: { background: "#ffffff", border: "1px solid #e5e7eb", radius: 12 }, type: "container", width: 1280 },
      { dx: 28, dy: 248, height: 24, name: "질문 텍스트 3", style: { align: "left", color: "#111111", fontSize: 15, fontWeight: 700, text: "언제든 플랜을 변경할 수 있나요?" }, type: "text", width: 1000 }
    ],
    preview: "faq",
    type: "container"
  },
  { category: "섹션", description: "고객 후기 인용", icon: <Quote size={16} />, key: "testimonial", label: "후기", preview: "testimonial", type: "testimonial" },
  {
    category: "섹션",
    description: "파트너 로고 스트립",
    icon: <Images size={16} />,
    key: "logos",
    label: "로고 클라우드",
    nodes: [
      { dx: 0, dy: 0, height: 22, name: "로고 라벨", style: { align: "center", color: "#9ca3af", fontSize: 13, fontWeight: 700, text: "함께하는 브랜드" }, type: "text", width: 1280 },
      { dx: 170, dy: 52, height: 48, name: "로고 1", style: { background: "#f3f4f6", radius: 10 }, type: "image", width: 150 },
      { dx: 380, dy: 52, height: 48, name: "로고 2", style: { background: "#f3f4f6", radius: 10 }, type: "image", width: 150 },
      { dx: 590, dy: 52, height: 48, name: "로고 3", style: { background: "#f3f4f6", radius: 10 }, type: "image", width: 150 },
      { dx: 800, dy: 52, height: 48, name: "로고 4", style: { background: "#f3f4f6", radius: 10 }, type: "image", width: 150 },
      { dx: 1010, dy: 52, height: 48, name: "로고 5", style: { background: "#f3f4f6", radius: 10 }, type: "image", width: 150 }
    ],
    preview: "logos",
    type: "image"
  },
  {
    category: "커머스",
    description: "상품 카드 그리드",
    icon: <ShoppingBag size={16} />,
    key: "products",
    label: "상품 그리드",
    preview: "products",
    type: "products"
  },
  { category: "커머스", description: "요금제 비교 테이블", icon: <CreditCard size={16} />, key: "pricing", label: "가격표", preview: "pricing", type: "pricing" },
  {
    category: "커머스",
    description: "시즌 프로모션 배너",
    icon: <ShoppingBag size={16} />,
    key: "sale",
    label: "할인 배너",
    nodes: [
      { dx: 0, dy: 0, height: 220, name: "할인 배경", style: { background: "#b91c1c", radius: 20 }, type: "container", width: 1280 },
      { dx: 80, dy: 56, height: 56, name: "할인 제목", style: { align: "left", color: "#ffffff", fontSize: 40, fontWeight: 850, text: "SEASON OFF 최대 40%" }, type: "text", width: 720 },
      { dx: 80, dy: 124, height: 24, name: "할인 설명", style: { align: "left", color: "#fecaca", fontSize: 15, fontWeight: 600, text: "이번 주말까지, 전 상품 시즌 오프" }, type: "text", width: 480 },
      { dx: 1020, dy: 84, height: 52, name: "할인 버튼", style: { align: "center", background: "#ffffff", color: "#b91c1c", fontSize: 15, fontWeight: 800, radius: 12, text: "지금 쇼핑하기" }, type: "button", width: 180 }
    ],
    preview: "sale",
    type: "container"
  },
  {
    category: "커머스",
    description: "이미지 + 구매 정보",
    icon: <ImageIcon size={16} />,
    key: "product-feature",
    label: "상품 하이라이트",
    nodes: [
      { dx: 0, dy: 0, height: 420, name: "상품 이미지", style: { background: "#f3f4f6", border: "1px solid #e5e7eb", radius: 20 }, type: "image", width: 560 },
      { dx: 640, dy: 36, height: 22, name: "상품 라벨", style: { align: "left", color: "#2563eb", fontSize: 13, fontWeight: 800, text: "BEST SELLER" }, type: "text", width: 320 },
      { dx: 640, dy: 70, height: 88, name: "상품명", style: { align: "left", color: "#111111", fontSize: 34, fontWeight: 850, text: "시그니처 컬렉션" }, type: "text", width: 560 },
      { dx: 640, dy: 170, height: 72, name: "상품 설명", style: { align: "left", color: "#6b7280", fontSize: 15, fontWeight: 500, text: "가장 사랑받는 구성을 하나로 담았습니다. 어떤 공간에도 어울리는 미니멀한 디자인." }, type: "text", width: 560 },
      { dx: 640, dy: 262, height: 40, name: "상품 가격", style: { align: "left", color: "#111111", fontSize: 28, fontWeight: 850, text: "₩89,000" }, type: "text", width: 300 },
      { dx: 640, dy: 330, height: 52, name: "구매 버튼", style: { align: "center", background: "#111111", color: "#ffffff", fontSize: 15, fontWeight: 800, radius: 12, text: "장바구니 담기" }, type: "button", width: 190 }
    ],
    preview: "productFeature",
    type: "image"
  },
  { category: "미디어", description: "단일 이미지", icon: <ImageIcon size={16} />, key: "image", label: "이미지", preview: "image", type: "image" },
  { category: "미디어", description: "이미지 그리드 6칸", icon: <Images size={16} />, key: "gallery", label: "갤러리", preview: "gallery", type: "gallery" },
  { category: "미디어", description: "자동 재생 캐러셀", icon: <GalleryHorizontal size={16} />, key: "slider", label: "슬라이더", preview: "slider", type: "slider" },
  { category: "미디어", description: "브랜드 필름 플레이어", icon: <Play size={16} />, key: "video", label: "비디오", preview: "video", type: "video" },
  { category: "미디어", description: "위치 안내 지도", icon: <MapPin size={16} />, key: "map", label: "지도", preview: "map", type: "map" },
  { category: "폼·CTA", description: "문의 접수 폼", icon: <Mail size={16} />, key: "form", label: "문의 폼", preview: "form", type: "form" },
  { category: "폼·CTA", description: "날짜·시간 예약 접수", icon: <Calendar size={16} />, key: "booking", label: "예약", preview: "form", type: "booking" },
  {
    category: "폼·CTA",
    description: "이메일 구독 유도",
    icon: <Mail size={16} />,
    key: "newsletter",
    label: "뉴스레터",
    nodes: [
      { dx: 0, dy: 0, height: 190, name: "뉴스레터 배경", style: { background: "#f1f5f9", border: "1px solid #e2e8f0", radius: 20 }, type: "container", width: 1280 },
      { dx: 80, dy: 46, height: 40, name: "뉴스레터 제목", style: { align: "left", color: "#0f172a", fontSize: 26, fontWeight: 850, text: "새 소식을 가장 먼저 받아보세요" }, type: "text", width: 560 },
      { dx: 80, dy: 96, height: 24, name: "뉴스레터 설명", style: { align: "left", color: "#64748b", fontSize: 14, fontWeight: 500, text: "한 달에 한 번, 유용한 소식만 보내드립니다." }, type: "text", width: 480 },
      { dx: 760, dy: 70, height: 52, name: "이메일 입력", style: { background: "#ffffff", border: "1px solid #cbd5e1", radius: 12 }, type: "container", width: 300 },
      { dx: 782, dy: 86, height: 20, name: "이메일 플레이스홀더", style: { align: "left", color: "#94a3b8", fontSize: 14, fontWeight: 500, text: "이메일 주소" }, type: "text", width: 240 },
      { dx: 1080, dy: 70, height: 52, name: "구독 버튼", style: { align: "center", background: "#111111", color: "#ffffff", fontSize: 14, fontWeight: 800, radius: 12, text: "구독하기" }, type: "button", width: 120 }
    ],
    preview: "newsletter",
    type: "form"
  },
  {
    category: "폼·CTA",
    description: "전환 유도 배너",
    icon: <Rocket size={16} />,
    key: "cta",
    label: "CTA 배너",
    nodes: [
      { dx: 0, dy: 0, height: 200, name: "CTA 배경", style: { background: "#1d4ed8", radius: 20 }, type: "container", width: 1280 },
      { dx: 80, dy: 58, height: 48, name: "CTA 제목", style: { align: "left", color: "#ffffff", fontSize: 32, fontWeight: 850, text: "지금 바로 시작해보세요" }, type: "text", width: 640 },
      { dx: 80, dy: 116, height: 24, name: "CTA 설명", style: { align: "left", color: "#bfdbfe", fontSize: 15, fontWeight: 600, text: "가입은 1분이면 충분합니다." }, type: "text", width: 480 },
      { dx: 1040, dy: 74, height: 52, name: "CTA 버튼", style: { align: "center", background: "#ffffff", color: "#1d4ed8", fontSize: 15, fontWeight: 800, radius: 12, text: "무료로 시작" }, type: "button", width: 160 }
    ],
    preview: "ctaBanner",
    type: "container"
  },
  { category: "기본", description: "섹션 제목 텍스트", icon: <Type size={16} />, key: "heading", label: "제목", preview: "heading", size: { height: 64, width: 640 }, style: { align: "left", color: "#111111", fontSize: 40, fontWeight: 850, text: "섹션 제목을 입력하세요" }, type: "text" },
  { category: "기본", description: "본문 문단 텍스트", icon: <Type size={16} />, key: "paragraph", label: "본문", preview: "paragraph", size: { height: 72, width: 560 }, style: { align: "left", color: "#4b5563", fontSize: 16, fontWeight: 500, text: "본문 내용을 입력하세요. 두세 문장으로 핵심을 전달하는 것이 좋습니다." }, type: "text" },
  { category: "기본", description: "채움형 메인 버튼", icon: <MousePointer2 size={16} />, key: "button-primary", label: "버튼 · 프라이머리", preview: "buttonPrimary", size: { height: 52, width: 160 }, style: { align: "center", background: "#111111", color: "#ffffff", fontSize: 15, fontWeight: 800, radius: 12, text: "버튼" }, type: "button" },
  { category: "기본", description: "테두리형 보조 버튼", icon: <MousePointer2 size={16} />, key: "button-outline", label: "버튼 · 아웃라인", preview: "buttonOutline", size: { height: 52, width: 160 }, style: { align: "center", background: "#ffffff", border: "1px solid #d1d5db", color: "#111111", fontSize: 15, fontWeight: 700, radius: 12, text: "버튼" }, type: "button" },
  { category: "기본", description: "빈 컨테이너 프레임", icon: <Square size={16} />, key: "frame", label: "프레임", preview: "container", type: "container" },
  { category: "기본", description: "섹션 구분선", icon: <Square size={16} />, key: "divider", label: "구분선", preview: "divider", size: { height: 2, width: 1280 }, style: { background: "#e5e7eb", padding: 0, radius: 0 }, type: "container" }
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
  const clipboardRef = useRef<EditorNode[]>([]);
  const resizeSessionRef = useRef<NodeResizeSession | null>(null);
  const [pages, setPages] = useState<EditorPage[]>(initialPages);
  const [selectedPageId, setSelectedPageId] = useState("home");
  const [nodes, setNodes] = useState<EditorNode[]>(initialNodes);
  const [siteNodes, setSiteNodes] = useState<EditorNode[]>([]);
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
  const [frameResize, setFrameResize] = useState<FrameResizeState | null>(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [activeResizeId, setActiveResizeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "hand" | "zoom">("select");
  const [toolMenu, setToolMenu] = useState<"cursor" | "frame" | "shape" | "image" | "widgets" | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [panelResize, setPanelResize] = useState<PanelResizeState | null>(null);
  const [canvasSizes, setCanvasSizes] = useState<Record<DeviceMode, CanvasSize>>(defaultCanvasSizes);
  const [viewport, setViewport] = useState<Viewport>({ scale: getFitZoom("desktop"), x: 0, y: 0 });
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [leftPanelMode, setLeftPanelMode] = useState<LeftPanelMode>("file");
  const [siteName, setSiteName] = useState("WEBABLE Demo Site");
  const [siteNameDraft, setSiteNameDraft] = useState("");
  const [editingSiteName, setEditingSiteName] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  const [aiBrief, setAiBrief] = useState("");
  const [aiState, setAiState] = useState<"error" | "idle" | "loading" | "ready">("idle");
  const [aiMessage, setAiMessage] = useState("");
  const [aiProposal, setAiProposal] = useState<AiProposal | null>(null);
  const [inboxItems, setInboxItems] = useState<InboxSubmission[]>([]);
  const [inboxState, setInboxState] = useState<"error" | "idle" | "loading" | "ready">("idle");
  const [inboxTab, setInboxTab] = useState<"forms" | "orders" | "reservations">("forms");
  const [reservationItems, setReservationItems] = useState<ReservationItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [productState, setProductState] = useState<"error" | "idle" | "loading" | "ready">("idle");
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [collapsedLayerIds, setCollapsedLayerIds] = useState<string[]>([]);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState("");
  const [assetCategory, setAssetCategory] = useState<WidgetCategory>("전체");
  const [assetSearch, setAssetSearch] = useState("");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<"design" | "interaction">("design");
  const [borderSettingsNodeId, setBorderSettingsNodeId] = useState<string | null>(null);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageCropDrag, setImageCropDrag] = useState<ImageCropDragState | null>(null);

  const zoom = viewport.scale;
  const selectedId = selectedIds.at(-1) ?? null;
  const canvasNodes = useMemo(() => [...siteNodes, ...nodes], [siteNodes, nodes]);
  const selectedNode = useMemo(() => canvasNodes.find((node) => node.id === selectedId), [canvasNodes, selectedId]);
  const selectedNodes = useMemo(() => canvasNodes.filter((node) => selectedIds.includes(node.id)), [canvasNodes, selectedIds]);
  const visibleNodes = useMemo(() => canvasNodes.filter((node) => !node.hidden && !node.hiddenOnPageIds?.includes(selectedPageId)), [canvasNodes, selectedPageId]);
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
      const matchesCategory = assetCategory === "전체" || block.category === assetCategory;
      const matchesSearch = !query || `${block.label} ${block.description} ${block.type} ${block.category} ${block.key}`.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [assetCategory, assetSearch]);

  const filteredPages = useMemo(() => {
    const query = pageSearch.trim().toLowerCase();

    if (!query) {
      return pagesForSave;
    }

    return pagesForSave.filter((page) => `${page.name} ${page.path}`.toLowerCase().includes(query));
  }, [pageSearch, pagesForSave]);

  const selectedGroups = useMemo(() => Array.from(new Set(selectedNodes.map((node) => node.groupId).filter(Boolean))), [selectedNodes]);
  const layerTree = useMemo(() => {
    const sortedNodes = [...canvasNodes].sort((a, b) => b.zIndex - a.zIndex);
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
  }, [canvasNodes]);

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
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      const project: EditorProject = {
        canvasSizes,
        pages: pagesForSave,
        selectedIds,
        selectedPageId,
        siteNodes,
        siteName
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
  }, [canvasSizes, nodes, pagesForSave, selectedIds, selectedPageId, siteName, siteNodes]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;

      if (target && (target.isContentEditable || target.closest("[contenteditable='true']") || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) {
        return;
      }

      if (editingImageId && (event.key === "Escape" || event.key === "Enter")) {
        event.preventDefault();
        setEditingImageId(null);
        setImageCropDrag(null);
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
        setSelectedIds(visibleNodes.map((node) => node.id));
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelection();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelection();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteClipboard();
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

      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.key.toLowerCase() === "v") {
          setActiveTool("select");
          return;
        }

        if (event.key.toLowerCase() === "h") {
          setActiveTool("hand");
          return;
        }

        if (event.key.toLowerCase() === "k") {
          setActiveTool("zoom");
          return;
        }

        if (event.key.toLowerCase() === "f") {
          event.preventDefault();
          setActiveTool("select");
          addNode("container");
          return;
        }

        if (event.key.toLowerCase() === "t") {
          event.preventDefault();
          setActiveTool("select");
          addNode("text");
          return;
        }

        if (event.key.toLowerCase() === "r") {
          event.preventDefault();
          setActiveTool("select");
          addShape("rectangle");
          return;
        }

        if (event.key.toLowerCase() === "o") {
          event.preventDefault();
          setActiveTool("select");
          addShape("ellipse");
          return;
        }

        if (event.key.toLowerCase() === "l") {
          event.preventDefault();
          setActiveTool("select");
          addShape("line");
          return;
        }
      }

      const movableSelected = canvasNodes.filter((node) => selectedIds.includes(node.id) && !node.locked);

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
        setSiteNodes((current) =>
          current.map((node) =>
            selectedIds.includes(node.id) && !node.locked
              ? {
                  ...node,
                  x: Math.round(node.x + delta.x),
                  y: Math.round(node.y + delta.y)
                }
              : node
          )
        );
        commitNodes((current) =>
          current.map((node) =>
            selectedIds.includes(node.id) && !node.locked
              ? {
                  ...node,
                  x: Math.round(node.x + delta.x),
                  y: Math.round(node.y + delta.y)
                }
              : node
          )
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasNodes, deviceMode, editingImageId, future, nodes, past, selectedId, selectedIds, visibleNodes, zoom]);

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
    if (!toolMenu) {
      return;
    }

    function closeToolMenu() {
      setToolMenu(null);
    }

    window.addEventListener("click", closeToolMenu);
    return () => window.removeEventListener("click", closeToolMenu);
  }, [toolMenu]);

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      const element = target as HTMLElement | null;
      return Boolean(element && (element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(element.tagName)));
    }

    function handleSpaceDown(event: KeyboardEvent) {
      if (event.code !== "Space" && event.key !== " ") {
        return;
      }

      if (isTypingTarget(event.target) || event.repeat) {
        return;
      }

      event.preventDefault();
      setIsSpaceDown(true);
    }

    function handleSpaceUp(event: KeyboardEvent) {
      if (event.code === "Space" || event.key === " ") {
        setIsSpaceDown(false);
      }
    }

    function clearSpace() {
      setIsSpaceDown(false);
    }

    window.addEventListener("keydown", handleSpaceDown);
    window.addEventListener("keyup", handleSpaceUp);
    window.addEventListener("blur", clearSpace);
    return () => {
      window.removeEventListener("keydown", handleSpaceDown);
      window.removeEventListener("keyup", handleSpaceUp);
      window.removeEventListener("blur", clearSpace);
    };
  }, []);

  useEffect(() => {
    function syncResizeModifier(event: KeyboardEvent) {
      setIsShiftDown(event.shiftKey);
    }

    function clearResizeModifier() {
      setIsShiftDown(false);
    }

    window.addEventListener("keydown", syncResizeModifier);
    window.addEventListener("keyup", syncResizeModifier);
    window.addEventListener("blur", clearResizeModifier);
    return () => {
      window.removeEventListener("keydown", syncResizeModifier);
      window.removeEventListener("keyup", syncResizeModifier);
      window.removeEventListener("blur", clearResizeModifier);
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
    if (!frameResize) {
      return;
    }

    const resize = frameResize;

    function moveFrameResize(event: MouseEvent) {
      event.preventDefault();
      const dx = (event.clientX - resize.originClientX) / viewportRef.current.scale;
      const dy = (event.clientY - resize.originClientY) / viewportRef.current.scale;
      const affectsLeft = resize.handle.includes("Left") || resize.handle === "left";
      const affectsRight = resize.handle.includes("Right") || resize.handle === "right";
      const affectsTop = resize.handle.includes("top") || resize.handle === "top";
      const affectsBottom = resize.handle.includes("bottom") || resize.handle === "bottom";
      const nextWidth = clampCanvasSize(resize.originWidth + (affectsRight ? dx : 0) - (affectsLeft ? dx : 0), resize.originWidth, "width");
      const nextHeight = clampCanvasSize(resize.originHeight + (affectsBottom ? dy : 0) - (affectsTop ? dy : 0), resize.originHeight, "height");
      const widthDelta = nextWidth - resize.originWidth;
      const heightDelta = nextHeight - resize.originHeight;

      setCanvasSizes((current) => ({
        ...current,
        [deviceMode]: {
          ...current[deviceMode],
          height: nextHeight,
          width: nextWidth
        }
      }));

      applyViewport({
        scale: viewportRef.current.scale,
        x: resize.originViewportX - (affectsLeft ? widthDelta * viewportRef.current.scale : 0),
        y: resize.originViewportY - (affectsTop ? heightDelta * viewportRef.current.scale : 0)
      });
    }

    function stopFrameResize() {
      setFrameResize(null);
    }

    window.addEventListener("mousemove", moveFrameResize);
    window.addEventListener("mouseup", stopFrameResize);
    return () => {
      window.removeEventListener("mousemove", moveFrameResize);
      window.removeEventListener("mouseup", stopFrameResize);
    };
  }, [deviceMode, frameResize]);

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

      setRightPanelWidth(clamp(resize.originWidth - delta, 260, 420));
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

  useEffect(() => {
    if (!imageCropDrag) {
      return;
    }

    const drag = imageCropDrag;

    function moveImageCrop(event: MouseEvent) {
      const dx = (event.clientX - drag.originClientX) / zoom;
      const dy = (event.clientY - drag.originClientY) / zoom;

      if (drag.mode === "move") {
        const nextOffset = constrainImageCropOffset({
          baseHeight: drag.baseHeight,
          baseWidth: drag.baseWidth,
          height: drag.height,
          offsetX: drag.originOffsetX + dx,
          offsetY: drag.originOffsetY + dy,
          scale: drag.originScale,
          width: drag.width
        });
        updateImageTransformLive(drag.id, {
          imageOffsetX: nextOffset.x,
          imageOffsetY: nextOffset.y
        });
        return;
      }

      const distance = Math.hypot(event.clientX - drag.centerClientX, event.clientY - drag.centerClientY);
      const nextScale = roundCropScale(clamp(drag.originScale * (distance / drag.originPointerDistance), 1, 8));
      const nextOffset = constrainImageCropOffset({
        baseHeight: drag.baseHeight,
        baseWidth: drag.baseWidth,
        height: drag.height,
        offsetX: drag.originOffsetX,
        offsetY: drag.originOffsetY,
        scale: nextScale,
        width: drag.width
      });
      updateImageTransformLive(drag.id, {
        imageOffsetX: nextOffset.x,
        imageOffsetY: nextOffset.y,
        imageScale: nextScale
      });
    }

    function stopImageCrop() {
      setImageCropDrag(null);
    }

    window.addEventListener("mousemove", moveImageCrop);
    window.addEventListener("mouseup", stopImageCrop);
    return () => {
      window.removeEventListener("mousemove", moveImageCrop);
      window.removeEventListener("mouseup", stopImageCrop);
    };
  }, [imageCropDrag, zoom]);

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

    if (typeof project.siteName === "string" && project.siteName.trim()) {
      setSiteName(project.siteName.trim());
    }

    setPages(project.pages);
    setSiteNodes(Array.isArray(project.siteNodes) ? project.siteNodes : []);
    setSelectedPageId(nextPage.id);
    setNodes(nextPage.nodes);
    setCanvasSizes(normalizeCanvasSizes(project.canvasSizes));
    setSelectedIds(Array.isArray(project.selectedIds) ? project.selectedIds.filter((id) => [...nextPage.nodes, ...(project.siteNodes || [])].some((node) => node.id === id)) : []);
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

  function exportProject() {
    const project: EditorProject = {
      canvasSizes,
      pages: pagesForSave,
      selectedIds,
      selectedPageId,
      siteNodes,
      siteName
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${siteName.trim().replace(/\s+/g, "-").toLowerCase() || "webable-project"}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setFileMenuOpen(false);
  }

  function startSiteRename() {
    setSiteNameDraft(siteName);
    setEditingSiteName(true);
    setFileMenuOpen(false);
  }

  function commitSiteRename() {
    const nextName = siteNameDraft.trim();

    if (nextName) {
      setSiteName(nextName);
    }

    setEditingSiteName(false);
  }

  async function loadInbox() {
    setInboxState("loading");

    try {
      const response = await fetch(`/api/forms/submissions?siteId=${SITE_ID}`);

      if (!response.ok) {
        throw new Error("load failed");
      }

      const data = (await response.json()) as { submissions: InboxSubmission[] };
      setInboxItems(data.submissions);
      setInboxState("ready");
    } catch {
      setInboxState("error");
    }
  }

  async function loadOrders() {
    try {
      const response = await fetch(`/api/orders?siteId=${SITE_ID}`);

      if (!response.ok) {
        throw new Error("load failed");
      }

      const data = (await response.json()) as { orders: OrderItem[] };
      setOrderItems(data.orders);
    } catch {
      setOrderItems([]);
    }
  }

  function setOrderStatus(id: string, status: OrderItem["status"]) {
    setOrderItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    void fetch("/api/orders", {
      body: JSON.stringify({ id, status }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    }).catch(() => undefined);
  }

  async function loadProducts() {
    setProductState("loading");

    try {
      const response = await fetch(`/api/products?siteId=${SITE_ID}&scope=all`);

      if (!response.ok) {
        throw new Error("load failed");
      }

      const data = (await response.json()) as { products: ProductItem[] };
      setProductItems(data.products);
      setProductState("ready");
    } catch {
      setProductState("error");
    }
  }

  async function createProductItem() {
    const name = newProductName.trim();
    const price = Math.round(Number(newProductPrice));

    if (!name || !Number.isFinite(price) || price < 0) {
      return;
    }

    try {
      const response = await fetch("/api/products", {
        body: JSON.stringify({ description: newProductDesc.trim() || undefined, name, price, siteId: SITE_ID }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("create failed");
      }

      setNewProductName("");
      setNewProductPrice("");
      setNewProductDesc("");
      void loadProducts();
    } catch {
      setProductState("error");
    }
  }

  function toggleProductActive(item: ProductItem) {
    setProductItems((current) => current.map((product) => (product.id === item.id ? { ...product, active: !product.active } : product)));
    void fetch("/api/products", {
      body: JSON.stringify({ active: !item.active, id: item.id }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    }).catch(() => undefined);
  }

  function removeProduct(id: string) {
    setProductItems((current) => current.filter((product) => product.id !== id));
    void fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => undefined);
  }

  async function loadReservations() {
    try {
      const response = await fetch(`/api/reservations?siteId=${SITE_ID}`);

      if (!response.ok) {
        throw new Error("load failed");
      }

      const data = (await response.json()) as { reservations: ReservationItem[] };
      setReservationItems(data.reservations);
    } catch {
      setReservationItems([]);
    }
  }

  function setReservationStatus(id: string, status: ReservationItem["status"]) {
    setReservationItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    void fetch("/api/reservations", {
      body: JSON.stringify({ id, status }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    }).catch(() => undefined);
  }

  function setInboxStatus(id: string, status: "done" | "read") {
    setInboxItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    void fetch("/api/forms/submissions", {
      body: JSON.stringify({ id, status }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    }).catch(() => undefined);
  }

  async function generateAiDraft() {
    const prompt = aiBrief.trim();

    if (!prompt || aiState === "loading") {
      return;
    }

    setAiState("loading");
    setAiMessage("");

    try {
      const response = await fetch("/api/ai/site-generate", {
        body: JSON.stringify({ prompt }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Generate failed");
      }

      const proposal = (await response.json()) as AiProposal;
      setAiProposal(proposal);
      setAiState("ready");
    } catch {
      setAiMessage("초안 생성에 실패했습니다. 다시 시도하세요.");
      setAiState("error");
    }
  }

  function applyAiProposal() {
    const spec = aiProposal?.outputDiff.siteSpec;
    const specPage = spec?.pages[0];

    if (!spec || !specPage) {
      return;
    }

    const stamp = Date.now();
    const theme = spec.site.theme;
    const created: EditorNode[] = [];
    let nextZ = Math.max(...nodes.map((node) => node.zIndex), 0);
    let cursorY = snap(Math.max(120, ...nodes.map((node) => node.y + node.height)) + 96);

    specPage.sections.forEach((section, index) => {
      const base = `ai-${stamp}-${index}`;
      const align = section.props.contentAlign ?? "left";

      created.push({
        id: `${base}-title`,
        name: `${section.type} 제목`,
        type: "text",
        x: 96,
        y: cursorY,
        width: 1248,
        height: 72,
        zIndex: (nextZ += 1),
        style: { align, color: "#111111", fontSize: 40, fontWeight: 850, text: section.props.title }
      });
      cursorY += 88;

      if (section.props.body) {
        created.push({
          id: `${base}-body`,
          name: `${section.type} 본문`,
          type: "text",
          x: 96,
          y: cursorY,
          width: 1100,
          height: 60,
          zIndex: (nextZ += 1),
          style: { align, color: "#374151", fontSize: 18, fontWeight: 500, text: section.props.body }
        });
        cursorY += 76;
      }

      if (section.props.primaryAction) {
        created.push({
          id: `${base}-action`,
          name: `${section.type} 버튼`,
          type: "button",
          x: 96,
          y: cursorY,
          width: 220,
          height: 54,
          zIndex: (nextZ += 1),
          style: { align: "center", background: theme.primaryColor, color: "#ffffff", fontSize: 16, fontWeight: 800, radius: 10, text: section.props.primaryAction }
        });
        cursorY += 78;
      }

      cursorY += 56;
    });

    if (created.length === 0) {
      return;
    }

    commitNodes((current) => [...current, ...created]);
    setSelectedIds([created[0].id]);
    setAiProposal(null);
    setAiState("idle");
    setAiMessage(`${specPage.sections.length}개 섹션을 캔버스에 추가했습니다.`);
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
    const node = canvasNodes.find((item) => item.id === id);
    const targetIds = node?.groupId ? canvasNodes.filter((item) => item.groupId === node.groupId).map((item) => item.id) : [id];

    if (editingImageId && editingImageId !== id) {
      setEditingImageId(null);
      setImageCropDrag(null);
    }

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
    setEditingImageId(null);
    setImageCropDrag(null);
  }

  function updateNode(id: string, changes: Partial<EditorNode>) {
    if (siteNodes.some((node) => node.id === id)) {
      setSiteNodes((current) => current.map((node) => (node.id === id ? { ...node, ...changes } : node)));
      return;
    }

    commitNodes((current) => current.map((node) => (node.id === id ? { ...node, ...changes } : node)));
  }

  function updateNodeLive(id: string, changes: Partial<EditorNode>) {
    if (siteNodes.some((node) => node.id === id)) {
      setSiteNodes((current) => current.map((node) => (node.id === id ? { ...node, ...changes } : node)));
      return;
    }

    setNodes((current) => current.map((node) => (node.id === id ? { ...node, ...changes } : node)));
  }

  function startNodeResize(node: EditorNode) {
    resizeSessionRef.current = {
      height: node.height,
      id: node.id,
      width: node.width,
      x: node.x,
      y: node.y
    };
    setActiveResizeId(node.id);

    if (siteNodes.some((item) => item.id === node.id)) {
      return;
    }

    setPast((items) => [nodes, ...items].slice(0, 40));
    setFuture([]);
  }

  function resizeNodeLive(node: EditorNode, event: MouseEvent | TouchEvent, ref: HTMLElement, position: { x: number; y: number }) {
    const minSize = getNodeMinSize(node);
    const session = resizeSessionRef.current?.id === node.id ? resizeSessionRef.current : null;
    let width = Math.max(minSize.width, Math.round(ref.offsetWidth));
    let height = Math.max(minSize.height, Math.round(ref.offsetHeight));
    let x = Math.round(position.x);
    let y = Math.round(position.y);

    if (event.altKey && session) {
      x = Math.round(session.x + (session.width - width) / 2);
      y = Math.round(session.y + (session.height - height) / 2);
    }

    if (x < 0) {
      width += x;
      x = 0;
    }

    if (y < 0) {
      height += y;
      y = 0;
    }

    width = Math.max(minSize.width, Math.min(width, activeCanvasSize.width - x));
    height = Math.max(minSize.height, Math.min(height, activeCanvasSize.height - y));

    updateNodeLive(node.id, { height, width, x, y });
  }

  function stopNodeResize(node: EditorNode, event: MouseEvent | TouchEvent, ref: HTMLElement, position: { x: number; y: number }) {
    resizeNodeLive(node, event, ref, position);
    resizeSessionRef.current = null;
    setActiveResizeId(null);
  }

  function getNodeMinSize(node: EditorNode) {
    if (node.type === "button") {
      return { height: 20, width: 24 };
    }

    if (node.type === "container") {
      return { height: 8, width: 8 };
    }

    if (node.type === "text") {
      return { height: 8, width: 16 };
    }

    return { height: 16, width: 16 };
  }

  function updateNodeInteractions(nodeId: string, updater: (current: Interaction[]) => Interaction[]) {
    if (siteNodes.some((node) => node.id === nodeId)) {
      setSiteNodes((current) => current.map((node) => (node.id === nodeId ? { ...node, interactions: updater(node.interactions ?? []) } : node)));
      return;
    }

    commitNodes((current) => current.map((node) => (node.id === nodeId ? { ...node, interactions: updater(node.interactions ?? []) } : node)));
  }

  function createInteractionAction(actionType: string): InteractionAction {
    const otherNode = canvasNodes.find((node) => node.id !== selectedId);

    if (actionType === "animate") {
      return { spec: { delay: 0, duration: 600, easing: "ease", effect: "fadeUp" }, type: "animate" };
    }

    if (actionType === "hoverStyle") {
      return { preset: "lift", type: "hoverStyle" };
    }

    if (actionType === "toggleVisibility") {
      return { target: otherNode?.id ?? "", type: "toggleVisibility" };
    }

    if (actionType === "scrollTo") {
      return { behavior: "smooth", block: "center", target: otherNode?.id ?? "", type: "scrollTo" };
    }

    if (actionType === "delay") {
      return { duration: 250, type: "delay" };
    }

    if (actionType === "setStyle") {
      return { duration: 240, easing: "ease", style: { opacity: "0.5" }, target: otherNode?.id ?? "", type: "setStyle" };
    }

    if (actionType === "setState") {
      return { mode: "toggle", state: "active", target: otherNode?.id ?? "", type: "setState" };
    }

    if (actionType === "setClass") {
      return { className: "is-active", mode: "toggle", target: otherNode?.id ?? "", type: "setClass" };
    }

    return { kind: "page", target: pagesForSave[0]?.id ?? "", type: "navigate" };
  }

  function createInteractionCondition(conditionType: string): InteractionCondition | undefined {
    const otherNode = canvasNodes.find((node) => node.id !== selectedId);

    if (conditionType === "visible") {
      return { target: otherNode?.id ?? "", type: "visible" };
    }

    if (conditionType === "hidden") {
      return { target: otherNode?.id ?? "", type: "hidden" };
    }

    if (conditionType === "stateEquals") {
      return { state: "active", target: otherNode?.id ?? "", type: "stateEquals" };
    }

    if (conditionType === "classPresent") {
      return { className: "is-active", target: otherNode?.id ?? "", type: "classPresent" };
    }

    return undefined;
  }

  function setInteractionConditionType(nodeId: string, interaction: Interaction, conditionType: string) {
    patchInteraction(nodeId, interaction.id, { condition: createInteractionCondition(conditionType) });
  }

  function patchInteractionCondition(nodeId: string, interaction: Interaction, patch: Partial<InteractionCondition>) {
    if (!interaction.condition) {
      return;
    }

    patchInteraction(nodeId, interaction.id, { condition: { ...interaction.condition, ...patch } as InteractionCondition });
  }

  function addInteraction(nodeId: string, preset: InteractionPresetKey) {
    const interaction: Interaction =
      preset === "appear"
        ? { actions: [{ spec: { delay: 0, duration: 600, easing: "ease", effect: "fadeUp" }, type: "animate" }], id: createInteractionId(), trigger: { threshold: 0.12, type: "viewEnter" } }
      : preset === "clickPage"
        ? { actions: [{ kind: "page", target: pagesForSave[0]?.id ?? "", type: "navigate" }], id: createInteractionId(), trigger: { type: "click" } }
      : preset === "loadAnimate"
        ? { actions: [{ duration: 150, type: "delay" }, { spec: { delay: 0, duration: 700, easing: "ease", effect: "fadeIn" }, type: "animate" }], id: createInteractionId(), trigger: { delay: 0, type: "pageLoad" } }
      : preset === "buttonPress"
        ? { actions: [{ duration: 90, easing: "ease", style: { transform: "scale(0.97)" }, type: "setStyle" }, { duration: 90, type: "delay" }, { duration: 130, easing: "spring", style: { transform: "scale(1)" }, type: "setStyle" }], id: createInteractionId(), trigger: { type: "mouseDown" } }
      : preset === "inputFocus"
        ? { actions: [{ duration: 180, easing: "ease", style: { boxShadow: "0 0 0 3px rgba(17, 17, 17, 0.12)" }, type: "setStyle" }, { mode: "set", state: "focused", type: "setState" }], id: createInteractionId(), trigger: { type: "focusWithin" } }
      : preset === "imageZoom"
        ? { actions: [{ preset: "scale", type: "hoverStyle" }], id: createInteractionId(), trigger: { type: "hover" } }
      : preset === "galleryLightbox"
        ? { actions: [{ mode: "toggle", state: "lightbox", type: "setState" }, { className: "is-lightbox-open", mode: "toggle", type: "setClass" }, { duration: 180, easing: "spring", style: { transform: "scale(1.02)", zIndex: "10020" }, type: "setStyle" }], id: createInteractionId(), trigger: { type: "click" } }
      : preset === "navReveal"
        ? { actions: [{ mode: "toggle", state: "open", type: "setState" }, { duration: 160, easing: "ease", style: { transform: "translateY(0)", opacity: "1" }, type: "setStyle" }], id: createInteractionId(), trigger: { type: "hover" } }
      : preset === "dropdownToggle"
        ? { actions: [{ mode: "toggle", state: "menu-open", type: "setState" }, { className: "is-menu-open", mode: "toggle", type: "setClass" }], id: createInteractionId(), trigger: { type: "click" } }
      : preset === "cardHover"
        ? { actions: [{ preset: "lift", type: "hoverStyle" }], id: createInteractionId(), trigger: { type: "hover" } }
      : preset === "formFocus"
        ? { actions: [{ duration: 220, easing: "ease", style: { boxShadow: "0 18px 45px rgba(15, 23, 42, 0.16)", transform: "translateY(-2px)" }, type: "setStyle" }], id: createInteractionId(), trigger: { type: "hover" } }
      : preset === "formSubmitFeedback"
        ? { actions: [{ mode: "set", state: "submitted", type: "setState" }, { className: "is-submitted", mode: "add", type: "setClass" }, { spec: { delay: 0, duration: 420, easing: "spring", effect: "zoomIn" }, type: "animate" }], id: createInteractionId(), trigger: { type: "formSubmit" } }
      : preset === "videoFocus"
        ? { actions: [{ spec: { delay: 0, duration: 420, easing: "spring", effect: "zoomIn" }, type: "animate" }], id: createInteractionId(), trigger: { type: "click" } }
      : preset === "mapReveal"
        ? { actions: [{ spec: { delay: 0, duration: 520, easing: "ease", effect: "fadeIn" }, type: "animate" }], id: createInteractionId(), trigger: { threshold: 0.2, type: "viewEnter" } }
      : preset === "mapFocus"
        ? { actions: [{ duration: 220, easing: "ease", style: { filter: "saturate(1.15)", transform: "scale(1.01)" }, type: "setStyle" }], id: createInteractionId(), trigger: { type: "hover" } }
      : preset === "sliderAutoplay"
        ? { actions: [{ spec: { delay: 0, duration: 1600, easing: "ease", effect: "slideLeft", fill: "both", iterations: 3 }, type: "animate" }], id: createInteractionId(), trigger: { delay: 350, type: "pageLoad" } }
      : preset === "accordionToggle"
        ? { actions: [{ mode: "toggle", state: "expanded", type: "setState" }, { className: "is-expanded", mode: "toggle", type: "setClass" }], id: createInteractionId(), trigger: { type: "click" } }
      : preset === "scrollTo"
        ? { actions: [createInteractionAction("scrollTo")], id: createInteractionId(), trigger: { type: "click" } }
      : preset === "toggle"
        ? { actions: [createInteractionAction("toggleVisibility")], id: createInteractionId(), trigger: { type: "click" } }
        : { actions: [{ preset: "lift", type: "hoverStyle" }], id: createInteractionId(), trigger: { type: "hover" } };

    updateNodeInteractions(nodeId, (current) => [...current, interaction]);
  }

  function removeInteraction(nodeId: string, interactionId: string) {
    updateNodeInteractions(nodeId, (current) => current.filter((interaction) => interaction.id !== interactionId));
  }

  function patchInteraction(nodeId: string, interactionId: string, patch: Partial<Interaction>) {
    updateNodeInteractions(nodeId, (current) => current.map((interaction) => (interaction.id === interactionId ? { ...interaction, ...patch } : interaction)));
  }

  function setInteractionTriggerType(nodeId: string, interaction: Interaction, triggerType: string) {
    const trigger: Interaction["trigger"] =
      triggerType === "doubleClick"
        ? { type: "doubleClick" }
        : triggerType === "focusWithin"
        ? { type: "focusWithin" }
        : triggerType === "formSubmit"
        ? { type: "formSubmit" }
        : triggerType === "inputChange"
        ? { type: "inputChange" }
        : triggerType === "mouseDown"
        ? { type: "mouseDown" }
        : triggerType === "mouseUp"
        ? { type: "mouseUp" }
        : triggerType === "viewEnter"
        ? { threshold: 0.12, type: "viewEnter" }
        : triggerType === "pageLoad"
        ? { delay: 0, type: "pageLoad" }
        : triggerType === "hover"
        ? { type: "hover" }
        : { type: "click" };
    const needsStyleAction = trigger.type === "hover" && interaction.actions[0]?.type === "navigate";
    patchInteraction(nodeId, interaction.id, needsStyleAction ? { actions: [{ preset: "lift", type: "hoverStyle" }], trigger } : { trigger });
  }

  function setInteractionActionType(nodeId: string, interaction: Interaction, actionType: string) {
    patchInteraction(nodeId, interaction.id, { actions: [createInteractionAction(actionType)] });
  }

  function setInteractionActionTypeAt(nodeId: string, interaction: Interaction, actionIndex: number, actionType: string) {
    patchInteraction(nodeId, interaction.id, {
      actions: interaction.actions.map((action, index) => (index === actionIndex ? createInteractionAction(actionType) : action))
    });
  }

  function addInteractionAction(nodeId: string, interaction: Interaction) {
    patchInteraction(nodeId, interaction.id, { actions: [...interaction.actions, createInteractionAction("delay"), createInteractionAction("animate")] });
  }

  function removeInteractionAction(nodeId: string, interaction: Interaction, actionIndex: number) {
    patchInteraction(nodeId, interaction.id, { actions: interaction.actions.filter((_, index) => index !== actionIndex) });
  }

  function patchInteractionActionAt(nodeId: string, interaction: Interaction, actionIndex: number, patch: Partial<InteractionAction>) {
    const action = interaction.actions[actionIndex];

    if (!action) {
      return;
    }

    patchInteraction(nodeId, interaction.id, {
      actions: interaction.actions.map((item, index) => (index === actionIndex ? ({ ...action, ...patch } as InteractionAction) : item))
    });
  }

  function patchInteractionAction(nodeId: string, interaction: Interaction, patch: Partial<InteractionAction>) {
    const action = interaction.actions[0];

    if (!action) {
      return;
    }

    patchInteraction(nodeId, interaction.id, { actions: [{ ...action, ...patch } as InteractionAction] });
  }

  function patchAnimationSpecAt(nodeId: string, interaction: Interaction, actionIndex: number, patch: Partial<AnimationSpec>) {
    const action = interaction.actions[actionIndex];

    if (!action || action.type !== "animate") {
      return;
    }

    patchInteractionActionAt(nodeId, interaction, actionIndex, { spec: { ...action.spec, ...patch } } as Partial<InteractionAction>);
  }

  function patchAnimationSpec(nodeId: string, interaction: Interaction, patch: Partial<AnimationSpec>) {
    const action = interaction.actions[0];

    if (!action || action.type !== "animate") {
      return;
    }

    patchInteraction(nodeId, interaction.id, { actions: [{ ...action, spec: { ...action.spec, ...patch } }] });
  }

  function applyCodeToCanvas(filePath: string, sourceText: string): CodeApplyResult {
    const result = parseCanvasCodeToNodes(filePath, sourceText, visibleNodes);

    if (!result.ok) {
      return result;
    }

    const resultById = new Map(result.nodes.map((node) => [node.id, node]));
    const siteNodeIds = new Set(siteNodes.map((node) => node.id));

    setSiteNodes((current) =>
      current.map((node) => {
        const next = resultById.get(node.id);

        return next ? { ...next, hiddenOnPageIds: node.hiddenOnPageIds, positionMode: next.positionMode || node.positionMode || "normal", scope: "site" } : node;
      })
    );
    commitNodes((current) => {
      const currentIds = new Set(current.map((node) => node.id));
      const updated = current.map((node) => {
        const next = resultById.get(node.id);

        return next ? { ...next, scope: "page" as const } : node;
      });
      const added = result.nodes.filter((node) => !siteNodeIds.has(node.id) && !currentIds.has(node.id)).map((node) => ({ ...node, scope: "page" as const }));

      return [...updated, ...added];
    });
    setSelectedIds((current) => current.filter((id) => resultById.has(id) || canvasNodes.some((node) => node.id === id)));
    return { ok: true, message: "Canvas updated from code." };
  }

  function updateStyle(id: string, changes: Partial<EditorNode["style"]>) {
    if (siteNodes.some((node) => node.id === id)) {
      setSiteNodes((current) =>
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
      return;
    }

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

  function toggleNodeSiteScope(node: EditorNode, enabled: boolean) {
    if (enabled) {
      if (siteNodes.some((item) => item.id === node.id)) {
        return;
      }

      commitNodes((current) => current.filter((item) => item.id !== node.id));
      setSiteNodes((current) => [...current, { ...node, hiddenOnPageIds: node.hiddenOnPageIds || [], positionMode: node.positionMode || "normal", scope: "site" }]);
      setSelectedIds([node.id]);
      return;
    }

    if (!siteNodes.some((item) => item.id === node.id)) {
      return;
    }

    setSiteNodes((current) => current.filter((item) => item.id !== node.id));
    commitNodes((current) => [...current, { ...node, hiddenOnPageIds: undefined, scope: "page" }]);
    setSelectedIds([node.id]);
  }

  function toggleNodeHiddenOnCurrentPage(node: EditorNode, hidden: boolean) {
    if (node.scope !== "site") {
      return;
    }

    const current = node.hiddenOnPageIds || [];
    updateNode(node.id, {
      hiddenOnPageIds: hidden ? Array.from(new Set([...current, selectedPageId])) : current.filter((pageId) => pageId !== selectedPageId)
    });
  }

  function updateImageTransformLive(id: string, changes: Partial<EditorNode["style"]>) {
    setNodes((current) =>
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

  function startImageCropEdit(node: EditorNode, event?: React.MouseEvent) {
    if (node.type !== "image" || node.locked || !node.style.imageUrl) {
      return;
    }

    event?.preventDefault();
    event?.stopPropagation();
    setSelectedIds([node.id]);
    setEditingNodeId(null);
    setEditingImageId(node.id);
  }

  function startImageCropDrag(
    node: EditorNode,
    mode: ImageCropDragState["mode"],
    event: React.MouseEvent<HTMLElement>,
    baseSize: { height: number; width: number }
  ) {
    if (node.type !== "image" || node.locked || !node.style.imageUrl) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const cropRoot = event.currentTarget.closest(".ffImageNode");
    const rect = cropRoot?.getBoundingClientRect();
    const centerClientX = rect ? rect.left + rect.width / 2 : event.clientX;
    const centerClientY = rect ? rect.top + rect.height / 2 : event.clientY;
    const originPointerDistance = Math.max(12, Math.hypot(event.clientX - centerClientX, event.clientY - centerClientY));
    setSelectedIds([node.id]);
    setEditingNodeId(null);
    setEditingImageId(node.id);
    setPast((items) => [nodes, ...items].slice(0, 40));
    setFuture([]);
    setImageCropDrag({
      baseHeight: baseSize.height,
      baseWidth: baseSize.width,
      centerClientX,
      centerClientY,
      id: node.id,
      mode,
      originClientX: event.clientX,
      originClientY: event.clientY,
      originOffsetX: node.style.imageOffsetX || 0,
      originOffsetY: node.style.imageOffsetY || 0,
      originPointerDistance,
      originScale: node.style.imageScale || 1,
      width: node.width,
      height: node.height
    });
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

  function getPageAwareWidgetStyle(type: EditorNodeType, style: EditorNode["style"]) {
    const pageMenuText = serializeMenuItems(getPageMenuItems(pagesForSave));

    if (!pageMenuText) {
      return style;
    }

    if (type === "nav") {
      return { ...style, text: pageMenuText };
    }

    if (type === "header") {
      const [brand, , action] = splitContent(style.text, ["WEBABLE", pageMenuText, "Start"]);
      return { ...style, text: joinContentParts([brand, pageMenuText, action]) };
    }

    return style;
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
      style: getPageAwareWidgetStyle(type, widget.style)
    };

    commitNodes((current) => [...current, base]);
    setSelectedIds([id]);
  }

  function addShape(kind: "rectangle" | "ellipse" | "line" | "section") {
    const presets: Record<typeof kind, { name: string; width: number; height: number; style: EditorNode["style"] }> = {
      rectangle: { name: "사각형", width: 240, height: 160, style: { background: "#d9d9d9", radius: 6 } },
      ellipse: { name: "타원", width: 200, height: 200, style: { background: "#d9d9d9", radius: 9999 } },
      line: { name: "선", width: 240, height: 2, style: { background: "#111111" } },
      section: { name: "섹션", width: 1200, height: 420, style: { background: "#f5f5f5", radius: 0 } }
    };
    const preset = presets[kind];
    const id = `container-${Date.now()}`;
    const nextZ = Math.max(...nodes.map((node) => node.zIndex), 0) + 1;
    const base: EditorNode = {
      id,
      name: preset.name,
      type: "container",
      x: snap(160 + nodes.length * 14),
      y: snap(120 + nodes.length * 14),
      width: preset.width,
      height: preset.height,
      zIndex: nextZ,
      style: preset.style
    };

    commitNodes((current) => [...current, base]);
    setSelectedIds([id]);
  }

  function addBlock(template: WidgetTemplate) {
    const stamp = Date.now();
    let nextZ = Math.max(...nodes.map((node) => node.zIndex), 0);

    if (!template.nodes) {
      const widget = getWidgetDefaults(template.type);
      const id = `${template.key}-${stamp}`;
      const node: EditorNode = {
        id,
        name: template.label,
        type: template.type,
        x: snap(160 + nodes.length * 14),
        y: snap(120 + nodes.length * 14),
        width: template.size?.width ?? widget.width,
        height: template.size?.height ?? widget.height,
        zIndex: nextZ + 1,
        style: getPageAwareWidgetStyle(template.type, { ...widget.style, ...template.style })
      };

      commitNodes((current) => [...current, node]);
      setSelectedIds([id]);
      return;
    }

    const specs = template.nodes;
    const blockWidth = Math.max(...specs.map((spec) => spec.dx + spec.width));
    const blockGroup = `block-${template.key}-${stamp}`;
    const originX = snap(Math.max(0, (activeCanvasSize.width - blockWidth) / 2));
    const originY = snap(Math.max(120, ...nodes.map((node) => node.y + node.height)) + 64);
    const created: EditorNode[] = specs.map((spec, index) => ({
      id: `${blockGroup}-${index}`,
      name: spec.name,
      type: spec.type,
      x: snap(originX + spec.dx),
      y: snap(originY + spec.dy),
      width: spec.width,
      height: spec.height,
      zIndex: (nextZ += 1),
      groupId: specs.length > 1 ? blockGroup : undefined,
      style: spec.style
    }));

    commitNodes((current) => [...current, ...created]);
    setSelectedIds(created.map((node) => node.id));
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
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageScale: 1,
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
    if (siteNodes.some((node) => node.id === id)) {
      setSiteNodes((current) => current.filter((node) => node.id !== id));
      setSelectedIds((current) => current.filter((item) => item !== id));
      return;
    }

    if (nodes.length <= 1) {
      return;
    }

    const nextNodes = nodes.filter((node) => node.id !== id);
    commitNodes(() => nextNodes);
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function deleteSelection() {
    if (selectedIds.length === 0) {
      return;
    }

    setSiteNodes((current) => current.filter((node) => !selectedIds.includes(node.id)));
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

    if (node.scope === "site") {
      setSiteNodes((current) => [...current, { ...copy, scope: "site" }]);
    } else {
      commitNodes((current) => [...current, { ...copy, scope: "page" }]);
    }
    setSelectedIds([copy.id]);
  }

  function duplicateSelection() {
    if (selectedNodes.length === 0) {
      return;
    }

    duplicateIds(selectedIds);
  }

  function duplicateIds(ids: string[]) {
    const nodesToCopy = canvasNodes.filter((node) => ids.includes(node.id));

    if (nodesToCopy.length === 0) {
      return;
    }

    const topZ = Math.max(...canvasNodes.map((item) => item.zIndex), 0);
    const copies = nodesToCopy.map((node, index) => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}-${index}`,
      name: `${node.name} copy`,
      x: snap(node.x + 24),
      y: snap(node.y + 24),
      zIndex: topZ + index + 1
    }));

    setSiteNodes((current) => [...current, ...copies.filter((node) => node.scope === "site")]);
    commitNodes((current) => [...current, ...copies.filter((node) => node.scope !== "site").map((node) => ({ ...node, scope: "page" as const }))]);
    setSelectedIds(copies.map((node) => node.id));
  }

  function copySelection() {
    const picked = canvasNodes.filter((node) => selectedIds.includes(node.id));

    if (picked.length === 0) {
      return;
    }

    clipboardRef.current = picked.map((node) => ({ ...node }));
  }

  function pasteClipboard() {
    const items = clipboardRef.current;

    if (!items || items.length === 0) {
      return;
    }

    const topZ = Math.max(...canvasNodes.map((item) => item.zIndex), 0);
    const stamp = Date.now();
    const copies = items.map((node, index) => ({
      ...node,
      id: `${node.id}-paste-${stamp}-${index}`,
      name: `${node.name} copy`,
      x: snap(node.x + 24),
      y: snap(node.y + 24),
      zIndex: topZ + index + 1
    }));

    setSiteNodes((current) => [...current, ...copies.filter((node) => node.scope === "site")]);
    commitNodes((current) => [...current, ...copies.filter((node) => node.scope !== "site").map((node) => ({ ...node, scope: "page" as const }))]);
    setSelectedIds(copies.map((node) => node.id));
  }

  function bringForward(node: EditorNode) {
    updateNode(node.id, { zIndex: Math.max(...canvasNodes.map((item) => item.zIndex), 0) + 1 });
  }

  function bringSelectionForward() {
    bringIdsForward(selectedIds);
  }

  function bringIdsForward(ids: string[]) {
    const topZ = Math.max(...canvasNodes.map((item) => item.zIndex), 0);
    setSiteNodes((current) =>
      current.map((node) => {
        const selectedIndex = ids.indexOf(node.id);
        return selectedIndex >= 0 ? { ...node, zIndex: topZ + selectedIndex + 1 } : node;
      })
    );
    commitNodes((current) =>
      current.map((node) => {
        const selectedIndex = ids.indexOf(node.id);
        return selectedIndex >= 0 ? { ...node, zIndex: topZ + selectedIndex + 1 } : node;
      })
    );
  }

  function moveNodeSelection(node: EditorNode, nextX: number, nextY: number) {
    const snapped = getSmartSnap(node, nextX, nextY);
    const deltaX = Math.round(snapped.x) - node.x;
    const deltaY = Math.round(snapped.y) - node.y;

    if (deltaX === 0 && deltaY === 0) {
      setSnapGuides([]);
      return;
    }

    const idsToMove =
      selectedIds.includes(node.id) && selectedIds.length > 1
        ? selectedIds
        : node.groupId
          ? canvasNodes.filter((item) => item.groupId === node.groupId).map((item) => item.id)
          : [node.id];

    setSiteNodes((current) =>
      current.map((item) =>
        idsToMove.includes(item.id) && !item.locked
          ? {
              ...item,
              x: Math.round(item.x + deltaX),
              y: Math.round(item.y + deltaY)
            }
          : item
      )
    );
    commitNodes((current) =>
      current.map((item) =>
        idsToMove.includes(item.id) && !item.locked
          ? {
              ...item,
              x: Math.round(item.x + deltaX),
              y: Math.round(item.y + deltaY)
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

  function startFrameResize(handle: FrameResizeHandle, event: React.MouseEvent<HTMLButtonElement>) {
    if (canvasMode !== "design") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    clearSelection();
    setMarquee(null);
    setFrameDrag(null);
    setFrameResize({
      handle,
      originClientX: event.clientX,
      originClientY: event.clientY,
      originHeight: activeCanvasSize.height,
      originViewportX: viewportRef.current.x,
      originViewportY: viewportRef.current.y,
      originWidth: activeCanvasSize.width
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

    if (editingImageId) {
      setEditingImageId(null);
      setImageCropDrag(null);
    }

    if (activeTool === "zoom" && event.button === 0) {
      zoomViewportAtPoint(getSteppedZoom(viewportRef.current.scale, event.altKey ? -1 : 1), event.clientX, event.clientY);
      return;
    }

    if (isSpaceDown || activeTool === "hand" || event.button === 1) {
      startFrameDrag(event);
      return;
    }

    startMarquee(event);
  }

  function startMarquee(event: React.MouseEvent<HTMLDivElement>) {
    if (canvasMode !== "design") {
      return;
    }

    const artboard = artboardRef.current;

    if (!artboard) {
      return;
    }

    const artboardElement = artboard;
    const originX = (event.clientX - artboardElement.getBoundingClientRect().left) / viewportRef.current.scale;
    const originY = (event.clientY - artboardElement.getBoundingClientRect().top) / viewportRef.current.scale;
    const marqueeNodes = visibleNodes;
    clearSelection();
    setMarquee({ height: 0, originX, originY, width: 0, x: originX, y: originY });

    function boxAt(clientX: number, clientY: number) {
      const rect = artboardElement.getBoundingClientRect();
      const scale = viewportRef.current.scale;
      const px = (clientX - rect.left) / scale;
      const py = (clientY - rect.top) / scale;

      return {
        height: Math.abs(py - originY),
        originX,
        originY,
        width: Math.abs(px - originX),
        x: Math.min(px, originX),
        y: Math.min(py, originY)
      };
    }

    function onMove(moveEvent: MouseEvent) {
      moveEvent.preventDefault();
      setMarquee(boxAt(moveEvent.clientX, moveEvent.clientY));
    }

    function onUp(upEvent: MouseEvent) {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const box = boxAt(upEvent.clientX, upEvent.clientY);
      setMarquee(null);

      if (box.width < 6 && box.height < 6) {
        clearSelection();
        return;
      }

      setSelectedIds(
        marqueeNodes
          .filter((node) => !node.hidden && intersects(box, { height: node.height, width: node.width, x: node.x, y: node.y }))
          .map((node) => node.id)
      );
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
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
      visibleNodes
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
    let x = Math.round(nextX);
    let y = Math.round(nextY);
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
      x = Math.round(xSnap.source - xSnap.offset);
      guides.push({ axis: "x", position: xSnap.source });
    }

    if (ySnap) {
      y = Math.round(ySnap.source - ySnap.offset);
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
    fitViewportToSize(canvasSizes[device], device);
  }

  function fitViewportToSize(size: CanvasSize, device: DeviceMode) {
    const canvas = canvasRef.current;

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
    const nextValue = clampCanvasSize(value, activeCanvasSize[axis], axis);

    setCanvasSizes((current) => ({
      ...current,
      [deviceMode]: {
        ...current[deviceMode],
        [axis]: nextValue
      }
    }));
  }

  function applyFramePreset(preset: FramePreset) {
    const nextSize = {
      height: clampCanvasSize(preset.height, preset.height, "height"),
      width: clampCanvasSize(preset.width, preset.width, "width")
    };

    setDeviceMode(preset.device);
    setCanvasSizes((current) => ({
      ...current,
      [preset.device]: nextSize
    }));
    fitViewportToSize(nextSize, preset.device);
  }

  function swapCanvasOrientation() {
    const nextSize = {
      height: clampCanvasSize(activeCanvasSize.width, activeCanvasSize.width, "height"),
      width: clampCanvasSize(activeCanvasSize.height, activeCanvasSize.height, "width")
    };

    setCanvasSizes((current) => ({
      ...current,
      [deviceMode]: nextSize
    }));
    fitViewportToSize(nextSize, deviceMode);
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
          siteNodes,
          siteName
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

  function openPreviewWindow() {
    const project: EditorProject = {
      canvasSizes,
      pages: pagesForSave,
      selectedIds,
      selectedPageId,
      siteNodes,
      siteName
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    window.open("/preview", "_blank", "noopener,noreferrer");
  }

  return (
    <section
      className={`${panelResize ? "freeformShell resizingPanels" : "freeformShell"}${frameResize ? " resizingFrame" : ""}`}
      style={{ gridTemplateColumns: `64px ${leftPanelWidth}px minmax(520px, 1fr) ${rightPanelWidth}px` }}
    >
      <aside className="ffToolRail" aria-label="Tools">
        <div className="ffRailBrand">W</div>
        <div className="ffRailSections" aria-label="Panel sections">
          <button className={leftPanelMode === "file" ? "ffRailTab active" : "ffRailTab"} onClick={() => setLeftPanelMode("file")} type="button">
            <FileText size={17} />
            <span>파일</span>
          </button>
          <button className={leftPanelMode === "ai" ? "ffRailTab active" : "ffRailTab"} onClick={() => setLeftPanelMode("ai")} type="button">
            <Sparkles size={17} />
            <span>AI</span>
          </button>
          <button className={leftPanelMode === "assets" ? "ffRailTab active" : "ffRailTab"} onClick={() => setLeftPanelMode("assets")} type="button">
            <LayoutGrid size={17} />
            <span>에셋</span>
          </button>
        </div>
      </aside>
      <aside className="ffPanel ffLayers" aria-label="Layers">
        <div className="ffPanelResizeHandle right" onMouseDown={(event) => startPanelResize("left", event)} role="separator" aria-orientation="vertical" aria-label="Resize layers panel" />
        {leftPanelMode === "file" ? (
          <div className="ffFileHeader">
            {editingSiteName ? (
              <input
                autoFocus
                className="ffFileNameInput"
                onBlur={commitSiteRename}
                onChange={(event) => setSiteNameDraft(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitSiteRename();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setEditingSiteName(false);
                  }
                }}
                value={siteNameDraft}
              />
            ) : (
              <button className="ffFileName" onClick={() => setFileMenuOpen((open) => !open)} type="button">
                <strong>{siteName}</strong>
                <ChevronDown size={14} />
              </button>
            )}
            <div className="ffFileBadges">
              <em className={publishedUrl ? "published" : ""}>{publishedUrl ? "게시됨" : "초안"}</em>
              <span>{saveState}</span>
            </div>
            {fileMenuOpen ? (
              <>
                <div className="ffMenuBackdrop" onClick={() => setFileMenuOpen(false)} />
                <div className="ffFileMenu" role="menu">
                  <button onClick={startSiteRename} type="button">이름 변경</button>
                  <button onClick={exportProject} type="button">
                    JSON 내보내기
                    <Download size={14} />
                  </button>
                  <button
                    disabled={!publishedUrl}
                    onClick={() => {
                      window.open(publishedUrl, "_blank");
                      setFileMenuOpen(false);
                    }}
                    type="button"
                  >
                    게시된 사이트 열기
                    <ExternalLink size={14} />
                  </button>
                  <span className="ffFileMenuDivider" />
                  <button
                    className="danger"
                    onClick={() => {
                      resetDocument();
                      setFileMenuOpen(false);
                    }}
                    type="button"
                  >
                    문서 초기화
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="ffPanelHeader">
            {leftPanelMode === "ai" ? <Sparkles size={17} /> : <LayoutGrid size={17} />}
            <div>
              <strong>{leftPanelMode === "ai" ? "AI" : "에셋"}</strong>
              <span>{leftPanelMode === "ai" ? "사이트 초안 생성" : `${filteredTemplates.length} widgets`}</span>
            </div>
          </div>
        )}
        {leftPanelMode === "file" ? (
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
        ) : null}
        {leftPanelMode === "file" ? (
          <div className="ffPages">
            <div className="ffPagesHeader">
              <span>페이지</span>
              <button onClick={addPage} title="페이지 추가" type="button">
                <Plus size={14} />
              </button>
            </div>
            <div className="ffPageSearch">
              <Search size={13} />
              <input aria-label="페이지 검색" placeholder="페이지 검색" value={pageSearch} onChange={(event) => setPageSearch(event.target.value)} />
            </div>
            <div className="ffPageList">
              {filteredPages.map((page) => (
                <div className={page.id === selectedPageId ? "ffPageRow active" : "ffPageRow"} key={page.id}>
                  <button className="ffPageSelect" onClick={() => switchPage(page.id)} type="button">
                    <FileText size={14} />
                    <span>{page.name}</span>
                    <em>{page.path}</em>
                  </button>
                  {page.id === selectedPageId ? (
                    <button className="ffPageIcon" onClick={duplicatePage} title="페이지 복제" type="button">
                      <Copy size={13} />
                    </button>
                  ) : null}
                  {pagesForSave.length > 1 ? (
                    <button className="ffPageIcon" onClick={() => deletePage(page.id)} title="페이지 삭제" type="button">
                      <Trash2 size={13} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
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
                <button className="ffWidgetCard" key={block.key} onClick={() => addBlock(block)} type="button">
                  <WidgetPreview type={block.type} variant={block.preview} />
                  <span>
                    {block.icon}
                    <strong>{block.label}</strong>
                  </span>
                  <em>{block.description}</em>
                </button>
              ))}
            </div>
            <button className="ffUploadButton" onClick={() => imageInputRef.current?.click()} type="button">
              <Upload size={15} />
              Upload image
            </button>
          </div>
        ) : leftPanelMode === "ai" ? (
          <div className="ffAiPanel">
            <p className="ffAiHint">브리프를 입력하면 초안을 제안합니다. 승인 전에는 캔버스에 반영되지 않습니다.</p>
            <textarea
              className="ffAiBrief"
              onChange={(event) => setAiBrief(event.target.value)}
              placeholder="예: 강남의 프리미엄 꽃 정기구독 브랜드 사이트"
              value={aiBrief}
            />
            <button className="ffAiGenerate" disabled={aiState === "loading" || !aiBrief.trim()} onClick={generateAiDraft} type="button">
              <Sparkles size={15} />
              {aiState === "loading" ? "생성 중..." : "초안 생성"}
            </button>
            {aiMessage ? <p className={aiState === "error" ? "ffAiMessage error" : "ffAiMessage"}>{aiMessage}</p> : null}
            {aiProposal ? (
              <div className="ffAiProposal">
                <header>
                  <strong>{aiProposal.outputDiff.siteSpec.site.name}</strong>
                  <em>승인 대기</em>
                </header>
                <ul>
                  {aiProposal.outputDiff.siteSpec.pages[0]?.sections.map((section) => (
                    <li key={section.id}>
                      <span>{section.type}</span>
                      <strong>{section.props.title}</strong>
                    </li>
                  ))}
                </ul>
                <div className="ffAiMeta">예상 비용 ${aiProposal.cost}</div>
                <div className="ffAiActions">
                  <button className="primary" onClick={applyAiProposal} type="button">
                    캔버스에 적용
                  </button>
                  <button
                    onClick={() => {
                      setAiProposal(null);
                      setAiState("idle");
                    }}
                    type="button"
                  >
                    거절
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <>
          <div className="ffSectionHeader">
            <span>레이어</span>
            <em>{visibleNodes.length}</em>
          </div>
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
          </>
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
          <a className="ffAdminLink" href="/admin">관리</a>
          <button className="ffPublishButton" disabled={publishState === "publishing"} onClick={publishSite} type="button">
            {publishState === "published" ? <CheckCircle2 size={15} /> : <Rocket size={15} />}
            {publishState === "publishing" ? "Publishing" : "Publish"}
          </button>
        </div>
        <div
          className={`${canvasMode === "code" ? "ffCanvas code" : "ffCanvas"}${frameDrag ? " panning" : isSpaceDown || activeTool === "hand" ? " spacePan" : activeTool === "zoom" ? " zoomTool" : ""}`}
          ref={canvasRef}
          onContextMenu={(event) => openContextMenu(event)}
          onMouseDown={(event) => {
            if (canvasMode !== "design" || event.currentTarget !== event.target) {
              return;
            }

            if (activeTool === "zoom" && event.button === 0) {
              zoomViewportAtPoint(getSteppedZoom(viewportRef.current.scale, event.altKey ? -1 : 1), event.clientX, event.clientY);
              return;
            }

            if (isSpaceDown || activeTool === "hand" || event.button === 1) {
              startFrameDrag(event);
            } else {
              if (editingImageId) {
                setEditingImageId(null);
                setImageCropDrag(null);
              }
              clearSelection();
              setMarquee(null);
            }
          }}
        >
          {canvasMode === "code" ? (
            <CodeWorkspace
              canvasSize={activeCanvasSize}
              index={codeIndex}
              message={codeIndexMessage}
              nodes={visibleNodes}
              onApplyCode={applyCodeToCanvas}
              onReload={loadCodeIndex}
              page={activePage}
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
          {canvasMode === "design" ? (
            <div
              className={frameResize ? "ffFrameResizeOverlay resizing" : "ffFrameResizeOverlay"}
              style={{
                height: activeCanvasSize.height * zoom,
                width: activeCanvasSize.width * zoom
              }}
            >
              {(["top", "right", "bottom", "left", "topLeft", "topRight", "bottomLeft", "bottomRight"] as FrameResizeHandle[]).map((handle) => (
                <button
                  aria-label={`Resize frame ${handle}`}
                  className={`ffFrameResizeHandle ${handle}`}
                  key={handle}
                  onMouseDown={(event) => startFrameResize(handle, event)}
                  style={{ transform: `scale(${1 / zoom})` }}
                  type="button"
                />
              ))}
              <span style={{ transform: `translateX(-50%) scale(${1 / zoom})` }}>
                {activeCanvasSize.width} × {activeCanvasSize.height}
              </span>
            </div>
          ) : null}
          <div
            className={`ffArtboard ${deviceMode}${frameDrag ? " draggingFrame" : ""}`}
            ref={artboardRef}
            onContextMenu={(event) => openContextMenu(event)}
            onMouseDown={handleArtboardMouseDown}
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
            {visibleNodes.map((node) =>
                  node.hidden ? null : (
                <Rnd
                  bounds="parent"
                  className={`${selectedIds.includes(node.id) ? "ffNode selected" : "ffNode"}${editingImageId === node.id ? " imageEditing" : ""}${activeResizeId === node.id ? " resizing" : ""}`}
                  disableDragging={node.locked || editingNodeId === node.id || editingImageId === node.id}
                  dragGrid={[1, 1]}
                  enableResizing={Boolean(!node.locked && editingImageId !== node.id && selectedIds.length === 1 && selectedNode && node.id === selectedNode.id)}
                  key={node.id}
                  lockAspectRatio={isShiftDown && selectedIds.length === 1 && selectedNode?.id === node.id}
                  maxHeight={activeCanvasSize.height}
                  maxWidth={activeCanvasSize.width}
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    selectNode(node.id, event.shiftKey);
                  }}
                  onContextMenu={(event: React.MouseEvent) => openContextMenu(event, node)}
                  onDrag={(_, data) => previewNodeSnap(node, data.x, data.y)}
                  onDragStop={(_, data) => moveNodeSelection(node, data.x, data.y)}
                  minHeight={getNodeMinSize(node).height}
                  minWidth={getNodeMinSize(node).width}
                  onResizeStart={() => startNodeResize(node)}
                  onResize={(event, __, ref, ___, position) => resizeNodeLive(node, event, ref, position)}
                  onResizeStop={(event, __, ref, ___, position) => stopNodeResize(node, event, ref, position)}
                  position={{ x: node.x, y: node.y }}
                  resizeGrid={[1, 1]}
                  scale={zoom}
                  resizeHandleStyles={{
                    bottom: { ...edgeHandleStyle, bottom: -5, height: 10 },
                    bottomLeft: { ...handleStyle, bottom: -6, left: -6 },
                    bottomRight: { ...handleStyle, bottom: -6, right: -6 },
                    left: { ...edgeHandleStyle, left: -5, width: 10 },
                    right: { ...edgeHandleStyle, right: -5, width: 10 },
                    top: { ...edgeHandleStyle, height: 10, top: -5 },
                    topLeft: { ...handleStyle, left: -6, top: -6 },
                    topRight: { ...handleStyle, right: -6, top: -6 }
                  }}
                  size={{ width: node.width, height: node.height }}
                  style={{ zIndex: selectedIds.includes(node.id) ? 10002 + node.zIndex : node.zIndex }}
                >
                  <RenderNode
                    isEditing={editingNodeId === node.id}
                    isImageEditing={editingImageId === node.id}
                    node={node}
                    onImageCropDrag={(mode, event, baseSize) => startImageCropDrag(node, mode, event, baseSize)}
                    onStartImageEditing={(event) => startImageCropEdit(node, event)}
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
          {canvasMode !== "code" ? (
            <div
              className="ffBottomBar"
              role="toolbar"
              aria-label="캔버스 도구"
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="ffToolGroup">
                <button
                  className={activeTool === "select" ? "ffToolBtn active" : "ffToolBtn"}
                  onClick={() => {
                    setActiveTool("select");
                    setToolMenu(null);
                  }}
                  title="이동 (V)"
                  type="button"
                >
                  <MousePointer2 size={18} />
                </button>
                <button className="ffToolCaret" onClick={() => setToolMenu(toolMenu === "cursor" ? null : "cursor")} title="커서 도구" type="button">
                  <ChevronDown size={12} />
                </button>
                {toolMenu === "cursor" ? (
                  <div className="ffToolMenu">
                    <button className={activeTool === "select" ? "active" : ""} onClick={() => { setActiveTool("select"); setToolMenu(null); }} type="button">
                      <MousePointer2 size={15} />
                      <span>이동</span>
                      <em>V</em>
                    </button>
                    <button className={activeTool === "hand" ? "active" : ""} onClick={() => { setActiveTool("hand"); setToolMenu(null); }} type="button">
                      <Hand size={15} />
                      <span>손 도구</span>
                      <em>H</em>
                    </button>
                    <button className={activeTool === "zoom" ? "active" : ""} onClick={() => { setActiveTool("zoom"); setToolMenu(null); }} type="button">
                      <ZoomIn size={15} />
                      <span>확대/축소</span>
                      <em>K</em>
                    </button>
                  </div>
                ) : null}
              </div>
              <span className="ffToolSep" />
              <div className="ffToolGroup">
                <button className="ffToolBtn" onClick={() => addNode("container")} title="프레임 (F)" type="button">
                  <Square size={18} />
                </button>
                <button className="ffToolCaret" onClick={() => setToolMenu(toolMenu === "frame" ? null : "frame")} title="프레임 옵션" type="button">
                  <ChevronDown size={12} />
                </button>
                {toolMenu === "frame" ? (
                  <div className="ffToolMenu">
                    <button onClick={() => { addNode("container"); setToolMenu(null); }} type="button">
                      <Square size={15} />
                      <span>프레임</span>
                      <em>F</em>
                    </button>
                    <button onClick={() => { addShape("section"); setToolMenu(null); }} type="button">
                      <LayoutTemplate size={15} />
                      <span>섹션</span>
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="ffToolGroup">
                <button className="ffToolBtn" onClick={() => addShape("rectangle")} title="사각형 (R)" type="button">
                  <Square size={18} />
                </button>
                <button className="ffToolCaret" onClick={() => setToolMenu(toolMenu === "shape" ? null : "shape")} title="도형" type="button">
                  <ChevronDown size={12} />
                </button>
                {toolMenu === "shape" ? (
                  <div className="ffToolMenu">
                    <button onClick={() => { addShape("rectangle"); setToolMenu(null); }} type="button">
                      <Square size={15} />
                      <span>사각형</span>
                      <em>R</em>
                    </button>
                    <button onClick={() => { addShape("ellipse"); setToolMenu(null); }} type="button">
                      <Circle size={15} />
                      <span>타원</span>
                      <em>O</em>
                    </button>
                    <button onClick={() => { addShape("line"); setToolMenu(null); }} type="button">
                      <Minus size={15} />
                      <span>선</span>
                      <em>L</em>
                    </button>
                  </div>
                ) : null}
              </div>
              <button className="ffToolBtn" onClick={() => addNode("text")} title="텍스트 (T)" type="button">
                <Type size={18} />
              </button>
              <div className="ffToolGroup">
                <button className="ffToolBtn" onClick={() => addNode("image")} title="이미지" type="button">
                  <ImageIcon size={18} />
                </button>
                <button className="ffToolCaret" onClick={() => setToolMenu(toolMenu === "image" ? null : "image")} title="이미지 옵션" type="button">
                  <ChevronDown size={12} />
                </button>
                {toolMenu === "image" ? (
                  <div className="ffToolMenu">
                    <button onClick={() => { addNode("image"); setToolMenu(null); }} type="button">
                      <ImageIcon size={15} />
                      <span>이미지 추가</span>
                    </button>
                    <button onClick={() => { imageInputRef.current?.click(); setToolMenu(null); }} type="button">
                      <Upload size={15} />
                      <span>업로드</span>
                    </button>
                  </div>
                ) : null}
              </div>
              <span className="ffToolSep" />
              <div className="ffToolGroup">
                <button className={toolMenu === "widgets" ? "ffToolBtn active" : "ffToolBtn"} onClick={() => setToolMenu(toolMenu === "widgets" ? null : "widgets")} title="위젯 추가" type="button">
                  <Plus size={18} />
                </button>
                {toolMenu === "widgets" ? (
                  <div className="ffToolMenu wide">
                    {blockTemplates.map((widget) => (
                      <button key={widget.key} onClick={() => { addNode(widget.type); setToolMenu(null); }} type="button">
                        {widget.icon}
                        <span>{widget.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="ffPanel ffInspector" aria-label="Inspector">
        <div className="ffPanelResizeHandle left" onMouseDown={(event) => startPanelResize("right", event)} role="separator" aria-orientation="vertical" aria-label="Resize inspector panel" />
        <div className="ffInspectorTabs" aria-label="Inspector mode">
          <div>
            <button className={inspectorMode === "design" ? "active" : ""} onClick={() => setInspectorMode("design")} type="button">디자인</button>
            <button className={inspectorMode === "interaction" ? "active" : ""} onClick={() => setInspectorMode("interaction")} type="button">인터렉션</button>
          </div>
          <button className="ffInspectorPreviewButton" onClick={openPreviewWindow} title="새 창에서 미리보기" type="button">
            <Play size={13} />
            프리뷰
          </button>
        </div>
        <div className="ffInspectorObjectBar">
          <button className="ffInspectorObjectName" type="button">
            <span>{selectedNode ? getInspectorTypeLabel(selectedNode.type) : selectedNodes.length > 1 ? "선택" : "프레임"}</span>
            <ChevronDown size={16} />
          </button>
          <div className="ffInspectorObjectTools" aria-label="Object tools">
            <button title="Resources" type="button"><GalleryHorizontal size={18} /></button>
            <button title="Boolean" type="button"><Group size={18} /></button>
            <button title="Combine" type="button"><Copy size={18} /></button>
            <button title="More" type="button"><ChevronDown size={16} /></button>
          </div>
        </div>
        {inspectorMode === "interaction" ? (
          selectedNode ? (
            <div className="ffInteractionPanel">
              <div className="ffInteractionHero">
                <span>{getInspectorTypeLabel(selectedNode.type)} 인터렉션</span>
                <strong>{getAssetInteractionProfile(selectedNode.type).title}</strong>
                <p>{getAssetInteractionProfile(selectedNode.type).description}</p>
                <em>{(selectedNode.interactions ?? []).length}개 연결됨 · 프리뷰/게시 동일 실행</em>
              </div>
              <div className="ffInteractionPresets">
                {getAssetInteractionPresets(selectedNode.type).map((preset) => (
                  <button key={preset.key} onClick={() => addInteraction(selectedNode.id, preset.key)} type="button">
                    <small>{preset.tag}</small>
                    <span>{preset.label}</span>
                    <em>{preset.description}</em>
                  </button>
                ))}
              </div>
              {(selectedNode.interactions ?? []).length === 0 ? (
                <div className="ffInteractionEmpty">
                  <Sparkles size={16} />
                  <span>아직 인터렉션이 없습니다. 위 프리셋으로 시작해보세요.</span>
                </div>
              ) : null}
              {(selectedNode.interactions ?? []).map((interaction) => {
                const action = interaction.actions[0];

                return (
                  <div className="ffInteractionCard" key={interaction.id}>
                    <header>
                      <div className="ffInteractionCardTitle">
                        <strong>{getTriggerLabel(interaction.trigger.type)}</strong>
                        <span>{interaction.actions.map((item) => getActionLabel(item.type)).join(" → ")}</span>
                      </div>
                      <select onChange={(event) => setInteractionTriggerType(selectedNode.id, interaction, event.target.value)} value={interaction.trigger.type}>
                        <option value="click">클릭 시</option>
                        <option value="doubleClick">더블클릭 시</option>
                        <option value="hover">호버 시</option>
                        <option value="focusWithin">입력 포커스 시</option>
                        <option value="inputChange">입력 변경 시</option>
                        <option value="formSubmit">폼 제출 시</option>
                        <option value="mouseDown">누를 때</option>
                        <option value="mouseUp">뗄 때</option>
                        <option value="viewEnter">화면에 나타날 때</option>
                        <option value="pageLoad">페이지 로드 시</option>
                      </select>
                      <button onClick={() => removeInteraction(selectedNode.id, interaction.id)} title="삭제" type="button">
                        <Trash2 size={13} />
                      </button>
                    </header>
                    <div className="ffInteractionCondition">
                      <label className="ffInteractionRow">
                        <span>조건</span>
                        <select onChange={(event) => setInteractionConditionType(selectedNode.id, interaction, event.target.value)} value={interaction.condition?.type || "always"}>
                          <option value="always">항상 실행</option>
                          <option value="visible">대상이 보일 때</option>
                          <option value="hidden">대상이 숨김일 때</option>
                          <option value="stateEquals">상태가 같을 때</option>
                          <option value="classPresent">클래스가 있을 때</option>
                        </select>
                      </label>
                      {interaction.condition && interaction.condition.type !== "always" ? (
                        <>
                          <label className="ffInteractionRow">
                            <span>대상</span>
                            <select onChange={(event) => patchInteractionCondition(selectedNode.id, interaction, { target: event.target.value } as Partial<InteractionCondition>)} value={"target" in interaction.condition ? interaction.condition.target || "" : ""}>
                              <option value="">현재 요소</option>
                              {canvasNodes
                                .filter((node) => node.id !== selectedNode.id)
                                .map((node) => (
                                  <option key={node.id} value={node.id}>
                                    {getLayerLabel(node)}
                                  </option>
                                ))}
                            </select>
                          </label>
                          {interaction.condition.type === "stateEquals" ? (
                            <label className="ffInteractionRow">
                              <span>상태</span>
                              <input onChange={(event) => patchInteractionCondition(selectedNode.id, interaction, { state: event.target.value })} value={interaction.condition.state} />
                            </label>
                          ) : null}
                          {interaction.condition.type === "classPresent" ? (
                            <label className="ffInteractionRow">
                              <span>클래스</span>
                              <input onChange={(event) => patchInteractionCondition(selectedNode.id, interaction, { className: event.target.value })} value={interaction.condition.className} />
                            </label>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                    {action ? (
                      <div className="ffInteractionBody">
                        <label className="ffInteractionRow">
                          <span>액션</span>
                          <select onChange={(event) => setInteractionActionTypeAt(selectedNode.id, interaction, 0, event.target.value)} value={action.type}>
                            <option value="navigate">이동</option>
                            <option value="animate">애니메이션</option>
                            <option value="hoverStyle">호버 스타일</option>
                            <option value="toggleVisibility">표시/숨김 전환</option>
                            <option value="scrollTo">스크롤 이동</option>
                            <option value="setStyle">스타일 변경</option>
                            <option value="setState">상태 변경</option>
                            <option value="setClass">클래스 변경</option>
                            <option value="delay">딜레이</option>
                          </select>
                        </label>
                        {action.type === "navigate" ? (
                          <>
                            <label className="ffInteractionRow">
                              <span>대상</span>
                              <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { kind: event.target.value as "anchor" | "email" | "page" | "url", target: "" })} value={action.kind}>
                                <option value="page">내 페이지</option>
                                <option value="url">외부 URL</option>
                                <option value="anchor">섹션으로 스크롤</option>
                                <option value="email">이메일</option>
                              </select>
                            </label>
                            {action.kind === "page" ? (
                              <label className="ffInteractionRow">
                                <span>페이지</span>
                                <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value })} value={action.target}>
                                  {pagesForSave.map((page) => (
                                    <option key={page.id} value={page.id}>
                                      {page.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : action.kind === "anchor" ? (
                              <label className="ffInteractionRow">
                                <span>섹션</span>
                                <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value })} value={action.target}>
                                  <option value="">선택...</option>
                                  {nodes
                                    .filter((node) => node.id !== selectedNode.id)
                                    .map((node) => (
                                      <option key={node.id} value={node.id}>
                                        {getLayerLabel(node)}
                                      </option>
                                    ))}
                                </select>
                              </label>
                            ) : (
                              <label className="ffInteractionRow">
                                <span>{action.kind === "email" ? "주소" : "URL"}</span>
                                <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value })} placeholder={action.kind === "email" ? "hello@brand.com" : "https://..."} value={action.target} />
                              </label>
                            )}
                            {action.kind === "url" ? (
                              <label className="ffInteractionCheck">
                                <input checked={Boolean(action.newTab)} onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { newTab: event.target.checked })} type="checkbox" />
                                <span>새 탭에서 열기</span>
                              </label>
                            ) : null}
                          </>
                        ) : null}
                        {action.type === "animate" ? (
                          <>
                            <label className="ffInteractionRow">
                              <span>효과</span>
                              <select onChange={(event) => patchAnimationSpecAt(selectedNode.id, interaction, 0, { effect: event.target.value as AnimationSpec["effect"] })} value={action.spec.effect}>
                                <option value="fadeUp">페이드업</option>
                                <option value="fadeIn">페이드인</option>
                                <option value="slideLeft">슬라이드 ←</option>
                                <option value="slideRight">슬라이드 →</option>
                                <option value="zoomIn">줌인</option>
                              </select>
                            </label>
                            <div className="ffInteractionSplit">
                              <label className="ffInteractionRow">
                                <span>시간(ms)</span>
                                <input onChange={(event) => patchAnimationSpecAt(selectedNode.id, interaction, 0, { duration: Number(event.target.value) || 0 })} type="number" value={action.spec.duration} />
                              </label>
                              <label className="ffInteractionRow">
                                <span>딜레이</span>
                                <input onChange={(event) => patchAnimationSpecAt(selectedNode.id, interaction, 0, { delay: Number(event.target.value) || 0 })} type="number" value={action.spec.delay} />
                              </label>
                            </div>
                            <label className="ffInteractionRow">
                              <span>이징</span>
                              <select onChange={(event) => patchAnimationSpecAt(selectedNode.id, interaction, 0, { easing: event.target.value as AnimationSpec["easing"] })} value={action.spec.easing}>
                                <option value="ease">부드럽게</option>
                                <option value="spring">탄성</option>
                                <option value="linear">일정하게</option>
                              </select>
                            </label>
                          </>
                        ) : null}
                        {action.type === "hoverStyle" ? (
                          <label className="ffInteractionRow">
                            <span>프리셋</span>
                            <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { preset: event.target.value as "glow" | "lift" | "none" | "scale" })} value={action.preset}>
                              <option value="lift">떠오름</option>
                              <option value="scale">확대</option>
                              <option value="glow">글로우</option>
                            </select>
                          </label>
                        ) : null}
                        {action.type === "toggleVisibility" ? (
                          <label className="ffInteractionRow">
                            <span>대상</span>
                            <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value })} value={action.target}>
                              <option value="">선택...</option>
                              {nodes
                                .filter((node) => node.id !== selectedNode.id)
                                .map((node) => (
                                  <option key={node.id} value={node.id}>
                                    {getLayerLabel(node)}
                                  </option>
                                ))}
                            </select>
                          </label>
                        ) : null}
                        {action.type === "scrollTo" ? (
                          <label className="ffInteractionRow">
                            <span>대상</span>
                            <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value })} value={action.target}>
                              <option value="">선택...</option>
                              {canvasNodes
                                .filter((node) => node.id !== selectedNode.id)
                                .map((node) => (
                                  <option key={node.id} value={node.id}>
                                    {getLayerLabel(node)}
                                  </option>
                                ))}
                            </select>
                          </label>
                        ) : null}
                        {action.type === "delay" ? (
                          <label className="ffInteractionRow">
                            <span>시간(ms)</span>
                            <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { duration: Number(event.target.value) || 0 })} type="number" value={action.duration ?? 0} />
                          </label>
                        ) : null}
                        {action.type === "setStyle" ? (
                          <>
                            <label className="ffInteractionRow">
                              <span>대상</span>
                              <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value } as Partial<InteractionAction>)} value={action.target || ""}>
                                <option value="">현재 요소</option>
                                {canvasNodes
                                  .filter((node) => node.id !== selectedNode.id)
                                  .map((node) => (
                                    <option key={node.id} value={node.id}>
                                      {getLayerLabel(node)}
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <label className="ffInteractionRow">
                              <span>투명도</span>
                              <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { style: { ...action.style, opacity: event.target.value } })} value={String(action.style.opacity ?? "")} />
                            </label>
                          </>
                        ) : null}
                        {action.type === "setState" ? (
                          <>
                            <label className="ffInteractionRow">
                              <span>대상</span>
                              <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value } as Partial<InteractionAction>)} value={action.target || ""}>
                                <option value="">현재 요소</option>
                                {canvasNodes
                                  .filter((node) => node.id !== selectedNode.id)
                                  .map((node) => (
                                    <option key={node.id} value={node.id}>
                                      {getLayerLabel(node)}
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <label className="ffInteractionRow">
                              <span>상태</span>
                              <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { state: event.target.value })} value={action.state} />
                            </label>
                            <label className="ffInteractionRow">
                              <span>모드</span>
                              <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { mode: event.target.value as "clear" | "set" | "toggle" })} value={action.mode || "set"}>
                                <option value="set">설정</option>
                                <option value="toggle">토글</option>
                                <option value="clear">해제</option>
                              </select>
                            </label>
                          </>
                        ) : null}
                        {action.type === "setClass" ? (
                          <>
                            <label className="ffInteractionRow">
                              <span>대상</span>
                              <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { target: event.target.value } as Partial<InteractionAction>)} value={action.target || ""}>
                                <option value="">현재 요소</option>
                                {canvasNodes
                                  .filter((node) => node.id !== selectedNode.id)
                                  .map((node) => (
                                    <option key={node.id} value={node.id}>
                                      {getLayerLabel(node)}
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <label className="ffInteractionRow">
                              <span>클래스</span>
                              <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, 0, { className: event.target.value })} value={action.className} />
                            </label>
                          </>
                        ) : null}
                        {interaction.actions.slice(1).map((chainAction, chainOffset) => {
                          const actionIndex = chainOffset + 1;

                          return (
                            <div className="ffInteractionChainItem" key={`${interaction.id}-${actionIndex}`}>
                              <div className="ffInteractionActionHeader">
                                <span>액션 {actionIndex + 1}</span>
                                <button onClick={() => removeInteractionAction(selectedNode.id, interaction, actionIndex)} title="액션 삭제" type="button">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <label className="ffInteractionRow">
                                <span>유형</span>
                                <select onChange={(event) => setInteractionActionTypeAt(selectedNode.id, interaction, actionIndex, event.target.value)} value={chainAction.type}>
                                  <option value="delay">딜레이</option>
                                  <option value="animate">애니메이션</option>
                                  <option value="toggleVisibility">표시/숨김</option>
                                  <option value="scrollTo">스크롤 이동</option>
                                  <option value="setStyle">스타일 변경</option>
                                  <option value="setState">상태 변경</option>
                                  <option value="setClass">클래스 변경</option>
                                  <option value="navigate">이동</option>
                                </select>
                              </label>
                              {chainAction.type === "delay" ? (
                                <label className="ffInteractionRow">
                                  <span>시간(ms)</span>
                                  <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { duration: Number(event.target.value) || 0 })} type="number" value={chainAction.duration ?? 0} />
                                </label>
                              ) : null}
                              {chainAction.type === "animate" ? (
                                <>
                                  <label className="ffInteractionRow">
                                    <span>효과</span>
                                    <select onChange={(event) => patchAnimationSpecAt(selectedNode.id, interaction, actionIndex, { effect: event.target.value as AnimationSpec["effect"] })} value={chainAction.spec.effect}>
                                      <option value="fadeUp">페이드업</option>
                                      <option value="fadeIn">페이드인</option>
                                      <option value="slideLeft">슬라이드 ←</option>
                                      <option value="slideRight">슬라이드 →</option>
                                      <option value="zoomIn">줌인</option>
                                    </select>
                                  </label>
                                  <div className="ffInteractionSplit">
                                    <label className="ffInteractionRow">
                                      <span>시간</span>
                                      <input onChange={(event) => patchAnimationSpecAt(selectedNode.id, interaction, actionIndex, { duration: Number(event.target.value) || 0 })} type="number" value={chainAction.spec.duration} />
                                    </label>
                                    <label className="ffInteractionRow">
                                      <span>딜레이</span>
                                      <input onChange={(event) => patchAnimationSpecAt(selectedNode.id, interaction, actionIndex, { delay: Number(event.target.value) || 0 })} type="number" value={chainAction.spec.delay} />
                                    </label>
                                  </div>
                                </>
                              ) : null}
                              {chainAction.type === "toggleVisibility" || chainAction.type === "scrollTo" ? (
                                <label className="ffInteractionRow">
                                  <span>대상</span>
                                  <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { target: event.target.value })} value={chainAction.target}>
                                    <option value="">선택...</option>
                                    {canvasNodes
                                      .filter((node) => node.id !== selectedNode.id)
                                      .map((node) => (
                                        <option key={node.id} value={node.id}>
                                          {getLayerLabel(node)}
                                        </option>
                                      ))}
                                  </select>
                                </label>
                              ) : null}
                              {chainAction.type === "setStyle" ? (
                                <>
                                  <label className="ffInteractionRow">
                                    <span>대상</span>
                                    <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { target: event.target.value } as Partial<InteractionAction>)} value={chainAction.target || ""}>
                                      <option value="">현재 요소</option>
                                      {canvasNodes
                                        .filter((node) => node.id !== selectedNode.id)
                                        .map((node) => (
                                          <option key={node.id} value={node.id}>
                                            {getLayerLabel(node)}
                                          </option>
                                        ))}
                                    </select>
                                  </label>
                                  <label className="ffInteractionRow">
                                    <span>투명도</span>
                                    <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { style: { ...chainAction.style, opacity: event.target.value } })} value={String(chainAction.style.opacity ?? "")} />
                                  </label>
                                </>
                              ) : null}
                              {chainAction.type === "setState" ? (
                                <>
                                  <label className="ffInteractionRow">
                                    <span>대상</span>
                                    <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { target: event.target.value } as Partial<InteractionAction>)} value={chainAction.target || ""}>
                                      <option value="">현재 요소</option>
                                      {canvasNodes
                                        .filter((node) => node.id !== selectedNode.id)
                                        .map((node) => (
                                          <option key={node.id} value={node.id}>
                                            {getLayerLabel(node)}
                                          </option>
                                        ))}
                                    </select>
                                  </label>
                                  <label className="ffInteractionRow">
                                    <span>상태</span>
                                    <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { state: event.target.value })} value={chainAction.state} />
                                  </label>
                                  <label className="ffInteractionRow">
                                    <span>모드</span>
                                    <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { mode: event.target.value as "clear" | "set" | "toggle" })} value={chainAction.mode || "set"}>
                                      <option value="set">설정</option>
                                      <option value="toggle">토글</option>
                                      <option value="clear">해제</option>
                                    </select>
                                  </label>
                                </>
                              ) : null}
                              {chainAction.type === "setClass" ? (
                                <>
                                  <label className="ffInteractionRow">
                                    <span>대상</span>
                                    <select onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { target: event.target.value } as Partial<InteractionAction>)} value={chainAction.target || ""}>
                                      <option value="">현재 요소</option>
                                      {canvasNodes
                                        .filter((node) => node.id !== selectedNode.id)
                                        .map((node) => (
                                          <option key={node.id} value={node.id}>
                                            {getLayerLabel(node)}
                                          </option>
                                        ))}
                                    </select>
                                  </label>
                                  <label className="ffInteractionRow">
                                    <span>클래스</span>
                                    <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { className: event.target.value })} value={chainAction.className} />
                                  </label>
                                </>
                              ) : null}
                              {chainAction.type === "navigate" ? (
                                <label className="ffInteractionRow">
                                  <span>URL</span>
                                  <input onChange={(event) => patchInteractionActionAt(selectedNode.id, interaction, actionIndex, { kind: "url", target: event.target.value })} value={chainAction.target} />
                                </label>
                              ) : null}
                            </div>
                          );
                        })}
                        <button className="ffInteractionAddAction" onClick={() => addInteractionAction(selectedNode.id, interaction)} type="button">
                          <Plus size={13} />
                          액션 체인 추가
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ffEmptyInspector">
              <MousePointer2 size={18} />
              <strong>No selection</strong>
              <span>노드를 선택하면 인터렉션을 추가할 수 있습니다.</span>
            </div>
          )
        ) : selectedNodes.length > 1 && selectionBounds ? (
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
          <div className="ffFigmaInspector">
            <InspectorSectionTitle label="위치" />
            <div className="ffInspectorSubLabel">정렬</div>
            <div className="ffInspectorRow">
              <div className="ffSegmentGroup">
                <button onClick={() => alignSelection("left")} title="왼쪽 정렬" type="button"><AlignStartVertical size={16} /></button>
                <button onClick={() => alignSelection("center")} title="가로 가운데 정렬" type="button"><AlignCenterVertical size={16} /></button>
                <button onClick={() => alignSelection("right")} title="오른쪽 정렬" type="button"><AlignEndVertical size={16} /></button>
              </div>
              <div className="ffSegmentGroup">
                <button onClick={() => alignSelection("top")} title="위 정렬" type="button"><AlignStartHorizontal size={16} /></button>
                <button onClick={() => alignSelection("middle")} title="세로 가운데 정렬" type="button"><AlignCenterHorizontal size={16} /></button>
                <button onClick={() => alignSelection("bottom")} title="아래 정렬" type="button"><AlignEndHorizontal size={16} /></button>
              </div>
              <button className="ffInspectorAux" title="정리" type="button"><AlignHorizontalDistributeCenter size={15} /></button>
            </div>
            <div className="ffInspectorSubLabel">위치</div>
            <div className="ffInspectorRow">
              <NumberField label="X" value={selectedNode.x} onChange={(value) => updateNode(selectedNode.id, { x: Math.round(value) })} />
              <NumberField label="Y" value={selectedNode.y} onChange={(value) => updateNode(selectedNode.id, { y: Math.round(value) })} />
              <button className="ffInspectorAux" title="절대 위치" type="button"><Frame size={15} /></button>
            </div>
            <div className="ffInspectorSubLabel">회전</div>
            <div className="ffInspectorRow">
              <NumberField label="∟" value={0} onChange={() => undefined} />
              <div className="ffSegmentGroup">
                <button title="회전" type="button"><RotateCcw size={15} /></button>
                <button title="좌우 반전" type="button"><FlipHorizontal size={15} /></button>
                <button title="상하 반전" type="button"><FlipVertical size={15} /></button>
              </div>
            </div>

            <div className="ffInspectorSectionTitle">
              <span>레이아웃</span>
              <div className="ffInspectorSectionTools">
                <button title="콘텐츠에 맞추기" type="button"><Minimize2 size={14} /></button>
                <button title="패딩" type="button"><Scan size={14} /></button>
              </div>
            </div>
            <div className="ffInspectorSubLabel">흐름</div>
            <div className="ffInspectorRow wide">
              <div className="ffLayoutModeGrid">
                <button className="active" title="자유 배치" type="button"><Square size={15} /></button>
                <button title="세로 스택" type="button"><PanelBottom size={15} /></button>
                <button title="가로 스택" type="button"><PanelRight size={15} /></button>
                <button title="그리드" type="button"><GalleryHorizontal size={15} /></button>
              </div>
            </div>
            {selectedNode.type === "nav" || selectedNode.type === "header" ? (
              <>
                <div className="ffInspectorSubLabel">메뉴 정렬</div>
                <div className="ffInspectorRow wide">
                  <div className="ffLayoutModeGrid">
                    <button className={selectedNode.style.align === "left" ? "active" : ""} onClick={() => updateStyle(selectedNode.id, { align: "left" })} title="메뉴 왼쪽 정렬" type="button"><AlignLeft size={15} /></button>
                    <button className={selectedNode.style.align === "center" ? "active" : ""} onClick={() => updateStyle(selectedNode.id, { align: "center" })} title="메뉴 가운데 정렬" type="button"><AlignCenter size={15} /></button>
                    <button className={selectedNode.style.align === "right" ? "active" : ""} onClick={() => updateStyle(selectedNode.id, { align: "right" })} title="메뉴 오른쪽 정렬" type="button"><AlignRight size={15} /></button>
                  </div>
                </div>
              </>
            ) : null}
            <div className="ffInspectorSubLabel">크기</div>
            <div className="ffInspectorRow">
              <NumberField label="W" value={selectedNode.width} onChange={(value) => updateNode(selectedNode.id, { width: Math.max(getNodeMinSize(selectedNode).width, Math.round(value)) })} />
              <NumberField label="H" value={selectedNode.height} onChange={(value) => updateNode(selectedNode.id, { height: Math.max(getNodeMinSize(selectedNode).height, Math.round(value)) })} />
              <button className="ffInspectorAux" title="비율 고정" type="button"><Link2 size={15} /></button>
            </div>
            <label className="ffInspectorCheckbox">
              <input checked={false} onChange={() => undefined} type="checkbox" />
              <span>넘친 콘텐츠 숨기기</span>
            </label>
            <InspectorSectionTitle label="페이지 표시" />
            <label className="ffInspectorCheckbox">
              <input checked={selectedNode.scope === "site"} onChange={(event) => toggleNodeSiteScope(selectedNode, event.target.checked)} type="checkbox" />
              <span>모든 페이지에 표시</span>
            </label>
            {selectedNode.scope === "site" ? (
              <>
                <label className="ffInspectorCheckbox">
                  <input checked={Boolean(selectedNode.hiddenOnPageIds?.includes(selectedPageId))} onChange={(event) => toggleNodeHiddenOnCurrentPage(selectedNode, event.target.checked)} type="checkbox" />
                  <span>현재 페이지에서 숨기기</span>
                </label>
                <label className="ffInspectorCheckbox">
                  <input checked={selectedNode.positionMode === "fixed"} onChange={(event) => updateNode(selectedNode.id, { positionMode: event.target.checked ? "fixed" : "normal" })} type="checkbox" />
                  <span>상단 고정</span>
                </label>
              </>
            ) : null}

            <div className="ffInspectorSectionTitle">
              <span>외형</span>
              <div className="ffInspectorSectionTools">
                <button onClick={() => toggleHidden(selectedNode)} title={selectedNode.hidden ? "표시" : "숨기기"} type="button">{selectedNode.hidden ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                <button title="블렌드" type="button"><Droplet size={14} /></button>
              </div>
            </div>
            <div className="ffInspectorRow labels">
              <span className="ffInspectorSubLabel inline">불투명도</span>
              <span className="ffInspectorSubLabel inline">모서리 반경</span>
            </div>
            <div className="ffInspectorRow">
              <NumberField label="%" value={100} onChange={() => undefined} />
              <NumberField label="R" value={selectedNode.style.radius || 0} onChange={(value) => updateStyle(selectedNode.id, { radius: value })} />
              <button className="ffInspectorAux" title="개별 모서리" type="button"><Scan size={15} /></button>
            </div>
            {supportsTypography(selectedNode.type) ? (
              <>
                <InspectorSectionTitle label="텍스트" />
                {selectedNode.type === "text" || selectedNode.type === "button" ? (
                  <div className="ffInspectorRow wide">
                    <InspectorField label="내용">
                      <textarea value={selectedNode.style.text || ""} onChange={(event) => updateStyle(selectedNode.id, { text: event.target.value })} />
                    </InspectorField>
                  </div>
                ) : null}
                <div className="ffInspectorRow wide">
                  <FontDropdown value={selectedNode.style.fontFamily || defaultFontStack} onChange={(fontFamily) => updateStyle(selectedNode.id, { fontFamily })} />
                </div>
                <div className="ffInspectorRow labels">
                  <span className="ffInspectorSubLabel inline">크기</span>
                  <span className="ffInspectorSubLabel inline">굵기</span>
                </div>
                <div className="ffInspectorRow">
                  <NumberField label="px" value={selectedNode.style.fontSize || 16} onChange={(value) => updateStyle(selectedNode.id, { fontSize: value })} />
                  <NumberField label="W" value={selectedNode.style.fontWeight || 500} onChange={(value) => updateStyle(selectedNode.id, { fontWeight: value })} />
                </div>
                <div className="ffInspectorRow labels">
                  <span className="ffInspectorSubLabel inline">행간</span>
                  <span className="ffInspectorSubLabel inline">자간</span>
                </div>
                <div className="ffInspectorRow">
                  <NumberField label="LH" step={0.1} value={selectedNode.style.lineHeight || 1.2} onChange={(value) => updateStyle(selectedNode.id, { lineHeight: value })} />
                  <NumberField label="LS" value={selectedNode.style.letterSpacing || 0} onChange={(value) => updateStyle(selectedNode.id, { letterSpacing: value })} />
                </div>
                <div className="ffInspectorRow wide">
                  <div className="ffLayoutModeGrid">
                    <button className={selectedNode.style.align === "left" ? "active" : ""} onClick={() => updateStyle(selectedNode.id, { align: "left" })} title="왼쪽 정렬" type="button"><AlignLeft size={15} /></button>
                    <button className={selectedNode.style.align === "center" ? "active" : ""} onClick={() => updateStyle(selectedNode.id, { align: "center" })} title="가운데 정렬" type="button"><AlignCenter size={15} /></button>
                    <button className={selectedNode.style.align === "right" ? "active" : ""} onClick={() => updateStyle(selectedNode.id, { align: "right" })} title="오른쪽 정렬" type="button"><AlignRight size={15} /></button>
                  </div>
                </div>
              </>
            ) : null}
            <WidgetContentControls node={selectedNode} pages={pagesForSave} onChange={(text) => updateStyle(selectedNode.id, { text })} />
            {getWidgetPresets(selectedNode.type).length > 0 ? (
              <div className="ffInspectorRow wide">
                <div className="ffPresetButtons">
                  {getWidgetPresets(selectedNode.type).map((preset) => (
                    <button key={preset.label} onClick={() => updateStyle(selectedNode.id, { text: preset.text })} type="button">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {selectedNode.type === "map" ? (
              <>
                <InspectorSectionTitle label="지도" />
                <div className="ffInspectorRow wide">
                  <InspectorField label="주소 또는 지도 URL">
                    <textarea
                      placeholder="서울 강남구 테헤란로 또는 Google Maps embed URL"
                      value={selectedNode.style.mapUrl || ""}
                      onChange={(event) => updateStyle(selectedNode.id, { mapUrl: event.target.value })}
                    />
                  </InspectorField>
                </div>
                <div className="ffInspectorRow wide">
                  <InspectorField label="표시 이름">
                    <input value={selectedNode.style.text || ""} onChange={(event) => updateStyle(selectedNode.id, { text: event.target.value })} />
                  </InspectorField>
                </div>
              </>
            ) : null}
            {selectedNode.type === "video" ? (
              <>
                <InspectorSectionTitle label="동영상" />
                <div className="ffInspectorRow wide">
                  <InspectorField label="YouTube / Vimeo / MP4 URL">
                    <textarea
                      placeholder="https://youtube.com/watch?v=... 또는 https://.../video.mp4"
                      value={selectedNode.style.videoUrl || ""}
                      onChange={(event) => updateStyle(selectedNode.id, { videoUrl: event.target.value })}
                    />
                  </InspectorField>
                </div>
                <div className="ffInspectorRow wide">
                  <InspectorField label="제목">
                    <input value={selectedNode.style.text || ""} onChange={(event) => updateStyle(selectedNode.id, { text: event.target.value })} />
                  </InspectorField>
                </div>
              </>
            ) : null}

            <InspectorSectionTitle label="채우기" action="+" />
            <FillControls node={selectedNode} onChange={(changes) => updateStyle(selectedNode.id, changes)} />
            <BorderControls
              isSettingsOpen={borderSettingsNodeId === selectedNode.id}
              node={selectedNode}
              onChange={(changes) => updateStyle(selectedNode.id, changes)}
              onToggleSettings={() => setBorderSettingsNodeId((current) => (current === selectedNode.id ? null : selectedNode.id))}
            />
            <InspectorSectionTitle label="효과" action="+" />
            <div className="ffInspectorActionRow">
              <button onClick={() => toggleLock(selectedNode)} type="button">
                {selectedNode.locked ? <Unlock size={15} /> : <Lock size={15} />}
                {selectedNode.locked ? "잠금 해제" : "잠금"}
              </button>
              <button onClick={() => toggleHidden(selectedNode)} type="button">
                {selectedNode.hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                {selectedNode.hidden ? "표시" : "숨기기"}
              </button>
              <button onClick={() => duplicateNode(selectedNode)} type="button">
                <Copy size={15} />
                복제
              </button>
              <button className="danger" onClick={() => deleteNode(selectedNode.id)} title="삭제" type="button">
                <Trash2 size={15} />
              </button>
            </div>
            {hasContentSettings(selectedNode.type) ? (
              selectedNode.type !== "text" && selectedNode.type !== "button" ? (
                <div className="ffInspectorRow wide">
                  <InspectorField label="내용">
                    <textarea value={selectedNode.style.text || ""} onChange={(event) => updateStyle(selectedNode.id, { text: event.target.value })} />
                  </InspectorField>
                </div>
              ) : null
            ) : null}
            {selectedNode.type === "image" ? (
              <>
                <div className="ffInspectorRow wide">
                  <button className="ffReplaceImage" onClick={() => imageInputRef.current?.click()} type="button">
                    <Upload size={15} />
                    이미지 교체
                  </button>
                </div>
                <div className="ffInspectorRow wide">
                  <div className="ffPresetButtons">
                    <button disabled={!selectedNode.style.imageUrl} onClick={(event) => startImageCropEdit(selectedNode, event)} type="button">
                      크롭 편집
                    </button>
                    <button disabled={!selectedNode.style.imageUrl} onClick={() => updateStyle(selectedNode.id, { imageOffsetX: 0, imageOffsetY: 0, imageScale: 1 })} type="button">
                      크롭 초기화
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="ffFigmaInspector ffFrameInspector">
            <InspectorSectionTitle label="프레임" />
            <div className="ffFrameSummary">
              <strong>{activePage.name}</strong>
              <span>{activeCanvasSize.width} × {activeCanvasSize.height}</span>
            </div>
            <div className="ffInspectorSubLabel">디바이스</div>
            <div className="ffInspectorRow wide">
              <div className="ffLayoutModeGrid ffFrameDeviceGrid">
                {(Object.keys(deviceConfig) as DeviceMode[]).map((device) => (
                  <button className={deviceMode === device ? "active" : ""} key={device} onClick={() => switchDevice(device)} title={deviceConfig[device].label} type="button">
                    {deviceConfig[device].icon}
                  </button>
                ))}
              </div>
              <button className="ffInspectorAux" onClick={() => fitViewport(deviceMode)} title="프레임 맞춤" type="button"><Maximize2 size={15} /></button>
            </div>
            <div className="ffInspectorSubLabel">크기</div>
            <div className="ffInspectorRow">
              <NumberField label="W" max={2560} min={320} step={8} value={activeCanvasSize.width} onChange={(value) => updateCanvasSize("width", value)} />
              <NumberField label="H" max={5000} min={480} step={8} value={activeCanvasSize.height} onChange={(value) => updateCanvasSize("height", value)} />
              <button className="ffInspectorAux" onClick={swapCanvasOrientation} title="가로/세로 전환" type="button"><FlipHorizontal size={15} /></button>
            </div>
            <div className="ffInspectorSubLabel">프리셋</div>
            <div className="ffFramePresetGrid">
              {framePresets.map((preset) => {
                const isActive = deviceMode === preset.device && activeCanvasSize.width === preset.width && activeCanvasSize.height === preset.height;
                return (
                  <button className={isActive ? "active" : ""} key={`${preset.category}-${preset.name}`} onClick={() => applyFramePreset(preset)} type="button">
                    <span>{preset.name}</span>
                    <em>{preset.width} × {preset.height}</em>
                  </button>
                );
              })}
            </div>
            <InspectorSectionTitle label="가이드" />
            <label className="ffInspectorCheckbox">
              <input checked={showPixelGrid} readOnly type="checkbox" />
              <span>고배율에서 픽셀 그리드 표시</span>
            </label>
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
  isImageEditing = false,
  node,
  onImageCropDrag,
  onStartImageEditing,
  onCommitText,
  onStartEditing
}: {
  isEditing?: boolean;
  isImageEditing?: boolean;
  node: EditorNode;
  onImageCropDrag?: (mode: ImageCropDragState["mode"], event: React.MouseEvent<HTMLElement>, baseSize: { height: number; width: number }) => void;
  onStartImageEditing?: (event: React.MouseEvent) => void;
  onCommitText?: (text: string) => void;
  onStartEditing?: () => void;
}) {
  const horizontalAlign = getTextHorizontalAlignment(node.style.align);
  const style = {
    color: node.style.color,
    background: node.style.background,
    borderRadius: node.style.radius,
    padding: node.style.padding,
    textAlign: node.style.align,
    fontFamily: node.style.fontFamily,
    fontSize: node.style.fontSize,
    fontWeight: node.style.fontWeight,
    lineHeight: node.style.lineHeight,
    letterSpacing: typeof node.style.letterSpacing === "number" ? node.style.letterSpacing : undefined,
    ...getBorderRenderStyle(node.style),
    ...horizontalAlign
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
      <ImageCropNode
        isEditing={isImageEditing}
        node={node}
        onCropDrag={onImageCropDrag}
        onStartEditing={onStartImageEditing}
        style={style}
      />
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

  if (node.type === "booking") {
    const booking = splitContent(node.style.text, ["방문 예약", "원하는 날짜와 시간을 선택하세요."]);

    return (
      <div className="wbBookingWidget ffBookingMock" style={style}>
        <strong>{booking[0]}</strong>
        <p>{booking[1]}</p>
        <div className="wbBookingDates">
          {["월", "화", "수", "목"].map((day, index) => (
            <button className={index === 0 ? "active" : ""} key={day} type="button">
              <em>{day}</em>
              <span>{index + 3}</span>
            </button>
          ))}
        </div>
        <div className="wbBookingSlots">
          {["10:00", "11:00", "14:00"].map((slot, index) => (
            <button className={index === 1 ? "active" : ""} key={slot} type="button">
              {slot}
            </button>
          ))}
        </div>
        <button className="wbBookingSubmit" type="button">예약하기</button>
      </div>
    );
  }

  if (node.type === "map") {
    const mapUrl = getMapEmbedUrl(node.style.mapUrl);

    return (
      <div className="ffMapWidget" style={style}>
        {mapUrl ? <iframe loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapUrl} title={node.style.text || node.name} /> : <span />}
        <strong>{node.style.text || "Location map"}</strong>
      </div>
    );
  }

  if (node.type === "video") {
    const video = getVideoEmbed(node.style.videoUrl);

    return (
      <div className="ffVideoWidget" style={style}>
        {video?.type === "iframe" ? <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen src={video.src} title={node.style.text || node.name} /> : null}
        {video?.type === "video" ? <video controls src={video.src} title={node.style.text || node.name} /> : null}
        {!video ? (
          <>
            <button type="button">▶</button>
            <strong>{node.style.text || "Brand film"}</strong>
          </>
        ) : null}
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

function getTextHorizontalAlignment(align?: EditorNode["style"]["align"]): React.CSSProperties {
  if (align === "center") {
    return { "--webable-menu-justify": "center", justifyContent: "center", justifyItems: "center" } as React.CSSProperties;
  }

  if (align === "right") {
    return { "--webable-menu-justify": "flex-end", justifyContent: "flex-end", justifyItems: "end" } as React.CSSProperties;
  }

  return { "--webable-menu-justify": "flex-start", justifyContent: "flex-start", justifyItems: "start" } as React.CSSProperties;
}

function ImageCropNode({
  isEditing,
  node,
  onCropDrag,
  onStartEditing,
  style
}: {
  isEditing: boolean;
  node: EditorNode;
  onCropDrag?: (mode: ImageCropDragState["mode"], event: React.MouseEvent<HTMLElement>, baseSize: { height: number; width: number }) => void;
  onStartEditing?: (event: React.MouseEvent) => void;
  style: React.CSSProperties;
}) {
  const [naturalSize, setNaturalSize] = useState<{ height: number; width: number } | null>(null);
  const imageRatio = naturalSize && naturalSize.height > 0 ? naturalSize.width / naturalSize.height : node.width / node.height;
  const boxRatio = node.width / node.height;
  const baseSize =
    imageRatio > boxRatio
      ? {
          height: node.height,
          width: node.height * imageRatio
        }
      : {
          height: node.width / imageRatio,
          width: node.width
        };
  const imageStyle = {
    ...style,
    "--webable-image-base-height": `${baseSize.height}px`,
    "--webable-image-base-width": `${baseSize.width}px`,
    "--webable-image-x": `${node.style.imageOffsetX || 0}px`,
    "--webable-image-y": `${node.style.imageOffsetY || 0}px`,
    "--webable-image-scale": node.style.imageScale || 1
  } as React.CSSProperties;
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;

    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      setNaturalSize({ height: image.naturalHeight, width: image.naturalWidth });
    }
  };

  if (!node.style.imageUrl) {
    return (
      <div className="ffImageNode" onDoubleClick={onStartEditing} style={imageStyle}>
        <span />
      </div>
    );
  }

  return (
    <div
      className={isEditing ? "ffImageNode editing" : "ffImageNode"}
      onDoubleClick={onStartEditing}
      onMouseDown={isEditing ? (event) => onCropDrag?.("move", event, baseSize) : undefined}
      style={imageStyle}
    >
      {isEditing ? <img alt="" aria-hidden="true" className="ffImageCropGhost" draggable={false} src={node.style.imageUrl} /> : null}
      <div className="ffImageMask">
        <img alt={node.name} className="ffImageCropImage" draggable={false} onLoad={handleImageLoad} src={node.style.imageUrl} />
      </div>
      {isEditing ? (
        <div className="ffImageCropOverlay" onMouseDown={(event) => event.stopPropagation()}>
          <button className="topLeft" aria-label="Scale image from top left" onMouseDown={(event) => onCropDrag?.("scale", event, baseSize)} type="button" />
          <button className="topRight" aria-label="Scale image from top right" onMouseDown={(event) => onCropDrag?.("scale", event, baseSize)} type="button" />
          <button className="bottomLeft" aria-label="Scale image from bottom left" onMouseDown={(event) => onCropDrag?.("scale", event, baseSize)} type="button" />
          <button className="bottomRight" aria-label="Scale image from bottom right" onMouseDown={(event) => onCropDrag?.("scale", event, baseSize)} type="button" />
          <em>Enter / Esc</em>
        </div>
      ) : null}
    </div>
  );
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
  canvasSize,
  index,
  message,
  nodes,
  onApplyCode,
  onReload,
  page,
  state
}: {
  canvasSize: CanvasSize;
  index: ProjectIndex | null;
  message: string;
  nodes: EditorNode[];
  onApplyCode: (filePath: string, sourceText: string) => CodeApplyResult;
  onReload: () => void;
  page: EditorPage;
  state: "idle" | "loading" | "ready" | "error";
}) {
  const generatedFiles = useMemo(() => createCanvasCodeFiles(page, canvasSize, nodes), [canvasSize, nodes, page]);
  const [selectedFilePath, setSelectedFilePath] = useState(generatedFiles[0].filePath);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [dirtyPaths, setDirtyPaths] = useState<string[]>([]);
  const [applyMessage, setApplyMessage] = useState("");
  const codeGutterRef = useRef<HTMLDivElement>(null);
  const codeHighlightRef = useRef<HTMLPreElement>(null);
  const codeTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const projectFiles = useMemo<CodePaneFile[]>(
    () =>
      index?.files.map((file) => ({
        elementCount: file.elements.length,
        filePath: file.filePath,
        sourceText: file.sourceText
      })) ?? [],
    [index]
  );
  const allFiles = useMemo(() => [...generatedFiles, ...projectFiles], [generatedFiles, projectFiles]);
  const selectedFile = allFiles.find((file) => file.filePath === selectedFilePath) ?? generatedFiles[0];
  const selectedSource = drafts[selectedFile.filePath] ?? selectedFile.sourceText;
  const codeLines = createSourceCodeLines(selectedSource);
  const generatedTree = useMemo(() => buildCodeTree(generatedFiles), [generatedFiles]);
  const projectTree = useMemo(() => buildCodeTree(projectFiles), [projectFiles]);
  const selectedIsGenerated = generatedFiles.some((file) => file.filePath === selectedFile.filePath);
  const selectedIsDirty = dirtyPaths.includes(selectedFile.filePath);

  useEffect(() => {
    if (!allFiles.some((file) => file.filePath === selectedFilePath)) {
      setSelectedFilePath(generatedFiles[0].filePath);
    }
  }, [allFiles, generatedFiles, selectedFilePath]);

  useEffect(() => {
    setDrafts((current) => {
      let changed = false;
      const next = { ...current };

      generatedFiles.forEach((file) => {
        if (!dirtyPaths.includes(file.filePath) && next[file.filePath] !== file.sourceText) {
          next[file.filePath] = file.sourceText;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [dirtyPaths, generatedFiles]);

  useEffect(() => {
    if (!selectedIsDirty || !selectedIsGenerated) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const result = onApplyCode(selectedFile.filePath, selectedSource);
      setApplyMessage(result.ok ? "Synced to canvas." : result.message);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [selectedFile.filePath, selectedIsDirty, selectedIsGenerated, selectedSource]);

  function updateSelectedSource(value: string) {
    setDrafts((current) => ({ ...current, [selectedFile.filePath]: value }));
    setDirtyPaths((current) => (current.includes(selectedFile.filePath) ? current : [...current, selectedFile.filePath]));
    setApplyMessage("");
  }

  function resetSelectedSource() {
    setDrafts((current) => {
      const next = { ...current };
      next[selectedFile.filePath] = selectedFile.sourceText;
      return next;
    });
    setDirtyPaths((current) => current.filter((path) => path !== selectedFile.filePath));
    setApplyMessage("Reverted local edits.");
  }

  function applySelectedSource() {
    const result = onApplyCode(selectedFile.filePath, selectedSource);
    setApplyMessage(result.message);

    if (result.ok) {
      setDirtyPaths((current) => current.filter((path) => path !== selectedFile.filePath));
      setDrafts((current) => ({ ...current, [selectedFile.filePath]: selectedSource }));
    }
  }

  function syncCodeScroll() {
    if (codeGutterRef.current && codeTextAreaRef.current) {
      codeGutterRef.current.scrollTop = codeTextAreaRef.current.scrollTop;
    }

    if (codeHighlightRef.current && codeTextAreaRef.current) {
      codeHighlightRef.current.scrollLeft = codeTextAreaRef.current.scrollLeft;
      codeHighlightRef.current.scrollTop = codeTextAreaRef.current.scrollTop;
    }
  }

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
          <strong>EXPLORER</strong>
          <button onClick={onReload} title="Load project source" type="button">
            Load source
          </button>
        </div>
        <div className="ffCodeFileList">
          {generatedTree.children.map((node) => (
            <CodeTreeItem key={node.name} node={node} selectedFilePath={selectedFile.filePath} onSelectFile={setSelectedFilePath} />
          ))}
          {projectFiles.length > 0 ? (
            projectTree.children.map((node) => (
              <CodeTreeItem key={node.name} node={node} selectedFilePath={selectedFile.filePath} onSelectFile={setSelectedFilePath} />
            ))
          ) : state === "loading" || state === "error" ? (
            <div className="ffCodeEmpty">{state === "loading" ? "Indexing project source..." : message}</div>
          ) : null}
        </div>
      </aside>
      <section className="ffCodeEditor">
        <div className="ffCodeTabs">
          <button className="active" type="button">
            <FileText size={13} />
            {selectedFile.filePath.split("/").at(-1)}
          </button>
        </div>
        <div className="ffCodeEditorTop">
          <span>{selectedFile.filePath.split("/").join(" / ")}</span>
          <em>{selectedIsDirty ? "edited" : selectedIsGenerated ? "generated from current canvas" : `${selectedFile.elementCount} mapped elements`}</em>
          <button disabled={!selectedIsDirty} onClick={resetSelectedSource} type="button">
            Revert
          </button>
          <button disabled={!selectedIsDirty} onClick={applySelectedSource} type="button">
            {selectedIsGenerated ? "Sync now" : "Apply to canvas"}
          </button>
        </div>
        <div className="ffCodeEditPane">
          <div className="ffCodeLineGutter" aria-hidden="true" ref={codeGutterRef}>
            {codeLines.map((_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
          <div className="ffCodeInputStack">
            <pre aria-hidden="true" className="ffCodeHighlight" ref={codeHighlightRef}>
              {codeLines.map((line, index) => (
                <code key={`${index}-${line}`}>
                  {highlightCodeLine(line)}
                </code>
              ))}
            </pre>
            <textarea
              aria-label="Source code editor"
              className="ffCodeTextArea"
              onChange={(event) => updateSelectedSource(event.target.value)}
              onScroll={syncCodeScroll}
              ref={codeTextAreaRef}
              spellCheck={false}
              value={selectedSource}
              wrap="off"
            />
          </div>
        </div>
        {applyMessage ? <div className={applyMessage.startsWith("Cannot") ? "ffCodeApplyMessage error" : "ffCodeApplyMessage"}>{applyMessage}</div> : null}
        <div className="ffCodeStatusBar">
          <span>{selectedIsGenerated ? "canvas" : index?.framework || "source"}</span>
          <span>{selectedFile.filePath.split(".").at(-1)?.toUpperCase() || "CODE"}</span>
          <span>{selectedIsGenerated ? `${nodes.length} canvas nodes` : `${selectedFile.elementCount} mapped elements`}</span>
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
    </button>
  );
}

function buildCodeTree(files: CodePaneFile[]): CodeTreeNode {
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
          elementCount: isFile ? file.elementCount : 0,
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

function createCanvasCodeFiles(page: EditorPage, canvasSize: CanvasSize, nodes: EditorNode[]): CodePaneFile[] {
  const visibleNodes = [...nodes].filter((node) => !node.hidden).sort((a, b) => a.zIndex - b.zIndex);
  const tsx = [
    'import "./canvas.generated.css";',
    "",
    "export default function WebableCanvasPage() {",
    "  return (",
    `    <main className="webable-page" data-page=${toJsxString(page.name)} data-path=${toJsxString(page.path)}>`,
    ...visibleNodes.map((node) => createNodeJsx(node)).flat(),
    "    </main>",
    "  );",
    "}",
    ""
  ].join("\n");
  const css = [
    ".webable-page {",
    "  position: relative;",
    `  width: ${canvasSize.width}px;`,
    `  min-height: ${canvasSize.height}px;`,
    "  overflow: hidden;",
    "  background: #ffffff;",
    "}",
    "",
    ".webable-node {",
    "  position: absolute;",
    "  box-sizing: border-box;",
    "}",
    "",
    ...visibleNodes.map((node) => createNodeCss(node)).flat()
  ].join("\n");
  const json = JSON.stringify(
    {
      page: {
        id: page.id,
        name: page.name,
        path: page.path,
        size: canvasSize
      },
      nodes: visibleNodes.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        hidden: node.hidden,
        hiddenOnPageIds: node.hiddenOnPageIds,
        positionMode: node.positionMode,
        scope: node.scope || "page",
        zIndex: node.zIndex,
        style: node.style
      }))
    },
    null,
    2
  );

  return [
    { elementCount: visibleNodes.length, filePath: "current-canvas/canvas.generated.tsx", sourceText: tsx },
    { elementCount: visibleNodes.length, filePath: "current-canvas/canvas.generated.css", sourceText: css },
    { elementCount: visibleNodes.length, filePath: "current-canvas/canvas.nodes.json", sourceText: json }
  ];
}

function createNodeJsx(node: EditorNode) {
  const className = `webable-node ${toCssClass(node)}`;
  const text = node.style.text || node.name;

  if (node.type === "text") {
    return [`      <p className=${toJsxString(className)}>${toJsxExpression(text)}</p>`];
  }

  if (node.type === "button") {
    return [`      <button className=${toJsxString(className)} type="button">${toJsxExpression(text || "Button")}</button>`];
  }

  if (node.type === "image") {
    if (node.style.imageUrl) {
      return [`      <img className=${toJsxString(className)} src=${toJsxString(node.style.imageUrl)} alt=${toJsxString(node.name)} />`];
    }

    return [`      <div className=${toJsxString(className)} aria-label=${toJsxString(node.name)} />`];
  }

  if (node.type === "form") {
    const form = getFormContent(node.style.text);
    return [
      `      <form className=${toJsxString(className)}>`,
      `        <strong>${toJsxExpression(form.title)}</strong>`,
      ...form.fields.map((field) => `        <label>${toJsxExpression(field)}<input /></label>`),
      `        <button type="button">${toJsxExpression(form.action)}</button>`,
      "      </form>"
    ];
  }

  if (node.type === "nav") {
    return [
      `      <nav className=${toJsxString(className)} aria-label=${toJsxString(node.name)}>`,
      ...parseMenuItems(node.style.text || "Home, Shop, About, Contact").map((item) => `        <a href="#">${toJsxExpression(item.label)}</a>`),
      "      </nav>"
    ];
  }

  if (node.type === "map") {
    const mapUrl = getMapEmbedUrl(node.style.mapUrl);
    return mapUrl
      ? [`      <iframe className=${toJsxString(className)} src=${toJsxString(mapUrl)} title=${toJsxString(text || node.name)} loading="lazy" />`]
      : [`      <section className=${toJsxString(className)}>${toJsxExpression(text || "Location map")}</section>`];
  }

  if (node.type === "video") {
    const video = getVideoEmbed(node.style.videoUrl);

    if (video?.type === "iframe") {
      return [`      <iframe className=${toJsxString(className)} src=${toJsxString(video.src)} title=${toJsxString(text || node.name)} allowFullScreen />`];
    }

    if (video?.type === "video") {
      return [`      <video className=${toJsxString(className)} src=${toJsxString(video.src)} title=${toJsxString(text || node.name)} controls />`];
    }

    return [`      <section className=${toJsxString(className)}>${toJsxExpression(text || "Brand film")}</section>`];
  }

  return [`      <section className=${toJsxString(className)}>${toJsxExpression(text)}</section>`];
}

function createNodeCss(node: EditorNode) {
  const style = node.style;
  const lines = [
    `.${toCssClass(node)} {`,
    node.positionMode === "fixed" ? "  position: fixed;" : node.positionMode === "sticky" ? "  position: sticky;" : "",
    `  left: ${node.x}px;`,
    `  top: ${node.y}px;`,
    `  width: ${node.width}px;`,
    `  height: ${node.height}px;`,
    `  z-index: ${node.positionMode === "fixed" || node.positionMode === "sticky" ? 10000 + node.zIndex : node.zIndex};`
  ].filter(Boolean);

  if (style.background) lines.push(`  background: ${style.background};`);
  if (style.color) lines.push(`  color: ${style.color};`);
  if (style.border) lines.push(`  border: ${style.border};`);
  if (typeof style.radius === "number") lines.push(`  border-radius: ${style.radius}px;`);
  if (typeof style.padding === "number") lines.push(`  padding: ${style.padding}px;`);
  if (style.fontFamily) lines.push(`  font-family: ${style.fontFamily};`);
  if (typeof style.fontSize === "number") lines.push(`  font-size: ${style.fontSize}px;`);
  if (typeof style.fontWeight === "number") lines.push(`  font-weight: ${style.fontWeight};`);
  if (typeof style.lineHeight === "number") lines.push(`  line-height: ${style.lineHeight};`);
  if (typeof style.letterSpacing === "number") lines.push(`  letter-spacing: ${style.letterSpacing}px;`);
  if (style.align) lines.push(`  text-align: ${style.align};`);

  if (node.type === "button") {
    lines.push("  display: inline-flex;");
    lines.push("  align-items: center;");
    lines.push("  justify-content: center;");
    lines.push("  border: 0;");
  }

  if (node.type === "image" && style.imageUrl) {
    lines.push("  object-fit: cover;");
    lines.push("  transform-origin: center;");
    lines.push(`  transform: translate(${style.imageOffsetX || 0}px, ${style.imageOffsetY || 0}px) scale(${style.imageScale || 1});`);
  }

  lines.push("}");
  lines.push("");
  return lines;
}

function toCssClass(node: EditorNode) {
  return `node-${node.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function toJsxString(value: string) {
  return JSON.stringify(value);
}

function toJsxExpression(value: string) {
  return `{${JSON.stringify(value)}}`;
}

function parseCanvasCodeToNodes(filePath: string, sourceText: string, currentNodes: EditorNode[]): CodeParseResult {
  if (!filePath.startsWith("current-canvas/")) {
    return { ok: false, message: "Cannot apply project source files to the canvas yet." };
  }

  if (filePath.endsWith(".json")) {
    return parseCanvasJson(sourceText);
  }

  if (filePath.endsWith(".css")) {
    return parseCanvasCss(sourceText, currentNodes);
  }

  if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
    return parseCanvasTsx(sourceText, currentNodes);
  }

  return { ok: false, message: "Cannot apply this file type to the canvas." };
}

function parseCanvasJson(sourceText: string): CodeParseResult {
  try {
    const parsed = JSON.parse(sourceText) as { nodes?: unknown } | unknown[];
    const rawNodes = Array.isArray(parsed) ? parsed : Array.isArray(parsed.nodes) ? parsed.nodes : null;

    if (!rawNodes) {
      return { ok: false, message: "Cannot apply JSON: expected a nodes array." };
    }

    const nodes = rawNodes.map((node, index) => normalizeCodeNode(node, index));

    if (nodes.some((node) => !node)) {
      return { ok: false, message: "Cannot apply JSON: one or more nodes are invalid." };
    }

    return { ok: true, message: "Canvas updated from JSON.", nodes: nodes as EditorNode[] };
  } catch (error) {
    return { ok: false, message: `Cannot apply JSON: ${error instanceof Error ? error.message : "invalid JSON"}` };
  }
}

function parseCanvasCss(sourceText: string, currentNodes: EditorNode[]): CodeParseResult {
  const nextNodes = currentNodes.map((node) => ({ ...node, style: { ...node.style } }));
  let changed = 0;
  const blockPattern = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(sourceText))) {
    const className = match[1];
    const node = nextNodes.find((item) => toCssClass(item) === className);

    if (!node) {
      continue;
    }

    const declarations = parseCssDeclarations(match[2]);
    const numericMap: Array<[keyof EditorNode, string]> = [
      ["x", "left"],
      ["y", "top"],
      ["width", "width"],
      ["height", "height"],
      ["zIndex", "z-index"]
    ];

    numericMap.forEach(([key, cssKey]) => {
      const value = parseCssNumber(declarations[cssKey]);
      if (value !== null) {
        (node[key] as number) = value;
        changed += 1;
      }
    });

    const styleNumberMap: Array<[keyof EditorNode["style"], string]> = [
      ["radius", "border-radius"],
      ["padding", "padding"],
      ["fontSize", "font-size"],
      ["fontWeight", "font-weight"],
      ["lineHeight", "line-height"],
      ["letterSpacing", "letter-spacing"]
    ];

    styleNumberMap.forEach(([key, cssKey]) => {
      const value = parseCssNumber(declarations[cssKey]);
      if (value !== null) {
        (node.style[key] as number) = value;
        changed += 1;
      }
    });

    if (declarations.background) {
      node.style.background = declarations.background;
      changed += 1;
    }
    if (declarations.color) {
      node.style.color = declarations.color;
      changed += 1;
    }
    if (declarations.border) {
      node.style.border = declarations.border;
      changed += 1;
    }
    if (declarations["font-family"]) {
      node.style.fontFamily = declarations["font-family"];
      changed += 1;
    }
    if (["left", "center", "right"].includes(declarations["text-align"] || "")) {
      node.style.align = declarations["text-align"] as "left" | "center" | "right";
      changed += 1;
    }
  }

  return changed > 0
    ? { ok: true, message: "Canvas updated from CSS.", nodes: nextNodes }
    : { ok: false, message: "Cannot apply CSS: no matching canvas node rules found." };
}

function parseCanvasTsx(sourceText: string, currentNodes: EditorNode[]): CodeParseResult {
  const nextNodes = currentNodes.map((node) => ({ ...node, style: { ...node.style } }));
  let changed = 0;

  nextNodes.forEach((node) => {
    const className = toCssClass(node);
    const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`className="[^"]*${escapedClassName}[^"]*"[^>]*>(?:\\{((?:"(?:\\\\.|[^"\\\\])*")|(?:'(?:\\\\.|[^'\\\\])*'))\\}|([^<{}]*))<`, "m");
    const match = sourceText.match(pattern);

    if (!match) {
      return;
    }

    const text = match[1] ? parseQuotedString(match[1]) : match[2]?.trim() ?? null;
    if (text !== null && node.style.text !== text) {
      node.style.text = text;
      changed += 1;
    }
  });

  return changed > 0
    ? { ok: true, message: "Canvas text updated from TSX.", nodes: nextNodes }
    : { ok: false, message: "Cannot apply TSX: edit text inside generated node tags or use JSON/CSS." };
}

function normalizeCodeNode(value: unknown, index: number): EditorNode | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const node = value as Partial<EditorNode>;

  if (!node.id || !node.type || !isEditorNodeType(node.type)) {
    return null;
  }

  return {
    id: node.id,
    name: typeof node.name === "string" ? node.name : node.id,
    type: node.type,
    x: sanitizeNumber(node.x, 0),
    y: sanitizeNumber(node.y, 0),
    width: Math.max(1, sanitizeNumber(node.width, 120)),
    height: Math.max(1, sanitizeNumber(node.height, 48)),
    zIndex: sanitizeNumber(node.zIndex, index + 1),
    groupId: typeof node.groupId === "string" ? node.groupId : undefined,
    hidden: Boolean(node.hidden),
    hiddenOnPageIds: Array.isArray(node.hiddenOnPageIds) ? node.hiddenOnPageIds.filter((pageId): pageId is string => typeof pageId === "string") : undefined,
    locked: Boolean(node.locked),
    positionMode: node.positionMode === "fixed" || node.positionMode === "sticky" || node.positionMode === "normal" ? node.positionMode : undefined,
    scope: node.scope === "site" ? "site" : "page",
    style: normalizeCodeNodeStyle(node.style)
  };
}

function normalizeCodeNodeStyle(value: unknown): EditorNode["style"] {
  const style = value && typeof value === "object" ? ({ ...(value as EditorNode["style"]) } as EditorNode["style"]) : {};

  if (typeof style.fontFamily !== "string") {
    delete style.fontFamily;
  }
  if (typeof style.lineHeight !== "number" || !Number.isFinite(style.lineHeight)) {
    delete style.lineHeight;
  }
  if (typeof style.letterSpacing !== "number" || !Number.isFinite(style.letterSpacing)) {
    delete style.letterSpacing;
  }

  return style;
}

function isEditorNodeType(value: unknown): value is EditorNodeType {
  return (
    value === "container" ||
    value === "text" ||
    value === "button" ||
    value === "image" ||
    value === "header" ||
    value === "nav" ||
    value === "gallery" ||
    value === "slider" ||
    value === "hero" ||
    value === "products" ||
    value === "form" ||
    value === "map" ||
    value === "video" ||
    value === "testimonial" ||
    value === "pricing" ||
    value === "footer"
  );
}

function sanitizeNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseCssDeclarations(block: string) {
  return block.split(";").reduce<Record<string, string>>((items, declaration) => {
    const separator = declaration.indexOf(":");

    if (separator === -1) {
      return items;
    }

    const key = declaration.slice(0, separator).trim().toLowerCase();
    const value = declaration.slice(separator + 1).trim();

    if (key && value) {
      items[key] = value;
    }

    return items;
  }, {});
}

function parseCssNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const match = value.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function parseQuotedString(value: string) {
  try {
    return JSON.parse(value.replace(/^'/, '"').replace(/'$/, '"')) as string;
  } catch {
    return null;
  }
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
  if (type === "booking") return <Calendar size={15} />;
  if (type === "pricing") return <CreditCard size={15} />;
  if (type === "footer") return <PanelBottom size={15} />;
  return <Square size={15} />;
}

function WidgetPreview({ type, variant }: { type: EditorNodeType; variant?: string }) {
  return (
    <i className={`ffWidgetPreview ${variant || type}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </i>
  );
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

function supportsTypography(type: EditorNodeType) {
  return !["container", "gallery", "image"].includes(type);
}

type InteractionPresetOption = {
  description: string;
  key: InteractionPresetKey;
  label: string;
  tag: string;
};

function getAssetInteractionProfile(type: EditorNodeType) {
  if (type === "button") return { title: "클릭 행동과 피드백이 중심입니다.", description: "버튼은 이동, 제출, 눌림 반응, 토글처럼 사용자의 의도가 즉시 보이는 인터렉션을 먼저 설계해야 합니다." };
  if (type === "image") return { title: "확대, 라이트박스, 시선 유도가 핵심입니다.", description: "이미지는 호버 확대와 클릭 라이트박스처럼 콘텐츠를 더 자세히 보는 흐름이 자연스럽습니다." };
  if (type === "nav" || type === "header") return { title: "페이지 이동과 메뉴 상태를 우선합니다.", description: "네비게이션은 드롭다운, 메가메뉴, 섹션 이동, 고정 헤더 상태를 안정적으로 처리해야 합니다." };
  if (type === "form" || type === "booking") return { title: "입력 상태와 제출 피드백이 중요합니다.", description: "폼은 포커스, 입력 변경, 제출 성공/실패 상태가 명확해야 실제 서비스처럼 느껴집니다." };
  if (type === "video") return { title: "재생 전환과 집중 상태를 다룹니다.", description: "영상은 클릭 확대, 재생 상태, 등장 애니메이션처럼 몰입을 방해하지 않는 반응이 맞습니다." };
  if (type === "map") return { title: "위치 확인과 이동 흐름이 중심입니다.", description: "지도는 등장, 포커스, 위치 섹션 이동처럼 사용자의 탐색을 돕는 인터렉션이 적합합니다." };
  if (type === "gallery" || type === "slider") return { title: "탐색, 자동 전환, 라이트박스를 우선합니다.", description: "갤러리와 슬라이더는 카드 호버, 자동재생, 확대 보기 같은 탐색형 인터렉션이 필요합니다." };
  if (type === "products" || type === "pricing") return { title: "비교와 선택 행동을 강화합니다.", description: "상품과 가격표는 카드 호버, 선택 상태, CTA 이동이 구매 흐름과 연결되어야 합니다." };
  return { title: "등장, 상태 전환, 섹션 이동을 조합합니다.", description: "이 에셋은 화면 진입, 호버 강조, 표시/숨김 같은 기본 패턴부터 구성하는 것이 좋습니다." };
}

function getTriggerLabel(type: Interaction["trigger"]["type"]) {
  const labels: Record<Interaction["trigger"]["type"], string> = {
    click: "클릭",
    doubleClick: "더블클릭",
    focusWithin: "포커스",
    formSubmit: "폼 제출",
    hover: "호버",
    inputChange: "입력 변경",
    mouseDown: "누름",
    mouseUp: "뗌",
    pageLoad: "로드",
    viewEnter: "화면 진입"
  };

  return labels[type];
}

function getActionLabel(type: InteractionAction["type"]) {
  const labels: Record<InteractionAction["type"], string> = {
    animate: "애니메이션",
    delay: "딜레이",
    hoverStyle: "호버 스타일",
    navigate: "이동",
    scrollTo: "스크롤",
    setClass: "클래스",
    setState: "상태",
    setStyle: "스타일",
    toggleVisibility: "표시"
  };

  return labels[type];
}

function getAssetInteractionPresets(type: EditorNodeType): InteractionPresetOption[] {
  const shared: InteractionPresetOption[] = [
    { description: "스크롤로 화면에 들어오면 부드럽게 등장", key: "appear", label: "스크롤 등장", tag: "Reveal" },
    { description: "페이지 로드 후 딜레이를 두고 실행", key: "loadAnimate", label: "로드 애니메이션", tag: "Load" }
  ];

  if (type === "button") {
    return [
      { description: "클릭 시 선택한 페이지로 이동", key: "clickPage", label: "클릭 이동", tag: "Click" },
      { description: "누르는 순간 스케일 반응", key: "buttonPress", label: "눌림 반응", tag: "Press" },
      { description: "타겟 요소 표시 상태 전환", key: "toggle", label: "토글", tag: "State" },
      { description: "클릭 시 특정 섹션으로 스크롤", key: "scrollTo", label: "섹션 이동", tag: "Scroll" },
      ...shared
    ];
  }

  if (type === "image") {
    return [
      { description: "호버 시 이미지 확대", key: "imageZoom", label: "이미지 확대", tag: "Hover" },
      { description: "클릭 시 라이트박스 상태 적용", key: "galleryLightbox", label: "라이트박스", tag: "Open" },
      { description: "스크롤 진입 시 페이드 등장", key: "appear", label: "페이드 등장", tag: "Reveal" },
      { description: "클릭 시 타겟 표시 상태 전환", key: "toggle", label: "클릭 토글", tag: "State" }
    ];
  }

  if (type === "nav" || type === "header") {
    return [
      { description: "클릭 시 메뉴 열림 상태 토글", key: "dropdownToggle", label: "드롭다운 토글", tag: "Menu" },
      { description: "호버 시 메뉴 상태와 스타일 전환", key: "navReveal", label: "메뉴 상태 전환", tag: "Hover" },
      { description: "클릭 시 페이지 내 섹션으로 이동", key: "scrollTo", label: "섹션 이동", tag: "Scroll" },
      { description: "클릭 시 다른 페이지로 이동", key: "clickPage", label: "페이지 이동", tag: "Page" },
      { description: "호버 시 메뉴를 강조", key: "hoverLift", label: "호버 강조", tag: "Hover" }
    ];
  }

  if (type === "form" || type === "booking") {
    return [
      { description: "폼 제출 시 완료 상태와 애니메이션", key: "formSubmitFeedback", label: "제출 피드백", tag: "Submit" },
      { description: "입력 포커스 시 필드 강조", key: "inputFocus", label: "입력 포커스", tag: "Focus" },
      { description: "폼 영역 호버 시 강조", key: "formFocus", label: "폼 포커스", tag: "Hover" },
      { description: "스크롤 진입 시 폼 등장", key: "appear", label: "폼 등장", tag: "Reveal" },
      { description: "제출/클릭 후 특정 섹션 이동", key: "scrollTo", label: "제출 후 이동", tag: "Scroll" }
    ];
  }

  if (type === "video") {
    return [
      { description: "클릭 시 영상 영역 확대", key: "videoFocus", label: "클릭 확대", tag: "Play" },
      { description: "스크롤 진입 시 영상 등장", key: "appear", label: "영상 등장", tag: "Reveal" }
    ];
  }

  if (type === "map") {
    return [
      { description: "호버 시 지도 대비와 크기 강조", key: "mapFocus", label: "지도 포커스", tag: "Hover" },
      { description: "스크롤 진입 시 지도 페이드", key: "mapReveal", label: "지도 등장", tag: "Reveal" },
      { description: "클릭 시 위치 섹션으로 이동", key: "scrollTo", label: "위치로 이동", tag: "Scroll" }
    ];
  }

  if (type === "slider") {
    return [
      { description: "로드 후 슬라이드 모션 실행", key: "sliderAutoplay", label: "자동 슬라이드", tag: "Auto" },
      { description: "호버 시 슬라이드 카드 강조", key: "cardHover", label: "슬라이드 호버", tag: "Hover" },
      { description: "스크롤 진입 시 슬라이더 등장", key: "appear", label: "슬라이더 등장", tag: "Reveal" }
    ];
  }

  if (type === "gallery" || type === "products" || type === "pricing" || type === "testimonial") {
    return [
      { description: "클릭 시 선택 카드 확대 상태", key: "galleryLightbox", label: "라이트박스", tag: "Open" },
      { description: "호버 시 카드 들어올림", key: "cardHover", label: "카드 호버", tag: "Hover" },
      { description: "스크롤 진입 시 리스트 등장", key: "appear", label: "리스트 등장", tag: "Reveal" },
      { description: "클릭 시 연결 섹션 이동", key: "scrollTo", label: "섹션 이동", tag: "Scroll" }
    ];
  }

  if (type === "container" || type === "hero" || type === "footer") {
    return [
      { description: "클릭 시 펼침 상태 전환", key: "accordionToggle", label: "펼침 토글", tag: "State" },
      { description: "호버 시 영역 강조", key: "cardHover", label: "영역 호버", tag: "Hover" },
      { description: "타겟 요소 표시/숨김 전환", key: "toggle", label: "표시 토글", tag: "Toggle" },
      ...shared
    ];
  }

  return [
    { description: "스크롤 진입 시 텍스트 등장", key: "appear", label: "텍스트 등장", tag: "Reveal" },
    { description: "호버 시 강조 반응", key: "cardHover", label: "호버 강조", tag: "Hover" },
    { description: "클릭 시 섹션으로 이동", key: "scrollTo", label: "섹션 이동", tag: "Scroll" }
  ];
}

function hasContentSettings(type: EditorNodeType) {
  return !["button", "container", "footer", "form", "gallery", "header", "hero", "image", "map", "nav", "pricing", "products", "slider", "testimonial", "text", "video"].includes(type);
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

function getPageMenuItems(pages: EditorPage[]): MenuItem[] {
  return pages
    .map((page) => page.name.trim() || page.path.trim())
    .filter(Boolean)
    .map((label) => ({ children: [], label }));
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

function parseBorderValue(value: string | undefined): { color: string; style: BorderStyleValue; width: number } {
  const input = value?.trim();

  if (!input || input === "0" || input === "none") {
    return { color: "#d4d4d4", style: "none", width: 0 };
  }

  const width = Number(input.match(/(\d+(?:\.\d+)?)px/)?.[1] || 1);
  const style = (input.match(/\b(solid|dashed|dotted|none)\b/)?.[1] || "solid") as BorderStyleValue;
  const color =
    input.match(/#[0-9a-fA-F]{3,8}\b/)?.[0] ||
    input.match(/rgba?\([^)]+\)/)?.[0] ||
    input.replace(/(\d+(?:\.\d+)?)px/g, "").replace(/\b(solid|dashed|dotted|none)\b/g, "").trim() ||
    "#d4d4d4";

  return {
    color,
    style,
    width: style === "none" ? 0 : Math.max(0, Math.round(width))
  };
}

function createBorderValue(value: { color: string; style: BorderStyleValue; width: number }) {
  if (value.style === "none" || value.width <= 0) {
    return undefined;
  }

  return `${value.width}px ${value.style} ${value.color || "#d4d4d4"}`;
}

function getBorderRenderStyle(style?: EditorNode["style"]): React.CSSProperties {
  const border = parseBorderValue(style?.border);

  if (border.style === "none" || border.width <= 0) {
    return { border: undefined, boxShadow: undefined, outline: undefined };
  }

  const color = withCssOpacity(border.color, style?.borderOpacity ?? 100);
  const borderValue = `${border.width}px ${border.style} ${color}`;
  const position = style?.borderPosition || "center";

  if (position === "inside") {
    return {
      border: undefined,
      boxShadow: `inset 0 0 0 ${border.width}px ${color}`,
      outline: undefined
    };
  }

  if (position === "outside") {
    return {
      border: undefined,
      boxShadow: undefined,
      outline: borderValue,
      outlineOffset: 0
    };
  }

  return {
    border: borderValue,
    boxShadow: undefined,
    outline: undefined
  };
}

function withCssOpacity(color: string, opacity: number) {
  const parsed = parseCssColor(color);
  return formatColor(parsed.r, parsed.g, parsed.b, clamp(opacity, 0, 100) / 100);
}

function getWidgetDefaults(type: EditorNodeType): Pick<EditorNode, "height" | "name" | "style" | "width"> {
  if (type === "booking") {
    return {
      name: "Booking",
      width: 480,
      height: 560,
      style: { align: "left", background: "#ffffff", border: "1px solid #e5e7eb", color: "#111111", fontSize: 15, fontWeight: 700, padding: 0, radius: 16, text: "방문 예약|원하는 날짜와 시간을 선택하세요." }
    };
  }

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
      style: { background: "#eeeeee", border: "1px solid #d0d0d0", color: "#111111", fontSize: 18, fontWeight: 850, mapUrl: "서울 강남구 테헤란로", padding: 0, radius: 10, text: "Location map" }
    };
  }

  if (type === "video") {
    return {
      name: "Video",
      width: 560,
      height: 315,
      style: { background: "#111111", border: "1px solid #111111", color: "#ffffff", fontSize: 20, fontWeight: 850, padding: 0, radius: 10, text: "Brand film", videoUrl: "" }
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
      fontFamily: supportsTypography(type) ? defaultFontStack : undefined,
      fontSize: type === "text" ? 24 : 15,
      fontWeight: type === "text" ? 760 : 800,
      lineHeight: supportsTypography(type) ? 1.2 : undefined,
      letterSpacing: supportsTypography(type) ? 0 : undefined,
      color: type === "container" || type === "image" ? undefined : "#111111",
      background: type === "container" ? "#f7f7f7" : type === "button" ? "#111111" : type === "image" ? "#dedede" : "transparent",
      radius: type === "text" ? 0 : 12,
      align: "left",
      imageOffsetX: type === "image" ? 0 : undefined,
      imageOffsetY: type === "image" ? 0 : undefined,
      imageScale: type === "image" ? 1 : undefined,
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

function InspectorSectionTitle({ action, label }: { action?: string; label: string }) {
  return (
    <div className="ffInspectorSectionTitle">
      <span>{label}</span>
      {action ? <button type="button">{action}</button> : null}
    </div>
  );
}

function getInspectorTypeLabel(type: EditorNodeType) {
  const labels: Record<EditorNodeType, string> = {
    booking: "예약",
    button: "버튼",
    container: "프레임",
    footer: "푸터",
    form: "폼",
    gallery: "갤러리",
    header: "헤더",
    hero: "히어로",
    image: "이미지",
    map: "지도",
    nav: "내비게이션",
    pricing: "가격표",
    products: "상품",
    slider: "슬라이더",
    testimonial: "후기",
    text: "텍스트",
    video: "비디오"
  };

  return labels[type];
}

type BorderStyleValue = "dashed" | "dotted" | "none" | "solid";
type InteractionPresetKey =
  | "accordionToggle"
  | "appear"
  | "buttonPress"
  | "cardHover"
  | "clickPage"
  | "dropdownToggle"
  | "formFocus"
  | "formSubmitFeedback"
  | "galleryLightbox"
  | "hoverLift"
  | "imageZoom"
  | "inputFocus"
  | "loadAnimate"
  | "mapFocus"
  | "mapReveal"
  | "navReveal"
  | "scrollTo"
  | "sliderAutoplay"
  | "toggle"
  | "videoFocus";

function FillControls({ node, onChange }: { node: EditorNode; onChange: (changes: Partial<EditorNode["style"]>) => void }) {
  const isTextLike = node.type === "text";

  return (
    <>
      <div className="ffInspectorRow wide">
        <div className="ffColorSplit">
          <ColorField label={isTextLike ? "텍스트 색상" : "채우기 색상"} value={isTextLike ? node.style.color : node.style.background} onChange={(value) => onChange(isTextLike ? { color: value } : { background: value })} />
          <div className="ffOpacityBox">
            <input onChange={() => undefined} type="number" value={100} />
            <span>%</span>
          </div>
        </div>
      </div>
      {!isTextLike ? (
        <div className="ffInspectorRow wide">
          <ColorField label="텍스트 색상" value={node.style.color} onChange={(value) => onChange({ color: value })} />
        </div>
      ) : null}
    </>
  );
}

function BorderControls({
  isSettingsOpen,
  node,
  onChange,
  onToggleSettings
}: {
  isSettingsOpen: boolean;
  node: EditorNode;
  onChange: (changes: Partial<EditorNode["style"]>) => void;
  onToggleSettings: () => void;
}) {
  const value = parseBorderValue(node.style.border);
  const opacity = clamp(node.style.borderOpacity ?? 100, 0, 100);
  const position = node.style.borderPosition || "center";
  const profile = node.style.borderProfile || "uniform";
  const corner = node.style.borderCorner || "miter";
  const miterAngle = node.style.borderMiterAngle ?? 28.96;

  function patchBorder(changes: Partial<{ color: string; style: BorderStyleValue; width: number }>) {
    const nextValue = { ...value, ...changes };
    onChange({ border: createBorderValue(nextValue) });
  }

  return (
    <div className="ffStrokeSection">
      <div className="ffInspectorSectionTitle">
        <span>외곽선</span>
        <div className="ffInspectorSectionTools">
          <button title="외곽선 순서" type="button"><LayoutGrid size={14} /></button>
          <button title="외곽선 추가" type="button"><Plus size={16} /></button>
        </div>
      </div>

      <div className="ffInspectorRow wide">
        <div className="ffColorSplit">
          <ColorField
            label="외곽선 색상"
            value={value.color}
            onChange={(color) => patchBorder({ color, width: value.width || 1, style: value.style === "none" ? "solid" : value.style })}
          />
          <div className="ffOpacityBox">
            <input
              max={100}
              min={0}
              onChange={(event) => onChange({ borderOpacity: clamp(Number(event.target.value), 0, 100) })}
              type="number"
              value={opacity}
            />
            <span>%</span>
          </div>
        </div>
      </div>

      <div className="ffInspectorRow labels">
        <span className="ffInspectorSubLabel inline">위치</span>
        <span className="ffInspectorSubLabel inline">굵기</span>
      </div>
      <div className="ffInspectorRow">
        <InspectorField label="">
          <select value={position} onChange={(event) => onChange({ borderPosition: event.target.value as EditorNode["style"]["borderPosition"] })}>
            <option value="center">가운데</option>
            <option value="inside">안쪽</option>
            <option value="outside">바깥쪽</option>
          </select>
        </InspectorField>
        <NumberField label="px" min={0} value={value.width} onChange={(width) => patchBorder({ width: Math.max(0, Math.round(width)) })} />
        <button className={isSettingsOpen ? "ffInspectorAux active" : "ffInspectorAux"} onClick={onToggleSettings} title="외곽선 설정" type="button">
          <Scan size={15} />
        </button>
      </div>

      {isSettingsOpen ? (
        <div className="ffStrokePopover">
          <div className="ffStrokePopoverHeader">
            <strong>외곽선 설정</strong>
            <button aria-label="닫기" onClick={onToggleSettings} type="button">×</button>
          </div>
          <div className="ffStrokeTabs">
            <button className="active" type="button">기본</button>
            <button disabled type="button">동적</button>
            <button disabled type="button">브러쉬</button>
          </div>
          <label className="ffStrokeSettingRow">
            <span>스타일</span>
            <select value={value.style} onChange={(event) => patchBorder({ style: event.target.value as BorderStyleValue, width: value.width || 1 })}>
              <option value="solid">실선</option>
              <option value="dashed">파선</option>
              <option value="dotted">점선</option>
              <option value="none">없음</option>
            </select>
          </label>
          <label className="ffStrokeSettingRow">
            <span>너비 프로필</span>
            <select value={profile} onChange={(event) => onChange({ borderProfile: event.target.value as EditorNode["style"]["borderProfile"] })}>
              <option value="uniform">균일</option>
              <option value="thin">얇게</option>
              <option value="wide">굵게</option>
            </select>
          </label>
          <div className="ffStrokeSettingRow">
            <span>모서리</span>
            <div className="ffStrokeCornerGroup">
              <button className={corner === "miter" ? "active" : ""} onClick={() => onChange({ borderCorner: "miter" })} title="각진 모서리" type="button">┐</button>
              <button className={corner === "bevel" ? "active" : ""} onClick={() => onChange({ borderCorner: "bevel" })} title="깎인 모서리" type="button">╱</button>
              <button className={corner === "round" ? "active" : ""} onClick={() => onChange({ borderCorner: "round" })} title="둥근 모서리" type="button">╮</button>
            </div>
          </div>
          <div className="ffStrokeSettingRow">
            <span>미터 각</span>
            <NumberField label="∠" min={0} step={0.01} value={miterAngle} onChange={(borderMiterAngle) => onChange({ borderMiterAngle })} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WidgetContentControls({ node, onChange, pages }: { node: EditorNode; onChange: (text: string) => void; pages: EditorPage[] }) {
  const pageMenuItems = getPageMenuItems(pages);
  const pageMenuText = serializeMenuItems(pageMenuItems);

  if (node.type === "header") {
    const [brand, links, action] = splitContent(node.style.text, ["WEBABLE", "Home,Shop>Flowers;Plants;Gifts,About,Contact", "Start"]);
    const isPageMenu = serializeMenuItems(parseMenuItems(links)) === pageMenuText;
    return (
      <>
        <InspectorSectionTitle label="헤더" />
        <div className="ffInspectorRow wide">
          <InspectorField label="브랜드"><input value={brand} onChange={(event) => onChange(joinContentParts([event.target.value, links, action]))} /></InspectorField>
        </div>
        <NavigationSourceButton disabled={pageMenuItems.length === 0} synced={isPageMenu} onClick={() => onChange(joinContentParts([brand, pageMenuText, action]))} />
        <MenuContentControls items={parseMenuItems(links)} onChange={(items) => onChange(joinContentParts([brand, serializeMenuItems(items), action]))} />
        <div className="ffInspectorRow wide">
          <InspectorField label="버튼"><input value={action} onChange={(event) => onChange(joinContentParts([brand, links, event.target.value]))} /></InspectorField>
        </div>
      </>
    );
  }

  if (node.type === "nav") {
    const isPageMenu = serializeMenuItems(parseMenuItems(node.style.text)) === pageMenuText;
    return (
      <>
        <InspectorSectionTitle label="내비게이션" />
        <NavigationSourceButton disabled={pageMenuItems.length === 0} synced={isPageMenu} onClick={() => onChange(pageMenuText)} />
        <MenuContentControls items={parseMenuItems(node.style.text)} onChange={(items) => onChange(serializeMenuItems(items))} />
      </>
    );
  }

  if (node.type === "hero") {
    const [title, body, action] = splitContent(node.style.text, ["Build a sharper landing page", "브랜드 메시지와 CTA를 한 화면에 배치하는 히어로 섹션입니다.", "Explore"]);
    return (
      <>
        <InspectorSectionTitle label="히어로" />
        <div className="ffInspectorRow wide">
          <InspectorField label="제목"><input value={title} onChange={(event) => onChange(joinContentParts([event.target.value, body, action]))} /></InspectorField>
        </div>
        <div className="ffInspectorRow wide">
          <InspectorField label="본문"><textarea value={body} onChange={(event) => onChange(joinContentParts([title, event.target.value, action]))} /></InspectorField>
        </div>
        <div className="ffInspectorRow wide">
          <InspectorField label="CTA"><input value={action} onChange={(event) => onChange(joinContentParts([title, body, event.target.value]))} /></InspectorField>
        </div>
      </>
    );
  }

  if (node.type === "slider") {
    const [title, meta] = splitContent(node.style.text, ["Featured collection", "01 / 03"]);
    return (
      <>
        <InspectorSectionTitle label="슬라이더" />
        <div className="ffInspectorRow wide">
          <InspectorField label="제목"><input value={title} onChange={(event) => onChange(joinContentParts([event.target.value, meta]))} /></InspectorField>
        </div>
        <div className="ffInspectorRow wide">
          <InspectorField label="표시"><input value={meta} onChange={(event) => onChange(joinContentParts([title, event.target.value]))} /></InspectorField>
        </div>
      </>
    );
  }

  if (node.type === "form") {
    const [title, fields, action] = splitContent(node.style.text, ["Contact form", "Name,Email,Message", "Submit"]);
    return (
      <>
        <InspectorSectionTitle label="폼" />
        <div className="ffInspectorRow wide">
          <InspectorField label="제목"><input value={title} onChange={(event) => onChange(joinContentParts([event.target.value, fields, action]))} /></InspectorField>
        </div>
        <ListContentControls label="필드" items={splitList(fields, ["Name", "Email", "Message"])} onChange={(items) => onChange(joinContentParts([title, serializeList(items), action]))} />
        <div className="ffInspectorRow wide">
          <InspectorField label="버튼"><input value={action} onChange={(event) => onChange(joinContentParts([title, fields, event.target.value]))} /></InspectorField>
        </div>
      </>
    );
  }

  if (node.type === "products" || node.type === "pricing") {
    return <PairsContentControls label={node.type === "products" ? "상품" : "가격표"} text={node.style.text} fallback={node.type === "products" ? [["Signature", "₩49,000"], ["Bundle", "₩89,000"], ["Premium", "₩129,000"]] : [["Basic", "₩19k"], ["Pro", "₩49k"], ["Scale", "₩99k"]]} onChange={onChange} />;
  }

  if (node.type === "footer") {
    const [brand, links] = splitContent(node.style.text, ["WEBABLE", "Company,Terms,Contact"]);
    return (
      <>
        <InspectorSectionTitle label="푸터" />
        <div className="ffInspectorRow wide">
          <InspectorField label="브랜드"><input value={brand} onChange={(event) => onChange(joinContentParts([event.target.value, links]))} /></InspectorField>
        </div>
        <ListContentControls label="링크" items={splitList(links, ["Company", "Terms", "Contact"])} onChange={(items) => onChange(joinContentParts([brand, serializeList(items)]))} />
      </>
    );
  }

  if (node.type === "testimonial") {
    return (
      <>
        <InspectorSectionTitle label="후기" />
        <div className="ffInspectorRow wide">
          <InspectorField label="내용"><textarea value={node.style.text || ""} onChange={(event) => onChange(event.target.value)} /></InspectorField>
        </div>
      </>
    );
  }

  return null;
}

function NavigationSourceButton({
  disabled,
  onClick,
  synced
}: {
  disabled: boolean;
  onClick: () => void;
  synced: boolean;
}) {
  return (
    <div className="ffInspectorRow wide">
      <button className={`ffSyncButton${synced ? " active" : ""}`} disabled={disabled || synced} onClick={onClick} type="button">
        <Link2 size={14} />
        {synced ? "페이지 목록과 동기화됨" : "페이지 목록에서 가져오기"}
      </button>
    </div>
  );
}

function MenuContentControls({ items, onChange }: { items: MenuItem[]; onChange: (items: MenuItem[]) => void }) {
  const safeItems = items.length > 0 ? items : parseMenuItems(undefined);

  function patch(index: number, changes: Partial<MenuItem>) {
    onChange(safeItems.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item)));
  }

  function remove(index: number) {
    onChange(safeItems.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <>
      {safeItems.map((item, index) => (
        <div className="ffInspectorStackRow" key={`menu-${index}`}>
          <div className="ffInspectorRow">
            <InspectorField label="메뉴"><input value={item.label} onChange={(event) => patch(index, { label: event.target.value })} /></InspectorField>
            <button className="ffMiniDanger" onClick={() => remove(index)} title="메뉴 삭제" type="button"><Trash2 size={13} /></button>
          </div>
          <div className="ffInspectorRow wide">
            <InspectorField label="하위"><input value={serializeList(item.children)} onChange={(event) => patch(index, { children: splitList(event.target.value, []) })} /></InspectorField>
          </div>
        </div>
      ))}
      <div className="ffInspectorRow wide">
        <button className="ffAddItemButton" onClick={() => onChange([...safeItems, { children: [], label: `Menu ${safeItems.length + 1}` }])} type="button">
          <Plus size={14} />
          메뉴 추가
        </button>
      </div>
    </>
  );
}

function ListContentControls({ items, label, onChange }: { items: string[]; label: string; onChange: (items: string[]) => void }) {
  const safeItems = items.length > 0 ? items : [label];

  function patch(index: number, value: string) {
    onChange(safeItems.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  return (
    <>
      {safeItems.map((item, index) => (
        <div className="ffInspectorRow" key={`${label}-${index}`}>
          <InspectorField label={label}><input value={item} onChange={(event) => patch(index, event.target.value)} /></InspectorField>
          <button className="ffMiniDanger" onClick={() => onChange(safeItems.filter((_, itemIndex) => itemIndex !== index))} title={`${label} 삭제`} type="button"><Trash2 size={13} /></button>
        </div>
      ))}
      <div className="ffInspectorRow wide">
        <button className="ffAddItemButton" onClick={() => onChange([...safeItems, `${label} ${safeItems.length + 1}`])} type="button">
          <Plus size={14} />
          {label} 추가
        </button>
      </div>
    </>
  );
}

function PairsContentControls({
  fallback,
  label,
  onChange,
  text
}: {
  fallback: Array<[string, string]>;
  label: string;
  onChange: (text: string) => void;
  text?: string;
}) {
  const pairs = getPairs(text, fallback);

  function patch(index: number, side: 0 | 1, value: string) {
    const nextPairs = pairs.map((pair, pairIndex) => (pairIndex === index ? ([side === 0 ? value : pair[0], side === 1 ? value : pair[1]] as [string, string]) : pair));
    onChange(nextPairs.map(([name, price]) => `${name}:${price}`).join(","));
  }

  function commit(nextPairs: Array<[string, string]>) {
    onChange(nextPairs.map(([name, price]) => `${name}:${price}`).join(","));
  }

  return (
    <>
      <InspectorSectionTitle label={label} />
      {pairs.slice(0, 4).map(([name, price], index) => (
        <div className="ffInspectorRow" key={`${label}-${index}`}>
          <InspectorField label="이름"><input value={name} onChange={(event) => patch(index, 0, event.target.value)} /></InspectorField>
          <InspectorField label="값"><input value={price} onChange={(event) => patch(index, 1, event.target.value)} /></InspectorField>
          <button className="ffMiniDanger" onClick={() => commit(pairs.filter((_, pairIndex) => pairIndex !== index))} title={`${label} 삭제`} type="button"><Trash2 size={13} /></button>
        </div>
      ))}
      <div className="ffInspectorRow wide">
        <button className="ffAddItemButton" onClick={() => commit([...pairs, [`${label} ${pairs.length + 1}`, ""]])} type="button">
          <Plus size={14} />
          {label} 추가
        </button>
      </div>
    </>
  );
}

function joinContentParts(parts: string[]) {
  return parts.map((part) => part.trim()).join("|");
}

function serializeList(items: string[]) {
  return items.map((item) => item.trim()).filter(Boolean).join(",");
}

function serializeMenuItems(items: MenuItem[]) {
  return items
    .map((item) => {
      const label = item.label.trim();
      const children = serializeList(item.children);
      return children ? `${label}>${children.replace(/,/g, ";")}` : label;
    })
    .filter(Boolean)
    .join(",");
}

function NumberField({
  label,
  max,
  min,
  onChange,
  step = 1,
  value
}: {
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  const precision = getStepPrecision(step);
  const normalizeValue = (nextValue: number) => {
    const bounded = clamp(nextValue, min ?? Number.NEGATIVE_INFINITY, max ?? Number.POSITIVE_INFINITY);
    return Number(bounded.toFixed(precision));
  };

  function nudge(delta: number) {
    onChange(normalizeValue(value + delta));
  }

  return (
    <label className="ffField ffNumberField">
      <span>{label}</span>
      <input
        max={max}
        min={min}
        step={step}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (Number.isFinite(nextValue)) {
            onChange(normalizeValue(nextValue));
          }
        }}
      />
      <div className="ffNumberStepper">
        <button
          aria-label={`${label} increase`}
          onClick={(event) => {
            event.preventDefault();
            nudge(step);
          }}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <ChevronUp size={10} />
        </button>
        <button
          aria-label={`${label} decrease`}
          onClick={(event) => {
            event.preventDefault();
            nudge(-step);
          }}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <ChevronDown size={10} />
        </button>
      </div>
    </label>
  );
}

function FontDropdown({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const options = useMemo(() => {
    if (fontPresets.some((font) => font.value === value)) {
      return fontPresets;
    }

    return [{ label: getFontLabel(value), value }, ...fontPresets];
  }, [value]);
  const selectedFont = options.find((font) => font.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="ffFontDropdown" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="ffFontTrigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span style={{ fontFamily: selectedFont.value }}>{selectedFont.label}</span>
        <ChevronDown size={15} />
      </button>
      {isOpen ? (
        <div className="ffFontMenu" role="listbox">
          {options.map((font) => (
            <button
              aria-selected={font.value === value}
              className={font.value === value ? "active" : ""}
              key={font.value}
              onClick={() => {
                onChange(font.value);
                setIsOpen(false);
              }}
              role="option"
              style={{ fontFamily: font.value }}
              type="button"
            >
              <span>{font.label}</span>
              <em>가나다 Aa</em>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getFontLabel(value: string) {
  return value.split(",")[0]?.replaceAll("\"", "").trim() || "Custom font";
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

function getStepPrecision(step: number) {
  const [, decimals = ""] = String(step).split(".");
  return decimals.length;
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

function roundCropScale(value: number) {
  return Math.round(value * 1000) / 1000;
}

function constrainImageCropOffset({
  baseHeight,
  baseWidth,
  height,
  offsetX,
  offsetY,
  scale,
  width
}: {
  baseHeight: number;
  baseWidth: number;
  height: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  width: number;
}) {
  const maxX = Math.max(0, (baseWidth * scale - width) / 2);
  const maxY = Math.max(0, (baseHeight * scale - height) / 2);

  return {
    x: Math.round(clamp(offsetX, -maxX, maxX)),
    y: Math.round(clamp(offsetY, -maxY, maxY))
  };
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
