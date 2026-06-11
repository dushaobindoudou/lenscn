import { clamp, computeDomeConstants, domeGradient, erf, roundedRectSDF } from './math'

export interface LensMapOptions {
  /** Lens width in CSS px. */
  width: number
  /** Lens height in CSS px. */
  height: number
  /** Corner radius of the lens shape in CSS px. */
  borderRadius?: number
  /** Map texture resolution (square). The map is stretched to the lens rect. */
  resolution?: number
  /**
   * Width of the refractive band at the rim, in CSS px. The center of the
   * lens stays optically flat; displacement ramps up over this distance
   * toward the edge with an erf falloff.
   */
  depth?: number
  /**
   * Depth of a spherical dome profile in CSS px. 0 keeps the linear
   * (cone-like) gradient; larger values bulge the surface like a droplet.
   */
  domeDepth?: number
  /**
   * 1 = displacement points straight at the lens center everywhere.
   * Values below 1 progressively bend near-edge displacement to be
   * perpendicular to the closest edge, which reads as a softer rim.
   */
  splay?: number
  /** Zero out displacement outside the rounded-rect shape. */
  clipToShape?: boolean
  /** Apply the erf edge falloff. Disable for a uniform prism-like shift. */
  edgeFalloff?: boolean
  /** Light direction for specular shading, degrees. */
  specularAngle?: number
  /** Broad diagonal sheen across the lens face, 0..1. */
  glowStrength?: number
  /** Fraction of the face the sheen covers, 0..1. */
  glowSpread?: number
  glowExponent?: number
  /** Bright rim highlight along the lens edge, 0..1. */
  edgeStrength?: number
  /** Width of the rim highlight band in CSS px. */
  edgeWidth?: number
  edgeExponent?: number
}

export interface LensMap {
  /** PNG data URL, ready to assign to an feImage href. */
  url: string
  resolution: number
  width: number
  height: number
  borderRadius: number
  /** Time spent in the pixel loop, ms. */
  generateMs: number
}

const DEFAULTS = {
  borderRadius: 0,
  resolution: 255,
  domeDepth: 0,
  splay: 1,
  clipToShape: true,
  edgeFalloff: true,
  specularAngle: 45,
  glowStrength: 0,
  glowSpread: 0.5,
  glowExponent: 1.5,
  edgeStrength: 0,
  edgeWidth: 3,
  edgeExponent: 1.5,
} as const

export interface PixelContext {
  halfW: number
  halfH: number
  cornerR: number
  innerW: number
  innerH: number
  innerR: number
  falloffSharpness: number
  cosA: number
  sinA: number
  glowStart: number
  glowRange: number
  dome: ReturnType<typeof computeDomeConstants> | null
  useSplay: boolean
  splayInv: number
  splay: number
  edgeFalloff: boolean
  edgeWidth: number
  glowStrength: number
  edgeStrength: number
  glowExponent: number
  edgeExponent: number
  hasSpecular: boolean
  clipToShape: boolean
}

/**
 * Computes the displacement-map pixel value for a point at absolute
 * coordinates (|x|, |y|) within the lens. The caller applies the sign of
 * the original x/y to flip R/G into the right quadrant.
 *
 * R and G are even in x and y respectively, so all four quadrants share
 * the same magnitude. The B specular formula uses the signed y
 * (`clamp(y/halfH, -1, 1) * sinA`), so |dir| is symmetric only under
 * (x,y)→(−x,−y). Two B values are returned:
 *   bSame — for quadrants where x and y have the same sign
 *   bOpp  — for quadrants where x and y have opposite signs
 *
 * R/G rounding happens in the caller at the same expression-level as the
 * naive path: `R = round(127.5 - sx * tR)`, `G = round(127.5 - sy * tG)`.
 */
