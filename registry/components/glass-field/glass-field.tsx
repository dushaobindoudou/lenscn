'use client'

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
} from 'react'

// ─── FieldContext ─────────────────────────────────────────────────────────────

interface FieldContextValue {
  /** id to apply to the control inside Field. */
  controlId: string
  /** id of the error element, present only when an error is shown. */
  errorId: string | undefined
}

const FieldContext = createContext<FieldContextValue | null>(null)

// ─── Label ────────────────────────────────────────────────────────────────────

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * Caption-style label (12px / 500, muted). Sentence case — no uppercase.
 *
 * When used inside a `Field`, `htmlFor` is wired automatically via
 * FieldContext. When used standalone, supply `htmlFor` yourself.
 */
export function Label({ style, children, htmlFor, ...rest }: LabelProps) {
  const ctx = useContext(FieldContext)

  const labelStyle: CSSProperties = {
    display: 'block',
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '16px',
    color: 'var(--ln-text-muted)',
    marginBottom: '4px',
    ...style,
  }

  return (
    <label htmlFor={htmlFor ?? ctx?.controlId} style={labelStyle} {...rest}>
      {children}
    </label>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Label text shown above the control. */
  label: string
  /** Optional error message. Shown below the control in danger color. */
  error?: string
  /**
   * Single form control child (Input, Textarea, NativeSelect, Checkbox).
   * Must be a single ReactElement — Field clones it to inject `id` and
   * `aria-describedby`. Fragments, arrays, and primitive children render
   * as-is and receive no automatic wiring.
   */
  children: ReactElement
}

/**
 * Form field wrapper. Renders a Label + control + optional error line.
 *
 * Wiring approach: React.cloneElement on a single ReactElement child.
 * Rationale: cloneElement is direct, type-safe without extra boilerplate,
 * and works for any host element (native or composite) without requiring
 * each control to subscribe to a context. FieldContext is still provided
 * so a standalone Label placed inside Field also picks up htmlFor.
 *
 * - Injects `id` on the control so Label's `htmlFor` connects to it.
 * - When `error` is present, injects `aria-describedby` pointing to the
 *   error element's id, appended to any existing describedby value.
 */
export function Field({ label, error, children, style, ...rest }: FieldProps) {
  const controlId = useId()
  const errorId = useId()

  const errorIdResolved = error ? errorId : undefined

  // Clone a single ReactElement child to inject id and aria-describedby.
  // isValidElement rejects primitives, arrays, and Fragments — Fragments
  // would otherwise accept cloneElement silently and apply the attributes
  // to nothing, dropping the aria wiring.
  let control = children
  if (isValidElement<Record<string, unknown>>(children)) {
    const child = children
    const existingDescribedBy = child.props['aria-describedby'] as string | undefined
    const describedBy = errorIdResolved
      ? existingDescribedBy
        ? `${errorIdResolved} ${existingDescribedBy}`
        : errorIdResolved
      : existingDescribedBy

    control = cloneElement(child, {
      id: child.props.id ?? controlId,
      ...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {}),
    })
  }

  const fieldStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    ...style,
  }

  const errorStyle: CSSProperties = {
    marginTop: '4px',
    fontFamily: 'var(--ln-font-sans)',
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    color: 'var(--ln-danger-text)',
  }

  return (
    <FieldContext.Provider value={{ controlId, errorId: errorIdResolved }}>
      <div style={fieldStyle} {...rest}>
        <Label>{label}</Label>
        {control}
        {error && (
          <p id={errorIdResolved} role="alert" style={errorStyle}>
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}

export default Field
