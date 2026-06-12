# Design System — lenscn (v2 "Liquid Optics")

This file is the **design source of truth** for lenscn: the component
registry, the demos, the docs pages, and the dashboard demo. Every visual
decision (color, type, spacing, motion, glass usage) is defined here.
Implementation agents: read this file before writing any UI code, and do
not deviate without explicit owner approval.

> v2 (2026-06-12) is a full Apple-native reskin of v1's dark instrument
> bench. Spec: `docs/superpowers/specs/2026-06-12-apple-native-design-v2-design.md`.
> The Glass Grammar and engine invariants did not change.

## Product Context

- **What this is:** an open-source (MIT) shadcn-style component collection
  built on a true-refraction glass engine (SVG `feDisplacementMap`, works
  in Chromium + Safari + Firefox).
- **Who it's for:** React developers who want liquid-glass UI that is
  *actually optical*, not `backdrop-filter` frosting.
- **Memorable thing:** **"The glass is real."** A lens slides over text and
  the text genuinely bends. Every design decision serves this.
- **Positioning:** **"The web's only real Liquid Glass."** Apple's own web
  glass is `backdrop-filter` frosting; lenscn speaks Apple's design
  language with genuine optics — more Apple than apple.com.
- **Competitive position:** glasscn-ui / Glass UI / GlassyUI all use
  backdrop-blur and frost *every surface*. Apple's Liquid Glass HIG puts
  glass only in the floating control layer. We side with Apple — and our
  engine's physics force the same answer (refraction needs painted content
  under the lens; filters can't nest in Safari).

## Aesthetic Direction

- **Direction:** Liquid Optics — Apple-native lightness with a real
  refraction engine. Light-first, airy, soft diffuse depth, capsule
  controls, spring motion; glass only where your finger goes.
- **Decoration level:** restrained. Backgrounds carry soft pastel "aurora"
  light fields (they give the lens something to bend). Content surfaces
  are matte white/near-black and quiet.
- **Mood:** light, precise, effortless, a little wondrous. Native-feeling
  before novel-feeling.
- **References:** Apple Liquid Glass HIG (glass = floating control layer;
  iOS 27 *reduced* default transparency — restraint reads as quality),
  apple.com (type, color, spacing), iOS system colors, Apple Intelligence
  glow (our spectral brand moment), shadcn/ui (token architecture, source
  distribution).
- **The two lenscn signatures** (everything else defers to Apple):
  1. True refraction — the lens genuinely bends content.
  2. Rationed spectral color (G8) — chromatic dispersion at the lens rim,
     Apple Intelligence-style glow in brand moments.

## The Glass Grammar (non-negotiable rules)

These rules are what make lenscn look like lenscn. Each is enforceable in
review. G5 and G9 are also engine invariants — violating them breaks
Safari.

- **G1 — Glass is interactive-only.** Lenses appear on things you touch or
  that indicate "where you are": switch/slider handles, active-item
  indicators (tabs, segmented control, sidebar nav), scrubbers, floating
  action bars. Cards, tables, inputs, dialogs, text surfaces are **matte**.
- **G2 — One moving lens per control group.** A tablist has one lens. A
  sidebar has one lens. Never two lenses chasing each other in one group.
- **G3 — The lens is a physical object.** It slides (350ms, spring — see
  Motion); it never fades in/out, never teleports, never duplicates. The
  only exception is the `prefers-reduced-motion` jump.
- **G4 — Glass needs something to bend.** Every lens sits over painted
  content: a track gradient, label text, or the aurora background. A lens
  over a flat solid color is invisible — that's a bug, not a style. On
  white surfaces this matters double: never place a lens over flat white.
- **G5 — Never glass inside glass.** No filtered descendant inside a
  filtered element (Safari re-rasterizes every frame). One level, always.
- **G6 — Minimum lens size 24px.** Refraction is illegible below that;
  use a matte affordance instead (e.g. checkboxes stay matte).
- **G7 — Every glass component ships its solid fallback.** When
  `isSupported()` is false (`prefers-reduced-transparency`, no SVG
  filters), the component renders a plain track + solid handle/pill and
  stays fully usable. This is already implemented in the four existing
  components — copy that pattern.
- **G8 — Spectral color is the brand, and it is rationed.** Rainbow /
  chromatic-dispersion gradients may appear **only** in aurora backgrounds
  and brand moments (logo, hero — Apple Intelligence-style soft glow).
  Never on buttons, charts, or text.
- **G9 — No `backdrop-filter` anywhere.** Not in components, not in demos.
  It's the fake-glass tell, it's Chromium-only, and it breaks the engine's
  Safari invariants.

