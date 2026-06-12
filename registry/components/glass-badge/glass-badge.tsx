'use client'

import { type CSSProperties, type HTMLAttributes } from 'react'

export type BadgeTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone that drives background tint and text color. */
  tone?: BadgeTone
}

/** Maps each tone to the fill token and text token. */
const TONE_VARS: Record<BadgeTone, { bg: string; text: string }> = {
  accent:  { bg: 'var(--ln-accent)',  text: 'var(--ln-accent)' },
  success: { bg: 'var(--ln-success)', text: 'var(--ln-success-text)' },
  warning: { bg: 'var(--ln-warning)', text: 'var(--ln-warning-text)' },
  danger:  { bg: 'var(--ln-danger)',  text: 'var(--ln-danger-text)' },
  info:    { bg: 'var(--ln-info)',    text: 'var(--ln-info-text)' },
  neutral: { bg: 'var(--ln-text)',    text: 'var(--ln-text-muted)' },
}

/**
 * Matte badge pill. No glass (G1). Background is a 14% tint of the tone
 * color; text uses the semantic `-text` token for AA contrast on light
 * surfaces.
 *
 * Tint pattern: `color-mix(in srgb, <tone> 14%, transparent)` —
 * no raw hex, CSS-native.
 */
export function Badge({ tone = 'neutral', style, children, ...rest }: BadgeProps) {
  const { bg, text } = TONE_VARS[tone]

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '22px',
    padding: '0 8px',
    borderRadius: 'var(--ln-radius-full)',
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    background: `color-mix(in srgb, ${bg} 14%, transparent)`,
    color: text,
    ...style,
  }

  return (
    <span style={badgeStyle} {...rest}>
      {children}
    </span>
  )
}

export default Badge