export function computePixelMag(
  ax: number,
  ay: number,
  ctx: PixelContext,
): { tR: number; tG: number; bSame: number; bOpp: number } | null {
  const sdf = roundedRectSDF(ax, ay, ctx.halfW, ctx.halfH, ctx.cornerR)
  if (ctx.clipToShape && sdf >= 0) return null

  let gx: number
  let gy: number
  if (ctx.dome) {
    gx = domeGradient(ax, ctx.dome.Rx, ctx.dome.scaleX)
    gy = domeGradient(ay, ctx.dome.Ry, ctx.dome.scaleY)
  } else {
    gx = clamp(ax / ctx.halfW, -1, 1)
    gy = clamp(ay / ctx.halfH, -1, 1)
  }

  if (ctx.useSplay) {
    const nearH = Math.max(0, 1 - (ctx.halfH - ay) * ctx.splayInv) * (1 - ctx.splay)
    const nearV = Math.max(0, 1 - (ctx.halfW - ax) * ctx.splayInv) * (1 - ctx.splay)
    if (nearH > 0.001 || nearV > 0.001) {
      const ogx = gx
      const ogy = gy
      gx = ogx * (1 - nearH)
      gy = ogy * (1 - nearV)
      const before = Math.sqrt(ogx * ogx + ogy * ogy)
      const after = Math.sqrt(gx * gx + gy * gy)
      if (after > 0.001) {
        const renorm = before / after
        gx *= renorm
        gy *= renorm
      }
    }
  }

  let falloff = 1
  if (ctx.edgeFalloff) {
    const innerSdf = roundedRectSDF(ax, ay, ctx.innerW, ctx.innerH, ctx.innerR)
    falloff = 0.5 * (1 + erf(innerSdf * ctx.falloffSharpness))
  }

  const tR = 0.5 * gx * falloff * 255
  const tG = 0.5 * gy * falloff * 255

  let bSame = 128
  let bOpp = 128
  if (ctx.hasSpecular) {
    const cx = clamp(ax / ctx.halfW, -1, 1)
    const cy = clamp(ay / ctx.halfH, -1, 1)
    // Quadrants where sign(x) == sign(y): dir = |cx·cosA + cy·sinA|.
    const dirSame = Math.abs(cx * ctx.cosA + cy * ctx.sinA)
    // Quadrants where sign(x) != sign(y): dir = |cx·cosA − cy·sinA|.
    const dirOpp = Math.abs(cx * ctx.cosA - cy * ctx.sinA)
    for (const [dir, isOpp] of [
      [dirSame, false],
      [dirOpp, true],
    ] as const) {
      let spec = 0
      if (ctx.glowStrength > 0) {
        const t = ctx.glowRange > 0.001 ? clamp((dir - ctx.glowStart) / ctx.glowRange, 0, 1) : 0
        spec += ctx.glowStrength * Math.pow(t, ctx.glowExponent) * falloff
      }
      if (ctx.edgeStrength > 0) {
        const band = sdf < 0 ? Math.max(0, 1 + sdf / ctx.edgeWidth) : 0
        spec += ctx.edgeStrength * band * Math.pow(dir, ctx.edgeExponent)
      }
      const b = Math.round(127 * Math.min(1, spec) + 128)
      if (isOpp) bOpp = b
      else bSame = b
    }
  }
  return { tR, tG, bSame, bOpp }
}

/**
 * Writes displacement-map pixels into a pre-allocated Uint8ClampedArray.
 * Pure function: no DOM, no canvas, no side effects.
 *
 * Uses quadrant symmetry: all four quadrants of the map are equal up to
 * sign-flipping R and G. We compute the first quadrant and mirror to the
 * other three. Specular B is identical in all four (uses |·|).
 *
 * `data` must be `resolution × resolution × 4` bytes (RGBA).
 * Channel layout (128 = neutral):
 *   R — horizontal displacement
 *   G — vertical displacement
 *   B — specular highlight mask (glow + edge), 128 = none
 *   A — 255 everywhere
 */
