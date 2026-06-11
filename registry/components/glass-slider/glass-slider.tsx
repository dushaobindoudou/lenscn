'use client'

import { useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent } from 'react'
import { Glass } from '@lenscn/react'
import { isSupported } from 'lenscn'

export interface GlassSliderProps {
  /** Controlled value, 0..1. */
  value?: number
  /** Uncontrolled initial value, 0..1. Ignored when `value` is provided. */
  defaultValue?: number
  /** Fired with the new value (0..1) whenever it changes. */
  onValueChange?: (value: number) => void
  /** Track width in px. */
  width?: number
  /** Track height in px. */
  height?: number
  /** Disable interaction. */
  disabled?: boolean
  /** Step for keyboard arrows (0..1). Defaults to 0.05. */
  step?: number
  className?: string
}

function trackStyle(value: number, width: number, height: number): CSSProperties {
  return {
    position: 'relative',
    display: 'inline-block',
    width: `${width}px`,
    height: `${height}px`,
    background: `linear-gradient(90deg, #6c5ce7 ${value * 100}%, #262c3a ${value * 100}%)`,
    borderRadius: `${height / 2}px`,
  }
}

/**
 * Range slider with a refracting glass handle. Drag the handle, or
 * focus the slider and use the arrow keys. Value is normalized to
 * 0..1; consumers map to their own range.
 *
 * Degradation: when the glass effect is unavailable (no SVG filter
 * support, or `prefers-reduced-transparency: reduce`) the slider renders
 * the plain track with a solid handle instead.
 */
export function GlassSlider({
  value: controlled,
  defaultValue = 0.4,
  onValueChange,
  width = 320,
  height = 60,
  disabled = false,
  step = 0.05,
  className,
}: GlassSliderProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const value = controlled ?? uncontrolled
  const [glass] = useState(() => isSupported())
  const dragging = useRef(false)
  const root = useRef<HTMLDivElement>(null)

  const set = (v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    if (controlled === undefined) setUncontrolled(clamped)
    onValueChange?.(clamped)
  }

  const onPointerDown = (e: PointerEvent) => {
    if (disabled) return
    dragging.current = true
    ;(e.target as Element).setPointerCapture(e.pointerId)
    updateFromEvent(e.clientX)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (dragging.current) updateFromEvent(e.clientX)
  }
  const onPointerUp = () => {
    dragging.current = false
  }
  const updateFromEvent = (clientX: number) => {
    if (!root.current) return
    const rect = root.current.getBoundingClientRect()
    const x = clientX - rect.left
    const lensH = height - 8
    const inset = lensH / 2
    set((x - inset) / (width - 2 * inset))
  }
  const onKey = (e: KeyboardEvent) => {
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? step
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
        ? -step
        : 0
    if (delta !== 0) {
      e.preventDefault()
      set(value + delta)
    }
  }

  const lensH = height - 8
  const inset = lensH / 2
  const lensX = inset + (width - 2 * inset) * value

  return (
    <div
      ref={root}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-disabled={disabled}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKey}
      className={className}
      style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'ew-resize', opacity: disabled ? 0.5 : 1 }}
    >
      {glass ? (
        <Glass
          lens={{
            width: lensH,
            height: lensH,
            borderRadius: lensH / 2,
            depth: 16,
            domeDepth: 6,
            glowStrength: 0.4,
            edgeStrength: 0.3,
          }}
          look={{ scale: 30, chroma: 0.2, specularStrength: 1.1 }}
          x={lensX}
          y={height / 2}
          as="span"
          style={trackStyle(value, width, height)}
        />
      ) : (
        <span style={trackStyle(value, width, height)}>
          <span
            data-fallback-handle
            style={{
              position: 'absolute',
              left: `${lensX - (lensH - 8) / 2}px`,
              top: `${(height - (lensH - 8)) / 2}px`,
              width: `${lensH - 8}px`,
              height: `${lensH - 8}px`,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
            }}
          />
        </span>
      )}
    </div>
  )
}

export default GlassSlider
