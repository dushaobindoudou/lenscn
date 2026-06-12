import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { Button } from '../../../../registry/components/glass-button/glass-button'
import { Badge } from '../../../../registry/components/glass-badge/glass-badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
} from '../../../../registry/components/glass-card/glass-card'

// No canvas stub needed — these are matte components; no Glass / GlassFilter.

afterEach(() => cleanup())

// ─── Button ──────────────────────────────────────────────────────────────────

describe('Button', () => {
  it('renders a <button> element', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    expect(getByRole('button')).toBeTruthy()
  })

  it('uses the real disabled attribute (not aria-disabled)', () => {
    const { getByRole } = render(<Button disabled>Off</Button>)
    const btn = getByRole('button') as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(btn.hasAttribute('aria-disabled')).toBe(false)
  })

  it('does not use aria-disabled for non-disabled buttons', () => {
    const { getByRole } = render(<Button>On</Button>)
    expect(getByRole('button').hasAttribute('aria-disabled')).toBe(false)
  })

  it('fires onClick when not disabled', () => {
    let fired = false
    const { getByRole } = render(<Button onClick={() => { fired = true }}>Go</Button>)
    fireEvent.click(getByRole('button'))
    expect(fired).toBe(true)
  })

  it('does not fire onClick when disabled', () => {
    let fired = false
    const { getByRole } = render(<Button disabled onClick={() => { fired = true }}>Go</Button>)
    fireEvent.click(getByRole('button'))
    // Browser blocks the click on a disabled button natively — test that
    // the onClick is not called via user interaction.
    expect(fired).toBe(false)
  })

  it('renders all four variants without errors', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const
    for (const variant of variants) {
      const { getByRole, unmount } = render(<Button variant={variant}>{variant}</Button>)
      expect(getByRole('button')).toBeTruthy()
      unmount()
    }
  })

  it('renders all three sizes without errors', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = render(<Button size={size}>{size}</Button>)
      const btn = getByRole('button') as HTMLButtonElement
      // Height is set as inline style.
      const h = { sm: '32px', md: '36px', lg: '44px' }[size]
      expect(btn.style.height).toBe(h)
      unmount()
    }
  })

  it('shows focus ring outline on focus', () => {
    const { getByRole } = render(<Button>Focus me</Button>)
    const btn = getByRole('button') as HTMLButtonElement
    fireEvent.focus(btn)
    // Each outline sub-property is set explicitly for reliable CSS-var parsing.
    expect(btn.style.outlineWidth).toBe('2px')
    expect(btn.style.outlineStyle).toBe('solid')
  })

  it('removes focus ring on blur', () => {
    const { getByRole } = render(<Button>Focus me</Button>)
    const btn = getByRole('button') as HTMLButtonElement
    fireEvent.focus(btn)
    fireEvent.blur(btn)
    // After blur the outline is invisible.
    expect(btn.style.outlineStyle).toBe('none')
  })

  it('passes through native button props (type)', () => {
    const { getByRole } = render(<Button type="submit">Submit</Button>)
    expect((getByRole('button') as HTMLButtonElement).type).toBe('submit')
  })

  it('passes through className', () => {
    const { getByRole } = render(<Button className="my-class">x</Button>)
    expect(getByRole('button').classList.contains('my-class')).toBe(true)
  })
})

// ─── Badge ────────────────────────────────────────────────────────────────────

describe('Badge', () => {
  it('renders a <span> element', () => {
    const { container } = render(<Badge>Label</Badge>)
    expect(container.querySelector('span')).toBeTruthy()
  })

  it('renders all six tones without errors', () => {
    const tones = ['accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const
    for (const tone of tones) {
      const { container, unmount } = render(<Badge tone={tone}>{tone}</Badge>)
      expect(container.querySelector('span')).toBeTruthy()
      unmount()
    }
  })

  it('uses token-based text color (no raw hex in rendered styles)', () => {
    // happy-dom strips color-mix() from serialized style (it parses CSS
    // values it does not understand). Verify that the semantic text token
    // is applied — the "no raw hex in component source" rule is enforced
    // by the pre-commit grep gate, not a DOM assertion.
    const { container } = render(<Badge tone="success">ok</Badge>)
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.color).toBe('var(--ln-success-text)')
  })

  it('uses the --ln-radius-full pill shape', () => {
    const { container } = render(<Badge>pill</Badge>)
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.borderRadius).toBe('var(--ln-radius-full)')
  })

  it('is 22px tall', () => {
    const { container } = render(<Badge>22</Badge>)
    const span = container.querySelector('span') as HTMLElement
    expect(span.style.height).toBe('22px')
  })

  it('passes through className and style', () => {
    const { container } = render(<Badge className="x" style={{ marginTop: '4px' }}>m</Badge>)
    const span = container.querySelector('span') as HTMLElement
    expect(span.classList.contains('x')).toBe(true)
    expect(span.style.marginTop).toBe('4px')
  })
})

