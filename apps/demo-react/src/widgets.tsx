import { useEffect, useRef, useState } from 'react'
import { Glass } from '@lenscn/react'

const TRACK_W = 148
const TRACK_H = 76
const INSET = TRACK_H / 2

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function GlassSwitchDemo() {
  const [checked, setChecked] = useState(false)
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(raf.current)
    const from = progress
    const target = checked ? 1 : 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 260)
      setProgress(from + (target - from) * easeOutCubic(t))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked])

  const toggle = () => setChecked((v) => !v)
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }
  const lensX = INSET + (TRACK_W - 2 * INSET) * progress

  return (
    <div
      role="switch"
      tabIndex={0}
      aria-checked={checked}
      onClick={toggle}
      onKeyDown={onKey}
      className="switch-root"
    >
      <Glass
        className="switch-track"
        lens={{ width: 68, height: 68, borderRadius: 34, depth: 18, domeDepth: 8, glowStrength: 0.45, edgeStrength: 0.3 }}
        look={{ scale: 26, chroma: 0.2, specularStrength: 1.2 }}
        x={lensX}
        y={TRACK_H / 2}
      />
    </div>
  )
}

const SLIDER_W = 320
const SLIDER_H = 60
const LENS_W = 72
const LENS_INSET = LENS_W / 2

export function GlassSliderDemo() {
  const [value, setValue] = useState(0.4)
  const dragging = useRef(false)
  const root = useRef<HTMLDivElement>(null)

  const lensX = LENS_INSET + (SLIDER_W - 2 * LENS_INSET) * value

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as Element).setPointerCapture(e.pointerId)
    updateFromEvent(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) updateFromEvent(e.clientX)
  }
  const onPointerUp = () => {
    dragging.current = false
  }
  const updateFromEvent = (clientX: number) => {
    if (!root.current) return
    const rect = root.current.getBoundingClientRect()
    const x = clientX - rect.left
    setValue(Math.min(1, Math.max(0, (x - LENS_INSET) / (SLIDER_W - 2 * LENS_INSET))))
  }
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 0.05 : e.key === 'ArrowLeft' ? -0.05 : 0
    if (step !== 0) {
      e.preventDefault()
      setValue((v) => Math.min(1, Math.max(0, v + step)))
    }
  }

  return (
    <div
      ref={root}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKey}
      className="slider-root"
      style={{ ['--p' as string]: `${value * 100}%` } as React.CSSProperties}
    >
      <Glass
        className="slider-track"
        lens={{ width: 72, height: 52, borderRadius: 26, depth: 16, domeDepth: 6, glowStrength: 0.4, edgeStrength: 0.3 }}
        look={{ scale: 30, chroma: 0.2, specularStrength: 1.1 }}
        x={lensX}
        y={SLIDER_H / 2}
      />
    </div>
  )
}
