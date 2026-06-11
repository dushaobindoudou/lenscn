# Design System — lenscn

This file is the **design source of truth** for lenscn: the component
registry, the demos, the docs pages, and the dashboard demo. Every visual
decision (color, type, spacing, motion, glass usage) is defined here.
Implementation agents: read this file before writing any UI code, and do
not deviate without explicit owner approval.

## Product Context

- **What this is:** an open-source (MIT) shadcn-style component collection
  built on a true-refraction glass engine (SVG `feDisplacementMap`, works
  in Chromium + Safari + Firefox).
- **Who it's for:** React developers who want liquid-glass UI that is
  *actually optical*, not `backdrop-filter` frosting.
- **Memorable thing:** **"The glass is real."** A lens slides over text and
  the text genuinely bends. Every design decision serves this.
- **Competitive position:** glasscn-ui / Glass UI / GlassyUI all use
  backdrop-blur and frost *every surface*. Apple's Liquid Glass HIG puts
  glass only in the floating control layer. We side with Apple — and our
  engine's physics force the same answer (refraction needs painted content
  under the lens; filters can't nest in Safari).

## Aesthetic Direction

- **Direction:** Optical Precision — a dark instrument bench. Matte black
  camera-body surfaces, engraved-feeling type, restrained light, and glass
  only where your finger goes.
- **Decoration level:** intentional. Backgrounds carry soft, saturated
  "aurora" light fields (they give the lens something to bend). Content
  surfaces are matte and quiet.
- **Mood:** precise, deep, technical, a little wondrous. Not luxury-bling,
  not playful.
- **References:** Apple Liquid Glass HIG (glass = floating control layer;
  iOS 27 *reduced* default transparency — restraint reads as quality),
  Tremor (data density), shadcn/ui (token architecture, source
  distribution), Leica/Zeiss industrial design (matte body + glass lens).

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
- **G3 — The lens is a physical object.** It slides (240ms, ease-out
  cubic); it never fades in/out, never teleports, never duplicates. The
  only exception is the `prefers-reduced-motion` jump.
- **G4 — Glass needs something to bend.** Every lens sits over painted
  content: a track gradient, label text, or the aurora background. A lens
  over a flat solid color is invisible — that's a bug, not a style.
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
  and brand moments (logo, hero). Never on buttons, charts, or text.
- **G9 — No `backdrop-filter` anywhere.** Not in components, not in demos.
  It's the fake-glass tell, it's Chromium-only, and it breaks the engine's
  Safari invariants.

## Color

- **Approach:** restrained. One functional accent ("prism teal"); neutrals
  do the work; spectral gradients rationed per G8.
- Components must consume **CSS variables only** (prefix `--ln-`), never
  raw hex. Both themes are first-class; dark is the default and the demo
  face.

### Dark theme (default — `:root` / `[data-theme="dark"]`)

| Token | Value | Usage |
|---|---|---|
| `--ln-bg` | `#0B0D12` | App background (under the aurora) |
| `--ln-surface` | `#11141C` | Cards, panels, table headers |
| `--ln-surface-2` | `#161B26` | Nested surfaces, hover rows, inputs |
| `--ln-border` | `rgba(255,255,255,0.08)` | Default hairline borders |
| `--ln-border-strong` | `rgba(255,255,255,0.14)` | Focused/hovered borders |
| `--ln-text` | `#F2F4F8` | Primary text |
| `--ln-text-muted` | `rgba(242,244,248,0.62)` | Secondary text, labels |
| `--ln-text-faint` | `rgba(242,244,248,0.40)` | Placeholders, disabled |
| `--ln-accent` | `#4FD8C2` | Prism teal — fills, active states |
| `--ln-accent-hover` | `#65E6D2` | Hover fills |
| `--ln-accent-pressed` | `#3EC4AE` | Pressed fills |
| `--ln-accent-contrast` | `#06251F` | Text/icons on accent fills |
| `--ln-success` | `#3ECF8E` | Positive deltas, success toasts |
| `--ln-warning` | `#F5B83D` | Warnings |
| `--ln-danger` | `#F0564A` | Errors, destructive actions |
| `--ln-info` | `#4D9DE0` | Informational |
| `--ln-focus-ring` | `#8AB4FF` | Focus outline (2px solid, offset 2px) |

