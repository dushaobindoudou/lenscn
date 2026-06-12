# Design Spec — lenscn Design System v2: "Liquid Optics" (Apple-native)

Status: approved by owner 2026-06-12 (full reskin; owner delegated all
visual judgment to Claude). This spec is the source for rewriting
DESIGN.md. The Glass Grammar (G1–G9) and the engine invariants in
docs/PLAN.md are **unchanged** and remain absolute.

## 1. Goal & Positioning

v1 ("Optical Precision", dark instrument bench) reads heavy, dark and
niche next to Apple's design language, which the owner judges will stay
mainstream. v2 aligns the entire aesthetic skin with Apple-native design
while keeping the two things Apple cannot have on the web:

1. **True refraction** — Apple's own web glass is `backdrop-filter`
   frosting; ours genuinely bends content.
2. **Rationed spectral color** (G8) — now expressed as Apple
   Intelligence-style glow in brand moments.

> Positioning line: **"The web's only real Liquid Glass."**

What changes: color, typography, shape, density, motion, aurora.
What does not: Glass Grammar G1–G9, `--ln-*` token names, component
APIs, a11y/fallback requirements, engine invariants.

## 2. Color — Apple system palette, light-first

Light becomes the default theme and the demo face. Values are Apple's
own (apple.com / iOS system colors); half-resemblance is the failure
mode, so we don't invent hues. Prism teal `#4FD8C2` is **retired**.

### Light (default — `:root` / `[data-theme="light"]`)

| Token | Value | Usage |
|---|---|---|
| `--ln-bg` | `#F5F5F7` | App background (under the aurora) |
| `--ln-surface` | `#FFFFFF` | Cards, panels, table headers |
| `--ln-surface-2` | `#F2F2F7` | Nested surfaces, hover rows, inputs |
| `--ln-border` | `rgba(0,0,0,0.08)` | Hairline borders |
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
| `--ln-success-text` | `#1B7F3E` | Semantic text on light surfaces |
| `--ln-warning-text` | `#A05A00` | Semantic text on light surfaces |
| `--ln-danger-text` | `#D70015` | Semantic text on light surfaces |
| `--ln-info-text` | `#0B7FA6` | Semantic text on light surfaces |
| `--ln-focus-ring` | `#0071E3` | 2px solid, offset 2px (unchanged shape) |

The four `--ln-*-text` tokens are **new**: iOS fill colors fail AA as
text on white, so text/icon-only semantic usage takes the `-text`
variant. Verify all `-text` variants ≥ 4.5:1 during implementation;
darken in ≤10% lightness steps if any fails.

### Dark (`[data-theme="dark"]`)

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
| semantic `-text` | same as fills (sufficient contrast on `#1C1C1E`) |
| `--ln-focus-ring` | `#0A84FF` |

### Aurora v2 (the refractable background)

Cyber blue/violet is replaced with macOS-wallpaper pastels. Same
structure as v1: fixed layer behind the app shell, 3–4 radial blobs,
`filter: blur(80px+)`, drift ≥60s, frozen under reduced motion, never a
filter descendant of a filtered element (G5/G9).

- Light blob palette: `#5AA9FF` (blue), `#B39DFF` (lavender),
  `#FF9FB2` (pink), `#7FE0D4` (mint, sparing) at **12–20%** opacity.
- Dark: same hues at **14–22%** on black.
- Spectral rainbow stays rationed to brand moments (G8). Brand
  expression changes to an Apple Intelligence-style soft conic spectral
  edge glow (logo, hero) — never on buttons, charts, or text.

## 3. Typography — system SF stack, zero webfonts

Cabinet Grotesk and Instrument Sans are **retired**. The v1 font ban
list (Inter, system-ui-as-primary, etc.) is **repealed** — it served
the v1 editorial direction. The v2 rule is stricter and simpler:

> **System-native only. Zero webfont downloads.**

