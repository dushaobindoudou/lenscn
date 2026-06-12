'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Glass } from '@lenscn/react'
import { isSupported, prefersReducedMotion } from 'lenscn'

export interface GlassTab {
  value: string
  label: string
  content: ReactNode
}

export interface GlassTabsProps {
  tabs: GlassTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  style?: React.CSSProperties
}

/** ~3% single-overshoot spring — the JS twin of --ln-ease-spring. */
function springOut(t: number): number {
  const s = 0.9
  const u = t - 1
  return 1 + (s + 1) * u * u * u + s * u * u
}

/**
 * Tabs with a refracting glass lens that slides between labels. One
 * filter, lens position animates between active items — no map regen.
 *
 * WAI-ARIA tablist: arrow keys move the active tab, Home/End jump to
 * the ends, the panel is the tabpanel labelled by the active tab.
 *
 * Degradation: when the glass effect is unavailable the lens is replaced
 * by a solid highlight pill. Under `prefers-reduced-motion: reduce` the
 * lens jumps to the active tab without easing.
 */
export function GlassTabs({
  tabs,
  value: controlled,
  defaultValue,
  onValueChange,
  className,
  style,
}: GlassTabsProps) {
  const [uncontrolled, setUncontrolled] = useState<string>(
    () => defaultValue ?? tabs[0]?.value ?? '',
  )
  const value = controlled ?? uncontrolled
  const tablistRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [glass] = useState(() => isSupported())
  const anim = useRef(0)

  // Slide the lens to the active tab. Only x/y are eased — the lens
  // size snaps to the target so the displacement map regenerates at
  // most once per tab change, never per animation frame.
  useLayoutEffect(() => {
    const el = tabRefs.current.get(value)
    if (!el || !tablistRef.current) return
    const rect = el.getBoundingClientRect()
    const parent = tablistRef.current.getBoundingClientRect()
    const next = {
      x: rect.left - parent.left + rect.width / 2,
      y: rect.top - parent.top + rect.height / 2,
      w: rect.width,
      h: rect.height,
    }
    if (!lens || prefersReducedMotion()) {
      setLens(next)
      return
    }
    cancelAnimationFrame(anim.current)
    const from = lens
    const start = performance.now()
    const duration = 350
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const k = springOut(t)
      setLens({
        x: from.x + (next.x - from.x) * k,
        y: from.y + (next.y - from.y) * k,
        w: next.w,
        h: next.h,
      })
      if (t < 1) anim.current = requestAnimationFrame(tick)
    }
    anim.current = requestAnimationFrame(tick)
  }, [value, tabs])

  // Re-measure on resize.
  useEffect(() => {
    if (!tablistRef.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const el = tabRefs.current.get(value)
      if (!el || !tablistRef.current) return
      const rect = el.getBoundingClientRect()
      const parent = tablistRef.current.getBoundingClientRect()
      setLens({
        x: rect.left - parent.left + rect.width / 2,
        y: rect.top - parent.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
      })
    })
    ro.observe(tablistRef.current)
    return () => ro.disconnect()
  }, [value])

  const select = (next: string) => {
    if (controlled === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }
  const onKey = (e: KeyboardEvent) => {
    const idx = tabs.findIndex((t) => t.value === value)
    let next = idx
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next !== idx) {
      e.preventDefault()
      select(tabs[next].value)
      tabRefs.current.get(tabs[next].value)?.focus()
    }
  }

  const active = tabs.find((t) => t.value === value)

  return (
    <div className={className} style={style}>
      <div
        ref={tablistRef}
        role="tablist"
        onKeyDown={onKey}
        style={{ position: 'relative', display: 'inline-flex', gap: 4, borderBottom: '1px solid var(--ln-border)' }}
      >
        {lens && glass && (
          <Glass
            lens={{ width: lens.w, height: lens.h, borderRadius: 12, depth: 12, domeDepth: 6, glowStrength: 0.4, edgeStrength: 0.35 }}
            look={{ scale: 20, chroma: 0.2, specularStrength: 1.15 }}
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
              borderRadius: '12px',
              background: 'var(--ln-fallback-pill)',
              pointerEvents: 'none',
            }}
          />
        )}
        {tabs.map((t) => {
          const selected = t.value === value
          return (
            <button
              key={t.value}
              ref={(el) => {
                if (el) tabRefs.current.set(t.value, el)
                else tabRefs.current.delete(t.value)
              }}
              type="button"
              role="tab"
              id={`tab-${t.value}`}
              aria-selected={selected}
              aria-controls={`tabpanel-${t.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.value)}
              style={{
                position: 'relative',
                padding: '10px 18px',
                background: 'transparent',
                border: 'none',
                color: selected ? 'var(--ln-text)' : 'var(--ln-text-muted)',
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active?.value}`}
        aria-labelledby={active ? `tab-${active.value}` : undefined}
        style={{ padding: '20px 0' }}
      >
        {active?.content}
      </div>
    </div>
  )
}

export default GlassTabs
