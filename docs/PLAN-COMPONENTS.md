# lenscn Component Plan — Milestones F & G

Execution plan for the component layer and the dashboard demo. Written so
that **any competent agent — including small/cheap models — can pick up one
task and implement it with no additional context.** Design decisions are
already made; your job is execution, not invention.

**Required reading order before touching code:**
1. `docs/PLAN.md` — engine invariants (section "Engine invariants") and
   working rules. These are absolute.
2. `DESIGN.md` — all visual decisions: tokens, type, spacing, motion, the
   Glass Grammar (G1–G9), and glass parameter presets (lens-s/m/l).
3. This file — your task's spec.

## Rules for implementation agents

1. **Do not invent.** Colors come from `--ln-*` tokens; glass parameters
   come from the DESIGN.md presets; interaction patterns are copied from
   the four reference components. If the spec is ambiguous, **stop and
   flag it** in your report instead of guessing.
2. **Reference components** — copy their patterns exactly:
   - controlled+uncontrolled state, keyboard handling:
     `registry/components/glass-switch/glass-switch.tsx`
   - sliding lens + measurement + ResizeObserver + reduced-motion jump:
     `registry/components/glass-tabs/glass-tabs.tsx`
   - degraded fallback rendering (`isSupported()` → solid handle):
     all four existing components, `data-fallback-handle` pattern.
3. **Self-containment.** Each component is one file in
   `registry/components/<kebab-name>/<kebab-name>.tsx`, importing only
   `react`, `lenscn`, `@lenscn/react`. Styling via inline styles consuming
   CSS variables (`var(--ln-…)`) + a `className` passthrough. No CSS-in-JS
   libs, no Tailwind, no other deps.