// ─── Card ─────────────────────────────────────────────────────────────────────

describe('Card', () => {
  it('renders a surface div with card styles', () => {
    const { container } = render(<Card>content</Card>)
    const div = container.querySelector('div') as HTMLElement
    expect(div).toBeTruthy()
    expect(div.style.background).toBe('var(--ln-surface)')
    expect(div.style.borderRadius).toBe('var(--ln-radius-lg)')
    expect(div.style.padding).toBe('24px')
  })

  it('CardTitle renders an h3 with correct font style', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Hello</CardTitle>
        </CardHeader>
      </Card>,
    )
    const h3 = container.querySelector('h3') as HTMLElement
    expect(h3.textContent).toBe('Hello')
    expect(h3.style.fontSize).toBe('17px')
    expect(h3.style.fontWeight).toBe('600')
  })

  it('CardContent renders its children', () => {
    const { getByText } = render(
      <Card>
        <CardContent>body text</CardContent>
      </Card>,
    )
    expect(getByText('body text')).toBeTruthy()
  })

  it('passes through className and style', () => {
    const { container } = render(<Card className="my-card" style={{ maxWidth: '400px' }}>x</Card>)
    const div = container.querySelector('div') as HTMLElement
    expect(div.classList.contains('my-card')).toBe(true)
    expect(div.style.maxWidth).toBe('400px')
  })
})

// ─── StatCard ─────────────────────────────────────────────────────────────────

describe('StatCard', () => {
  it('renders label and value', () => {
    const { getByText } = render(<StatCard label="Revenue" value="¥1,234" />)
    expect(getByText('Revenue')).toBeTruthy()
    expect(getByText('¥1,234')).toBeTruthy()
  })

  it('KPI value element uses font-variant-numeric: tabular-nums (inline style)', () => {
    const { container } = render(<StatCard label="Orders" value="3,842" />)
    // The KPI value is the second <p> inside the card.
    const paras = container.querySelectorAll('p')
    // paras[0] = label, paras[1] = value
    const valuePara = paras[1] as HTMLElement
    expect(valuePara.style.fontVariantNumeric).toBe('tabular-nums')
  })

  it('renders delta with up arrow and success color', () => {
    const { container, getByText } = render(
      <StatCard label="Rev" value="100" delta={{ value: '5%', direction: 'up' }} />,
    )
    const paras = container.querySelectorAll('p')
    const deltaPara = paras[2] as HTMLElement
    expect(getByText(/↑/)).toBeTruthy()
    expect(deltaPara.style.color).toBe('var(--ln-success-text)')
  })

  it('renders delta with down arrow and danger color', () => {
    const { container, getByText } = render(
      <StatCard label="Rev" value="100" delta={{ value: '2%', direction: 'down' }} />,
    )
    const paras = container.querySelectorAll('p')
    const deltaPara = paras[2] as HTMLElement
    expect(getByText(/↓/)).toBeTruthy()
    expect(deltaPara.style.color).toBe('var(--ln-danger-text)')
  })

  it('renders without delta when not provided', () => {
    const { container } = render(<StatCard label="Users" value="999" />)
    const paras = container.querySelectorAll('p')
    // Only label + value — no delta paragraph.
    expect(paras.length).toBe(2)
  })

  it('KPI value uses 28px font size and weight 600', () => {
    const { container } = render(<StatCard label="KPI" value="42" />)
    const paras = container.querySelectorAll('p')
    const valuePara = paras[1] as HTMLElement
    expect(valuePara.style.fontSize).toBe('28px')
    expect(valuePara.style.fontWeight).toBe('600')
  })
})
