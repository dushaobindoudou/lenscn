'use client'

import {
  forwardRef,
  useState,
  useEffect,
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { injectPlaceholderStyle } from '../glass-native-select/placeholder-style'

// Heights per DESIGN.md: sm=32px, md=36px (default), lg=44px.
const HEIGHT: Record<'sm' | 'md' | 'lg', number> = { sm: 32, md: 36, lg: 44 }
const FONT_SIZE: Record<'sm' | 'md' | 'lg', number> = { sm: 13, md: 14, lg: 15 }

// ─── Input ───────────────────────────────────────────────────────────────────

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Height preset: sm=32px, md=36px (default), lg=44px. */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Marks the field as invalid: applies --ln-danger border and sets
   * aria-invalid="true".
   */
  invalid?: boolean
}

/**
 * Matte text input. No glass (G1/G6 — inputs are content surfaces).
 *
 * Background: --ln-surface-2. Border: 1px solid --ln-border-strong.
 * Radius: --ln-radius-sm. Focus ring: 2px solid --ln-focus-ring, offset 2px.
 * invalid prop → danger border + aria-invalid.
 * Placeholder color is set via an injected <style> (::placeholder cannot
 * be styled inline).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    invalid = false,
    disabled = false,
    style,
    className,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    injectPlaceholderStyle()
  }, [])

  const inputStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    height: `${HEIGHT[size]}px`,
    padding: '0 12px',
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
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box',
    transition: 'border-color 150ms ease-out',
    ...style,
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    onFocus?.(e)
  }
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    onBlur?.(e)
  }

  return (
    <input
      ref={ref}
      className={`ln-input${className ? ` ${className}` : ''}`}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      style={inputStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  )
})

// ─── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Marks the field as invalid: applies --ln-danger border and sets
   * aria-invalid="true".
   */
  invalid?: boolean
  /** Minimum number of visible rows. */
  rows?: number
}

/**
 * Matte multi-line text input. Same token usage as Input.
 * Resizes vertically (resize: vertical). No glass (G1).
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    invalid = false,
    disabled = false,
    rows = 3,
    style,
    className,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    injectPlaceholderStyle()
  }, [])

  const textareaStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '14px',
    lineHeight: '22px',
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
    cursor: disabled ? 'not-allowed' : 'text',
    resize: 'vertical',
    boxSizing: 'border-box',
    transition: 'border-color 150ms ease-out',
    ...style,
  }

  const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true)
    onFocus?.(e)
  }
  const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false)
    onBlur?.(e)
  }

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`ln-textarea${className ? ` ${className}` : ''}`}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      style={textareaStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  )
})

export default Input
