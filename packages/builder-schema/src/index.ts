export type BrandVoice =
  | "minimal"
  | "friendly"
  | "premium"
  | "playful"
  | "professional"
  | "bold";

export type SectionType =
  | "hero.editorial"
  | "feature.grid"
  | "process.steps"
  | "proof.metrics"
  | "product.showcase"
  | "gallery.masonry"
  | "testimonial.wall"
  | "faq.accordion"
  | "contact.form"
  | "cta.publish";

export type ThemeRadius = "none" | "small" | "medium" | "large" | "pill";

export type SiteTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPairing: string;
  radius: ThemeRadius;
};

export type SiteSpec = {
  schemaVersion: 1;
  site: {
    name: string;
    slug: string;
    industry: string;
    targetAudience: string;
    brandVoice: BrandVoice;
    theme: SiteTheme;
  };
  pages: PageSpec[];
  aiMetadata: {
    prompt: string;
    model: string;
    createdAt: string;
    safetyChecks: string[];
    estimatedCost: number;
  };
};

export type PageSpec = {
  id: string;
  path: string;
  title: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  sections: SectionSpec[];
};

export type SectionSpec = {
  id: string;
  type: SectionType;
  props: {
    eyebrow?: string;
    title: string;
    body: string;
    primaryAction?: string;
    secondaryAction?: string;
    align?: "left" | "center" | "split";
    background?: "dark" | "light" | "soft" | "brand" | "image";
    width?: "contained" | "wide" | "full";
    mediaStyle?: "none" | "photo" | "mockup" | "pattern";
    minHeight?: number;
    containerWidth?: number;
    contentMaxWidth?: number;
    offsetX?: number;
    contentAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    items?: Array<{
      title: string;
      body: string;
      value?: string;
      meta?: string;
    }>;
  };
};

export type SiteGenerateInput = {
  prompt: string;
  industry: string;
  tone: BrandVoice;
  targetAudience: string;
};

const palettes: Record<BrandVoice, Pick<SiteTheme, "primaryColor" | "secondaryColor" | "accentColor">> = {
  minimal: {
    primaryColor: "#111827",
    secondaryColor: "#E5E7EB",
    accentColor: "#0F766E"
  },
  friendly: {
    primaryColor: "#2563EB",
    secondaryColor: "#DCFCE7",
    accentColor: "#F97316"
  },
  premium: {
    primaryColor: "#0F172A",
    secondaryColor: "#F8FAFC",
    accentColor: "#B45309"
  },
  playful: {
    primaryColor: "#BE123C",
    secondaryColor: "#FEF3C7",
    accentColor: "#0EA5E9"
  },
  professional: {
    primaryColor: "#1D4ED8",
    secondaryColor: "#F1F5F9",
    accentColor: "#059669"
  },
  bold: {
    primaryColor: "#B91C1C",
    secondaryColor: "#F8FAFC",
    accentColor: "#7C3AED"
  }
};

export function createSiteSpec(input: SiteGenerateInput): SiteSpec {
  const siteName = deriveSiteName(input.prompt, input.industry);
  const slug = slugify(siteName, input.industry);
  const palette = palettes[input.tone];
  const isKorean = containsHangul(input.prompt) || containsHangul(input.targetAudience);

  return {
    schemaVersion: 1,
    site: {
      name: siteName,
      slug,
      industry: input.industry || "brand",
      targetAudience: input.targetAudience || "new customers",
      brandVoice: input.tone,
      theme: {
        ...palette,
        fontPairing: "Geist Sans / Geist Mono",
        radius: input.tone === "minimal" ? "small" : "medium"
      }
    },
    pages: [
      {
        id: "page-home",
        path: "/",
        title: "Home",
        seo: {
          title: `${siteName} | AI generated website draft`,
          description: isKorean
            ? `${siteName}의 핵심 제안, 신뢰 요소, 전환 흐름을 한눈에 보여주는 웹사이트 초안입니다.`
            : `${siteName} introduces a clear offer, trust signals, and a conversion-ready flow for ${input.targetAudience}.`,
          keywords: [input.industry, "website", "ai builder", "webable"].filter(Boolean)
        },
        sections: createHomeSections(siteName, input, isKorean)
      }
    ],
    aiMetadata: {
      prompt: input.prompt,
      model: "webable-local-draft-v0",
      createdAt: new Date().toISOString(),
      safetyChecks: ["tenant_scope_checked", "publish_requires_approval", "no_sensitive_training_data"],
      estimatedCost: 0.012
    }
  };
}

export function updateSection(spec: SiteSpec, sectionId: string, changes: Partial<SectionSpec["props"]>): SiteSpec {
  return {
    ...spec,
    pages: spec.pages.map((page) => ({
      ...page,
      sections: page.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              props: {
                ...section.props,
                ...changes
              }
            }
          : section
      )
    }))
  };
}