4. **Registry.** Every new component gets an entry in
   `registry/registry.json` (copy an existing entry's shape) and a render
   in `apps/demo-react/src/main.tsx`.
5. **Tests.** Every component gets tests in
   `packages/react/src/__tests__/` (happy-dom): role/aria assertions,
   keyboard behavior, controlled mode, and a degradation test
   (matchMedia mock → `[data-fallback-handle]` present, still operable).
   Copy the setup from `registry.test.tsx` / `degradation.test.tsx`.
6. **Quality gates per task:** `pnpm typecheck && pnpm test && pnpm build`
   all green; demo loads with zero console errors; one focused commit
   `F<N>: <component>` pushed to `main` after acceptance passes.
7. **Hard bans:** no `backdrop-filter` (G9); no raw hex in components; no
   second lens in one control group (G2); no lens under 24px (G6); no
   `filter` on a descendant of a filtered element (G5); no new runtime
   deps anywhere.

## Token architecture (built in F1, consumed by everything)

`registry/styles/lenscn.css` defines all `--ln-*` tokens for
`:root`/`[data-theme="dark"]` and `[data-theme="light"]`, exactly as
tabulated in DESIGN.md, plus font-face guidance comments. Components
assume the variables exist; apps import this file once.

---

## Milestone F — Component registry

Suggested order: F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8. F2–F8 are
parallelizable after F1.

### F1. Design tokens + retrofit existing components

**Goal:** the token layer exists and the four shipped components consume it.

- Create `registry/styles/lenscn.css` with every token from DESIGN.md
  (both themes), `@import`-able and also listed in `registry/registry.json`
  as `registry:style` item `tokens`.
- Retrofit `glass-switch`, `glass-slider`, `glass-tabs`,
  `glass-segmented-control`: replace raw colors (track gradients, text
  rgba, fallback pill rgba) with `var(--ln-…)` equivalents. Track
  gradients become tokens too: `--ln-track-on` (accent-tinted),
  `--ln-track-off`, `--ln-track-fill`. **Switch ON state changes from
  green to prism teal** (`--ln-accent` family) per DESIGN.md.
- Update both demo apps to import the tokens file and set
  `data-theme="dark"`; demo accent moves from purple `#6c5ce7` to
  `var(--ln-accent)` (G8: purple is retired).

**Acceptance:**
- [ ] Zero raw hex/rgba colors left in the four component files (grep).
- [ ] Both demos render correctly in dark and light (`data-theme` flip).
- [ ] All existing tests still pass; visual smoke in Chrome + Safari.

### F2. Button, Badge, Card, StatCard (matte primitives)

**Goal:** the matte layer the dashboard is built from. **No glass in this
task (G1)** — buttons are matte by doctrine.

`glass-button/glass-button.tsx` — `Button`:
| Prop | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` (32/36/44px) | `'md'` |
| `disabled` | `boolean` | `false` |
| + all native `button` props (`type`, `onClick`, …) | | |

Styles per DESIGN.md: radius `--ln-radius-md`, font 500 13.5px body stack,
primary = accent bg + accent-contrast text, hover/pressed use
accent-hover/pressed, 120ms tint transition, focus ring
`2px solid var(--ln-focus-ring)` offset 2px. Disabled: 50% opacity,
`cursor: not-allowed`.

`glass-badge` — `Badge`: `tone: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'`,
pill radius, 22px height, tinted bg at 14% opacity + tone color text
(pattern: `rgba` of the tone token — use `color-mix(in srgb, var(--ln-success) 14%, transparent)`).

`glass-card` — `Card`, `CardHeader`, `CardTitle`, `CardContent`: surface
bg, `--ln-border` 1px, radius `--ln-radius-lg`, padding 20px,
`--shadow-card`. Plus `StatCard`:
| Prop | Type |
|---|---|
| `label` | `string` (caption style, uppercase) |
| `value` | `string` (KPI style: JetBrains Mono 600 28px tabular-nums) |
| `delta` | `{ value: string; direction: 'up' \| 'down' }?` (success/danger color) |

**Acceptance:**
- [ ] All variants/sizes/tones rendered in demo-react, both themes.
- [ ] Buttons keyboard-operable with visible focus ring; `aria-disabled`
      not used (real `disabled` attribute).
- [ ] KPI numerals are mono + tabular (assert computed style in test).

### F3. Form set: Input, Textarea, Label, Field, Checkbox, NativeSelect

**Goal:** matte form controls (G1/G6: checkbox is 20px → matte, no lens).

- `Input` / `Textarea`: surface-2 bg, border-strong 1px, radius
  `--ln-radius-sm`, heights sm/md/lg, placeholder `--ln-text-faint`,
  focus ring per DESIGN.md. `invalid` prop → `--ln-danger` border +
  `aria-invalid`.
- `Label` + `Field` wrapper: label (caption style) + control + optional
  `error` line (danger, 12px); `Field` wires `htmlFor`/`id` and
  `aria-describedby` automatically (generate ids with `useId`).
- `Checkbox`: 20×20, radius 6, matte; checked = accent fill +
  accent-contrast ✓ (inline SVG); mixed state supported
  (`aria-checked="mixed"`). Space toggles.
- `NativeSelect`: styled native `<select>` (custom chevron via inline SVG
  background) — a custom listbox comes later in F6's menu pattern if
  needed; do not build one here.

**Acceptance:**
- [ ] Demo form section: all controls, error state, disabled state, both themes.
- [ ] Labels associated (click label focuses control — test).
- [ ] Checkbox: role=checkbox, Space toggles, mixed state asserted.

### F4. SidebarNav — the flagship glass moment #1

**Goal:** vertical navigation rail where the **active-item lens slides**
between items (G1: "where you are" indicator). This is `glass-tabs`
rotated vertically + nav semantics; copy its measurement/animation code.

`glass-sidebar-nav/glass-sidebar-nav.tsx` — `SidebarNav`:
| Prop | Type |
|---|---|
| `items` | `{ value: string; label: string; icon?: ReactNode; href?: string }[]` |
| `value` / `defaultValue` / `onValueChange` | controlled/uncontrolled |
| `aria-label` | `string` (required) |

- Semantics: `<nav>` > list of `<a>` (when `href`) or `<button>`;
  `aria-current="page"` on the active item. NOT a tablist.
- Lens: preset **lens-m**, `borderRadius: 10`, slides vertically 240ms
  easeOutCubic; ResizeObserver re-measures; reduced-motion jumps;
  degraded fallback = solid `--ln-surface-2` pill behind active item.
- Keyboard: normal tab order (links), Enter/Space activates buttons.
  No roving tabindex (it's navigation, not a composite widget).
- Item: 36px height, padding 9px 12px, muted text → text when active.

**Acceptance:**
- [ ] Lens slides between items on activation; map regenerates at most
      once per item-size change (copy the w/h-snap pattern from tabs).
- [ ] `aria-current` correct; works as links and as buttons.
- [ ] Degradation + reduced-motion tests present.

### F5. DataTable + Skeleton

**Goal:** the dashboard's data surface. Matte (G1). Headless-ish: data in,
markup out — no virtualisation, no deps.

`glass-data-table/glass-data-table.tsx` — `DataTable<T>`:
| Prop | Type |
|---|---|
| `columns` | `{ key: string; header: string; align?: 'left' \| 'right'; numeric?: boolean; sortable?: boolean; render?: (row: T) => ReactNode }[]` |
| `rows` | `T[]` (each row needs `id: string`) |
| `sort` / `defaultSort` / `onSortChange` | `{ key: string; dir: 'asc' \| 'desc' }` |
| `loading` | `boolean` → renders Skeleton rows |
| `empty` | `ReactNode` |

- Styling per DESIGN.md table spec: 44px rows, caption-style headers,
  hairline row borders, `numeric` columns mono+tabular right-aligned,
  hover row `--ln-surface-2`.
- Sorting: client-side compare when uncontrolled; sortable headers are
  `<button>` inside `<th aria-sort=…>`, cycle asc→desc.
- `Skeleton` component (same folder or `glass-skeleton`): shimmer block,
  `prefers-reduced-motion` → static block, `aria-hidden`.

**Acceptance:**
- [ ] Sort cycles and `aria-sort` updates (test); controlled sort works.
- [ ] Numeric cells are mono/tabular/right-aligned; loading and empty
      states render.

### F6. Overlay set: DropdownMenu, Tooltip, Toast

**Goal:** floating layer primitives. Panels are **matte** floats
(`--shadow-float`, surface bg, radius-lg) — glass overlays fail legibility
(refraction would bend the menu's own text). No portals needed beyond
`createPortal` to `document.body`; position with
`getBoundingClientRect` + flip when near viewport edge (no popper dep).

- `DropdownMenu`: trigger + menu, `role="menu"`/`menuitem`, ArrowUp/Down
  cycle, Home/End, Esc closes & restores focus, click-outside closes,
  `aria-expanded`/`aria-haspopup` on trigger. Items: 36px, radius-md,
  hover surface-2, destructive tone option.
- `Tooltip`: hover/focus show after 300ms, `role="tooltip"` +
  `aria-describedby`, never contains interactive content, 150ms exit.
- `Toast`: `ToastProvider` + `useToast()`; viewport bottom-right, stack
  max 3, auto-dismiss 5s (pause on hover), `role="status"`
  (`aria-live="polite"`), tones success/danger/info with 3px left accent
  bar. Enter: slide-up 200ms; reduced-motion: appear in place.

**Acceptance:**
- [ ] Full keyboard paths tested (menu cycle, Esc focus restore).
- [ ] Toasts stack, dismiss, pause on hover; `aria-live` asserted.
- [ ] No `filter`/`backdrop-filter` anywhere in the floating layer.

### F7. Dialog

**Goal:** modal surface. **Matte panel** (legibility), with one optional
glass moment: the dialog sits over a dimmed backdrop, and the demo places
it over the aurora so the page itself stays alive behind
`rgba(11,13,18,0.6)` dimming. No glass on the panel (G1 — a dialog is
content, not a control).

`glass-dialog` — `Dialog`, `DialogTrigger`, `DialogContent`,
`DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`:
- Native `<dialog>` element (`showModal()`) for free focus-trap + Esc;
  fallback: portal + manual trap if `HTMLDialogElement` unsupported is
  NOT required (all target browsers ship it).
- Panel: surface bg, radius-lg, `--shadow-float`, max-width 480px,
  padding 24px; enter scale 0.98→1 + fade 200ms, exit 150ms;
  reduced-motion: no transform.
- `aria-labelledby`/`aria-describedby` wired via `useId`.

**Acceptance:**
- [ ] Focus trapped, Esc closes, focus restored to trigger (tests).
- [ ] Scroll locked while open; both themes verified.

### F8. Charts: LineChart, BarChart + GlassScrubber — flagship glass moment #2

**Goal:** zero-dependency SVG charts sized for stat cards and the
dashboard, plus the showcase: a **glass scrubber lens** that slides along
the line chart on hover, genuinely refracting the curve beneath it
(preset **lens-l**). This is the demo people screenshot.

`glass-charts/glass-charts.tsx`:
- `LineChart`: `{ data: { x: string | number; y: number }[]; height?; formatY?; formatX? }`.
  Renders inline SVG: area gradient fill (accent at 35%→0), 2.5px accent
  line, 4 horizontal gridlines (`--ln-border`), mono axis labels (12px).
  `role="img"` + `aria-label` summary; data table fallback in
  `<desc>` not required.
- `BarChart`: same data shape, rounded-top 4px bars, accent fill, hover
  bar → accent-hover + tooltip-style value flag.
- `GlassScrubber` (inside LineChart, `scrubber` prop, default on):
  a `<Glass>` window (~84×height, preset lens-l, borderRadius 16) that
  follows pointer x along the chart, snapping to the nearest data point;
  above it a mono read-out `x · y`. **The chart SVG is painted content
  inside the Glass host** so the curve actually bends (G4). Hidden when
  degraded (`isSupported()` false) — scrubbing falls back to a 1px
  accent rule + read-out. Touch: drag works (`pointermove`).
  Keyboard: chart focusable, ←/→ move the scrubber per data point
  (`aria-valuetext` announces `x, y`).
- **Engine note:** position updates go through `setPosition` semantics —
  the lens `x`/`y` props change per frame, the lens *size never changes*
  while scrubbing (no map regen; this is the whole perf story).

**Acceptance:**
- [ ] 60fps scrub in Chrome AND Safari (manual check, note in PR);
      console counter or stats hook proves zero map regen while scrubbing.
- [ ] Keyboard scrubbing with `aria-valuetext`; degraded mode = accent
      rule, still fully readable.
- [ ] Charts render from data alone (no layout thrash; ResizeObserver
      re-renders on container resize).

---

## Milestone G — Dashboard demo (the proof)

A complete dashboard at `apps/dashboard` (Vite + React, port 5181), built
**exclusively** from registry components + tokens. This is the
"can a real product be built on lenscn?" proof and the marketing asset.
If a layout need can't be met by the registry, that's a missing component
— flag it, don't hand-roll a one-off.

### G1. App shell

Aurora background layer (per DESIGN.md spec, drifting blobs, frozen under
reduced-motion) → `SidebarNav` (Overview / Transactions / Customers /
Reports / Settings) → top bar (page `h1`, `GlassSegmentedControl` 7d/30d/90d
range filter, theme `GlassSwitch`, avatar + `DropdownMenu`). Theme toggle
flips `data-theme` and persists to `localStorage`.

**Acceptance:**
- [ ] Sidebar lens slides between sections; routes swap main content
      (hash-based routing is fine — no router dep).
- [ ] Theme flip restyles everything live; choice persists on reload.

### G2. Overview page (the screenshot)

Layout exactly as the preview mockup: 4 `StatCard`s (Revenue ¥-mono KPI,
Orders, Refund rate, Active users with deltas) → `LineChart` with
`GlassScrubber` (Revenue trend, 30 points of plausible data) → `DataTable`
(Customer / Status `Badge` / Orders / Total, sortable, 8 rows) →
`Toast` on "New report" `Button`. Range filter actually filters the
chart + table data.

**Acceptance:**
- [ ] Built from registry components only (grep for raw hex / one-off
      widgets in `apps/dashboard/src` — only layout flex/grid CSS allowed).
- [ ] Range segmented control re-animates the chart smoothly; scrubber
      works on the new data.

### G3. Secondary pages + ship

Transactions (full-page `DataTable` + `Field`/`Input` search + status
`NativeSelect` filter), Customers (card grid), Settings (form: `Field`s,
`Checkbox`es, `GlassSwitch`es, `GlassSlider`, Save `Button` → success
`Toast`, destructive zone with `Dialog` confirm). Then: QA pass
(reduced-motion + reduced-transparency emulation, Safari manual pass,
zero console errors), deploy to GitHub Pages alongside the existing demo
(`/lenscn/dashboard/` path in `pages.yml`), link from README top.

**Acceptance:**
- [ ] All five nav sections have real content; every registry component
      appears in the dashboard at least once.
- [ ] CI green; public URL serves the dashboard; README links it.
- [ ] Lighthouse perf ≥ 90 on the deployed Overview page (no fonts
      blocking render: `display=swap`; aurora is GPU-only).

---

## Component → task index

| Component | Task | Glass? | Preset |
|---|---|---|---|
| tokens/lenscn.css | F1 | — | — |
| Button / Badge / Card / StatCard | F2 | matte | — |
| Input / Textarea / Label / Field / Checkbox / NativeSelect | F3 | matte | — |
| SidebarNav | F4 | ✦ active lens | lens-m |
| DataTable / Skeleton | F5 | matte | — |
| DropdownMenu / Tooltip / Toast | F6 | matte | — |
| Dialog | F7 | matte | — |
| LineChart / BarChart / GlassScrubber | F8 | ✦ scrubber | lens-l |
| (existing) Switch / Slider / Tabs / SegmentedControl | shipped | ✦ | lens-s/m |

## Out of scope (do not build without owner sign-off)

- Docs website, custom CLI, Tailwind variants (unchanged from PLAN.md).
- Charting library integration (recharts etc.) — our SVG charts are the
  point: zero deps.
- Glass on content surfaces (cards, panels, dialogs) — doctrine G1. If a
  request seems to need it, flag it instead.
- New glass parameter values outside the DESIGN.md presets.
