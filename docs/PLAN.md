# lenscn Development Plan

Execution plan for completing lenscn. Written so any competent agent can pick
up tasks in order with no additional context. Read this file, then
`docs/how-it-works.md`, before touching code.

## Project context

lenscn is an open-source (MIT) glass-refraction UI library. The core engine
works today: a displacement-map generator plus an SVG `feDisplacementMap`
filter chain that refracts an element's own painted content, cross-browser
(Chromium + Safari + Firefox). The end goal is a **shadcn-style component
collection** on top of that engine — thin components distributed as source,
not a monolithic package.

| Path | What it is |
|---|---|
| `packages/lenscn/src/math.ts` | erf, rounded-rect SDF, dome math |
| `packages/lenscn/src/lens-map.ts` | `generateLensMap()` — the displacement map |
| `packages/lenscn/src/glass-filter.ts` | `GlassFilter` — SVG filter lifecycle |
| `apps/demo` | Vite playground + Switch/Slider widgets |
| `docs/how-it-works.md` | Algorithm + filter chain + browser quirks |

Commands: `pnpm install`, `pnpm dev` (demo on :5180), `pnpm typecheck`.
Repo: https://github.com/dushaobindoudou/lenscn — push to `main`.

## Engine invariants — do not break these

Violating any of these reintroduces bugs we already fixed. If a task seems to
require breaking one, stop and flag it instead.

1. **Refraction applies to the element's own content** via
   `style.filter = url(#id)`. Never switch to `backdrop-filter` + SVG filter
   (Chromium-only) for the core path.
2. **Safari rotates the filter id on every visual update** (map swap and,
   on Safari, every position frame). Removing rotation freezes the glass.
3. **The filter region is padded** by half a lens + margin on all sides.
   If a lens subregion crosses the region boundary, Safari blanks the whole
   element.
4. **Lens-scoped primitives carry explicit subregions** (x/y/width/height =
   lens rect). This is both the perf model (move = attribute write, no map
   regen) and correctness (lensResult must be clipped for the final `over`).
5. `color-interpolation-filters="sRGB"` on the filter. Default linearRGB
   shifts colors.
6. **Map regenerates only on shape change**, never on position change.
7. The demo must not put `filter:`/`backdrop-filter:` descendants inside a
   filtered element (Safari re-rasterizes them every frame).
8. `packages/lenscn` has **zero runtime dependencies**. Keep it that way.
9. Never copy code from Aave's bundles. The technique is fair game; their
   code is not. `docs/how-it-works.md` is the reference.

## Working rules (every task)

- `pnpm typecheck` passes before every commit.
- Demo loads on Chrome with zero console errors after every change.
- Any change to `packages/lenscn` must be manually sanity-checked in Safari
  (macOS host): lens follows pointer smoothly, no blanking at panel edges.
- Each task is one focused commit (or small series) referencing the task id,
  e.g. `T3: react Glass binding`. Push to `main` after acceptance passes.
- Update `README.md` roadmap checkboxes and `docs/how-it-works.md` whenever
  behavior or API changes.
- New public APIs get TSDoc comments in the style of the existing code.

---

## Milestone A — Engine hardening

### T1. Extract a canvas-free map core + unit tests

**Goal:** the per-pixel map math becomes a pure function testable in Node,
and regressions in the generator become impossible to miss.

Refactor `lens-map.ts` into:
- `writeLensMapPixels(data: Uint8ClampedArray, options)` — pure, no DOM.
- `generateLensMap(options)` — thin canvas/PNG wrapper around it (API
  unchanged).

Add `vitest` (dev-dep at repo root or package level) with tests for:
- `erf`: erf(0)=0, odd symmetry, →±1 at ±3.
- `roundedRectSDF`: sign inside/outside, distance on axis, corner radius.
- `computeDomeConstants`: Rx=(w²+d²)/2d, scales positive and finite.
- Map properties on a 64×64 map: every pixel outside the shape is exactly
  (128,128,128,255); center pixel ≈ neutral (flat plateau, |R−128| ≤ 2);
  horizontal mirror symmetry: R(x) + R(mirror(x)) = 255 ± 1, G equal ± 1;
  vertical mirror: G flips, R equal; alpha is 255 everywhere.

