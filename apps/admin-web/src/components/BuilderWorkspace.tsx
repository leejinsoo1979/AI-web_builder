"use client";

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Bell,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  FileText,
  Globe2,
  Home,
  LayoutTemplate,
  Loader2,
  Lock,
  Monitor,
  Palette,
  PenLine,
  Plus,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Undo2,
  Users
} from "lucide-react";
import {
  createSiteSpec,
  updateSection,
  type BrandVoice,
  type SectionSpec,
  type SectionType,
  type SiteSpec
} from "@webable/builder-schema";
import { FormEvent, useEffect, useMemo, useState } from "react";

type GenerateJob = {
  id: string;
  status: "needs_approval" | "queued" | "running" | "applied" | "failed";
  outputDiff: {
    siteSpec: SiteSpec;
  };
  cost: number;
};

type DeviceMode = "desktop" | "tablet" | "mobile";
type WorkspaceMode = "build" | "pages" | "commerce" | "crm" | "ai" | "settings";
type InspectorTab = "content" | "design" | "seo";
type SaveState = "saved" | "saving" | "restored";
type ResizeAxis = "x" | "y" | "xy";
type CommerceRow = {
  name: string;
  status: string;
  price: string;
  stock: number;
};

const initialSpec = createSiteSpec({
  prompt: "프리미엄 꽃 정기구독 브랜드",
  industry: "flower-subscription",
  tone: "premium",
  targetAudience: "선물과 공간 연출을 자주 고민하는 30-40대 고객"
});