### Light theme (`[data-theme="light"]`)

| Token | Value |
|---|---|
| `--ln-bg` | `#F4F6F9` |
| `--ln-surface` | `#FFFFFF` |
| `--ln-surface-2` | `#EDF0F5` |
| `--ln-border` | `rgba(13,18,28,0.10)` |
| `--ln-border-strong` | `rgba(13,18,28,0.18)` |
| `--ln-text` | `#14181F` |
| `--ln-text-muted` | `rgba(20,24,31,0.64)` |
| `--ln-text-faint` | `rgba(20,24,31,0.42)` |
| `--ln-accent` | `#0FA88E` |
| `--ln-accent-hover` | `#0C9079` |
| `--ln-accent-pressed` | `#0A7B68` |
| `--ln-accent-contrast` | `#FFFFFF` |
| semantic | success `#1FA567`, warning `#C77E10`, danger `#D7382B`, info `#2E7CC0` |
| `--ln-focus-ring` | `#2E7CC0` |

Accent text on light backgrounds uses `--ln-accent-pressed` (AA contrast);
`#0FA88E` is for fills only.

### Aurora (the refractable background)

The only home of spectral color. A fixed-position layer behind the app
shell: 3–4 large radial blobs, `filter: blur(80px+)`, on `--ln-bg`.
Dark-theme blob palette: `#2563EB` (blue), `#7C3AED` (violet), `#06B6D4`
(cyan), `#F59E0B` (amber accent blob, use sparingly) at 18–35% opacity.
Light theme: same hues at 10–18% opacity. Blobs may drift slowly
(60s+ loops) but must freeze under `prefers-reduced-motion`.
**The aurora layer must never contain `filter`/`backdrop-filter`
descendants of a filtered element** (G5/G9) — it lives behind the app
shell, not inside glass.

## Typography

| Role | Font | Loading | Notes |
|---|---|---|---|
| Display / hero / page titles | **Cabinet Grotesk** (700, 500) | Fontshare CDN or self-host | Tight tracking (−1% to −2%) at 28px+ |
| Body / UI | **Instrument Sans** (400, 500, 600) | Google Fonts (variable) | Default everything |
| Data / numerals / code | **JetBrains Mono** (400, 600) | Google Fonts | Always `font-variant-numeric: tabular-nums` |

Banned: Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat,
Poppins, Space Grotesk, `system-ui` as a *primary* font. Fallback stacks
end in `ui-sans-serif, sans-serif` / `ui-monospace, monospace`.

**Rule: data numerals are always mono.** KPI values, table numbers, axis
labels, deltas — JetBrains Mono with tabular-nums. This is the instrument
look; body text never sets numbers in mono.

### Scale (rem, base 16px)

| Token | Size/Line | Font | Use |
|---|---|---|---|
| `--ln-text-display` | 44/48 | Cabinet 700 | Marketing hero only |
| `--ln-text-h1` | 28/34 | Cabinet 700 | Page title |
| `--ln-text-h2` | 22/28 | Cabinet 500 | Section title |
| `--ln-text-h3` | 17/24 | Instrument 600 | Card title |
| `--ln-text-body` | 14/22 | Instrument 400 | Default UI/body |
| `--ln-text-sm` | 13/18 | Instrument 400 | Secondary, table cells |
| `--ln-text-caption` | 12/16 | Instrument 500 | Labels, uppercase +4% tracking |
| `--ln-text-kpi` | 28/32 | JetBrains 600 | Stat-card values |
| `--ln-text-mono-sm` | 12.5/18 | JetBrains 400 | Table numerals, code |

## Spacing & Layout

- **Base unit:** 8px with a 4px half-step.
  Scale: `2, 4, 8, 12, 16, 24, 32, 48, 64` (`--ln-space-*`).
