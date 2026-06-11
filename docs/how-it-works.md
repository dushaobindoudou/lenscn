# How the glass works

Technical notes behind `lenscn`, distilled from Aave's article
[Building Glass for the Web](https://aave.com/design/building-glass-for-the-web)
and from studying how their public demo page behaves. The code in this repo is
an independent implementation of the technique.

## The one-primitive idea

`feDisplacementMap` takes two inputs: the painted content and a map image.
For each output pixel it reads the map's matching pixel and shifts the sample
point by `scale * (channel/255 − 0.5)` per axis. With a carefully built map,
that's a lens.

Crucially the filter is applied to the element's **own** content via
`style.filter = url(#id)` — not `backdrop-filter`, which only Chromium can
combine with SVG filters. That single decision is what makes the effect work
in Chromium, Safari and Firefox.

## The displacement map

A square PNG generated on a canvas. Channel layout (128 = neutral):

| Channel | Meaning |
|---|---|
| R | horizontal displacement |
| G | vertical displacement |
| B | specular highlight mask (glow + edge light) |

Per pixel, in lens-local coordinates (origin at lens center, `halfW`/`halfH`
half-extents):

1. **Shape test** — signed distance to the rounded rect:
   `sdf = |(max(qx,0), max(qy,0))| + min(max(qx,qy),0) − r` with
   `q = |p| − half + r`. Outside (`sdf ≥ 0`): write neutral gray.
2. **Base gradient** — linear `g = clamp(p/half, −1, 1)`, or a **dome**
   profile: the lens face lies on a sphere of radius
   `R = (half² + d²) / 2d` for dome depth `d`, and the gradient is the
   sphere's surface slope `s/√(R²−s²)`, normalized by its mean over the
   half-extent (200-step trapezoid) so average strength stays constant as
   the dome deepens.
3. **Splay** — near an edge, displacement is bent toward that edge's normal:
   proximity to the horizontal edges scales down `gx`, vertical edges scale
   down `gy`, then the vector is renormalized to its original magnitude.
4. **Edge falloff** — the optical heart. An *inner* rounded rect is inset by
   `depth`; the falloff is `0.5 · (1 + erf(innerSdf / (depth·√2)))`. Deep
   inside the lens this is ~0 (flat center, no distortion); it ramps to 1
   across the rim band. `erf(x) ≈ tanh(√π·x)` is accurate to ~2·10⁻⁴.
5. **Write R/G** — `(0.5 − 0.5 · g · falloff) · 255`.
6. **Specular (B)** — alignment with the light axis
   `dir = |clamp(x/halfW)·cosθ + clamp(y/halfH)·sinθ|` drives two terms:
   a broad **glow** `glow · pow(clamp((dir − (1−spread)√2) / (spread√2)), exp) · falloff`
   and an **edge light** confined to an SDF band
   `edge · max(0, 1 + sdf/edgeWidth) · pow(dir, exp)`.
   `B = 127 · min(1, glow + edge) + 128`.

Aave additionally exploits the map's four-fold symmetry: compute one
quadrant, mirror into the other three with negated X/Y displacement —
25% of the per-pixel work. (On our roadmap; a 255×255 map already generates
in single-digit milliseconds.)

## The filter chain

```
feFlood gray(128)                         → mapBg     (neutral outside lens)
feImage [lens] map.png                    → rawMap
feComposite rawMap over mapBg             → map
feGaussianBlur SourceGraphic (optional)   → blurred   (frosted glass)

# dispersion: 3 taps, one per channel, scales L·(1+0.2c), L·(1+0.1c), L
feDisplacementMap [lens] src/map → feColorMatrix keep-R → disp0
feDisplacementMap [lens] src/map → feColorMatrix keep-G → disp1
feDisplacementMap [lens] src/map → feColorMatrix keep-B → disp2
feComposite arithmetic k2=1 k3=1 (disp0+disp1) ∘ +disp2 → lensResult

# specular: white with alpha = (B−128)/255, added on top
feColorMatrix map → specMask
feComposite arithmetic k2=strength k3=1   → lensResult
  (dark variant: multiply, k1=1, with an inverted matrix)

# compose: punch the lens rect out of the source, lay the lens back over
feFlood [lens] black                      → lensMask
feComposite SourceGraphic out lensMask    → holedSG
feComposite lensResult over holedSG       → final
```

Primitives marked `[lens]` carry an explicit **primitive subregion**
(`x`/`y`/`width`/`height` = the lens rect). Two consequences:

- displacement is only evaluated inside the lens rect — cheap;
- moving the lens is four attribute writes; the map is untouched.

`color-interpolation-filters="sRGB"` everywhere, or colors shift.

## Browser quirks

- **Safari caches filter output by id.** Swap the map image under the same
  id and the glass freezes. Rotate the id (`lenscn-N-vM`) on every map
  change and reassign `style.filter`.
- **Safari caps the source-graphic size** a filter can process; the cap
  varies by version/platform. Stay conservative with filtered-element size.
- **Safari never feeds `<video>` pixels to SVG filters** (GPU-composited).
  Videos need a WebGL renderer driven by the same displacement map.
- **Safari blanks the whole filter when a primitive subregion crosses the
  filter region boundary** (found empirically; Chromium just clips). Pad
  the filter region by half a lens plus margin on every side so the lens
  subregion always stays inside.
- **Nested filters inside the filtered element are poison on Safari**: the
  per-frame id rotation re-rasterizes the SourceGraphic, including any
  `filter: blur()` descendants, every frame. Use gradients instead.
- Filter region tracks the element's size (`ResizeObserver`),
  `filterUnits`/`primitiveUnits` = `userSpaceOnUse`.

## Parameter cheat sheet

| Parameter | Effect | Typical |
|---|---|---|
| `scale` | displacement strength (px) | 40–80 |
| `depth` | width of the refractive rim band (px) | ~25% of min(w,h) |
| `domeDepth` | spherical bulge of the face | 0–30 |
| `splay` | 1 = radial; <1 bends rim displacement outward | 0.7–1 |
| `chroma` | dispersion between color channels | 0.2–0.5 |
| `glowStrength` / `glowSpread` | diagonal sheen | 0.3 / 0.5 |
| `edgeStrength` / `edgeWidth` | rim light | 0.25 / 3px |
| `specularAngle` | light direction | 45° |
