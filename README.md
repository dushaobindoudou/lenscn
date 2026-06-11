# lenscn

**True optical refraction glass for the web.** One SVG filter primitive, every modern browser, no flags, no fallbacks.

Most "liquid glass" libraries fake refraction with `backdrop-filter: url(#svg-filter)` — which only Chromium supports, so the effect silently disappears in Safari and Firefox. lenscn takes the approach described in Aave's [Building Glass for the Web](https://aave.com/design/building-glass-for-the-web): apply the displacement filter to the element's **own painted content** (`filter: url()` works with SVG filters everywhere), and move only the filter's lens subregion for motion.

> Status: **early**. The core engine (displacement map generator + filter manager) and an interactive demo work today. shadcn-style components are the roadmap.

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
| `lenscn` | Core engine: `generateLensMap()` + `GlassFilter` (framework-free) |
| `@lenscn/demo` | Interactive playground (Vite) |

## Roadmap

Full execution plan with per-task goals and acceptance criteria:
**[docs/PLAN.md](docs/PLAN.md)**.

- [x] Displacement map generator (SDF + erf falloff + dome + splay + specular)
- [x] SVG filter manager with lens subregions and Safari id rotation
- [x] Interactive demo with Switch/Slider widgets, smooth on Safari
- [ ] Engine hardening: pure-function map core, tests, quadrant symmetry, map cache (T1–T3)
- [ ] Packaging, CI, public demo deploy (T4–T6)
- [ ] React `<Glass>` binding (T7)
- [ ] shadcn-style component registry: Switch, Slider, Tabs… (T8–T9)
- [ ] Reduced-motion / reduced-transparency degradation (T10)
- [ ] Multi-lens filters, WebGL for `<canvas>`/`<video>`, Firefox pass (T11–T13)

## Credits

The technique is described in Aave's excellent article [Building Glass for the Web](https://aave.com/design/building-glass-for-the-web). This is an independent, from-scratch implementation — see [docs/how-it-works.md](docs/how-it-works.md) for the full technical notes.

## License

MIT