**Acceptance:**
- [ ] `pnpm test` runs vitest and passes in plain Node (no jsdom, no canvas).
- [ ] `generateLensMap` public signature unchanged; demo unaffected.
- [ ] All listed properties asserted, not just snapshotted.

### T2. Quadrant-symmetry optimization

**Goal:** ≥2× faster map generation by computing one quadrant and mirroring
(R negates across the vertical axis, G across the horizontal; B copies).

Implement inside `writeLensMapPixels`. The specular term is symmetric under
the same mirroring only because `dir` uses |·| — keep it correct, don't
assume; verify against the naive path.

**Acceptance:**
- [ ] A test generates maps both ways (keep the naive loop as a test-only
      reference) for ≥4 option fixtures (linear, dome, splay<1, specular on)
      and asserts per-channel difference ≤ 1.
- [ ] Demo stats line shows generation time roughly ≤ half of before at 255²
      (record numbers in the commit message).

### T3. Shared map cache

**Goal:** N components with identical lens options share one map instead of
generating N times.

Module-level cache keyed by the canonical option set; refcount with
`retain/release` or just LRU-cap at ~16 entries. `GlassFilter.dispose()`
releases.

**Acceptance:**
- [ ] Test: two `generateLensMap` calls with equal options return the same
      `url` (or a documented cached object); different options don't.
- [ ] Demo with Switch + Slider + playground still works.

---

## Milestone B — Packaging and CI

### T4. Build pipeline + npm publish readiness

**Goal:** `lenscn` installs cleanly from npm.

Use `tsup` (or `tsc` emit): ESM + `.d.ts` into `dist/`. Package.json:
`exports` → `dist/index.js` + types, `files: ["dist"]`, `sideEffects: false`.
Demo keeps using workspace source via a `development` exports condition or
vite alias — verify `pnpm dev` still works.

**Acceptance:**
- [ ] `pnpm build` produces `dist/index.js` + `dist/index.d.ts`.
- [ ] `npm publish --dry-run` in `packages/lenscn` lists only dist + README
      + LICENSE (add a package README if missing).
- [ ] `pnpm dev` and `pnpm typecheck` still pass.
- [ ] Do **not** actually publish — the repo owner publishes manually.

### T5. CI

**Goal:** every push to `main` is verified.

GitHub Actions: pnpm install (with cache), typecheck, test, build, and
`vite build` of the demo.

**Acceptance:**
- [ ] `.github/workflows/ci.yml` green on `main` (check with `gh run list`).
- [ ] Badge in README.

### T6. Deploy the demo