| Role | Stack |
|---|---|
| All UI / body / display | `-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI Variable", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Code | `ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace` |

On Apple platforms this renders genuine SF Pro (SF Display cuts in
automatically at large sizes) — "Apple native" in the literal sense.
On Windows/Android it falls to that platform's native face; accepted
trade-off (owner-approved) in exchange for authenticity on Apple
devices and zero font-loading cost.

**Numerals rule change:** v1's "data numerals are always mono" becomes
**"data numerals are always `font-variant-numeric: tabular-nums`"** on
the SF stack. Mono is for code only. (Apple sets KPIs in SF with
tabular figures, not in a mono face.) The implementation plan must
sweep docs/PLAN-COMPONENTS.md for stale mono-numeral references.

### Scale (rem, base 16px)

| Token | Size/Line | Weight | Use |
|---|---|---|---|
| `--ln-text-display` | 48/52 | 700, tracking −1.5% | Marketing hero only |
| `--ln-text-h1` | 32/38 | 700, tracking −1% | Page title |
| `--ln-text-h2` | 24/30 | 600 | Section title |
| `--ln-text-h3` | 17/24 | 600 | Card title |
| `--ln-text-body` | 15/22 | 400 | Default UI/body (was 14) |
| `--ln-text-sm` | 13/18 | 400 | Secondary, table cells |
| `--ln-text-caption` | 12/16 | 500 | Labels — sentence case (v1 uppercase rule repealed) |
| `--ln-text-kpi` | 28/34 | 600, tabular-nums | Stat-card values (SF, not mono) |
| `--ln-text-mono-sm` | 12.5/18 | 400 | Code only |

## 4. Shape, Spacing, Elevation

- **Spacing scale unchanged** (`2,4,8,12,16,24,32,48,64`), but density
  loosens: table row 48px (was 44), card padding 24px (was 20),
  section gap 32px (was 24), page gutter 32px desktop / 16px mobile.
- **Control heights unchanged:** sm 32 / md 36 / lg 44.
- **Layout unchanged:** sidebar 256px, content max 1440px, 12-col grid.
- **Radius:** `--ln-radius-sm: 8px` (inputs, badges),
  `--ln-radius-md: 12px` (buttons, menu items), `--ln-radius-lg: 20px`
  (cards), **new** `--ln-radius-xl: 28px` (dialogs, sheets),
  `--ln-radius-full: 9999px` (pills, switch, segmented — controls go
  capsule wherever v1 wasn't already). Progressive enhancement: apply
  `corner-shape: squircle` behind `@supports` for Apple's continuous
  corners.
- **Elevation:** hairline borders stay primary. Light: cards
  `0 2px 12px rgba(0,0,0,0.04)`; floating layers
  `0 24px 60px rgba(0,0,0,0.12)`. Dark: cards
  `0 2px 12px rgba(0,0,0,0.35)`; floating
  `0 24px 70px rgba(0,0,0,0.55)`. No colored glows except the lens's
  own specular (unchanged).

## 5. Motion — spring everywhere

The single biggest source of Apple feel. New token:

```css
--ln-ease-spring: cubic-bezier(0.34, 1.3, 0.64, 1); /* ~3% single overshoot */
```

(If the overshoot reads bouncy on small lenses during Safari review,
reduce the second value toward 1.2. Chosen over `linear()` spring
curves for universal browser support and zero JS.)

| Animation | v2 |
|---|---|
| Micro (hover/press tint) | 150ms ease-out |
| Lens slide (G3) | 350ms `--ln-ease-spring` |
| Panel enter / exit | 300ms spring / 200ms ease-in |
| Toast | 250ms spring |

Reduced-motion jump paths and aurora freeze: unchanged, mandatory.

## 6. Glass on light backgrounds

Presets lens-s/m/l keep their structure and remain the only allowed
parameter source. Refraction reads weaker on light surfaces, so the
implementation adds a **light-theme tuning pass**: raise
`edgeStrength` by 0.05–0.1 and `specularStrength` as needed for lens
legibility, tuned **per preset** (not per component — keeps the
displacement-map cache hot), verified live in Safari and Chromium.
G4 still applies: every lens must sit over painted content; the demo
must never place a lens over flat white.

## 7. Migration Impact (practicality)

- Token **names** unchanged; components consume `--ln-*` only, so the
  four shipped components take token-value + easing changes with no
  logic edits. New tokens: `--ln-radius-xl`, `--ln-ease-spring`, four
  semantic `-text` colors.
- Demo: light theme becomes default (toggle stays), aurora re-colored,
  type/spacing classes updated.
- DESIGN.md rewritten from this spec; decisions log appended (v2 pivot,
  font-ban repeal, teal retirement, numerals rule change).
- docs/PLAN-COMPONENTS.md swept for v1 visual references (teal, mono
  numerals, dark-first wording); component scope/acceptance unchanged.
- No new dependencies; webfont loading removed (perf win).

## 8. Out of Scope

- New components beyond Milestones F–G; marketing site; engine changes
  beyond the preset tuning pass.

## 9. Acceptance Criteria

1. Demo on :5180 opens in light theme and reads Apple-native at a
   glance on a Mac: real SF, Apple blue, pastel aurora, capsule
   controls, spring lens with subtle overshoot.
2. Both themes pass: zero raw hex in components, G1–G9 hold, no
   `backdrop-filter` anywhere, lens legible over light surfaces.
3. All `-text` semantic tokens ≥ 4.5:1 on their surfaces.
4. `pnpm typecheck`, `pnpm test`, `pnpm build` pass; manual Safari
   sanity check done (preset tuning touches `packages/lenscn` usage).
5. Reduced-motion and `isSupported()` fallbacks verified unchanged.
