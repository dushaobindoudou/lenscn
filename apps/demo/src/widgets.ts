import { GlassFilter, generateLensMap } from 'lenscn'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Glass switch, modeled on Aave's <Glass lens={{ lensW, lensH }} x={progress}>
 * pattern: the filter lives on the track and the lens handle slides over it.
 */
export function initSwitch(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('.switch-track')!
  const lensW = 68
  const lensH = 68
  const map = generateLensMap({
    width: lensW,
    height: lensH,
    borderRadius: lensH / 2,
    depth: 18,
    domeDepth: 8,
    glowStrength: 0.45,
    edgeStrength: 0.3,
  })
  const glass = new GlassFilter(track, map, { scale: 26, chroma: 0.35, specularStrength: 1.2 })

  const trackW = 148
  const trackH = 76
  const inset = trackH / 2
  const xOff = inset
  const xOn = trackW - inset
  let checked = false
  let progress = 0
  let raf = 0

  const apply = () => glass.setPosition(xOff + (xOn - xOff) * progress, trackH / 2)
  apply()

  const animateTo = (target: number) => {
    cancelAnimationFrame(raf)
    const from = progress
    const start = performance.now()
    const duration = 260
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      progress = from + (target - from) * easeOutCubic(t)
      apply()
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  const toggle = () => {
    checked = !checked
    root.setAttribute('aria-checked', String(checked))
    animateTo(checked ? 1 : 0)
  }

  root.addEventListener('click', toggle)
  root.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  })
}

/**
 * Glass slider: dragging moves the lens along the track while the fill
 * boundary (a CSS gradient stop) sweeps underneath it — the same
 * refractionTarget idea as Aave's slider demo.
 */
export function initSlider(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('.slider-track')!
  const lensW = 72
  const lensH = 52
  const map = generateLensMap({
    width: lensW,
    height: lensH,
    borderRadius: lensH / 2,
    depth: 16,
    domeDepth: 6,
    glowStrength: 0.4,
    edgeStrength: 0.3,
  })
  const glass = new GlassFilter(track, map, { scale: 30, chroma: 0.5, specularStrength: 1.1 })

  const trackW = 320
  const trackH = 60
  const inset = lensW / 2
  let value = 0.4

  const apply = () => {
    const x = inset + (trackW - 2 * inset) * value
    glass.setPosition(x, trackH / 2)
    track.style.setProperty('--p', `${value * 100}%`)
    root.setAttribute('aria-valuenow', String(Math.round(value * 100)))
  }
  apply()

  let dragging = false
  const valueFromEvent = (e: PointerEvent) => {
    const rect = track.getBoundingClientRect()
    const x = e.clientX - rect.left
    value = Math.min(1, Math.max(0, (x - inset) / (trackW - 2 * inset)))
    apply()
  }

  root.addEventListener('pointerdown', (e) => {
    dragging = true
    root.setPointerCapture(e.pointerId)
    valueFromEvent(e)
  })
  root.addEventListener('pointermove', (e) => {
    if (dragging) valueFromEvent(e)
  })
  root.addEventListener('pointerup', () => {
    dragging = false
  })
  root.addEventListener('keydown', (e) => {
    const step = e.key === 'ArrowRight' ? 0.05 : e.key === 'ArrowLeft' ? -0.05 : 0
    if (step !== 0) {
      e.preventDefault()
      value = Math.min(1, Math.max(0, value + step))
      apply()
    }
  })
}
