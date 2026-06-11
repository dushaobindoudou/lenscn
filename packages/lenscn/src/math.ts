/**
 * Error function approximation via tanh. Max error ~0.02% over the range
 * we care about; cheap enough to call per pixel.
 */
export function erf(x: number): number {
  return Math.tanh(1.7724538509055159 * x) // √π
}

/**
 * Signed distance to a rounded rectangle, evaluated in the first quadrant
 * (callers pass absolute coordinates). Negative inside, positive outside.
 */
export function roundedRectSDF(
  ax: number,
  ay: number,
  halfW: number,
  halfH: number,
  radius: number,
): number {
  const qx = ax - halfW + radius
  const qy = ay - halfH + radius
  const dx = Math.max(qx, 0)
  const dy = Math.max(qy, 0)
  const outside = dx * dx + dy * dy
  return (outside > 0 ? Math.sqrt(outside) : 0) + Math.min(Math.max(qx, qy), 0) - radius
}

export interface DomeConstants {
  Rx: number
  Ry: number
  scaleX: number
  scaleY: number
}

/**
 * Mean of the sphere-surface slope s/√(R²−s²) over s ∈ [0, half],
 * trapezoidal rule. Used to normalize the dome profile so its average
 * displacement matches the linear profile regardless of dome depth.
 */
function meanSlope(R: number, half: number): number {
  const N = 200
  let sum = 0
  for (let i = 0; i <= N; i++) {
    const s = (i / N) * half
    const g = s / Math.sqrt(R * R - s * s)
    sum += i === 0 || i === N ? 0.5 * g : g
  }
  return sum / N
}

/**
 * A dome of depth d spanning a half-width w lies on a sphere of radius
 * R = (w² + d²) / 2d. Returns the per-axis radii and normalization scales.
 */
export function computeDomeConstants(depth: number, halfW: number, halfH: number): DomeConstants {
  const d = Math.max(0.01, Math.min(depth, Math.min(halfW, halfH) - 1))
  const Rx = (halfW * halfW + d * d) / (2 * d)
  const Ry = (halfH * halfH + d * d) / (2 * d)
  const mx = meanSlope(Rx, halfW)
  const my = meanSlope(Ry, halfH)
  return {
    Rx,
    Ry,
    scaleX: mx > 0 ? 0.5 / mx : 1,
    scaleY: my > 0 ? 0.5 / my : 1,
  }
}

/** Slope of the dome surface at distance p from the lens center, one axis. */
export function domeGradient(p: number, R: number, scale: number): number {
  const s = Math.min(p, 0.999 * R)
  return (s / Math.sqrt(R * R - s * s)) * scale
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}
