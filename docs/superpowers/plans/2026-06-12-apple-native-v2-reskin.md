# Apple-native v2 Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the v2 "Liquid Optics" design system in code — token layer, retrofit of the four shipped components (tokens + spring motion + light-tuned glass params), and both demo apps reskinned light-first Apple-native.

**Architecture:** Pure skin migration. A new `registry/styles/lenscn.css` defines every `--ln-*` token (light default, dark override); the four registry components swap raw colors for `var(--ln-…)` and `easeOutCubic` for `springOut`; both demos import the tokens and restyle. No engine (`packages/lenscn`) changes, no component logic changes, no new dependencies.

**Tech Stack:** CSS custom properties, React inline styles, Vite, vitest (existing suites).

**Authority:** DESIGN.md (v2) is the design source of truth; the spec is `docs/superpowers/specs/2026-06-12-apple-native-design-v2-design.md`. Read both plus `docs/PLAN.md` engine invariants before starting. This plan supersedes task F1 in `docs/PLAN-COMPONENTS.md`.

**Rules that apply to every task:**
- Glass Grammar G1–G9 (DESIGN.md) — absolute. No `backdrop-filter`, ever.
- Token *names* never change; do not invent colors or glass numbers.
- Before EVERY commit: `pnpm typecheck && pnpm test && pnpm build` all green (CLAUDE.md).
- If an existing test asserts an old color (`rgba(255,255,255,…)`, `#6c5ce7`, green track) or an old duration (240/260/280ms), update the assertion to the v2 value and note it in your report. Do not change component behavior to satisfy a stale assertion.

---

### Task 1: Token stylesheet + registry entry

**Files:**
- Create: `registry/styles/lenscn.css`
- Modify: `registry/registry.json` (items array, add first entry)

- [ ] **Step 1: Create `registry/styles/lenscn.css`** with exactly this content:

```css
/* lenscn design tokens — v2 "Liquid Optics" (Apple-native).
   Source of truth: DESIGN.md. Light is the default theme. */

:root,
[data-theme='light'] {
  color-scheme: light;

  --ln-bg: #f5f5f7;
  --ln-surface: #ffffff;
  --ln-surface-2: #f2f2f7;
  --ln-border: rgba(0, 0, 0, 0.08);
  --ln-border-strong: rgba(0, 0, 0, 0.16);
  --ln-text: #1d1d1f;
  --ln-text-muted: rgba(29, 29, 31, 0.64);
  --ln-text-faint: rgba(29, 29, 31, 0.4);

  --ln-accent: #0071e3;
  --ln-accent-hover: #0077ed;
  --ln-accent-pressed: #0068d1;
  --ln-accent-contrast: #ffffff;

  --ln-success: #34c759;
  --ln-warning: #ff9500;
  --ln-danger: #ff3b30;
  --ln-info: #32ade6;
  --ln-success-text: #1b7f3e;
  --ln-warning-text: #a05a00;
  --ln-danger-text: #d70015;
  --ln-info-text: #0b7fa6;

  --ln-focus-ring: #0071e3;
  --ln-handle: #ffffff;
  --ln-fallback-pill: rgba(0, 0, 0, 0.06);
  --ln-track-on: linear-gradient(180deg, #2fbe52, #3cd964);
  --ln-track-off: linear-gradient(180deg, #e9e9ee, #dcdce1);
  --ln-track-fill: #0071e3;
  --ln-track-rest: #e5e5ea;

  --ln-shadow-card: 0 2px 12px rgba(0, 0, 0, 0.04);
  --ln-shadow-float: 0 24px 60px rgba(0, 0, 0, 0.12);
  --ln-shadow-handle: 0 2px 6px rgba(0, 0, 0, 0.25);
}

[data-theme='dark'] {
  color-scheme: dark;

  --ln-bg: #000000;
  --ln-surface: #1c1c1e;
  --ln-surface-2: #2c2c2e;
  --ln-border: rgba(255, 255, 255, 0.1);
  --ln-border-strong: rgba(255, 255, 255, 0.18);
  --ln-text: #f5f5f7;
  --ln-text-muted: rgba(245, 245, 247, 0.64);
  --ln-text-faint: rgba(245, 245, 247, 0.4);

  --ln-accent: #0a84ff;
  --ln-accent-hover: #2691ff;
  --ln-accent-pressed: #0974df;
  --ln-accent-contrast: #ffffff;

  --ln-success: #30d158;
  --ln-warning: #ff9f0a;
  --ln-danger: #ff453a;
  --ln-info: #64d2ff;
  --ln-success-text: #30d158;
  --ln-warning-text: #ff9f0a;
  --ln-danger-text: #ff453a;
  --ln-info-text: #64d2ff;

  --ln-focus-ring: #0a84ff;
  --ln-handle: #ffffff;
  --ln-fallback-pill: rgba(255, 255, 255, 0.14);
  --ln-track-on: linear-gradient(180deg, #28b14a, #34d45c);
  --ln-track-off: linear-gradient(180deg, #3a3a3f, #2c2c2e);
  --ln-track-fill: #0a84ff;
  --ln-track-rest: #39393d;

  --ln-shadow-card: 0 2px 12px rgba(0, 0, 0, 0.35);
  --ln-shadow-float: 0 24px 70px rgba(0, 0, 0, 0.55);
  --ln-shadow-handle: 0 2px 6px rgba(0, 0, 0, 0.5);
}

:root {
  /* Theme-independent tokens. */
  --ln-font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Text',
    system-ui, 'Segoe UI Variable', 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
  --ln-font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo,
    Consolas, monospace;

  --ln-space-2: 2px;
  --ln-space-4: 4px;
  --ln-space-8: 8px;
  --ln-space-12: 12px;
  --ln-space-16: 16px;
  --ln-space-24: 24px;
  --ln-space-32: 32px;
  --ln-space-48: 48px;
  --ln-space-64: 64px;

  --ln-radius-sm: 8px;
  --ln-radius-md: 12px;
  --ln-radius-lg: 20px;
  --ln-radius-xl: 28px;
  --ln-radius-full: 9999px;

  --ln-ease-spring: cubic-bezier(0.34, 1.3, 0.64, 1);
  --ln-ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ln-ease-in: cubic-bezier(0.32, 0, 0.67, 0);
  --ln-dur-micro: 150ms;
  --ln-dur-lens: 350ms;
  --ln-dur-enter: 300ms;
  --ln-dur-exit: 200ms;
  --ln-dur-toast: 250ms;
}
```

- [ ] **Step 2: Register the stylesheet.** In `registry/registry.json`, insert this object as the FIRST element of the `items` array (before `glass-switch`):

```json
{
  "name": "tokens",
  "type": "registry:style",
  "title": "Design Tokens",
  "description": "All --ln-* design tokens, v2 Liquid Optics: light default + dark theme, type, spacing, radius, motion.",
  "files": [
    {
      "path": "registry/styles/lenscn.css",
      "type": "registry:style"
    }
  ],
  "dependencies": [],
  "registryDependencies": []
}
```

- [ ] **Step 3: Gates.** Run `pnpm typecheck && pnpm test && pnpm build` — all green (this task adds files only; nothing should break).

- [ ] **Step 4: Commit.**

```bash
git add registry/styles/lenscn.css registry/registry.json
git commit -m "v2 reskin: token stylesheet (light default + dark)"
```

---

### Task 2: Retrofit `glass-switch` (tokens + spring + lens-s tuning)

**Files:**
- Modify: `registry/components/glass-switch/glass-switch.tsx`

- [ ] **Step 1: Replace the easing function.** Replace:

```ts
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}
```

with:

```ts
/** ~3% single-overshoot spring — the JS twin of --ln-ease-spring. */
function springOut(t: number): number {
  const s = 0.9
  const u = t - 1
  return 1 + (s + 1) * u * u * u + s * u * u
}
```

- [ ] **Step 2: Update the animation.** In the `useEffect` tick, replace `const t = Math.min(1, (now - start) / 260)` with `const t = Math.min(1, (now - start) / 350)` and `easeOutCubic(t)` with `springOut(t)`.

- [ ] **Step 3: Tokenize `trackStyle`.** Replace its `background` and `transition` lines with:

```ts
    background: checked ? 'var(--ln-track-on)' : 'var(--ln-track-off)',
    transition: 'background 150ms ease-out',
```

- [ ] **Step 4: Tune the lens to v2 lens-s.** In the `<Glass>` props, change `edgeStrength: 0.3` → `edgeStrength: 0.4` and `specularStrength: 1.2` → `specularStrength: 1.25` (depth/dome/glow/scale/chroma unchanged).

- [ ] **Step 5: Tokenize the fallback handle.** In the `data-fallback-handle` span style, replace `background: '#fff'` with `background: 'var(--ln-handle)'` and `boxShadow: '0 2px 6px rgba(0,0,0,0.35)'` with `boxShadow: 'var(--ln-shadow-handle)'`.

- [ ] **Step 6: Verify zero raw colors.** Run:
`grep -nE "#[0-9a-fA-F]{3}|rgba?\(" registry/components/glass-switch/glass-switch.tsx`
Expected: no matches.

- [ ] **Step 7: Gates, then commit.** `pnpm typecheck && pnpm test && pnpm build` green, then:

```bash
git add registry/components/glass-switch/glass-switch.tsx
git commit -m "v2 reskin: glass-switch — tokens, springOut 350ms, lens-s tuning"
```

---

### Task 3: Retrofit `glass-slider`

**Files:**
- Modify: `registry/components/glass-slider/glass-slider.tsx`

- [ ] **Step 1: Tokenize `trackStyle`.** Replace the `background` line with:

```ts
    background: `linear-gradient(90deg, var(--ln-track-fill) ${value * 100}%, var(--ln-track-rest) ${value * 100}%)`,
```

- [ ] **Step 2: Tune the lens to v2 lens-s.** In the `<Glass>` props, change `edgeStrength: 0.3` → `edgeStrength: 0.35` and `specularStrength: 1.1` → `specularStrength: 1.2`.

- [ ] **Step 3: Tokenize the fallback handle.** Replace `background: '#fff'` with `background: 'var(--ln-handle)'` and `boxShadow: '0 2px 6px rgba(0,0,0,0.35)'` with `boxShadow: 'var(--ln-shadow-handle)'`. (The slider has no rAF animation — dragging is direct; nothing to spring.)

- [ ] **Step 4: Verify zero raw colors** (same grep as Task 2, on this file). Expected: no matches.

- [ ] **Step 5: Gates, then commit.**

```bash
git add registry/components/glass-slider/glass-slider.tsx
git commit -m "v2 reskin: glass-slider — tokens, lens-s tuning"
```

---

### Task 4: Retrofit `glass-tabs`

**Files:**
- Modify: `registry/components/glass-tabs/glass-tabs.tsx`

- [ ] **Step 1: Replace `easeOutCubic` with `springOut`** (identical code block as Task 2 Step 1; registry components are self-contained — each file keeps its own copy).

- [ ] **Step 2: Update the animation.** Replace `const duration = 280` with `const duration = 350` and the `easeOutCubic(t)` call with `springOut(t)`.

- [ ] **Step 3: Tokenize colors.**
- Tablist style: `borderBottom: '1px solid rgba(255,255,255,0.1)'` → `borderBottom: '1px solid var(--ln-border)'`.
- Fallback pill: `background: 'rgba(255,255,255,0.14)'` → `background: 'var(--ln-fallback-pill)'`.
- Tab button: `color: selected ? '#fff' : 'rgba(255,255,255,0.6)'` → `color: selected ? 'var(--ln-text)' : 'var(--ln-text-muted)'`.