export function writeLensMapPixels(data: Uint8ClampedArray, options: LensMapOptions): void {
  const o = { ...DEFAULTS, ...options }
  const halfW = o.width / 2
  const halfH = o.height / 2
  const depth = o.depth ?? Math.min(halfW, halfH) * 0.5
  const size = o.resolution

  const ctx: PixelContext = {
    halfW,
    halfH,
    cornerR: Math.min(o.borderRadius, Math.min(halfW, halfH)),
    innerW: Math.max(0, halfW - depth),
    innerH: Math.max(0, halfH - depth),
    innerR: Math.max(0, Math.min(o.borderRadius, Math.min(Math.max(0, halfW - depth), Math.max(0, halfH - depth)))),
    falloffSharpness: depth > 0 ? 1 / (depth * Math.SQRT2) : 1e6,
    cosA: Math.cos((o.specularAngle * Math.PI) / 180),
    sinA: Math.sin((o.specularAngle * Math.PI) / 180),
    glowStart: (1 - o.glowSpread) * Math.SQRT2,
    glowRange: o.glowSpread * Math.SQRT2,
    dome: o.domeDepth > 0 ? computeDomeConstants(o.domeDepth, halfW, halfH) : null,
    useSplay: o.splay < 1,
    splayInv: (() => {
      const splayHalf = 0.5 * Math.min(halfW, halfH)
      return splayHalf > 0 ? 1 / splayHalf : 0
    })(),
    splay: o.splay,
    edgeFalloff: o.edgeFalloff,
    edgeWidth: o.edgeWidth,
    glowStrength: o.glowStrength,
    edgeStrength: o.edgeStrength,
    glowExponent: o.glowExponent,
    edgeExponent: o.edgeExponent,
    hasSpecular: o.glowStrength > 0 || o.edgeStrength > 0,
    clipToShape: o.clipToShape,
  }

  // Quadrant symmetry: the function is even in x (R mirrors) and even in y
  // (G mirrors) — compute one quadrant and replicate. For even size the
  // quadrants tile cleanly; for odd size the center row/column are fixed
  // points (R=128 on center column, G=128 on center row).
  const halfSize = Math.floor(size / 2)

  for (let py = 0; py < halfSize; py++) {
    const y = ((py + 0.5) / size) * o.height - halfH
    const ay = Math.abs(y)
    const mirrorY = size - 1 - py
    for (let px = 0; px < halfSize; px++) {
      const x = ((px + 0.5) / size) * o.width - halfW
      const ax = Math.abs(x)
      const mirrorX = size - 1 - px

      const m = computePixelMag(ax, ay, ctx)
      if (!m) {
        // Outside shape — write 4 neutral pixels.
        for (const [tx, ty] of [
          [px, py],
          [mirrorX, py],
          [px, mirrorY],
          [mirrorX, mirrorY],
        ] as const) {
          const i = (ty * size + tx) * 4
          data[i] = 128
          data[i + 1] = 128
          data[i + 2] = 128
          data[i + 3] = 255
        }
        continue
      }

      // Source quadrant (top-left in image space) has x<0, y<0 → sx=-1, sy=-1.
      // Mirrored quadrants flip one or both signs.
      writeQuad(data, size, px, py, m, -1, -1)
      writeQuad(data, size, mirrorX, py, m, 1, -1)
      writeQuad(data, size, px, mirrorY, m, -1, 1)
      writeQuad(data, size, mirrorX, mirrorY, m, 1, 1)
    }
  }

  // Center row (if size is odd): the top half of the row has y=0 and
  // x<0; bottom half has y=0 and x>0. R mirrors across the column, G=128.
  if (size % 2 === 1) {
    const cx = halfSize
    const y = halfSize
    const ay = 0
    for (let px = 0; px < halfSize; px++) {
      const x = ((px + 0.5) / size) * o.width - halfW
      const ax = Math.abs(x)
      const mirrorX = size - 1 - px
      const m = computePixelMag(ax, ay, ctx)
      if (!m) {
        const i = (y * size + px) * 4
        data[i] = 128
        data[i + 1] = 128
        data[i + 2] = 128
        data[i + 3] = 255
        const j = (y * size + mirrorX) * 4
        data[j] = 128
        data[j + 1] = 128
        data[j + 2] = 128
        data[j + 3] = 255
        continue
      }
      // Left half: x<0 → sx=-1. Right half: x>0 → sx=+1. y=0, so sy=-1.
      writeQuad(data, size, px, y, m, -1, -1)
      writeQuad(data, size, mirrorX, y, m, 1, -1)
    }
    // Center pixel itself — x=0, y=0.
    {
      const m = computePixelMag(0, 0, ctx)
      if (!m) {
        const i = (y * size + cx) * 4
        data[i] = 128
        data[i + 1] = 128
        data[i + 2] = 128
        data[i + 3] = 255
      } else {
        writeQuad(data, size, cx, y, m, -1, -1)
      }
    }
  }

  // Center column (if size is odd): the left half has x=0 and y<0;
  // right half has x=0 and y>0. G mirrors across the row, R=128.
  if (size % 2 === 1) {
    const x = halfSize
    const ax = 0
    for (let py = 0; py < halfSize; py++) {
      const y = ((py + 0.5) / size) * o.height - halfH
      const ay = Math.abs(y)
      const mirrorY = size - 1 - py
      const m = computePixelMag(ax, ay, ctx)
      if (!m) {
        const i = (py * size + x) * 4
        data[i] = 128
        data[i + 1] = 128
        data[i + 2] = 128
        data[i + 3] = 255
        const j = (mirrorY * size + x) * 4
        data[j] = 128
        data[j + 1] = 128
        data[j + 2] = 128
        data[j + 3] = 255
        continue
      }
      // Top half: y<0 → sy=-1. Bottom half: y>0 → sy=+1. x=0, so sx=-1.
      writeQuad(data, size, x, py, m, -1, -1)
      writeQuad(data, size, x, mirrorY, m, -1, 1)
    }
  }
}

