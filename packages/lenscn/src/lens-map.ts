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
  const halfW = o.width / 2
  const halfH = o.height / 2
  const depth = o.depth ?? Math.min(halfW, halfH) * 0.5
  const size = o.resolution

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('lenscn: 2d canvas unavailable')
  const image = ctx.createImageData(size, size)
  const data = image.data

  const cornerR = Math.min(o.borderRadius, Math.min(halfW, halfH))
  // Inner rounded rect for the edge falloff: the flat plateau of the lens.
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

  const started = performance.now()
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const idx = (py * size + px) * 4
      // Pixel center in lens space, origin at lens center.
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
        // Proximity to the horizontal edges squashes gx, proximity to the
        // vertical edges squashes gy; magnitude is restored afterwards so
        // only the direction bends toward the edge normal.
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
        // Alignment of this point with the light axis, 0 at center.
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
