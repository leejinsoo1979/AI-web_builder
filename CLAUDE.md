# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

WEBABLE is an AI-native website/commerce/booking builder SaaS. The repo currently contains **a Korean planning package plus an early MVP implementation**. Only a fraction of what the docs describe is built:

- **Planning docs** (`00_`–`10_` numbered files, `assets/`): product scope, roadmap, OpenAPI draft, ERD, AI SiteSpec schema, security checklist, recommended stack. These describe the *target* system (Postgres+RLS, NestJS/Spring, Redis/BullMQ, AI gateway, multi-tenant), **most of which is NOT implemented**. Treat them as intent, not as a description of the code. Docs and in-app UI text are in Korean.
- **Actual code**: an npm-workspaces monorepo with one running app (`apps/admin-web`) and one shared package (`packages/builder-schema`). There is no database, backend service, or auth — persistence is local JSON files.

## Commands

Run from the repo root (npm workspaces, Node >= 20.20.0):

```bash
npm install                # install all workspaces
npm run dev                # next dev on :3000 (admin-web only)
npm run build              # build all workspaces (--if-present)
npm run typecheck          # tsc --noEmit across all workspaces
```

There is **no test framework, linter, or test suite** configured despite what the planning docs recommend. `typecheck` is the only automated check. To run one workspace directly: `npm run <script> --workspace @webable/admin-web`.

## Architecture

### Two coexisting builder data models — don't confuse them

1. **SiteSpec / SectionSpec** (`packages/builder-schema/src/index.ts`): a *section-based* model (`hero.editorial`, `feature.grid`, etc.). `createSiteSpec()` deterministically generates a bilingual (KO/EN via Hangul detection) site draft from a brief. This is used **only** by the AI generate endpoint and matches `08_WEBABLE_AI_SiteSpec_schema.json`.

2. **Freeform node model** (`apps/admin-web/src/components/editor/FreeformEditor.tsx`): the *actual editor UI*. Nodes are absolutely-positioned (`x/y/width/height/zIndex`, node types `text|button|image|header|hero|products|...`), edited on a canvas via `react-rnd` with snapping/marquee/grouping. This is what users interact with and what gets published.

The two models are **not connected** — AI-generated `SiteSpec`s are not (yet) imported into the freeform editor. When adding a node type, update it in *all three* places that enumerate the union: `FreeformEditor.tsx`, the publish route, and the published-page renderer (see below).

### admin-web (Next.js 16 App Router, React 19)

- `app/page.tsx` → renders `FreeformEditor` (the whole editor is one ~3000-line client component). `src/components/BuilderWorkspace.tsx` is an **unused** alternative implementation — the live editor is `FreeformEditor`, not this.
- Editor state persists two ways on a 350ms debounce: `localStorage` **and** `PUT /api/projects/webable-main`. On load, `restoreProject()` prefers the server copy and falls back to localStorage. The site id is hardcoded as `SITE_ID = "webable-main"`.

### API routes (file-based persistence, `runtime = "nodejs"`)

- `POST /api/ai/site-generate` — calls `createSiteSpec`, returns a `needs_approval` envelope with `outputDiff` and cost. **Never auto-publishes** — this enforces the "AI proposes, operator approves" principle from the plan.
- `GET|PUT /api/projects/[projectId]` — reads/writes `apps/admin-web/.webable-projects/<id>.json` (the editor's autosave target).
- `POST /api/sites/[siteId]/publish` — validates/normalizes nodes+pages, writes `apps/admin-web/.webable-published/<slug>.json`, returns a `liveUrl`.

Both storage dirs are gitignored-adjacent working data under `apps/admin-web/`. All ids from URLs are sanitized (`[^a-zA-Z0-9-_]` → `-`) before being used as filenames — preserve this when touching route handlers.

### Published site rendering

- `app/p/[siteId]/page.tsx` (home) and `app/p/[siteId]/[pagePath]/page.tsx` (subpages) are **server components** that read the published JSON file and render nodes. The subpage route imports `PublishedCanvas`, `PublishedNav`, and normalizers from the home `page.tsx`, so those exports are a shared contract — changing their signatures breaks the subpage route.
- The `PublishedNode` type and its renderer (`RenderPublishedNode`) are duplicated between the publish route, the home page, and the subpage. Keep them in sync.

### Styling

Global CSS only — `app/globals.css` (~4300 lines) holds every editor and published-widget class (`ff*Widget`, `published*`). There is no Tailwind/CSS-modules despite the plan mentioning Tailwind. Node styling is inline via a `style` object stored on each node.

## Conventions

- Object keys and props are frequently written **alphabetically** (see route bodies and node objects) — follow the local ordering of the file you edit.
- TS config is strict, `noEmit`, ESM (`"module": "ESNext"`, bundler resolution). `@/*` maps to `apps/admin-web/src/*`. `@webable/builder-schema` is consumed as raw TS source via `transpilePackages` in `next.config.ts` (no build step for the package).
