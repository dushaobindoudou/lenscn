'use client'

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Glass } from '@lenscn/react'
import { isSupported, prefersReducedMotion } from 'lenscn'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
}

export interface GlassSegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** Pixels of padding around the option label, applied to the lens rect. */
  lensPadding?: number
  className?: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Segmented control with a refracting glass lens that slides between
 * options. One filter, the lens position animates between items — no
 * map regen on selection change.
 *
 * Degradation: when the glass effect is unavailable the lens is replaced
 * by a solid highlight pill. Under `prefers-reduced-motion: reduce` the
 * lens jumps to the active option without easing.
 */
export function GlassSegmentedControl<T extends string = string>({
  options,
  value: controlled,
  defaultValue,
  onValueChange,
  lensPadding = 6,
  className,
}: GlassSegmentedControlProps<T>) {
  const [uncontrolled, setUncontrolled] = useState<T>(
    () => defaultValue ?? options[0]?.value ?? ('' as T),
  )
  const value = controlled ?? uncontrolled
  const containerRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef(new Map<T, HTMLButtonElement>())
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [glass] = useState(() => isSupported())
  const anim = useRef(0)

  // Measure the active label, then tween the lens to it. Only x/y are
  // eased — the lens size snaps to the target so the displacement map
  // regenerates at most once per selection, never per animation frame.
  useLayoutEffect(() => {
    const el = labelRefs.current.get(value)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const parent = containerRef.current!.getBoundingClientRect()
    const next = {
      x: rect.left - parent.left + rect.width / 2,
      y: rect.top - parent.top + rect.height / 2,
      w: rect.width + lensPadding * 2,
      h: rect.height + lensPadding * 2,
    }
    if (!lens || prefersReducedMotion()) {
      setLens(next)
      return
    }
    cancelAnimationFrame(anim.current)
    const from = lens
    const start = performance.now()
    const duration = 240
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const k = easeOutCubic(t)
      setLens({
        x: from.x + (next.x - from.x) * k,
        y: from.y + (next.y - from.y) * k,
        w: next.w,
        h: next.h,
      })
      if (t < 1) anim.current = requestAnimationFrame(tick)
    }
    anim.current = requestAnimationFrame(tick)
  }, [value, options, lensPadding])

  // Re-measure on resize.
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const el = labelRefs.current.get(value)
      if (!el || !containerRef.current) return
      const rect = el.getBoundingClientRect()
      const parent = containerRef.current.getBoundingClientRect()
      setLens({
        x: rect.left - parent.left + rect.width / 2,
        y: rect.top - parent.top + rect.height / 2,
        w: rect.width + lensPadding * 2,
        h: rect.height + lensPadding * 2,
      })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [value, lensPadding])

  const select = (next: T) => {
    if (controlled === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }
  const onKey = (e: KeyboardEvent) => {
    const idx = options.findIndex((o) => o.value === value)
    let next = idx
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % options.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (idx - 1 + options.length) % options.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = options.length - 1
    if (next !== idx) {
      e.preventDefault()
      select(options[next].value)
    }
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      tabIndex={0}
      onKeyDown={onKey}
      className={className}
      style={{ position: 'relative', display: 'inline-flex', gap: 4 }}
    >
      {lens && glass && (
        <Glass
          lens={{ width: lens.w, height: lens.h, borderRadius: lens.h / 2, depth: 14, domeDepth: 6, glowStrength: 0.4, edgeStrength: 0.25 }}
          look={{ scale: 22, chroma: 0.2, specularStrength: 1.1 }}
          x={lens.x}
          y={lens.y}
          as="span"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        />
      )}
      {lens && !glass && (
        <span
          data-fallback-handle
          style={{
            position: 'absolute',
            left: `${lens.x - lens.w / 2}px`,
            top: `${lens.y - lens.h / 2}px`,
            width: `${lens.w}px`,
            height: `${lens.h}px`,
            borderRadius: `${lens.h / 2}px`,
            background: 'rgba(255,255,255,0.14)',
            pointerEvents: 'none',
          }}
        />
      )}
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(el) => {
              if (el) labelRefs.current.set(opt.value, el)
              else labelRefs.current.delete(opt.value)
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => select(opt.value)}
            style={{
              position: 'relative',
              padding: `${8 + lensPadding}px ${16 + lensPadding}px`,
              background: 'transparent',
              border: 'none',
              color: selected ? '#fff' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export default GlassSegmentedControl
