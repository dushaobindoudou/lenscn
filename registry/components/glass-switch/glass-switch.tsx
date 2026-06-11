'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Glass } from '@lenscn/react'

export interface GlassSwitchProps {
  /** Controlled checked state. */
  checked?: boolean
  /** Uncontrolled initial state. Ignored when `checked` is provided. */
  defaultChecked?: boolean
  /** Fired when the user toggles the switch. */
  onCheckedChange?: (checked: boolean) => void
  /** Track width in px. */
  width?: number
  /** Track height in px. */
  height?: number
  /** Disable interaction. */
  disabled?: boolean
  className?: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Accessible switch with a refracting glass handle that slides between
 * off and on positions. Keyboard: Space / Enter toggles.
 */
export function GlassSwitch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  width = 148,
  height = 76,
  disabled = false,
  className,
}: GlassSwitchProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked)
  const checked = controlled ?? uncontrolled
  const [progress, setProgress] = useState(checked ? 1 : 0)
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

  const toggle = () => {
    if (disabled) return
    const next = !checked
    if (controlled === undefined) setUncontrolled(next)
    onCheckedChange?.(next)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }

  const inset = height / 2
  const lensX = inset + (width - 2 * inset) * progress

  return (
    <div
      role="switch"
      tabIndex={disabled ? -1 : 0}
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={toggle}
      onKeyDown={onKey}
      className={className}
      style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
    >
      <Glass
        lens={{
          width: height,
          height: height,
          borderRadius: height / 2,
          depth: 18,
          domeDepth: 8,
          glowStrength: 0.45,
          edgeStrength: 0.3,
        }}
        look={{ scale: 26, chroma: 0.2, specularStrength: 1.2 }}
        x={lensX}
        y={height / 2}
        as="span"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  )
}

export default GlassSwitch
