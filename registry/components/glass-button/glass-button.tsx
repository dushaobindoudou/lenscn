'use client'

import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
} from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Height preset: sm=32px, md=36px (default), lg=44px. */
  size?: 'sm' | 'md' | 'lg'
}

const HEIGHT: Record<NonNullable<ButtonProps['size']>, number> = {
  sm: 32,
  md: 36,
  lg: 44,
}

const H_PADDING: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: '0 12px',
  md: '0 16px',
  lg: '0 20px',
}

const FONT_SIZE: Record<NonNullable<ButtonProps['size']>, number> = {
  sm: 13,
  md: 14,
  lg: 15,
}

/**
 * Matte button primitive. No glass (G1 — buttons are matte by doctrine).
 *
 * Variants: primary (accent fill), secondary (border), ghost (transparent),
 * danger (danger fill). Sizes: sm 32px / md 36px / lg 44px.
 * Focus ring: 2px solid --ln-focus-ring, offset 2px.
 * Disabled: real HTML `disabled` attribute (not aria-disabled), 50% opacity.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    disabled = false,
    style,
    children,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    ...rest
  },
  ref,
) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [focused, setFocused] = useState(false)

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: `${HEIGHT[size]}px`,
    padding: H_PADDING[size],
    borderRadius: 'var(--ln-radius-md)',
    fontFamily: 'var(--ln-font-sans)',
    fontSize: `${FONT_SIZE[size]}px`,
    fontWeight: 500,
    lineHeight: 1,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color 150ms ease-out, color 150ms ease-out',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    whiteSpace: 'nowrap',
    // Focus ring — set each sub-property explicitly so CSS-variable
    // parsing in browsers and test environments is unambiguous.
    outlineWidth: focused ? '2px' : '0',
    outlineStyle: focused ? 'solid' : 'none',
    outlineColor: focused ? 'var(--ln-focus-ring)' : 'transparent',
    outlineOffset: '2px',
  }

  const variantStyle = getVariantStyle(variant, hovered, pressed)

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    setHovered(true)
    onMouseEnter?.(e)
  }
  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    setHovered(false)
    setPressed(false)
    onMouseLeave?.(e)
  }
  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    setPressed(true)
    onMouseDown?.(e)
  }
  const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
    setPressed(false)
    onMouseUp?.(e)
  }
  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    setFocused(true)
    onFocus?.(e)
  }
  const handleBlur = (e: FocusEvent<HTMLButtonElement>) => {
    setFocused(false)
    setPressed(false)
    onBlur?.(e)
  }

  return (
    <button
      ref={ref}
      disabled={disabled}
      style={{ ...base, ...variantStyle, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      {children}
    </button>
  )
})

function getVariantStyle(
  variant: NonNullable<ButtonProps['variant']>,
  hovered: boolean,
  pressed: boolean,
): CSSProperties {
  switch (variant) {
    case 'primary': {
      let bg = 'var(--ln-accent)'
      if (pressed) bg = 'var(--ln-accent-pressed)'
      else if (hovered) bg = 'var(--ln-accent-hover)'
      return {
        background: bg,
        color: 'var(--ln-accent-contrast)',
      }
    }
    case 'secondary': {
      return {
        background: hovered || pressed ? 'var(--ln-surface-2)' : 'var(--ln-surface)',
        color: 'var(--ln-text)',
        border: '1px solid var(--ln-border-strong)',
      }
    }
    case 'ghost': {
      return {
        background: hovered || pressed ? 'var(--ln-surface-2)' : 'transparent',
        color: 'var(--ln-text)',
      }
    }
    case 'danger': {
      let bg = 'var(--ln-danger)'
      if (pressed) bg = 'color-mix(in srgb, var(--ln-danger) 80%, transparent)'
      else if (hovered) bg = 'color-mix(in srgb, var(--ln-danger) 90%, transparent)'
      return {
        background: bg,
        color: 'var(--ln-accent-contrast)',
      }
    }
  }
}

export default Button
