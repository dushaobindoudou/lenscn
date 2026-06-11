# lenscn

True optical refraction glass for the web. SVG `feDisplacementMap` based — works in every modern browser (Chromium, Safari, Firefox), with no `backdrop-filter` fallback or shim layer.

This is the core engine. See [the root README](../../README.md) for the project overview and [docs/how-it-works.md](../../docs/how-it-works.md) for the technical notes.

## Install

```bash
npm install lenscn
```

## Usage

```ts
import { generateLensMap, GlassFilter } from 'lenscn'

const map = generateLensMap({
  width: 220,
  height: 140,
  borderRadius: 70,
  depth: 36,
  glowStrength: 0.35,
  edgeStrength: 0.25,
})

const glass = new GlassFilter(element, map, {
  scale: 52,
  chroma: 0.2,
})

glass.setPosition(x, y)
// later:
glass.dispose() // drops the map refcount and tears down the filter
```

## API

| Export | What it is |
|---|---|
| `generateLensMap(options)` | Build a displacement map (`LensMap` with PNG data URL). Cached by options. |
| `releaseLensMap(map)` | Drop one refcount; the cache entry is purged at 0. |
| `GlassFilter` | Apply a filter to an `HTMLElement`. Owns the SVG, subregions, and Safari id rotation. |
| `erf`, `roundedRectSDF`, `computeDomeConstants`, `domeGradient` | Math helpers (pure, no DOM). |

## License

MIT