**Goal:** a public URL people can try (this is the project's marketing).

GitHub Pages via Actions (`vite build` with correct `base`), deployed on
push to `main`.

**Acceptance:**
- [ ] Public URL serves the demo; lens, switch, slider all work there.
- [ ] URL linked at the top of README and in the repo's About field
      (`gh repo edit --homepage`).

---

## Milestone C — React binding

### T7. `@lenscn/react` package with `<Glass>`

**Goal:** the Aave-style API:

```tsx
<Glass lens={{ width: 68, height: 68, borderRadius: 34, depth: 18 }}
       look={{ scale: 26, chroma: 0.2 }}
       x={x} y={y}>
  <SwitchTrack />
</Glass>
```

`packages/react` (name `@lenscn/react`, peer-dep `react >= 18`, dep on
`lenscn`). Behavior:
- Renders a wrapper `div` (`display: contents` is NOT safe with filters —
  use a plain block/inline-block div, documented) holding `children`;
  attaches a `GlassFilter` to it on mount, disposes on unmount.
- `lens` object changes → `setLensMap` (deep-compare or require memo —
  document the choice). `look` changes → `setOptions`. `x`/`y` number
  changes → `setPosition` without re-render churn (refs + effect).
- SSR-safe: no `document`/`navigator` access at module scope; effect-only.
- Export `useGlass(ref, lens, look)` for advanced cases.

**Acceptance:**
- [ ] Demo gains a React island or a second demo app where Switch/Slider are
      rebuilt with `<Glass>` in ≤ ~40 lines each, behavior identical to the
      vanilla widgets.
- [ ] Unmount removes the hidden SVG and clears the element's filter style
      (assert in a test with happy-dom/jsdom for DOM bookkeeping only, or a
      manual check documented in the PR).
- [ ] Typecheck + build wired into the same root scripts.

---

## Milestone D — shadcn-style components

The product layer. Components are **distributed as source** (copy-paste /
registry), styled with plain CSS or Tailwind-agnostic class hooks, built on
`@lenscn/react`.

### T8. Registry structure + Switch + Slider

**Goal:** `registry/` directory with self-contained component sources and a
`registry.json` index (name, files, dependencies) structurally compatible
with the shadcn CLI manifest format.

Components: `GlassSwitch` (role=switch, keyboard support, controlled +
uncontrolled), `GlassSlider` (role=slider, arrow keys, pointer drag,
controlled + uncontrolled). Port the interaction logic from
`apps/demo/src/widgets.ts`, but as accessible React components.

**Acceptance:**
- [ ] `registry/registry.json` + `registry/components/glass-switch/`,
      `glass-slider/` exist and are self-contained (import only react,
      `lenscn`, `@lenscn/react`).
- [ ] Demo (or docs page) renders both registry components.
- [ ] Keyboard: Space/Enter toggles switch; arrows move slider; focus ring
      visible. aria-checked / aria-valuenow update correctly.

### T9. GlassTabs + GlassSegmentedControl

**Goal:** the lens slides between tab labels — the strongest showcase of
"motion is free" (one filter, lens position animates between items).

**Acceptance:**
- [ ] Tab/segment change animates the lens to the active item (eased, no map
      regen — verify via the stats hook or a console counter in dev mode).
- [ ] Resize-safe: lens re-positions when container resizes.
- [ ] Keyboard arrows + Home/End per WAI-ARIA tabs pattern.

### T10. Reduced-motion / reduced-transparency degradation

**Goal:** respect users and weak devices without a separate API.

In `GlassFilter`: if `prefers-reduced-motion: reduce`, position updates jump
(no per-frame Safari rotation storms from animations — still functional).
If `prefers-reduced-transparency: reduce` or SVG filters unsupported,
`GlassFilter` becomes a no-op and components must still be fully usable
(plain track + a simple solid handle rendered by the component itself —
each registry component defines its fallback handle).

**Acceptance:**
- [ ] Emulate both media queries in DevTools: components remain usable and
      legible; no console errors.
- [ ] `GlassFilter.isSupported()` (or similar) exported and documented.

---

## Milestone E — Advanced (do last, each optional)

### T11. Multi-lens: several lenses in one filter

One `GlassFilter` accepting N lens slots (Aave's pool/sub-slot model) so a
video-player-style surface (several glass buttons on one panel) costs one
filter. Acceptance: demo panel with 3 independent lenses, smooth in Safari.

### T12. WebGL renderer for `<canvas>`/`<video>`

Safari never feeds video pixels to SVG filters. Implement a WebGL2 fragment
shader consuming the same displacement map (R/G displace, B specular,
3-tap chroma) rendering the media into a canvas overlay. Acceptance: a video
demo with a glass scrub bar working in Safari; shader output visually matches
the SVG path on a static test card.

### T13. Firefox verification pass

Run the full demo in Firefox; document quirks found in
`docs/how-it-works.md`; fix what's fixable. Acceptance: a "Firefox" row in a
new browser-support table in README with honest status.

---

## Suggested order

T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10, then E-tasks as wanted.
T4/T5/T6 can interleave with C/D if blocked.

## Out of scope (do not build without owner sign-off)

- A documentation website framework (the demo page is the docs for now).
- A custom CLI (registry.json compatibility is enough initially).
- Tailwind/styling system lock-in inside components.
- Publishing to npm (prepare everything; owner pushes the button).