function writeQuad(
  data: Uint8ClampedArray,
  size: number,
  tx: number,
  ty: number,
  m: { tR: number; tG: number; bSame: number; bOpp: number },
  sx: -1 | 1,
  sy: -1 | 1,
): void {
  const i = (ty * size + tx) * 4
  data[i] = Math.round(127.5 - sx * m.tR)
  data[i + 1] = Math.round(127.5 - sy * m.tG)
  data[i + 2] = sx * sy === 1 ? m.bSame : m.bOpp
  data[i + 3] = 255
}

/**
 * Reference implementation that iterates every pixel without the quadrant
 * shortcut. Kept for parity tests in T2; not exported as public API.
 */
export function writeLensMapPixelsNaive(data: Uint8ClampedArray, options: LensMapOptions): void {
  const o = { ...DEFAULTS, ...options }
  const halfW = o.width / 2
  const halfH = o.height / 2
  const depth = o.depth ?? Math.min(halfW, halfH) * 0.5
  const size = o.resolution

  const cornerR = Math.min(o.borderRadius, Math.min(halfW, halfH))
  const innerW = Math.max(0, halfW - depth)
  const innerH = Math.max(0, halfH - depth)
  const innerR = Math.max(0, Math.min(o.borderRadius, Math.min(innerW, innerH)))
  const falloffSharpness = depth > 0 ? 1 / (depth * Math.SQRT2) : 1e6

  const hasSpecular = o.glowStrength > 0 || o.edgeStrength > 0
  const angle = (o.specularAngle * Math.PI) / 180
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const glowStart = (1 - o.glowSpread) * Math.SQRT2
  const glowRange = o.glowSpread * Math.SQRT2

  const dome = o.domeDepth > 0 ? computeDomeConstants(o.domeDepth, halfW, halfH) : null
  const useSplay = o.splay < 1
  const splayHalf = 0.5 * Math.min(halfW, halfH)
  const splayInv = splayHalf > 0 ? 1 / splayHalf : 0

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const idx = (py * size + px) * 4
      const x = ((px + 0.5) / size) * o.width - halfW
      const y = ((py + 0.5) / size) * o.height - halfH
      const ax = Math.abs(x)
      const ay = Math.abs(y)
      const sdf = roundedRectSDF(ax, ay, halfW, halfH, cornerR)

      if (o.clipToShape && sdf >= 0) {
        data[idx] = 128
        data[idx + 1] = 128
        data[idx + 2] = 128
        data[idx + 3] = 255
        continue
      }

      let gx: number
      let gy: number
      if (dome) {
        gx = Math.sign(x) * domeGradient(ax, dome.Rx, dome.scaleX)
        gy = Math.sign(y) * domeGradient(ay, dome.Ry, dome.scaleY)
      } else {
        gx = clamp(x / halfW, -1, 1)
        gy = clamp(y / halfH, -1, 1)
      }

      if (useSplay) {
        const nearH = Math.max(0, 1 - (halfH - ay) * splayInv) * (1 - o.splay)
        const nearV = Math.max(0, 1 - (halfW - ax) * splayInv) * (1 - o.splay)
        if (nearH > 0.001 || nearV > 0.001) {
          const ogx = gx
          const ogy = gy
          gx = ogx * (1 - nearH)
          gy = ogy * (1 - nearV)
          const before = Math.sqrt(ogx * ogx + ogy * ogy)
          const after = Math.sqrt(gx * gx + gy * gy)
          if (after > 0.001) {
            const renorm = before / after
            gx *= renorm
            gy *= renorm
          }
        }
      }

      let falloff = 1
      if (o.edgeFalloff) {
        const innerSdf = roundedRectSDF(ax, ay, innerW, innerH, innerR)
        falloff = 0.5 * (1 + erf(innerSdf * falloffSharpness))
      }

      data[idx] = Math.round((0.5 - 0.5 * gx * falloff) * 255)
      data[idx + 1] = Math.round((0.5 - 0.5 * gy * falloff) * 255)

      if (hasSpecular) {
        const dir = Math.abs(clamp(x / halfW, -1, 1) * cosA + clamp(y / halfH, -1, 1) * sinA)
        let spec = 0
        if (o.glowStrength > 0) {
          const t = glowRange > 0.001 ? clamp((dir - glowStart) / glowRange, 0, 1) : 0
          spec += o.glowStrength * Math.pow(t, o.glowExponent) * falloff
        }
        if (o.edgeStrength > 0) {
          const band = sdf < 0 ? Math.max(0, 1 + sdf / o.edgeWidth) : 0
          spec += o.edgeStrength * band * Math.pow(dir, o.edgeExponent)
        }
        data[idx + 2] = Math.round(127 * Math.min(1, spec) + 128)
      } else {
        data[idx + 2] = 128
      }
      data[idx + 3] = 255
    }
  }
}

/**
 * Generates the displacement map that drives the glass effect.
 *
 * Channel layout (128 = neutral):
 *   R — horizontal displacement
 *   G — vertical displacement
 *   B — specular highlight mask (glow + edge), 128 = none
 *
 * feDisplacementMap shifts each output pixel's sample point by
 * scale * (channel/255 − 0.5), so values above 128 sample to the right/down.
 */
export function generateLensMap(options: LensMapOptions): LensMap {
  const o = { ...DEFAULTS, ...options }
  const size = o.resolution
  const cornerR = Math.min(o.borderRadius, Math.min(o.width / 2, o.height / 2))

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('lenscn: 2d canvas unavailable')
  const image = ctx.createImageData(size, size)

  const started = performance.now()
  writeLensMapPixels(image.data, options)
  const generateMs = performance.now() - started

  ctx.putImageData(image, 0, 0)
  return {
    url: canvas.toDataURL('image/png'),
    resolution: size,
    width: o.width,
    height: o.height,
    borderRadius: cornerR,
    generateMs,
  }
}
