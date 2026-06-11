# lenscn

[![CI](https://github.com/dushaobindoudou/lenscn/actions/workflows/ci.yml/badge.svg)](https://github.com/dushaobindoudou/lenscn/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**True optical refraction glass for the web.** Liquid-glass / glassmorphism UI with *real* lens refraction — one SVG filter primitive, every modern browser, no flags, no Chromium-only hacks.

**[▶ Live demo](https://dushaobindoudou.github.io/lenscn/)**

Most "liquid glass" libraries fake refraction with `backdrop-filter: url(#svg-filter)` — which only Chromium supports, so the effect silently disappears in Safari and Firefox. lenscn takes the approach described in Aave's [Building Glass for the Web](https://aave.com/design/building-glass-for-the-web): apply the displacement filter to the element's **own painted content** (`filter: url()` works with SVG filters everywhere), and move only the filter's lens subregion for motion.

## Quick start

```bash
npm install lenscn            # framework-free core engine
npm install @lenscn/react     # React <Glass> binding
```

```tsx
import { Glass } from '@lenscn/react'

<Glass
  lens={{ width: 68, height: 68, borderRadius: 34, depth: 18 }}
  look={{ scale: 26, chroma: 0.2 }}
  x={x} y={y}
>
  <SwitchTrack />
</Glass>
```

Ready-made accessible components (Switch, Slider, Tabs, SegmentedControl) live in [`registry/`](registry/) and are distributed **as source**, shadcn style — copy them into your project and own the code. The [`registry.json`](registry/registry.json) follows the shadcn registry schema.

## How it works

1. **A displacement map** is generated on a `<canvas>`: red = horizontal shift, green = vertical shift, blue = specular highlight mask. The lens profile is a rounded-rect SDF with an erf edge falloff (flat center, refractive rim), optional spherical dome and splay shaping.
2. **An SVG filter** feeds that map into `feDisplacementMap` against the element's live `SourceGraphic`. Chromatic dispersion comes from three displacement taps at slightly different scales — one per color channel — recombined additively. The specular highlight rides the same map's blue channel.
3. **Motion is free**: lens-scoped filter primitives carry an explicit subregion; dragging the lens only updates `x`/`y` attributes. The map regenerates only when the lens *shape* changes.
4. **Safari quirks are handled**: filter ids rotate on every map swap (Safari caches filter output by id).

## Try the demo

```bash
pnpm install
pnpm dev
# open http://localhost:5180
```

Move your pointer across the panel — the lens refracts live DOM: text, gradients, borders. Tune shape, dispersion and lighting in the sidebar.

## Packages

| Package | What it is |
|---|---|
| [`lenscn`](packages/lenscn) | Core engine: `generateLensMap()` + `GlassFilter` (framework-free, zero dependencies) |
| [`@lenscn/react`](packages/react) | React binding: `<Glass>` component + `useGlass` hook |
| [`registry/`](registry/) | shadcn-style component sources: GlassSwitch, GlassSlider, GlassTabs, GlassSegmentedControl |
| `@lenscn/demo`, `@lenscn/demo-react` | Interactive playgrounds (Vite) |

## Accessibility & degradation

- Every registry component follows the WAI-ARIA pattern for its role (switch, slider, tabs) with full keyboard support and visible focus.
- `prefers-reduced-motion: reduce` — lens movement jumps instead of easing.
- `prefers-reduced-transparency: reduce`, or no SVG filter support — the glass effect turns off and components render a plain track with a solid handle. Everything stays fully usable.
- `isSupported()` and `prefersReducedMotion()` are exported from `lenscn` for your own components.

## Browser support

| Browser | Status |
|---|---|
| Chromium (Chrome, Edge, Arc…) | ✅ Supported, primary CI target |
| Safari (macOS / iOS) | ✅ Supported — filter-id rotation and subregion quirks handled |
| Firefox | ✅ Works; dedicated verification pass tracked as [T13](docs/PLAN.md) |

## Roadmap

Full execution plan with per-task goals and acceptance criteria:
**[docs/PLAN.md](docs/PLAN.md)**.

- [x] Displacement map generator (SDF + erf falloff + dome + splay + specular)
- [x] SVG filter manager with lens subregions and Safari id rotation
- [x] Interactive demo with Switch/Slider widgets, smooth on Safari
- [x] Engine hardening: pure-function map core, tests, quadrant symmetry, map cache (T1–T3)
- [x] Packaging, CI, public demo deploy (T4–T6)
- [x] React `<Glass>` binding (T7)
- [x] shadcn-style component registry: Switch, Slider, Tabs, SegmentedControl (T8–T9)
- [x] Reduced-motion / reduced-transparency degradation (T10)
- [ ] Multi-lens filters, WebGL for `<canvas>`/`<video>`, Firefox pass (T11–T13)

## Status

Milestones A–D from [docs/PLAN.md](docs/PLAN.md) are shipped. The engine, React binding, registry of components, packaging, CI, and degradation are all working. 45 tests pass across the two packages; `pnpm typecheck`, `pnpm test`, and `pnpm build` are all green.

The optional milestone E (multi-lens, WebGL for media, Firefox pass) is still open.

## Credits

The technique is described in Aave's excellent article [Building Glass for the Web](https://aave.com/design/building-glass-for-the-web). This is an independent, from-scratch implementation — see [docs/how-it-works.md](docs/how-it-works.md) for the full technical notes.

## License

MIT
