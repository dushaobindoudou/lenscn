'use client'

import {
  forwardRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'

export interface CheckboxProps {
  /**
   * Controlled checked state. Use `true`, `false`, or `'mixed'` for
   * indeterminate / tri-state. When omitted the component is uncontrolled.
   */
  checked?: boolean | 'mixed'
  /** Uncontrolled initial state. Ignored when `checked` is provided. */
  defaultChecked?: boolean | 'mixed'
  /** Fired when the user toggles the checkbox. mixed → true on Space. */
  onCheckedChange?: (checked: boolean) => void
  /** Disable interaction. */
  disabled?: boolean
  /** Extra CSS class on the root element. */
  className?: string
  /** Inline style override (spread last). */
  style?: CSSProperties
  /** id forwarded to the root button — needed for label association. */
  id?: string
  /** aria-describedby forwarded to root button — wired by Field. */
  'aria-describedby'?: string
  /** aria-label when no visible label text is available. */
  'aria-label'?: string
}

/**
 * Matte 20×20 checkbox. No glass (G1/G6 — 20px is below the 24px
 * minimum lens size). Checked = accent fill + accent-contrast checkmark.
 * Mixed state supported (`aria-checked="mixed"`), Space toggles mixed → true.
 *
 * Pattern mirrors GlassSwitch: `<button role="checkbox">` with
 * controlled / uncontrolled via checked / defaultChecked / onCheckedChange.
 * Space toggles. Keyboard focus ring via outline sub-properties.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    checked: controlled,
    defaultChecked = false,
    onCheckedChange,
    disabled = false,
    className,
    style,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState<boolean | 'mixed'>(defaultChecked)
  const checked = controlled !== undefined ? controlled : uncontrolled

  const [focused, setFocused] = useState(false)

  const toggle = () => {
    if (disabled) return
    // mixed → true; true/false → invert
    const next = checked === 'mixed' ? true : !checked
    if (controlled === undefined) setUncontrolled(next)
    onCheckedChange?.(next)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    toggle()
  }

  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    setFocused(true)
  }

  const handleBlur = (e: FocusEvent<HTMLButtonElement>) => {
    setFocused(false)
  }

  const isChecked = checked === true
  const isMixed = checked === 'mixed'

  // Background color
  let bg: string
  if (isChecked || isMixed) {
    bg = 'var(--ln-accent)'
  } else {
    bg = 'var(--ln-surface-2)'
  }

  const boxStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: isChecked || isMixed ? 'none' : '1px solid var(--ln-border-strong)',
    background: bg,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    padding: 0,
    // Focus ring via sub-properties (house pattern from glass-button)
    outlineWidth: focused ? '2px' : '0',
    outlineStyle: focused ? 'solid' : 'none',
    outlineColor: focused ? 'var(--ln-focus-ring)' : 'transparent',
    outlineOffset: '2px',
    transition: 'background 150ms ease-out, border-color 150ms ease-out',
    flexShrink: 0,
    ...style,
  }

  return (
    <button
      ref={ref}
      id={id}
      role="checkbox"
      type="button"
      aria-checked={isMixed ? 'mixed' : isChecked}
      aria-disabled={disabled || undefined}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
      style={boxStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Checkmark — inline SVG using currentColor (inherits accent-contrast) */}
      {isChecked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          style={{ color: 'var(--ln-accent-contrast)', display: 'block', flexShrink: 0 }}
        >
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {/* Mixed / indeterminate indicator — horizontal dash */}
      {isMixed && (
        <svg
          width="10"
          height="2"
          viewBox="0 0 10 2"
          fill="none"
          aria-hidden="true"
          style={{ color: 'var(--ln-accent-contrast)', display: 'block', flexShrink: 0 }}
        >
          <line
            x1="0"
            y1="1"
            x2="10"
            y2="1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
})

export default Checkbox