- [ ] **Step 4: Tune the lens to v2 lens-m.** In the `<Glass>` props, change `edgeStrength: 0.3` → `edgeStrength: 0.35` and `specularStrength: 1.1` → `specularStrength: 1.15`.

- [ ] **Step 5: Verify zero raw colors** (grep, this file). Expected: no matches.

- [ ] **Step 6: Gates, then commit.**

```bash
git add registry/components/glass-tabs/glass-tabs.tsx
git commit -m "v2 reskin: glass-tabs — tokens, springOut 350ms, lens-m tuning"
```

---

### Task 5: Retrofit `glass-segmented-control`

**Files:**
- Modify: `registry/components/glass-segmented-control/glass-segmented-control.tsx`

- [ ] **Step 1: Replace `easeOutCubic` with `springOut`** (same code block as Task 2 Step 1).

- [ ] **Step 2: Update the animation.** Replace `const duration = 240` with `const duration = 350` and the `easeOutCubic(t)` call with `springOut(t)`.

- [ ] **Step 3: Tokenize colors.**
- Fallback pill: `background: 'rgba(255,255,255,0.14)'` → `background: 'var(--ln-fallback-pill)'`.
- Option button: `color: selected ? '#fff' : 'rgba(255,255,255,0.7)'` → `color: selected ? 'var(--ln-text)' : 'var(--ln-text-muted)'`.

- [ ] **Step 4: Tune the lens to v2 lens-m.** In the `<Glass>` props, change `edgeStrength: 0.25` → `edgeStrength: 0.3` and `specularStrength: 1.1` → `specularStrength: 1.15`.

- [ ] **Step 5: Verify zero raw colors** (grep, this file). Expected: no matches.

- [ ] **Step 6: Gates, then commit.**

```bash
git add registry/components/glass-segmented-control/glass-segmented-control.tsx
git commit -m "v2 reskin: glass-segmented-control — tokens, springOut 350ms, lens-m tuning"
```

---

### Task 6: Reskin the vanilla demo (`apps/demo`) light-first

**Files:**
- Modify: `apps/demo/src/style.css` (full rewrite)
- Modify: `apps/demo/src/widgets.ts` (easing only)
- Modify: `apps/demo/index.html` (one meta tag)

- [ ] **Step 1: Replace the entire content of `apps/demo/src/style.css`** with:

```css
@import '../../../registry/styles/lenscn.css';

* { box-sizing: border-box; margin: 0; }

body {
  font-family: var(--ln-font-sans);
  background: var(--ln-bg);
  color: var(--ln-text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

main {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

#stage {
  position: relative;
  border-radius: var(--ln-radius-lg);
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  border: 1px solid var(--ln-border);
  box-shadow: var(--ln-shadow-card);
}

#content {
  position: relative;
  min-height: 80vh;
  padding: 56px 48px;
  background: var(--ln-surface);
  overflow: hidden;
}

/* Soft discs via radial-gradient, not filter:blur — a nested blur inside
   the filtered element forces Safari to re-render it on every filter
   re-evaluation, which tanks lens motion. Pastel palette per DESIGN.md
   Aurora v2. */
.blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.55;
  pointer-events: none;
}
.blob-a { width: 640px; height: 640px; background: radial-gradient(circle, #5aa9ff 0%, rgba(90, 169, 255, 0) 65%); top: -230px; left: -190px; }
.blob-b { width: 560px; height: 560px; background: radial-gradient(circle, #b39dff 0%, rgba(179, 157, 255, 0) 65%); bottom: -200px; right: 2%; }
.blob-c { width: 460px; height: 460px; background: radial-gradient(circle, #ff9fb2 0%, rgba(255, 159, 178, 0) 65%); top: 22%; left: 48%; }

header { position: relative; }
h1 { font-size: 64px; font-weight: 700; letter-spacing: -0.02em; }
.tagline { font-size: 18px; color: var(--ln-text-muted); max-width: 480px; margin-top: 12px; line-height: 1.5; }

.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 48px;
}

/* Translucent white (no blur — G9): the pastel discs show through and
   give the lens content to bend at card edges. */
.card {
  border: 1px solid var(--ln-border);
  border-radius: var(--ln-radius-lg);
  padding: 24px;
  background: rgba(255, 255, 255, 0.55);
}
.card h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.card p { font-size: 13px; color: var(--ln-text-muted); line-height: 1.5; }

.fineprint {
  position: relative;
  margin-top: 48px;
  font-size: 13px;
  color: var(--ln-text-muted);
  line-height: 1.6;
  max-width: 560px;
}

#controls {
  position: sticky;
  top: 24px;
  align-self: start;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border: 1px solid var(--ln-border);
  border-radius: var(--ln-radius-lg);
  padding: 20px;
  background: var(--ln-surface);
  box-shadow: var(--ln-shadow-card);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

#controls h2 { font-size: 12px; font-weight: 500; color: var(--ln-text-muted); }

.control { display: flex; flex-direction: column; gap: 4px; }
.control label { font-size: 12px; color: var(--ln-text-muted); display: flex; justify-content: space-between; }
.control label output { color: var(--ln-text); font-variant-numeric: tabular-nums; }
.control input[type='range'] { width: 100%; accent-color: var(--ln-accent); }

.control-toggle { flex-direction: row; align-items: center; gap: 8px; }
.control-toggle label { font-size: 12px; color: var(--ln-text-muted); }

#stats { font-size: 11px; color: var(--ln-text-faint); line-height: 1.6; }

#widgets {
  grid-column: 1 / 2;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.widget {
  flex: 1;
  min-width: 320px;
  border: 1px solid var(--ln-border);
  border-radius: var(--ln-radius-lg);
  padding: 28px;
  background: var(--ln-surface);
  box-shadow: var(--ln-shadow-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.widget-caption { font-size: 12px; color: var(--ln-text-muted); text-align: center; }

#glass-switch { cursor: pointer; touch-action: none; outline-offset: 4px; }
.switch-track {
  position: relative;
  width: 148px;
  height: 76px;
  border-radius: var(--ln-radius-full);
  background: var(--ln-track-off);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: background 150ms ease-out;
}
#glass-switch[aria-checked='true'] .switch-track {
  background: var(--ln-track-on);
}
.switch-glyph {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--ln-text-faint);
  pointer-events: none;
}
.switch-glyph.on { left: 26px; }
.switch-glyph.off { right: 22px; }

#glass-slider { cursor: ew-resize; touch-action: none; outline-offset: 4px; }
.slider-track {
  position: relative;
  width: 320px;
  height: 60px;
  border-radius: var(--ln-radius-full);
  --p: 40%;
  background: linear-gradient(90deg, var(--ln-track-fill) var(--p), var(--ln-track-rest) var(--p));
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.slider-ticks {
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ln-text-faint);
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}

@media (max-width: 900px) {
  main { grid-template-columns: 1fr; }
  #controls { position: static; }
}
```

- [ ] **Step 2: Spring the switch in `apps/demo/src/widgets.ts`.** Replace the `easeOutCubic` function with the `springOut` block (Task 2 Step 1), replace `const duration = 260` with `const duration = 350`, and the `easeOutCubic(t)` call with `springOut(t)`. (`initSlider` has no animation; `apps/demo/src/main.ts` needs no changes — the playground sliders are engine knobs, not design tokens.)

- [ ] **Step 3: Add the theme-color meta.** In `apps/demo/index.html` `<head>`, after the viewport meta, add:

```html
    <meta name="theme-color" content="#F5F5F7" />
```