const voiceOptions: Array<{ value: BrandVoice; label: string }> = [
  { value: "professional", label: "Professional" },
  { value: "premium", label: "Premium" },
  { value: "friendly", label: "Friendly" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" }
];

const navItems: Array<{ id: WorkspaceMode; label: string; icon: React.ReactNode }> = [
  { id: "build", label: "빌더", icon: <LayoutTemplate size={20} /> },
  { id: "pages", label: "페이지", icon: <FileText size={20} /> },
  { id: "commerce", label: "커머스", icon: <ShoppingBag size={20} /> },
  { id: "crm", label: "고객", icon: <Users size={20} /> },
  { id: "ai", label: "AI", icon: <Bot size={20} /> },
  { id: "settings", label: "설정", icon: <Settings size={20} /> }
];

const sectionPresets: Array<{
  type: SectionType;
  label: string;
  title: string;
  body: string;
  background: NonNullable<SectionSpec["props"]["background"]>;
  align: NonNullable<SectionSpec["props"]["align"]>;
  mediaStyle: NonNullable<SectionSpec["props"]["mediaStyle"]>;
}> = [
  {
    type: "hero.editorial",
    label: "Hero",
    title: "브랜드를 가장 선명하게 보여주는 첫 화면",
    body: "핵심 제안, CTA, 신뢰 메시지를 한 번에 전달합니다.",
    background: "dark",
    align: "split",
    mediaStyle: "photo"
  },
  {
    type: "feature.grid",
    label: "Features",
    title: "고객이 선택해야 하는 이유",
    body: "서비스 장점, 상품 구성, 운영 강점을 카드형으로 정리합니다.",
    background: "light",
    align: "left",
    mediaStyle: "none"
  },
  {
    type: "process.steps",
    label: "Process",
    title: "예약부터 완료까지 흐름",
    body: "사용자가 다음 행동을 자연스럽게 이해하도록 단계별로 안내합니다.",
    background: "soft",
    align: "left",
    mediaStyle: "none"
  },
  {
    type: "proof.metrics",
    label: "Proof",
    title: "성과와 신뢰 지표",
    body: "리뷰, 누적 판매, 응답 속도 같은 전환 근거를 보여줍니다.",
    background: "light",
    align: "center",
    mediaStyle: "none"
  },
  {
    type: "product.showcase",
    label: "Products",
    title: "대표 상품과 가격을 한눈에 비교합니다.",
    body: "상품 구성, 가격, 추천 옵션을 명확하게 보여줘 구매 결정을 돕습니다.",
    background: "soft",
    align: "left",
    mediaStyle: "mockup"
  },
  {
    type: "gallery.masonry",
    label: "Gallery",
    title: "브랜드 분위기를 이미지 중심으로 보여줍니다.",
    body: "공간, 상품, 작업 사례를 감각적인 갤러리로 구성합니다.",
    background: "light",
    align: "center",
    mediaStyle: "photo"
  },
  {
    type: "testimonial.wall",
    label: "Reviews",
    title: "고객 후기로 신뢰를 쌓습니다.",
    body: "구매 경험, 만족도, 재방문 이유를 실제 목소리처럼 배치합니다.",
    background: "soft",
    align: "left",
    mediaStyle: "none"
  },
  {
    type: "faq.accordion",
    label: "FAQ",
    title: "구매 전에 자주 묻는 질문을 미리 답합니다.",
    body: "배송, 예약, 교환, 상담 기준을 정리해 이탈을 줄입니다.",
    background: "light",
    align: "left",
    mediaStyle: "none"
  },
  {
    type: "contact.form",
    label: "Form",
    title: "문의와 예약을 바로 받을 수 있습니다.",
    body: "이름, 연락처, 요청사항을 받아 운영자가 빠르게 응답합니다.",
    background: "soft",
    align: "split",
    mediaStyle: "mockup"
  },
  {
    type: "cta.publish",
    label: "CTA",
    title: "지금 바로 시작할 수 있는 마지막 제안",
    body: "문의, 예약, 구매, 상담 같은 명확한 전환 버튼을 둡니다.",
    background: "brand",
    align: "center",
    mediaStyle: "none"
  }
];

const themeSwatches = [
  { primaryColor: "#0f172a", secondaryColor: "#f8fafc", accentColor: "#0f766e" },
  { primaryColor: "#1d4ed8", secondaryColor: "#eff6ff", accentColor: "#f97316" },
  { primaryColor: "#7f1d1d", secondaryColor: "#fff7ed", accentColor: "#2563eb" },
  { primaryColor: "#164e63", secondaryColor: "#ecfeff", accentColor: "#be123c" }
];

const commerceRows: CommerceRow[] = [
  { name: "Signature starter", status: "Active", price: "49,000", stock: 28 },
  { name: "Premium bundle", status: "Draft", price: "89,000", stock: 12 },
  { name: "Seasonal add-on", status: "Hidden", price: "19,000", stock: 44 }
];

const STORAGE_KEY = "webable.admin.draft.v1";

export function BuilderWorkspace() {
  const [prompt, setPrompt] = useState("프리미엄 꽃 정기구독 서비스를 위한 브랜드 사이트");
  const [industry, setIndustry] = useState("flower-subscription");
  const [targetAudience, setTargetAudience] = useState("선물과 공간 연출을 자주 고민하는 30-40대 고객");
  const [tone, setTone] = useState<BrandVoice>("premium");
  const [siteSpec, setSiteSpec] = useState<SiteSpec>(initialSpec);
  const [activeSectionId, setActiveSectionId] = useState("section-hero");
  const [job, setJob] = useState<GenerateJob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "queued" | "published">("idle");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("build");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("content");
  const [history, setHistory] = useState<SiteSpec[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState("방금 전");

  const page = siteSpec.pages[0];
  const activeSection = page.sections.find((section) => section.id === activeSectionId) || page.sections[0];

  const launchReadiness = useMemo(() => {
    const filledSections = page.sections.filter((section) => section.props.title && section.props.body).length;
    return Math.round((filledSections / page.sections.length) * 100);
  }, [page.sections]);

  const pendingAiTasks = job ? 1 : 3;
  const publishChecks = useMemo(
    () => [
      { label: "섹션 제목과 본문 입력", passed: launchReadiness === 100 },
      { label: "SEO 제목 70자 이하", passed: page.seo.title.length > 0 && page.seo.title.length <= 70 },
      { label: "SEO 설명 160자 이하", passed: page.seo.description.length > 0 && page.seo.description.length <= 160 },
      { label: "CTA 버튼 설정", passed: page.sections.some((section) => Boolean(section.props.primaryAction)) }
    ],
    [launchReadiness, page.seo.description, page.seo.title, page.sections]
  );
  const publishReady = publishChecks.every((check) => check.passed);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(STORAGE_KEY);

    if (!savedDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as SiteSpec;
      setSiteSpec(parsed);
      setActiveSectionId(parsed.pages[0]?.sections[0]?.id || "section-hero");
      setSaveState("restored");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    setSaveState("saving");
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(siteSpec));
      setLastSavedAt(
        new Intl.DateTimeFormat("ko-KR", {
          hour: "2-digit",
          minute: "2-digit"
        }).format(new Date())
      );
      setSaveState("saved");
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [siteSpec]);

  function commitSiteSpec(updater: (current: SiteSpec) => SiteSpec) {
    setSiteSpec((current) => {
      const next = updater(current);
      setHistory((items) => [current, ...items].slice(0, 24));
      return next;
    });
    setPublishStatus("idle");
  }

  function handleUndo() {
    const [previous, ...rest] = history;

    if (!previous) {
      return;
    }

    setSiteSpec(previous);
    setHistory(rest);
    setActiveSectionId(previous.pages[0]?.sections[0]?.id || "section-hero");
    setPublishStatus("idle");
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setPublishStatus("idle");

    try {
      const response = await fetch("/api/ai/site-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          industry,
          tone,
          targetAudience
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate site draft");
      }

      const nextJob = (await response.json()) as GenerateJob;
      setJob(nextJob);
      commitSiteSpec(() => nextJob.outputDiff.siteSpec);
      setActiveSectionId(nextJob.outputDiff.siteSpec.pages[0].sections[0].id);
      setWorkspaceMode("build");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSectionChange(sectionId: string, changes: Partial<SectionSpec["props"]>) {
    commitSiteSpec((current) => updateSection(current, sectionId, changes));
  }

  function handleSectionResize(sectionId: string, changes: Partial<SectionSpec["props"]>) {
    setSiteSpec((current) => updateSection(current, sectionId, changes));
    setPublishStatus("idle");
  }

  function captureResizeHistory() {
    setHistory((items) => [siteSpec, ...items].slice(0, 24));
  }

  function handleSeoChange(changes: Partial<SiteSpec["pages"][number]["seo"]>) {
    commitSiteSpec((current) => ({
      ...current,
      pages: current.pages.map((currentPage) =>
        currentPage.id === page.id
          ? {
              ...currentPage,
              seo: {
                ...currentPage.seo,
                ...changes
              }
            }
          : currentPage
      )
    }));
  }

  function addSection(preset: (typeof sectionPresets)[number]) {
    const nextSection: SectionSpec = {
      id: `section-${Date.now()}`,
      type: preset.type,
      props: {
        eyebrow: preset.label,
        title: preset.title,
        body: preset.body,
        primaryAction: preset.type === "cta.publish" ? "상담 예약" : undefined,
        secondaryAction: preset.type === "hero.editorial" ? "사례 보기" : undefined,
        align: preset.align,
        background: preset.background,
        width: preset.type === "hero.editorial" || preset.type === "cta.publish" ? "wide" : "contained",
        mediaStyle: preset.mediaStyle,
        minHeight: preset.type === "hero.editorial" ? 430 : preset.type === "cta.publish" ? 280 : 320,
        containerWidth: preset.type === "hero.editorial" || preset.type === "cta.publish" ? 980 : 900,
        contentMaxWidth: preset.align === "split" ? 980 : 820,
        offsetX: 0,
        contentAlign: preset.align === "center" ? "center" : "left",
        verticalAlign: preset.type === "hero.editorial" || preset.type === "cta.publish" ? "middle" : "top",
        items:
          preset.type === "feature.grid" || preset.type === "process.steps"
            ? [
                { title: "콘텐츠", body: "AI가 만든 초안을 바로 수정합니다." },
                { title: "운영", body: "승인, 게시, 롤백 흐름을 관리합니다." },
                { title: "전환", body: "문의와 구매로 이어지는 버튼을 배치합니다." }
              ]
            : preset.type === "product.showcase"
              ? [
                  { title: "베이직", body: "처음 시작하는 고객에게 맞는 기본 구성", value: "49,000원", meta: "추천" },
                  { title: "프리미엄", body: "선물과 정기 이용에 적합한 인기 구성", value: "89,000원", meta: "인기" },
                  { title: "커스텀", body: "브랜드 목적에 맞춘 맞춤 상담", value: "상담", meta: "맞춤" }
                ]
              : preset.type === "gallery.masonry"
                ? [
                    { title: "Mood 01", body: "브랜드 대표 이미지", meta: "wide" },
                    { title: "Mood 02", body: "상품 사용 장면", meta: "tall" },
                    { title: "Mood 03", body: "고객 사례", meta: "square" }
                  ]
                : preset.type === "testimonial.wall"
                  ? [
                      { title: "김서연", body: "문의부터 배송까지 빠르고 친절해서 다시 이용하고 싶어요.", meta: "재구매 고객" },
                      { title: "박민준", body: "사이트에서 상품 차이가 명확해서 선택이 쉬웠습니다.", meta: "첫 구매 고객" },
                      { title: "이하나", body: "예약 흐름이 간단해서 모바일에서도 불편함이 없었습니다.", meta: "모바일 예약" }
                    ]
                  : preset.type === "faq.accordion"
                    ? [
                        { title: "배송일을 지정할 수 있나요?", body: "가능합니다. 주문 단계에서 희망 날짜를 선택할 수 있습니다." },
                        { title: "정기구독은 언제든 해지되나요?", body: "마이페이지에서 다음 결제 전까지 변경하거나 해지할 수 있습니다." },
                        { title: "기업 선물도 가능한가요?", body: "수량과 일정에 맞춰 별도 견적을 제공합니다." }
                      ]
            : undefined
      }
    };

    commitSiteSpec((current) => ({
      ...current,
      pages: current.pages.map((currentPage) =>
        currentPage.id === page.id
          ? {
              ...currentPage,
              sections: [...currentPage.sections, nextSection]
            }
          : currentPage
      )
    }));
    setActiveSectionId(nextSection.id);
    setWorkspaceMode("build");
  }

  function duplicateSection(section: SectionSpec) {
    const copy: SectionSpec = {
      ...section,
      id: `section-${Date.now()}`,
      props: {
        ...section.props,
        eyebrow: `${section.props.eyebrow || "Section"} copy`
      }
    };

    commitSiteSpec((current) => ({
      ...current,
      pages: current.pages.map((currentPage) =>
        currentPage.id === page.id
          ? {
              ...currentPage,
              sections: currentPage.sections.flatMap((item) => (item.id === section.id ? [item, copy] : [item]))
            }
          : currentPage
      )
    }));
    setActiveSectionId(copy.id);
  }

  function deleteSection(sectionId: string) {
    if (page.sections.length <= 1) {
      return;
    }

    commitSiteSpec((current) => ({
      ...current,
      pages: current.pages.map((currentPage) =>
        currentPage.id === page.id
          ? {
              ...currentPage,
              sections: currentPage.sections.filter((section) => section.id !== sectionId)
            }
          : currentPage
      )
    }));
    setActiveSectionId(page.sections.find((section) => section.id !== sectionId)?.id || page.sections[0].id);
  }

  function applyTheme(theme: (typeof themeSwatches)[number]) {
    commitSiteSpec((current) => ({
      ...current,
      site: {
        ...current.site,
        theme: {
          ...current.site.theme,
          ...theme
        }
      }
    }));
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const currentIndex = page.sections.findIndex((section) => section.id === sectionId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= page.sections.length) {
      return;
    }

    commitSiteSpec((current) => ({
      ...current,
      pages: current.pages.map((currentPage) => {
        if (currentPage.id !== page.id) {
          return currentPage;
        }

        const sections = [...currentPage.sections];
        const [moved] = sections.splice(currentIndex, 1);
        sections.splice(nextIndex, 0, moved);

        return {
          ...currentPage,
          sections
        };
      })
    }));
  }

  async function handlePublish() {
    if (!publishReady) {
      return;
    }

    setPublishStatus("queued");
    await fetch(`/api/sites/${siteSpec.site.slug}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Operator approved MVP draft"
      })
    });
    window.setTimeout(() => setPublishStatus("published"), 700);
  }

  return (
    <main className="appShell">
      <aside className="rail" aria-label="WEBABLE modules">
        <div className="railLogo">
          <Sparkles size={20} />
        </div>
        <nav>
          {navItems.map((item) => (
            <button
              className={workspaceMode === item.id ? "railButton active" : "railButton"}
              key={item.id}
              onClick={() => setWorkspaceMode(item.id)}
              title={item.label}
              type="button"
            >
              {item.icon}
            </button>
          ))}
        </nav>
      </aside>

      <section className="leftPanel" aria-label="Site controls">
        <div className="projectHeader">
          <div>
            <p className="eyebrow">WEBABLE Studio</p>
            <h1>{siteSpec.site.name}</h1>
          </div>
          <button className="iconButton dark" title="Notifications" type="button">
            <Bell size={17} />
          </button>
        </div>

        <div className="searchBox">
          <Search size={16} />
          <span>사이트, 페이지, 상품 검색</span>
        </div>

        <ModePanel
          activeSection={activeSection}
          addSection={addSection}
          commerceRows={commerceRows}
          handleGenerate={handleGenerate}
          industry={industry}
          isGenerating={isGenerating}
          page={page}
          pendingAiTasks={pendingAiTasks}
          prompt={prompt}
          setActiveSectionId={setActiveSectionId}
          setIndustry={setIndustry}
          setPrompt={setPrompt}
          setTargetAudience={setTargetAudience}
          setTone={setTone}
          siteSpec={siteSpec}
          targetAudience={targetAudience}
          tone={tone}
          workspaceMode={workspaceMode}
        />
      </section>

      <section className="mainStage" aria-label="Builder canvas">
        <header className="commandBar">
          <div className="crumbs">
            <Home size={16} />
            <span>{siteSpec.site.slug}.webable.site</span>
            <ChevronRight size={14} />
            <strong>{page.title}</strong>
          </div>
          <div className="commandActions">
            <button className="toolButton" disabled={history.length === 0} onClick={handleUndo} type="button">
              <Undo2 size={16} />
              되돌리기
            </button>
            <div className="deviceSwitch" aria-label="Preview device">
              <button
                className={deviceMode === "desktop" ? "active" : ""}
                onClick={() => setDeviceMode("desktop")}
                title="Desktop"
                type="button"
              >
                <Monitor size={16} />
              </button>
              <button
                className={deviceMode === "tablet" ? "active" : ""}
                onClick={() => setDeviceMode("tablet")}
                title="Tablet"
                type="button"
              >
                <Tablet size={16} />
              </button>
              <button
                className={deviceMode === "mobile" ? "active" : ""}
                onClick={() => setDeviceMode("mobile")}
                title="Mobile"
                type="button"
              >
                <Smartphone size={16} />
              </button>
            </div>
            <button className="toolButton" type="button">
              <Eye size={16} />
              미리보기
            </button>
            <button className="publishButton" disabled={!publishReady} type="button" onClick={handlePublish}>
              {publishStatus === "published" ? <Check size={17} /> : <Rocket size={17} />}
              {publishStatus === "published" ? "게시 완료" : "게시 요청"}
            </button>
          </div>
        </header>

        <div className="statusGrid">
          <StatusTile icon={<ShieldCheck size={18} />} label="승인 정책" value="수동 승인" />
          <StatusTile icon={<Clock3 size={18} />} label="런칭 준비도" value={`${launchReadiness}%`} />
          <StatusTile icon={<Bot size={18} />} label="AI 작업" value={`${pendingAiTasks}건`} />
          <StatusTile
            icon={<Check size={18} />}
            label="자동저장"
            value={saveState === "saving" ? "Saving" : saveState === "restored" ? "Restored" : lastSavedAt}
          />
          <StatusTile
            icon={<Globe2 size={18} />}
            label="게시 상태"
            value={publishStatus === "published" ? "Published" : publishStatus === "queued" ? "Queued" : "Draft"}
          />
        </div>

        <div className="designToolDock" aria-label="Design tools">
          <button className="active" type="button">
            <PenLine size={16} />
            선택
          </button>
          <button type="button">
            <LayoutTemplate size={16} />
            프레임
          </button>
          <button type="button">
            <FileText size={16} />
            텍스트
          </button>
          <button type="button">
            <Palette size={16} />
            스타일
          </button>
          <span>Zoom 82%</span>
        </div>

        <div className={`canvasFrame ${deviceMode}`}>
          <SitePreview
            activeSectionId={activeSection.id}
            onResizeSection={handleSectionResize}
            onResizeStart={captureResizeHistory}
            onSelectSection={setActiveSectionId}
            siteSpec={siteSpec}
          />
        </div>
      </section>

      <aside className="inspector" aria-label="Section inspector">
        <div className="inspectorHeader">
          <div>
            <p className="eyebrow">Inspector</p>
            <h2>{activeSection.props.eyebrow || activeSection.type}</h2>
          </div>
          <div className="iconRow">
            <button className="iconButton" onClick={() => duplicateSection(activeSection)} title="Duplicate" type="button">
              <Copy size={16} />
            </button>
            <button className="iconButton" onClick={() => moveSection(activeSection.id, -1)} title="Move up" type="button">
              <ArrowUp size={16} />
            </button>
            <button className="iconButton" onClick={() => moveSection(activeSection.id, 1)} title="Move down" type="button">
              <ArrowDown size={16} />
            </button>
            <button className="iconButton danger" onClick={() => deleteSection(activeSection.id)} title="Delete" type="button">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="tabList" role="tablist">
          {(["content", "design", "seo"] as InspectorTab[]).map((tabName) => (
            <button
              className={inspectorTab === tabName ? "active" : ""}
              key={tabName}
              onClick={() => setInspectorTab(tabName)}
              type="button"
            >
              {tabName}
            </button>
          ))}
        </div>

        {inspectorTab === "content" ? (
          <SectionEditor section={activeSection} onChange={handleSectionChange} />
        ) : null}
        {inspectorTab === "design" ? <DesignPanel applyTheme={applyTheme} siteSpec={siteSpec} /> : null}
        {inspectorTab === "seo" ? <SeoPanel onChange={handleSeoChange} page={page} /> : null}

        <div className="reviewBox">
          <div>
            <Lock size={16} />
            <strong>{publishReady ? "게시 준비 완료" : "게시 전 확인 필요"}</strong>
          </div>
          <p>AI 변경과 편집 내용은 자동저장되며, 아래 조건을 통과한 뒤 게시 요청할 수 있습니다.</p>
          <ul className="publishChecklist">
            {publishChecks.map((check) => (
              <li className={check.passed ? "passed" : ""} key={check.label}>
                <Check size={14} />
                {check.label}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}

function ModePanel({
  activeSection,
  addSection,
  commerceRows,
  handleGenerate,
  industry,
  isGenerating,
  page,
  pendingAiTasks,
  prompt,
  setActiveSectionId,
  setIndustry,
  setPrompt,
  setTargetAudience,
  setTone,
  siteSpec,
  targetAudience,
  tone,
  workspaceMode
}: {
  activeSection: SectionSpec;
  addSection: (preset: (typeof sectionPresets)[number]) => void;
  commerceRows: CommerceRow[];
  handleGenerate: (event: FormEvent<HTMLFormElement>) => void;
  industry: string;
  isGenerating: boolean;
  page: SiteSpec["pages"][number];
  pendingAiTasks: number;
  prompt: string;
  setActiveSectionId: (id: string) => void;
  setIndustry: (value: string) => void;
  setPrompt: (value: string) => void;
  setTargetAudience: (value: string) => void;
  setTone: (value: BrandVoice) => void;
  siteSpec: SiteSpec;
  targetAudience: string;
  tone: BrandVoice;
  workspaceMode: WorkspaceMode;
}) {
  if (workspaceMode === "pages") {
    return (
      <div className="panelStack">
        <PanelTitle icon={<FileText size={18} />} title="페이지" subtitle="사이트 구조" />
        {siteSpec.pages.map((sitePage) => (
          <button className="pageRow active" key={sitePage.id} type="button">
            <span>{sitePage.path}</span>
            <strong>{sitePage.title}</strong>
          </button>
        ))}
        <button className="addButton" type="button">
          <Plus size={16} />
          새 페이지 추가
        </button>
      </div>
    );
  }

  if (workspaceMode === "commerce") {
    return (
      <div className="panelStack">
        <PanelTitle icon={<ShoppingBag size={18} />} title="커머스" subtitle="상품/주문 스냅샷" />
        {commerceRows.map((row) => (
          <div className="dataRow" key={row.name}>
            <div>
              <strong>{row.name}</strong>
              <span>{row.status}</span>
            </div>
            <div>
              <strong>{row.price}</strong>
              <span>{row.stock} left</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (workspaceMode === "crm") {
    return (
      <div className="panelStack">
        <PanelTitle icon={<Users size={18} />} title="CRM" subtitle="고객 운영" />
        <MetricLine label="신규 리드" value="128" />
        <MetricLine label="예약 전환" value="18.4%" />
        <MetricLine label="재방문 고객" value="42" />
        <div className="activityList">
          <ActivityItem label="VIP 세그먼트 생성" time="3분 전" />
          <ActivityItem label="주문 문의 요약 완료" time="18분 전" />
          <ActivityItem label="캠페인 초안 대기" time="1시간 전" />
        </div>
      </div>
    );
  }

  if (workspaceMode === "ai") {
    return (
      <div className="panelStack">
        <PanelTitle icon={<Bot size={18} />} title="AI 운영" subtitle={`${pendingAiTasks} tasks waiting`} />
        <form className="generatorForm" onSubmit={handleGenerate}>
          <label htmlFor="brand-prompt">
            <span>브랜드 설명</span>
            <textarea
              id="brand-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={5}
              placeholder="예: 프리미엄 꽃 정기구독 서비스"
            />
          </label>
          <div className="fieldPair">
            <label htmlFor="brand-industry">
              <span>업종</span>
              <input id="brand-industry" value={industry} onChange={(event) => setIndustry(event.target.value)} />
            </label>
            <label htmlFor="brand-tone">
              <span>톤</span>
              <select id="brand-tone" value={tone} onChange={(event) => setTone(event.target.value as BrandVoice)}>
                {voiceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label htmlFor="target-audience">
            <span>타깃 고객</span>
            <input
              id="target-audience"
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
            />
          </label>
          <button className="primaryButton" type="submit" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />}
            {isGenerating ? "생성 중" : "AI 사이트 초안 생성"}
          </button>
        </form>
        <ActivityItem label="SEO 제목 1건 승인 대기" time="needs approval" />
        <ActivityItem label="상품 상세 카피 생성 가능" time="ready" />
      </div>
    );
  }

  if (workspaceMode === "settings") {
    return (
      <div className="panelStack">
        <PanelTitle icon={<Settings size={18} />} title="설정" subtitle="도메인/권한/보안" />
        <MetricLine label="Custom domain" value="미연결" />
        <MetricLine label="SSL" value="자동" />
        <MetricLine label="역할" value="Owner" />
        <MetricLine label="감사 로그" value="켜짐" />
      </div>
    );
  }

  return (
    <div className="panelStack">
      <PanelTitle icon={<LayoutTemplate size={18} />} title="섹션" subtitle={`${page.sections.length} blocks`} />
      <div className="sectionList" aria-label="Sections">
        {page.sections.map((section, index) => (
          <button
            className={section.id === activeSection.id ? "sectionTab active" : "sectionTab"}
            key={section.id}
            onClick={() => setActiveSectionId(section.id)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{section.props.eyebrow || section.type}</strong>
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        ))}
      </div>
      <PanelTitle icon={<Plus size={18} />} title="섹션 추가" subtitle="라이브러리" />
      <div className="presetGrid">
        {sectionPresets.map((preset) => (
          <button key={preset.label} onClick={() => addSection(preset)} type="button">
            <Plus size={15} />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  onChange
}: {
  section: SectionSpec;
  onChange: (sectionId: string, changes: Partial<SectionSpec["props"]>) => void;
}) {
  return (
    <div className="sectionEditor">
      <div className="editorTitle">
        <PenLine aria-hidden="true" size={18} />
        <strong>{section.type}</strong>
      </div>
      <label htmlFor={`${section.id}-eyebrow`}>
        <span>Eyebrow</span>
        <input
          id={`${section.id}-eyebrow`}
          value={section.props.eyebrow || ""}
          onChange={(event) => onChange(section.id, { eyebrow: event.target.value })}
        />
      </label>
      <label htmlFor={`${section.id}-title`}>
        <span>Title</span>
        <textarea
          id={`${section.id}-title`}
          value={section.props.title}
          onChange={(event) => onChange(section.id, { title: event.target.value })}
          rows={3}
        />
      </label>
      <label htmlFor={`${section.id}-body`}>
        <span>Body</span>
        <textarea
          id={`${section.id}-body`}
          value={section.props.body}
          onChange={(event) => onChange(section.id, { body: event.target.value })}
          rows={5}
        />
      </label>
      <div className="fieldPair">
        <label htmlFor={`${section.id}-primary`}>
          <span>Primary CTA</span>
          <input
            id={`${section.id}-primary`}
            value={section.props.primaryAction || ""}
            onChange={(event) => onChange(section.id, { primaryAction: event.target.value })}
          />
        </label>
        <label htmlFor={`${section.id}-secondary`}>
          <span>Secondary</span>
          <input
            id={`${section.id}-secondary`}
            value={section.props.secondaryAction || ""}
            onChange={(event) => onChange(section.id, { secondaryAction: event.target.value })}
          />
        </label>
      </div>
      <div className="controlGroup">
        <strong>Section style</strong>
        <div className="rangeField">
          <label htmlFor={`${section.id}-height`}>
            <span>Height</span>
            <b>{section.props.minHeight || 320}px</b>
          </label>
          <input
            id={`${section.id}-height`}
            max={900}
            min={180}
            onChange={(event) => onChange(section.id, { minHeight: Number(event.target.value) })}
            type="range"
            value={section.props.minHeight || 320}
          />
        </div>
        <div className="rangeField">
          <label htmlFor={`${section.id}-offset-x`}>
            <span>X position</span>
            <b>{section.props.offsetX || 0}px</b>
          </label>
          <input
            id={`${section.id}-offset-x`}
            max={320}
            min={-320}
            onChange={(event) => onChange(section.id, { offsetX: Number(event.target.value) })}
            type="range"
            value={section.props.offsetX || 0}
          />
        </div>
        <div className="nudgeGrid" aria-label="Container position">
          <button
            onClick={() => onChange(section.id, { offsetX: clamp((section.props.offsetX || 0) - 40, -320, 320) })}
            type="button"
          >
            Left
          </button>
          <button onClick={() => onChange(section.id, { offsetX: 0 })} type="button">
            Center
          </button>
          <button
            onClick={() => onChange(section.id, { offsetX: clamp((section.props.offsetX || 0) + 40, -320, 320) })}
            type="button"
          >
            Right
          </button>
        </div>
        <SegmentedControl
          label="Content align"
          options={["left", "center", "right"]}
          value={section.props.contentAlign || "left"}
          onChange={(value) => onChange(section.id, { contentAlign: value as SectionSpec["props"]["contentAlign"] })}
        />
        <SegmentedControl
          label="Vertical"
          options={["top", "middle", "bottom"]}
          value={section.props.verticalAlign || "top"}
          onChange={(value) => onChange(section.id, { verticalAlign: value as SectionSpec["props"]["verticalAlign"] })}
        />
        <div className="rangeField">
          <label htmlFor={`${section.id}-container-width`}>
            <span>Container width</span>
            <b>{section.props.containerWidth || 980}px</b>
          </label>
          <input
            id={`${section.id}-container-width`}
            max={1180}
            min={280}
            onChange={(event) => onChange(section.id, { containerWidth: Number(event.target.value) })}
            type="range"
            value={section.props.containerWidth || 980}
          />
        </div>
        <div className="rangeField">
          <label htmlFor={`${section.id}-content-width`}>
            <span>Inner content</span>
            <b>{section.props.contentMaxWidth || 820}px</b>
          </label>
          <input
            id={`${section.id}-content-width`}
            max={1180}
            min={260}
            onChange={(event) => onChange(section.id, { contentMaxWidth: Number(event.target.value) })}
            type="range"
            value={section.props.contentMaxWidth || 820}
          />
        </div>
        <SegmentedControl
          label="Background"
          options={["dark", "light", "soft", "brand", "image"]}
          value={section.props.background || "light"}
          onChange={(value) => onChange(section.id, { background: value as SectionSpec["props"]["background"] })}
        />
        <SegmentedControl
          label="Layout"
          options={["left", "center", "split"]}
          value={section.props.align || "left"}
          onChange={(value) => onChange(section.id, { align: value as SectionSpec["props"]["align"] })}
        />
        <SegmentedControl
          label="Width"
          options={["contained", "wide", "full"]}
          value={section.props.width || "contained"}
          onChange={(value) => onChange(section.id, { width: value as SectionSpec["props"]["width"] })}
        />
        <SegmentedControl
          label="Media"
          options={["none", "photo", "mockup", "pattern"]}
          value={section.props.mediaStyle || "none"}
          onChange={(value) => onChange(section.id, { mediaStyle: value as SectionSpec["props"]["mediaStyle"] })}
        />
      </div>
    </div>
  );
}

function SegmentedControl({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <div className="segmentedField">
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <button className={value === option ? "active" : ""} key={option} onClick={() => onChange(option)} type="button">
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function DesignPanel({
  applyTheme,
  siteSpec
}: {
  applyTheme: (theme: (typeof themeSwatches)[number]) => void;
  siteSpec: SiteSpec;
}) {
  return (
    <div className="sectionEditor">
      <div className="editorTitle">
        <Palette size={18} />
        <strong>Theme tokens</strong>
      </div>
      <div className="swatchGrid">
        {themeSwatches.map((theme) => (
          <button
            aria-label={`Apply ${theme.primaryColor} theme`}
            className={siteSpec.site.theme.primaryColor === theme.primaryColor ? "active" : ""}
            key={theme.primaryColor}
            onClick={() => applyTheme(theme)}
            type="button"
          >
            <span style={{ background: theme.primaryColor }} />
            <span style={{ background: theme.secondaryColor }} />
            <span style={{ background: theme.accentColor }} />
          </button>
        ))}
      </div>
      <MetricLine label="Primary" value={siteSpec.site.theme.primaryColor} />
      <MetricLine label="Accent" value={siteSpec.site.theme.accentColor} />
      <MetricLine label="Radius" value={siteSpec.site.theme.radius} />
    </div>
  );
}

function SeoPanel({
  onChange,
  page
}: {
  onChange: (changes: Partial<SiteSpec["pages"][number]["seo"]>) => void;
  page: SiteSpec["pages"][number];
}) {
  return (
    <div className="sectionEditor">
      <div className="editorTitle">
        <Globe2 size={18} />
        <strong>Search preview</strong>
      </div>
      <label htmlFor="seo-title">
        <span>SEO title</span>
        <input id="seo-title" value={page.seo.title} onChange={(event) => onChange({ title: event.target.value })} />
      </label>
      <label htmlFor="seo-description">
        <span>Description</span>
        <textarea
          id="seo-description"
          rows={5}
          value={page.seo.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </label>
      <div className="serpCard">
        <span>{page.path}</span>
        <strong>{page.seo.title}</strong>
        <p>{page.seo.description}</p>
      </div>
    </div>
  );
}

function SitePreview({
  activeSectionId,
  onResizeSection,
  onResizeStart,
  onSelectSection,
  siteSpec
}: {
  activeSectionId: string;
  onResizeSection: (sectionId: string, changes: Partial<SectionSpec["props"]>) => void;
  onResizeStart: () => void;
  onSelectSection: (sectionId: string) => void;
  siteSpec: SiteSpec;
}) {
  const page = siteSpec.pages[0];
  const theme = siteSpec.site.theme;

  return (
    <article
      className="sitePreview"
      style={
        {
          "--preview-primary": theme.primaryColor,
          "--preview-secondary": theme.secondaryColor,
          "--preview-accent": theme.accentColor
        } as React.CSSProperties
      }
    >
      <nav className="previewNav">
        <span>{siteSpec.site.name}</span>
        <div>
          <a>About</a>
          <a>Offer</a>
          <a>Store</a>
          <a>Contact</a>
        </div>
      </nav>

      {page.sections.map((section) => (
        <PreviewSection
          active={section.id === activeSectionId}
          key={section.id}
          onResize={(changes) => onResizeSection(section.id, changes)}
          onResizeStart={onResizeStart}
          onSelect={() => onSelectSection(section.id)}
          section={section}
        />
      ))}
    </article>
  );
}

function PreviewSection({
  active,
  onResize,
  onResizeStart,
  onSelect,
  section
}: {
  active: boolean;
  onResize: (changes: Partial<SectionSpec["props"]>) => void;
  onResizeStart: () => void;
  onSelect: () => void;
  section: SectionSpec;
}) {
  const sectionClassName = getPreviewSectionClassName(section, active);
  const sectionStyle = getPreviewSectionStyle(section);

  if (section.type === "hero.editorial") {
    return (
      <section className={`${sectionClassName} previewHero`} onClick={onSelect} style={sectionStyle}>
        <div className="sectionCopy">
          <p>{section.props.eyebrow}</p>
          <h2>{section.props.title}</h2>
          <span>{section.props.body}</span>
          <div className="previewActions">
            {section.props.primaryAction ? <button>{section.props.primaryAction}</button> : null}
            {section.props.secondaryAction ? <a>{section.props.secondaryAction}</a> : null}
          </div>
        </div>
        <PreviewMedia mediaStyle={section.props.mediaStyle || "photo"} />
        {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
      </section>
    );
  }

  if (section.type === "proof.metrics") {
    return (
      <section className={sectionClassName} onClick={onSelect} style={sectionStyle}>
        <p>{section.props.eyebrow}</p>
        <h3>{section.props.title}</h3>
        <span>{section.props.body}</span>
        <div className="metricGrid">
          {section.props.items?.map((item) => (
            <div className="metricTile" key={item.title}>
              <strong>{item.value}</strong>
              <span>{item.title}</span>
            </div>
          ))}
        </div>
        {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
      </section>
    );
  }

  if (section.type === "product.showcase") {
    return (
      <section className={sectionClassName} onClick={onSelect} style={sectionStyle}>
        <p>{section.props.eyebrow}</p>
        <h3>{section.props.title}</h3>
        <span>{section.props.body}</span>
        <div className="productGrid">
          {section.props.items?.map((item) => (
            <div className="productCard" key={item.title}>
              <div className="productImage" />
              <span>{item.meta}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
              <b>{item.value}</b>
            </div>
          ))}
        </div>
        {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
      </section>
    );
  }

  if (section.type === "gallery.masonry") {
    return (
      <section className={sectionClassName} onClick={onSelect} style={sectionStyle}>
        <p>{section.props.eyebrow}</p>
        <h3>{section.props.title}</h3>
        <span>{section.props.body}</span>
        <div className="galleryGrid">
          {section.props.items?.map((item, index) => (
            <div className={`galleryTile tile${index + 1}`} key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </div>
          ))}
        </div>
        {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
      </section>
    );
  }

  if (section.type === "testimonial.wall") {
    return (
      <section className={sectionClassName} onClick={onSelect} style={sectionStyle}>
        <p>{section.props.eyebrow}</p>
        <h3>{section.props.title}</h3>
        <span>{section.props.body}</span>
        <div className="reviewGrid">
          {section.props.items?.map((item) => (
            <blockquote key={item.title}>
              <p>{item.body}</p>
              <footer>
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </footer>
            </blockquote>
          ))}
        </div>
        {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
      </section>
    );
  }

  if (section.type === "faq.accordion") {
    return (
      <section className={sectionClassName} onClick={onSelect} style={sectionStyle}>
        <p>{section.props.eyebrow}</p>
        <h3>{section.props.title}</h3>
        <span>{section.props.body}</span>
        <div className="faqList">
          {section.props.items?.map((item) => (
            <details key={item.title} open>
              <summary>{item.title}</summary>
              <p>{item.body}</p>
            </details>
          ))}
        </div>
        {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
      </section>
    );
  }

  if (section.type === "contact.form") {
    return (
      <section className={`${sectionClassName} contactPreview`} onClick={onSelect} style={sectionStyle}>
        <div className="sectionCopy">
          <p>{section.props.eyebrow}</p>
          <h3>{section.props.title}</h3>
          <span>{section.props.body}</span>
        </div>
        <div className="formMock">
          <span>이름</span>
          <span>연락처</span>
          <span>문의 내용</span>
          <button>문의 보내기</button>
        </div>
        {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
      </section>
    );
  }

  return (
    <section className={sectionClassName} onClick={onSelect} style={sectionStyle}>
      <p>{section.props.eyebrow}</p>
      <h3>{section.props.title}</h3>
      <span>{section.props.body}</span>
      {section.props.items ? (
        <div className="previewItems">
          {section.props.items.map((item) => (
            <div className="previewItem" key={item.title}>
              <FileText size={16} />
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </div>
          ))}
        </div>
      ) : null}
      {section.props.primaryAction ? <button className="previewCta">{section.props.primaryAction}</button> : null}
      {active ? <ResizeHandles onResize={onResize} onResizeStart={onResizeStart} section={section} /> : null}
    </section>
  );
}

function ResizeHandles({
  onResize,
  onResizeStart,
  section
}: {
  onResize: (changes: Partial<SectionSpec["props"]>) => void;
  onResizeStart: () => void;
  section: SectionSpec;
}) {
  function startResize(axis: ResizeAxis, event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (document.body.classList.contains("is-resizing-section")) {
      return;
    }

    if ("pointerId" in event) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    onResizeStart();

    const startX = event.clientX;
    const startY = event.clientY;
    const sectionElement = event.currentTarget.closest("section");
    const renderedHeight = sectionElement?.getBoundingClientRect().height || 0;
    const renderedWidth = sectionElement?.getBoundingClientRect().width || 0;
    const startHeight = Math.max(section.props.minHeight || 320, Math.round(renderedHeight));
    const startWidth = Math.round(renderedWidth || section.props.containerWidth || 980);
    function handleMove(moveEvent: PointerEvent | MouseEvent) {
      const nextHeight = Math.round(clamp(startHeight + moveEvent.clientY - startY, 180, 900));
      const nextWidth = Math.round(clamp(startWidth + moveEvent.clientX - startX, 280, 1180));

      onResize({
        ...(axis === "y" || axis === "xy" ? { minHeight: nextHeight } : {}),
        ...(axis === "x" || axis === "xy" ? { containerWidth: nextWidth } : {})
      });
    }

    function stopResize() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopResize);
      document.body.classList.remove("is-resizing-section");
    }

    document.body.classList.add("is-resizing-section");
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopResize);
  }

  return (
    <div className="resizeOverlay" aria-label="Resize selected section">
      <input
        aria-label="선택 섹션 폭"
        className="canvasResizeRange widthRange"
        max={1180}
        min={280}
        onChange={(event) => onResize({ containerWidth: Number(event.target.value) })}
        onClick={(event) => event.stopPropagation()}
        type="range"
        value={section.props.containerWidth || 980}
      />
      <div className="canvasResizeStepper widthStepper" onClick={(event) => event.stopPropagation()}>
        <button
          onClick={() => onResize({ containerWidth: getNextContainerWidth(section.props.containerWidth || 980, -1) })}
          type="button"
        >
          -
        </button>
        <span>{section.props.containerWidth || 980}px</span>
        <button
          onClick={() => onResize({ containerWidth: getNextContainerWidth(section.props.containerWidth || 980, 1) })}
          type="button"
        >
          +
        </button>
      </div>
      <div className="canvasMovePad" onClick={(event) => event.stopPropagation()}>
        <button onClick={() => onResize({ offsetX: clamp((section.props.offsetX || 0) - 40, -320, 320) })} type="button">
          ←
        </button>
        <button onClick={() => onResize({ offsetX: 0 })} type="button">
          •
        </button>
        <button onClick={() => onResize({ offsetX: clamp((section.props.offsetX || 0) + 40, -320, 320) })} type="button">
          →
        </button>
      </div>
      <input
        aria-label="선택 섹션 높이"
        className="canvasResizeRange heightRange"
        max={900}
        min={180}
        onChange={(event) => onResize({ minHeight: Number(event.target.value) })}
        onClick={(event) => event.stopPropagation()}
        type="range"
        value={section.props.minHeight || 320}
      />
      <button
        className="resizeHandle east"
        onMouseDown={(event) => startResize("x", event)}
        onPointerDown={(event) => startResize("x", event)}
        title="가로 크기 조절"
        type="button"
      />
      <button
        className="resizeHandle south"
        onMouseDown={(event) => startResize("y", event)}
        onPointerDown={(event) => startResize("y", event)}
        title="세로 크기 조절"
        type="button"
      />
      <button
        className="resizeHandle southeast"
        onMouseDown={(event) => startResize("xy", event)}
        onPointerDown={(event) => startResize("xy", event)}
        title="가로/세로 크기 조절"
        type="button"
      />
    </div>
  );
}

function getPreviewSectionClassName(section: SectionSpec, active: boolean) {
  return [
    "previewBand",
    active ? "selected" : "",
    `bg-${section.props.background || "light"}`,
    `align-${section.props.contentAlign || section.props.align || "left"}`,
    `valign-${section.props.verticalAlign || "top"}`,
    `width-${section.props.width || "contained"}`,
    `media-${section.props.mediaStyle || "none"}`
  ]
    .filter(Boolean)
    .join(" ");
}

function getPreviewSectionStyle(section: SectionSpec) {
  return {
    "--section-min-height": `${section.props.minHeight || 320}px`,
    "--section-container-width": `${section.props.containerWidth || 980}px`,
    "--section-content-width": `${section.props.contentMaxWidth || 820}px`,
    "--section-offset-x": `${section.props.offsetX || 0}px`
  } as React.CSSProperties;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNextContainerWidth(currentWidth: number, direction: -1 | 1) {
  if (direction === -1 && currentWidth > 640) {
    return 560;
  }

  return clamp(currentWidth + direction * 80, 280, 1180);
}

function PreviewMedia({ mediaStyle }: { mediaStyle: NonNullable<SectionSpec["props"]["mediaStyle"]> }) {
  if (mediaStyle === "none") {
    return null;
  }

  return (
    <div className={`previewMedia ${mediaStyle}`}>
      <span />
      <strong>{mediaStyle === "mockup" ? "Live booking" : mediaStyle === "pattern" ? "Brand system" : "Visual story"}</strong>
      <p>{mediaStyle === "photo" ? "상품과 분위기를 보여주는 대표 비주얼" : "서비스 상태를 한눈에 보여주는 디자인 영역"}</p>
    </div>
  );
}

function PanelTitle({ icon, subtitle, title }: { icon: React.ReactNode; subtitle: string; title: string }) {
  return (
    <div className="panelTitle">
      {icon}
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function StatusTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="statusTile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="metricLine">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActivityItem({ label, time }: { label: string; time: string }) {
  return (
    <div className="activityItem">
      <Activity size={15} />
      <strong>{label}</strong>
      <span>{time}</span>
    </div>
  );
}