- **Density:** comfortable-compact, benchmarked against Tremor. Table row
  44px; card padding 20px; section gap 24px; page gutter 24px.
- **Control heights:** sm 32px / md 36px (default) / lg 44px (touch).
- **Layout:** grid-disciplined. Sidebar 256px fixed; content max-width
  1440px; 12-col grid, 24px gutters; stat cards 4-up ≥1280px, 2-up ≥768px,
  1-up below.
- **Border radius:** `--ln-radius-sm: 6px` (inputs, badges),
  `--ln-radius-md: 10px` (buttons, menu items), `--ln-radius-lg: 16px`
  (cards, dialogs), `--ln-radius-full: 9999px` (pills, switch, avatars).
- **Elevation:** borders over shadows. Matte surfaces get a 1px
  `--ln-border` and at most `0 1px 2px rgba(0,0,0,0.25)` (dark) /
  `0 1px 2px rgba(13,18,28,0.06)` (light). Floating layers (menu, dialog,
  toast): `0 12px 40px rgba(0,0,0,0.45)` dark / `0 12px 32px
  rgba(13,18,28,0.14)` light. No colored glows except the lens's own
  specular.

## Motion

- **Approach:** intentional. Motion exists to say "the lens is a real
  object" (G3) and to clarify state — nothing decorative.
- **Durations:** micro (hover/press tint) 120ms · lens slide 240ms ·
  panel enter 200ms / exit 150ms · toast 200ms.
- **Easing:** lens slide `cubic-bezier(0.33, 1, 0.68, 1)` (easeOutCubic —
  matches existing components); enter ease-out; exit ease-in.
- **Reduced motion:** every animation checks `prefersReducedMotion()`
  (exported by `lenscn`) and jumps to the final state. Aurora drift
  freezes. Already implemented in the four existing components — copy that
  pattern.

## Glass Parameter Presets

Use these exact presets; do not invent per-component numbers. They match
the shipped components and keep the map cache hot (identical options share
one displacement map).

| Preset | For | `lens` | `look` |
|---|---|---|---|
| **lens-s** | Handles ≤ 76px (switch, slider) | `depth: 16–18, domeDepth: 6–8, glowStrength: 0.4–0.45, edgeStrength: 0.3, borderRadius: size/2` | `scale: 26–30, chroma: 0.2, specularStrength: 1.1–1.2` |
| **lens-m** | Indicator pills 40–160px (tabs, segmented, sidebar nav) | `depth: 12–14, domeDepth: 6, glowStrength: 0.4, edgeStrength: 0.25–0.3, borderRadius: 12 or h/2` | `scale: 20–22, chroma: 0.2, specularStrength: 1.1` |
| **lens-l** | Large floats 160px+ (scrubber window, floating bar) | `depth: 24–32, domeDepth: 8–10, glowStrength: 0.35, edgeStrength: 0.25, borderRadius: 16` | `scale: 36–48, chroma: 0.15, specularStrength: 1.0` |

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
7. Both themes verified; works on `--ln-bg` *and* on aurora.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-11 | Initial design system | /design-consultation: memorable thing = "the glass is real"; research across Apple Liquid Glass HIG + glass component libraries + shadcn/Tremor dashboards |
| 2026-06-11 | Glass is interactive-only (G1) | Apple HIG puts glass in the floating control layer; competitors frost everything; our engine physics (refract own painted content, no nested filters) force the same answer |
| 2026-06-11 | Accent = prism teal `#4FD8C2`, demo purple retired | Purple-gradient default is the AI-slop tell; teal reads optical/instrument and isn't owned by a competitor |
| 2026-06-11 | Spectral gradients rationed to aurora + brand (G8) | Chromatic dispersion *is* the brand — scarcity keeps it special |
| 2026-06-11 | Cabinet Grotesk / Instrument Sans / JetBrains Mono | Distinctive non-Inter stack, all free CDNs; mono numerals give the instrument look |