function createHomeSections(siteName: string, input: SiteGenerateInput, isKorean: boolean): SectionSpec[] {
  const audience = input.targetAudience || "busy operators";
  const industry = input.industry || "service";

  if (isKorean) {
    return [
      {
        id: "section-hero",
        type: "hero.editorial",
        props: {
          eyebrow: "AI 사이트 초안",
          title: `${siteName}, 방문자가 바로 이해하고 행동하는 브랜드 사이트`,
          body: `${audience}을 위해 핵심 제안, 신뢰 요소, 예약/문의 동선을 한 화면에서 자연스럽게 연결합니다.`,
          primaryAction: "상담 예약",
          secondaryAction: "서비스 보기",
          align: "split",
          background: "dark",
          width: "wide",
          mediaStyle: "photo",
          minHeight: 430,
          containerWidth: 980,
          contentMaxWidth: 980,
          offsetX: 0,
          contentAlign: "left",
          verticalAlign: "middle"
        }
      },
      {
        id: "section-features",
        type: "feature.grid",
        props: {
          eyebrow: "핵심 구성",
          title: "첫 게시에 필요한 콘텐츠와 전환 요소를 먼저 완성합니다.",
          body: "WEBABLE은 섹션 단위 편집, AI 카피 보정, SEO 초안, 게시 승인 흐름을 하나의 작업대에서 제공합니다.",
          align: "left",
          background: "light",
          width: "contained",
          mediaStyle: "none",
          minHeight: 320,
          containerWidth: 900,
          contentMaxWidth: 820,
          offsetX: 0,
          contentAlign: "left",
          verticalAlign: "top",
          items: [
            {
              title: "섹션 기반 편집",
              body: "히어로, 상품, 후기, FAQ, CTA를 블록처럼 추가하고 즉시 수정합니다."
            },
            {
              title: "AI 콘텐츠 보조",
              body: "브랜드 설명만으로 메뉴, 문구, SEO, 캠페인 초안을 생성합니다."
            },
            {
              title: "게시 승인 관리",
              body: "AI 변경은 검토 후 반영되며, 게시와 롤백 흐름을 분리합니다."
            }
          ]
        }
      },
      {
        id: "section-process",
        type: "process.steps",
        props: {
          eyebrow: "운영 흐름",
          title: "초안 생성부터 게시까지 끊기지 않는 제작 과정",
          body: "브랜드 입력, 섹션 검토, 문구 수정, SEO 확인, 게시 요청까지 한 흐름으로 이어집니다.",
          align: "left",
          background: "soft",
          width: "contained",
          mediaStyle: "none",
          minHeight: 320,
          containerWidth: 900,
          contentMaxWidth: 820,
          offsetX: 0,
          contentAlign: "left",
          verticalAlign: "top",
          items: [
            {
              title: "브리프 입력",
              body: "업종, 타깃, 톤을 입력해 사이트 구조를 자동 생성합니다."
            },
            {
              title: "섹션 편집",
              body: "캔버스와 인스펙터를 보며 문구와 CTA를 바로 조정합니다."
            },
            {
              title: "검토 후 게시",
              body: "승인 정책을 통과한 변경만 실제 사이트에 반영합니다."
            }
          ]
        }
      },
      {
        id: "section-proof",
        type: "proof.metrics",
        props: {
          eyebrow: "운영 지표",
          title: "게시 후에도 성과를 바로 확인할 수 있게 설계합니다.",
          body: "첫 게시까지 걸린 시간, AI 제안 적용률, 전환 이벤트를 운영 지표로 추적합니다.",
          align: "center",
          background: "light",
          width: "contained",
          mediaStyle: "none",
          minHeight: 300,
          containerWidth: 900,
          contentMaxWidth: 820,
          offsetX: 0,
          contentAlign: "center",
          verticalAlign: "middle",
          items: [
            {
              value: "24h",
              title: "첫 게시 목표",
              body: "가입 후 하루 안에 첫 공개 사이트를 완성합니다."
            },
            {
              value: "AI",
              title: "제안 적용률",
              body: "AI 초안이 실제 편집에 얼마나 기여했는지 확인합니다."
            },
            {
              value: "p95",
              title: "성능 기준",
              body: "공개 사이트와 API 응답 시간을 함께 모니터링합니다."
            }
          ]
        }
      },
      {
        id: "section-cta",
        type: "cta.publish",
        props: {
          eyebrow: "게시 준비",
          title: "검토가 끝나면 안전하게 게시를 요청하세요.",
          body: "운영자 승인, 감사 로그, 롤백 기준을 갖춘 상태에서 사이트를 공개합니다.",
          primaryAction: "게시 요청",
          align: "center",
          background: "brand",
          width: "wide",
          mediaStyle: "none",
          minHeight: 280,
          containerWidth: 980,
          contentMaxWidth: 900,
          offsetX: 0,
          contentAlign: "center",
          verticalAlign: "middle"
        }
      }
    ];
  }

  return [
    {
      id: "section-hero",
      type: "hero.editorial",
      props: {
        eyebrow: "AI generated site draft",
        title: `${siteName} turns ${industry} expertise into a publish-ready website.`,
        body: `Built for ${audience}, this draft starts with sharp positioning, editable sections, SEO basics, and a clear path to launch.`,
        primaryAction: "Start editing",
        secondaryAction: "Preview site",
        align: "split",
        background: "dark",
        width: "wide",
        mediaStyle: "photo",
        minHeight: 430,
        containerWidth: 980,
        contentMaxWidth: 980,
        offsetX: 0,
        contentAlign: "left",
        verticalAlign: "middle"
      }
    },
    {
      id: "section-features",
      type: "feature.grid",
      props: {
        eyebrow: "Core offer",
        title: "Everything needed for the first launch is already structured.",
        body: "WEBABLE keeps the MVP focused on sections, content, preview, approval, and rollback-ready publishing.",
        align: "left",
        background: "light",
        width: "contained",
        mediaStyle: "none",
        minHeight: 320,
        containerWidth: 900,
        contentMaxWidth: 820,
        offsetX: 0,
        contentAlign: "left",
        verticalAlign: "top",
        items: [
          {
            title: "Section builder",
            body: "Edit copy, order, and conversion blocks without touching code."
          },
          {
            title: "AI assist",
            body: "Generate positioning, menus, section copy, and SEO metadata from one brief."
          },
          {
            title: "Publish control",
            body: "Require review before changes go live, with an audit trail for every action."
          }
        ]
      }
    },
    {
      id: "section-process",
      type: "process.steps",
      props: {
        eyebrow: "Launch flow",
        title: "From onboarding prompt to approved publish.",
        body: "The first product loop mirrors the planning package: generate, inspect, edit, approve, publish.",
        align: "left",
        background: "soft",
        width: "contained",
        mediaStyle: "none",
        minHeight: 320,
        containerWidth: 900,
        contentMaxWidth: 820,
        offsetX: 0,
        contentAlign: "left",
        verticalAlign: "top",
        items: [
          {
            title: "Generate",
            body: "Create a SiteSpec from brand, audience, tone, and target industry."
          },
          {
            title: "Edit",
            body: "Adjust each section while the live preview stays in sync."
          },
          {
            title: "Approve",
            body: "Queue publishing only after operator review."
          }
        ]
      }
    },
    {
      id: "section-proof",
      type: "proof.metrics",
      props: {
        eyebrow: "MVP metrics",
        title: "Track the launch health from day one.",
        body: "The dashboard starts with the measures named in the roadmap.",
        align: "center",
        background: "light",
        width: "contained",
        mediaStyle: "none",
        minHeight: 300,
        containerWidth: 900,
        contentMaxWidth: 820,
        offsetX: 0,
        contentAlign: "center",
        verticalAlign: "middle",
        items: [
          {
            value: "24h",
            title: "first publish window",
            body: "Measure signup-to-first-publish speed."
          },
          {
            value: "AI",
            title: "proposal adoption",
            body: "Track how often AI drafts survive review."
          },
          {
            value: "p95",
            title: "latency watch",
            body: "Keep public rendering and APIs observable."
          }
        ]
      }
    },
    {
      id: "section-cta",
      type: "cta.publish",
      props: {
        eyebrow: "Ready for review",
        title: "Approve the draft when the site feels launchable.",
        body: "Publishing remains an explicit action so AI edits never go live without a human decision.",
        primaryAction: "Request publish",
        align: "center",
        background: "brand",
        width: "wide",
        mediaStyle: "none",
        minHeight: 280,
        containerWidth: 980,
        contentMaxWidth: 900,
        offsetX: 0,
        contentAlign: "center",
        verticalAlign: "middle"
      }
    }
  ];
}

function deriveSiteName(prompt: string, industry: string): string {
  const koreanStopWords = new Set(["ai", "AI", "기반", "위한", "브랜드", "사이트", "서비스", "웹사이트"]);
  const words = prompt
    .replace(/[^a-zA-Z0-9가-힣\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/의$/g, ""))
    .filter((word) => (word.length > 1 || containsHangul(word)) && !koreanStopWords.has(word))
    .slice(0, 2);

  if (words.length > 0) {
    return titleCase(words.join(" "));
  }

  return `${titleCase(industry || "Webable")} Studio`;
}

function slugify(value: string, fallbackValue = "webable-site"): string {
  const romanized = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

  if (romanized.length >= 3) {
    return romanized.slice(0, 64);
  }

  const fallbackSlug = fallbackValue
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

  return fallbackSlug.length >= 3 ? fallbackSlug.slice(0, 64) : "webable-site";
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function containsHangul(value: string): boolean {
  return /[가-힣]/.test(value);
}
