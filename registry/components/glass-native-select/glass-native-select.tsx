'use client'

import {
  forwardRef,
  useState,
  useEffect,
  type CSSProperties,
  type FocusEvent,
  type SelectHTMLAttributes,
} from 'react'
import { injectPlaceholderStyle } from './placeholder-style'

// Heights per DESIGN.md: sm=32px, md=36px (default), lg=44px.
const HEIGHT: Record<'sm' | 'md' | 'lg', number> = { sm: 32, md: 36, lg: 44 }
const FONT_SIZE: Record<'sm' | 'md' | 'lg', number> = { sm: 13, md: 14, lg: 15 }

export interface NativeSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface NativeSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Height preset: sm=32px, md=36px (default), lg=44px. */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Options rendered as <option>s internally. Consumers who need
   * <optgroup> or custom <option> children can pass them via
   * `children` and omit `options` (or use a forwarded ref to the
   * underlying <select>).
   */
  options?: NativeSelectOption[]
  /**
   * Marks the field as invalid: applies --ln-danger border and sets
   * aria-invalid="true".
   */
  invalid?: boolean
}

/**
 * Matte native <select>. No glass (G1/G6 — selects are content surfaces).
 * Same height/size pattern as Input. Custom chevron is an inline SVG
 * absolutely positioned inside a relative wrapper, using `currentColor`
 * so it inherits `--ln-text` from the select.
 *
 * Background: --ln-surface-2. Border: 1px solid --ln-border-strong.
 * Radius: --ln-radius-sm. Focus ring: 2px solid --ln-focus-ring, offset 2px.
 * invalid prop → danger border + aria-invalid. Disabled uses the real
 * `disabled` attribute.
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  function NativeSelect(
    {
      size = 'md',
      invalid = false,
      disabled = false,
      options,
      style,
      className,
      onFocus,
      onBlur,
      children,
      ...rest
    },
    ref,
  ) {
    const [focused, setFocused] = useState(false)

    useEffect(() => {
      injectPlaceholderStyle()
    }, [])

    const wrapperStyle: CSSProperties = {
      position: 'relative',
      display: 'block',
      width: '100%',
    }

    const selectStyle: CSSProperties = {
      display: 'block',
      width: '100%',
      height: `${HEIGHT[size]}px`,
      padding: '0 32px 0 12px',
      fontFamily: 'var(--ln-font-sans)',
      fontSize: `${FONT_SIZE[size]}px`,
      lineHeight: `${HEIGHT[size]}px`,
      color: 'var(--ln-text)',
      background: 'var(--ln-surface-2)',
      border: `1px solid ${invalid ? 'var(--ln-danger)' : 'var(--ln-border-strong)'}`,
      borderRadius: 'var(--ln-radius-sm)',
      outline: 'none',
      outlineWidth: focused ? '2px' : '0',
      outlineStyle: focused ? 'solid' : 'none',
      outlineColor: focused ? 'var(--ln-focus-ring)' : 'transparent',
      outlineOffset: '2px',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxSizing: 'border-box',
      transition: 'border-color 150ms ease-out',
      // The native select gets the chevron via an overlay SVG, but we still
      // hide the OS-rendered default arrow for a consistent look across
      // platforms (Chromium / Safari / Firefox).
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      ...style,
    }

    const chevronStyle: CSSProperties = {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--ln-text-muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }

    const handleFocus = (e: FocusEvent<HTMLSelectElement>) => {
      setFocused(true)
      onFocus?.(e)
    }
    const handleBlur = (e: FocusEvent<HTMLSelectElement>) => {
      setFocused(false)
      onBlur?.(e)
    }

    return (
      <span style={wrapperStyle}>
        <select
          ref={ref}
          className={`ln-select${className ? ` ${className}` : ''}`}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          style={selectStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {/* Chevron — inline SVG using currentColor (inherits text color) */}
        <span aria-hidden="true" style={chevronStyle}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            <path
              d="M3 4.5l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    )
  },
)

export default NativeSelect