- [ ] **Step 4: Visual smoke.** Run `pnpm dev`, open `http://localhost:5180` in Chrome: light page, pastel discs, blue slider fill, green switch when on, lens follows pointer and visibly refracts card edges/text, switch handle lands with a subtle overshoot. Zero console errors.

- [ ] **Step 5: Gates, then commit.**

```bash
git add apps/demo/src/style.css apps/demo/src/widgets.ts apps/demo/index.html
git commit -m "v2 reskin: vanilla demo — light-first Apple skin, pastel aurora, spring switch"
```

---

### Task 7: Reskin the React demo (`apps/demo-react`)

**Files:**
- Modify: `apps/demo-react/src/style.css` (full rewrite — the old `.switch-*`/`.slider-*` blocks are dead code from pre-registry markup; the registry components style themselves inline)

- [ ] **Step 1: Replace the entire content of `apps/demo-react/src/style.css`** with:

```css
@import '../../../registry/styles/lenscn.css';

* { box-sizing: border-box; margin: 0; }

body {
  font-family: var(--ln-font-sans);
  background: var(--ln-bg);
  color: var(--ln-text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.demo { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 8px; }
.demo p { color: var(--ln-text-muted); margin-bottom: 32px; }
.demo a { color: var(--ln-accent); }
.row { display: flex; gap: 24px; flex-wrap: wrap; }
.card {
  flex: 1;
  min-width: 320px;
  background: var(--ln-surface);
  border: 1px solid var(--ln-border);
  border-radius: var(--ln-radius-lg);
  padding: 24px;
  box-shadow: var(--ln-shadow-card);
}
.card h2 { font-size: 12px; color: var(--ln-text-muted); margin-bottom: 18px; font-weight: 500; }
```

- [ ] **Step 2: Visual smoke.** Run `pnpm dev` inside `apps/demo-react`, open the printed URL in Chrome: light cards, all four components render, lenses visible over the light tracks, tab/segmented lens slides with overshoot. Flip themes in devtools (`document.documentElement.dataset.theme = 'dark'`) — everything restyles. Zero console errors.

- [ ] **Step 3: Gates, then commit.**

```bash
git add apps/demo-react/src/style.css
git commit -m "v2 reskin: react demo — tokens, light-first"
```

---

### Task 8: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Raw-color ban.** Run:
`grep -rnE "#[0-9a-fA-F]{3}|rgba?\(" registry/components/`
Expected: zero matches.

- [ ] **Step 2: Backdrop-filter ban (G9).** Run:
`grep -rn "backdrop-filter" apps/ registry/ packages/ --include="*.css" --include="*.tsx" --include="*.ts"`
Expected: zero matches.

- [ ] **Step 3: Full gates.** `pnpm typecheck && pnpm test && pnpm build` — all green.

- [ ] **Step 4: Manual Safari pass (required).** Open `http://localhost:5180` in Safari:
  - Lens follows the pointer smoothly (no per-frame stutter).
  - Lens is legible over the white cards and pastel discs (edge highlight + specular visible).
  - Switch/slider handles refract their tracks; spring overshoot is subtle (if it reads bouncy, STOP and flag — do not retune numbers yourself; the spring constant is an owner decision per DESIGN.md).
  - System Settings → Accessibility → Reduce Motion ON: handles jump with no animation.
  Note the results in your report.

- [ ] **Step 5: Report.** List any stale test assertions you updated, anything you had to flag, and screenshots/notes from the Safari pass. Do not push beyond what previous tasks committed.

---

## Known gaps (out of scope, do not fix here)

- Registry components have no visible custom focus ring yet — that is
  checklist item 3 and lands with the F2+ component work.
- `corner-shape: squircle` progressive enhancement — lands with F2+
  (cards/dialogs), nothing to apply in the current four components.
- Dashboard app, app-shell blurred aurora — Milestone G.