## Color

- **Approach:** Apple's own palette, verbatim — half-resemblance is the
  failure mode. Light is the default theme and the demo face; dark is
  first-class. One functional accent (Apple blue); spectral gradients
  rationed per G8.
- Components must consume **CSS variables only** (prefix `--ln-`), never
  raw hex.

### Light theme (default — `:root` / `[data-theme="light"]`)

| Token | Value | Usage |
|---|---|---|
| `--ln-bg` | `#F5F5F7` | App background (under the aurora) |
| `--ln-surface` | `#FFFFFF` | Cards, panels, table headers |
| `--ln-surface-2` | `#F2F2F7` | Nested surfaces, hover rows, inputs |
| `--ln-border` | `rgba(0,0,0,0.08)` | Default hairline borders |
| `--ln-border-strong` | `rgba(0,0,0,0.16)` | Focused/hovered borders |
| `--ln-text` | `#1D1D1F` | Primary text |
| `--ln-text-muted` | `rgba(29,29,31,0.64)` | Secondary text, labels |
| `--ln-text-faint` | `rgba(29,29,31,0.40)` | Placeholders, disabled |
| `--ln-accent` | `#0071E3` | Apple blue — fills, active states |
| `--ln-accent-hover` | `#0077ED` | Hover fills |
| `--ln-accent-pressed` | `#0068D1` | Pressed fills |
| `--ln-accent-contrast` | `#FFFFFF` | Text/icons on accent fills |
| `--ln-success` | `#34C759` | Fills, badges |
| `--ln-warning` | `#FF9500` | Fills, badges |
| `--ln-danger` | `#FF3B30` | Fills, badges |
| `--ln-info` | `#32ADE6` | Fills, badges |
| `--ln-success-text` | `#1B7F3E` | Semantic *text* on light surfaces |
| `--ln-warning-text` | `#A05A00` | Semantic *text* on light surfaces |
| `--ln-danger-text` | `#D70015` | Semantic *text* on light surfaces |
| `--ln-info-text` | `#0B7FA6` | Semantic *text* on light surfaces |
| `--ln-focus-ring` | `#0071E3` | Focus outline (2px solid, offset 2px) |
| `--ln-handle` | `#FFFFFF` | Solid fallback handle (both themes) |
| `--ln-fallback-pill` | `rgba(0,0,0,0.06)` | Solid fallback indicator pill |
| `--ln-track-on` | `linear-gradient(180deg, #2FBE52, #3CD964)` | Switch ON (Apple green) |
| `--ln-track-off` | `linear-gradient(180deg, #E9E9EE, #DCDCE1)` | Switch OFF |
| `--ln-track-fill` | `#0071E3` | Slider filled portion |
| `--ln-track-rest` | `#E5E5EA` | Slider unfilled portion |

The `--ln-*-text` tokens exist because iOS fill colors fail AA as text on
white. Text/icon-only semantic usage takes the `-text` variant; badges and
fills use the base token with appropriate contrast text.

### Dark theme (`[data-theme="dark"]`)

| Token | Value |
|---|---|
| `--ln-bg` | `#000000` |
| `--ln-surface` | `#1C1C1E` |
| `--ln-surface-2` | `#2C2C2E` |
| `--ln-border` | `rgba(255,255,255,0.10)` |
| `--ln-border-strong` | `rgba(255,255,255,0.18)` |
| `--ln-text` | `#F5F5F7` |
| `--ln-text-muted` | `rgba(245,245,247,0.64)` |
| `--ln-text-faint` | `rgba(245,245,247,0.40)` |
| `--ln-accent` | `#0A84FF` (hover `#2691FF`, pressed `#0974DF`, contrast `#FFFFFF`) |
| semantic fills | success `#30D158`, warning `#FF9F0A`, danger `#FF453A`, info `#64D2FF` |
| semantic `-text` | same values as the fills (sufficient contrast on `#1C1C1E`) |
| `--ln-focus-ring` | `#0A84FF` |
| `--ln-handle` | `#FFFFFF` |
| `--ln-fallback-pill` | `rgba(255,255,255,0.14)` |
| `--ln-track-on` | `linear-gradient(180deg, #28B14A, #34D45C)` |
| `--ln-track-off` | `linear-gradient(180deg, #3A3A3F, #2C2C2E)` |
| `--ln-track-fill` | `#0A84FF` / `--ln-track-rest`: `#39393D` |

### Aurora (the refractable background)

The only home of spectral color. Two render modes:

- **App shell aurora** (dashboard, docs): a fixed-position layer behind
  the app shell — 3–4 large radial blobs, `filter: blur(80px+)`, drifting
  on 60s+ loops, frozen under `prefers-reduced-motion`. It must never be
  a `filter`/`backdrop-filter` descendant of a filtered element (G5/G9).
- **Inside a refractable stage** (vanilla demo `#content`): soft discs via
  `radial-gradient` fading to transparent, **no `filter: blur`** — a
  blurred descendant inside the filtered element forces Safari to
  re-rasterize per frame.

v2 blob palette (macOS-wallpaper pastels):
- Light: `#5AA9FF` (blue), `#B39DFF` (lavender), `#FF9FB2` (pink),
  `#7FE0D4` (mint, use sparingly) at 12–20% opacity for the blurred
  app-shell mode; as radial-gradient discs at ~50–60% element opacity
  inside refractable stages.
- Dark: same hues at 14–22% on black.

## Typography

**Rule: system-native only, zero webfont downloads.** "Apple native" in
the literal sense — on Apple platforms this renders genuine SF Pro
(SF Display cuts in automatically at large sizes); on Windows/Android it
falls to that platform's native face. The v1 ban list (Inter, Roboto,
system-ui-as-primary, …) is repealed; it served the v1 editorial
direction.

