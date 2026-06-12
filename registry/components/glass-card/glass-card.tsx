'use client'

import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

// ─── Card ────────────────────────────────────────────────────────────────────

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Matte surface card. No glass (G1). Background `--ln-surface`, 1px
 * `--ln-border`, radius `--ln-radius-lg` (20px), padding 24px,
 * shadow `--ln-shadow-card`.
 */
export function Card({ style, children, ...rest }: CardProps) {
  const cardStyle: CSSProperties = {
    background: 'var(--ln-surface)',
    border: '1px solid var(--ln-border)',
    borderRadius: 'var(--ln-radius-lg)',
    padding: '24px',
    boxShadow: 'var(--ln-shadow-card)',
    ...style,
  }
  return (
    <div style={cardStyle} {...rest}>
      {children}
    </div>
  )
}

// ─── CardHeader ──────────────────────────────────────────────────────────────

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

/** Card header row. Provides bottom spacing to separate from content. */
export function CardHeader({ style, children, ...rest }: CardHeaderProps) {
  const headerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
    ...style,
  }
  return (
    <div style={headerStyle} {...rest}>
      {children}
    </div>
  )
}

// ─── CardTitle ───────────────────────────────────────────────────────────────

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

/** Card title — h3 style (17px / 600, per DESIGN.md). */
export function CardTitle({ style, children, ...rest }: CardTitleProps) {
  const titleStyle: CSSProperties = {
    margin: 0,
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '17px',
    fontWeight: 600,
    lineHeight: '24px',
    color: 'var(--ln-text)',
    ...style,
  }
  return (
    <h3 style={titleStyle} {...rest}>
      {children}
    </h3>
  )
}

// ─── CardContent ─────────────────────────────────────────────────────────────

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

/** Card content area — no extra padding (Card already adds 24px). */
export function CardContent({ style, children, ...rest }: CardContentProps) {
  const contentStyle: CSSProperties = {
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '15px',
    lineHeight: '22px',
    color: 'var(--ln-text)',
    ...style,
  }
  return (
    <div style={contentStyle} {...rest}>
      {children}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

export interface StatCardDelta {
  value: string
  direction: 'up' | 'down'
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Caption-style label — sentence case, muted color. */
  label: string
  /** KPI value — 28px / 600 / tabular-nums in --ln-font-sans. */
  value: string
  /** Optional delta indicator: value text + up/down direction. */
  delta?: StatCardDelta
}

/**
 * KPI stat card. Matte surface (G1). Label uses caption style (12px / 500,
 * muted). Value uses KPI style (28px / 600 / tabular-nums). Delta uses
 * success / danger color per direction.
 */
export function StatCard({ label, value, delta, style, ...rest }: StatCardProps) {
  return (
    <Card style={style} {...rest}>
      <StatCardInner label={label} value={value} delta={delta} />
    </Card>
  )
}

function StatCardInner({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta?: StatCardDelta
}): ReactNode {
  const labelStyle: CSSProperties = {
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '16px',
    color: 'var(--ln-text-muted)',
    marginBottom: '4px',
  }

  const valueStyle: CSSProperties = {
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '28px',
    fontWeight: 600,
    lineHeight: '34px',
    color: 'var(--ln-text)',
    fontVariantNumeric: 'tabular-nums',
  }

  const deltaStyle: CSSProperties = {
    marginTop: '4px',
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '13px',
    fontWeight: 500,
    lineHeight: '18px',
    color: delta?.direction === 'up' ? 'var(--ln-success-text)' : 'var(--ln-danger-text)',
  }

  return (
    <>
      <p style={labelStyle}>{label}</p>
      <p style={valueStyle}>{value}</p>
      {delta && (
        <p style={deltaStyle}>
          {delta.direction === 'up' ? '↑' : '↓'} {delta.value}
        </p>
      )}
    </>
  )
}

export default StatCard