| Role | Stack (token) |
|---|---|
| All UI / body / display | `--ln-font-sans`: `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI Variable", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Code | `--ln-font-mono`: `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace` |

**Rule: data numerals are always `font-variant-numeric: tabular-nums`.**
KPI values, table numbers, axis labels, deltas — SF with tabular figures
(this is how Apple sets data). Mono is reserved for code. (Replaces v1's
"data numerals are always mono".)

### Scale (rem, base 16px)

| Token | Size/Line | Weight | Use |
|---|---|---|---|
| `--ln-text-display` | 48/52 | 700, tracking −1.5% | Marketing hero only |
| `--ln-text-h1` | 32/38 | 700, tracking −1% | Page title |
| `--ln-text-h2` | 24/30 | 600 | Section title |
| `--ln-text-h3` | 17/24 | 600 | Card title |
| `--ln-text-body` | 15/22 | 400 | Default UI/body |
| `--ln-text-sm` | 13/18 | 400 | Secondary, table cells |
| `--ln-text-caption` | 12/16 | 500 | Labels — sentence case (no uppercase) |
| `--ln-text-kpi` | 28/34 | 600, tabular-nums | Stat-card values |
| `--ln-text-mono-sm` | 12.5/18 | 400 | Code only (`--ln-font-mono`) |

## Spacing & Layout

- **Base unit:** 8px with a 4px half-step.
  Scale: `2, 4, 8, 12, 16, 24, 32, 48, 64` (`--ln-space-*`).
- **Density:** comfortable (Apple-roomy, not Tremor-compact). Table row
  48px; card padding 24px; section gap 32px; page gutter 32px desktop /
  16px mobile.
- **Control heights:** sm 32px / md 36px (default) / lg 44px (touch).
- **Layout:** grid-disciplined. Sidebar 256px fixed; content max-width
  1440px; 12-col grid, 24px gutters; stat cards 4-up ≥1280px, 2-up ≥768px,
  1-up below.
- **Border radius:** `--ln-radius-sm: 8px` (inputs, badges),
  `--ln-radius-md: 12px` (buttons, menu items), `--ln-radius-lg: 20px`
  (cards), `--ln-radius-xl: 28px` (dialogs, sheets),
  `--ln-radius-full: 9999px` (pills, switch, segmented — controls go
  capsule). Progressive enhancement: `corner-shape: squircle` behind
  `@supports` for Apple's continuous corners.
- **Elevation:** hairline borders stay primary. Light: cards
  `--ln-shadow-card: 0 2px 12px rgba(0,0,0,0.04)`; floating layers
  `--ln-shadow-float: 0 24px 60px rgba(0,0,0,0.12)`. Dark: cards
  `0 2px 12px rgba(0,0,0,0.35)`; floating `0 24px 70px rgba(0,0,0,0.55)`.
  Fallback handles: `--ln-shadow-handle: 0 2px 6px rgba(0,0,0,0.25)`
  light / `0 2px 6px rgba(0,0,0,0.5)` dark. No colored glows except the
  lens's own specular.

## Motion

- **Approach:** spring everywhere — the single biggest source of Apple
  feel. Motion exists to say "the lens is a real object" (G3) and to
  clarify state — nothing decorative.
- **Spring easing:**
  - CSS: `--ln-ease-spring: cubic-bezier(0.34, 1.3, 0.64, 1)` — a single
    ~3% overshoot, then settle. If it reads bouncy on small lenses,
    reduce the second value toward 1.2 (owner sign-off).
  - JS (rAF lens animations): the equivalent `springOut`:
    ```ts
    function springOut(t: number): number {
      const s = 0.9 // ~3% single overshoot
      const u = t - 1
      return 1 + (s + 1) * u * u * u + s * u * u
    }
    ```
- **Durations:** micro (hover/press tint) 150ms ease-out · lens slide
  350ms spring · panel enter 300ms spring / exit 200ms ease-in · toast
  250ms spring.
- **Reduced motion:** every animation checks `prefersReducedMotion()`
  (exported by `lenscn`) and jumps to the final state. Aurora drift
  freezes. Already implemented in the four existing components — copy
  that pattern.

## Glass Parameter Presets

Use these exact presets; do not invent per-component numbers. They match
the shipped components and keep the map cache hot (identical options share
one displacement map). v2 raises `edgeStrength`/`specularStrength`
slightly over v1 so the lens stays legible on light surfaces — tuned per
preset, never per component.

| Preset | For | `lens` | `look` |
|---|---|---|---|
| **lens-s** | Handles ≤ 76px (switch, slider) | `depth: 16–18, domeDepth: 6–8, glowStrength: 0.4–0.45, edgeStrength: 0.35–0.4, borderRadius: size/2` | `scale: 26–30, chroma: 0.2, specularStrength: 1.2–1.25` |
| **lens-m** | Indicator pills 40–160px (tabs, segmented, sidebar nav) | `depth: 12–14, domeDepth: 6, glowStrength: 0.4, edgeStrength: 0.3–0.35, borderRadius: 12 or h/2` | `scale: 20–22, chroma: 0.2, specularStrength: 1.15` |
| **lens-l** | Large floats 160px+ (scrubber window, floating bar) | `depth: 24–32, domeDepth: 8–10, glowStrength: 0.35, edgeStrength: 0.3, borderRadius: 16` | `scale: 36–48, chroma: 0.15, specularStrength: 1.05–1.1` |

Reference implementations: `registry/components/glass-switch` (lens-s),
`glass-tabs` / `glass-segmented-control` (lens-m).

## Component Checklist (every new component)

1. Consumes `--ln-*` tokens only; zero raw hex in component code.
2. Obeys the Glass Grammar (G1–G9); glass params from a preset above.
3. WAI-ARIA pattern for its role; keyboard complete; visible
   `--ln-focus-ring` focus.
4. Controlled + uncontrolled modes where stateful.
5. Solid fallback via `isSupported()`; reduced-motion jump via
   `prefersReducedMotion()`.
6. Self-contained file in `registry/components/<name>/` importing only
   `react`, `lenscn`, `@lenscn/react`; entry added to
   `registry/registry.json`.
7. Both themes verified; works on `--ln-bg` *and* on aurora; lens legible
   over light surfaces (never over flat white — G4).

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-11 | Initial design system (v1 "Optical Precision") | /design-consultation: memorable thing = "the glass is real"; research across Apple Liquid Glass HIG + glass component libraries + shadcn/Tremor dashboards |
| 2026-06-11 | Glass is interactive-only (G1) | Apple HIG puts glass in the floating control layer; competitors frost everything; our engine physics (refract own painted content, no nested filters) force the same answer |
| 2026-06-11 | Spectral gradients rationed to aurora + brand (G8) | Chromatic dispersion *is* the brand — scarcity keeps it special |
| 2026-06-12 | **v2 "Liquid Optics": full Apple-native reskin** | Owner judged v1's dark instrument bench below Apple's bar and Apple's language the durable mainstream; keep only the two signatures (true refraction, rationed spectral); positioning "the web's only real Liquid Glass" |
| 2026-06-12 | Light-first; palette = Apple system colors verbatim; accent = Apple blue; prism teal retired | Half-resemblance is the failure mode; Apple blue reads native instantly |
| 2026-06-12 | System SF font stack; v1 font ban list repealed | Genuine SF on Apple platforms is "native" by definition; zero webfont downloads; new rule: system-native only |
| 2026-06-12 | Data numerals: mono → SF + tabular-nums; mono = code only | Apple sets data in SF tabular figures; mono numerals were the v1 instrument look |
| 2026-06-12 | Motion: ease-out cubic → spring (~3% overshoot), lens 350ms | Spring response is the single biggest source of Apple feel |
| 2026-06-12 | Preset edge/specular raised for light-surface legibility | Refraction contrast is weaker over light content; tuned per preset to keep the map cache hot |
