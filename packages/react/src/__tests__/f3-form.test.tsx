import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { Input, Textarea } from '../../../../registry/components/glass-input/glass-input'
import { Field, Label } from '../../../../registry/components/glass-field/glass-field'
import { Checkbox } from '../../../../registry/components/glass-checkbox/glass-checkbox'
import { NativeSelect } from '../../../../registry/components/glass-native-select/glass-native-select'

// F3 components are matte — no Glass / GlassFilter. No canvas stub needed.

afterEach(() => cleanup())

// ─── Input ───────────────────────────────────────────────────────────────────

describe('Input', () => {
  it('renders an <input type="text"> by default', () => {
    const { container } = render(<Input />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.type).toBe('text')
  })

  it('size sets the height (sm=32, md=36, lg=44)', () => {
    const sizes = { sm: '32px', md: '36px', lg: '44px' } as const
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container, unmount } = render(<Input size={size} />)
      const input = container.querySelector('input') as HTMLInputElement
      expect(input.style.height).toBe(sizes[size])
      unmount()
    }
  })

  it('invalid sets the border to var(--ln-danger) and aria-invalid="true"', () => {
    const { container } = render(<Input invalid />)
    const input = container.querySelector('input') as HTMLInputElement
    // happy-dom strips var() from parsed border shorthand; assert via the
    // raw inline style string which preserves the token.
    expect(input.getAttribute('style')).toContain('var(--ln-danger)')
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('non-invalid input does not set aria-invalid', () => {
    const { container } = render(<Input />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.hasAttribute('aria-invalid')).toBe(false)
  })

  it('focus shows a 2px focus ring (outline sub-properties)', () => {
    const { container } = render(<Input />)
    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    expect(input.style.outlineWidth).toBe('2px')
    expect(input.style.outlineStyle).toBe('solid')
  })

  it('blur hides the focus ring', () => {
    const { container } = render(<Input />)
    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(input.style.outlineStyle).toBe('none')
  })

  it('has the "ln-input" class so placeholder styling hooks apply', () => {
    const { container } = render(<Input />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.classList.contains('ln-input')).toBe(true)
  })

  it('user-supplied style is spread last (overrides base)', () => {
    const { container } = render(<Input style={{ height: '60px', color: 'rebeccapurple' }} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.style.height).toBe('60px')
    expect(input.style.color).toBe('rebeccapurple')
  })
})

// ─── Textarea ────────────────────────────────────────────────────────────────

describe('Textarea', () => {
  it('renders a <textarea>', () => {
    const { container } = render(<Textarea />)
    const ta = container.querySelector('textarea') as HTMLTextAreaElement
    expect(ta).toBeTruthy()
  })

  it('invalid adds aria-invalid="true" and danger border', () => {
    const { container } = render(<Textarea invalid />)
    const ta = container.querySelector('textarea') as HTMLTextAreaElement
    expect(ta.getAttribute('aria-invalid')).toBe('true')
    expect(ta.getAttribute('style')).toContain('var(--ln-danger)')
  })

  it('user-supplied style is spread last (overrides base)', () => {
    const { container } = render(<Textarea style={{ padding: '20px' }} />)
    const ta = container.querySelector('textarea') as HTMLTextAreaElement
    expect(ta.style.padding).toBe('20px')
  })

  it('has the "ln-textarea" class', () => {
    const { container } = render(<Textarea />)
    const ta = container.querySelector('textarea') as HTMLTextAreaElement
    expect(ta.classList.contains('ln-textarea')).toBe(true)
  })
})

// ─── Field + Label ───────────────────────────────────────────────────────────

describe('Field + Label', () => {
  it('Label htmlFor and control id are wired (native label click focuses control)', () => {
    const { container, getByText } = render(
      <Field label="Email">
        <Input type="email" />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    const label = getByText('Email') as HTMLLabelElement
    expect(label.htmlFor).toBe(input.id)
  })

  it('injected id is present and stable on the control', () => {
    const { container } = render(
      <Field label="Username">
        <Input />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.id).toBeTruthy()
    expect(input.id.length).toBeGreaterThan(0)
  })

  it('preserves a user-supplied id on the child', () => {
    const { container } = render(
      <Field label="Custom">
        <Input id="my-input" />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.id).toBe('my-input')
  })

  it('error renders with role="alert" and an id that matches aria-describedby', () => {
    const { container } = render(
      <Field label="Email" error="That email looks off.">
        <Input type="email" />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    const error = container.querySelector('[role="alert"]') as HTMLElement
    expect(error).toBeTruthy()
    expect(error.id).toBeTruthy()
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(describedBy!.split(/\s+/)).toContain(error.id)
  })

  it('existing user aria-describedby is preserved and the error id is appended', () => {
    const { container } = render(
      <Field label="Composite" error="Broken.">
        <Input aria-describedby="hint-1 hint-2" />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    const error = container.querySelector('[role="alert"]') as HTMLElement
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    const tokens = describedBy.split(/\s+/)
    expect(tokens).toContain('hint-1')
    expect(tokens).toContain('hint-2')
    expect(tokens).toContain(error.id)
  })

  it('preserves a user-supplied aria-describedby on the child when there is no error', () => {
    const { container } = render(
      <Field label="Hinted">
        <Input aria-describedby="external-hint" />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-describedby')).toBe('external-hint')
  })

  it('no aria-describedby is set when there is no error and child did not provide one', () => {
    const { container } = render(
      <Field label="Clean">
        <Input />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.hasAttribute('aria-describedby')).toBe(false)
  })
})

// ─── Label ───────────────────────────────────────────────────────────────────

describe('Label', () => {
  it('renders a <label> element (not a <span>)', () => {
    const { container } = render(<Label htmlFor="x">My label</Label>)
    const label = container.querySelector('label')
    expect(label).toBeTruthy()
    expect(label!.tagName.toLowerCase()).toBe('label')
  })

  it('forwards htmlFor when used standalone', () => {
    const { container } = render(<Label htmlFor="external-id">My label</Label>)
    const label = container.querySelector('label') as HTMLLabelElement
    expect(label.htmlFor).toBe('external-id')
  })

  it('inherits htmlFor from FieldContext when used inside a Field without htmlFor', () => {
    const { container, getByText } = render(
      <Field label="Email">
        <Input />
      </Field>,
    )
    const input = container.querySelector('input') as HTMLInputElement
    const label = getByText('Email') as HTMLLabelElement
    expect(label.tagName.toLowerCase()).toBe('label')
    expect(label.htmlFor).toBe(input.id)
  })
})

// ─── Checkbox ────────────────────────────────────────────────────────────────

describe('Checkbox', () => {
  it('renders a <button role="checkbox" aria-checked="false"> by default', () => {
    const { getByRole } = render(<Checkbox />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    expect(cb.tagName.toLowerCase()).toBe('button')
    expect(cb.getAttribute('aria-checked')).toBe('false')
  })

  it('Space toggles to true', () => {
    const seen: boolean[] = []
    const { getByRole } = render(
      <Checkbox onCheckedChange={(v) => seen.push(v)} />,
    )
    const cb = getByRole('checkbox') as HTMLButtonElement
    fireEvent.keyDown(cb, { key: ' ' })
    expect(cb.getAttribute('aria-checked')).toBe('true')
    expect(seen).toEqual([true])
  })

  it('click toggles', () => {
    const { getByRole } = render(<Checkbox />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    fireEvent.click(cb)
    expect(cb.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(cb)
    expect(cb.getAttribute('aria-checked')).toBe('false')
  })

  it('checked prop is controlled (ignores user click for aria-checked)', () => {
    const { getByRole, rerender } = render(<Checkbox checked={false} />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    fireEvent.click(cb)
    expect(cb.getAttribute('aria-checked')).toBe('false')
    rerender(<Checkbox checked={true} />)
    expect(cb.getAttribute('aria-checked')).toBe('true')
  })

  it('defaultChecked is uncontrolled', () => {
    const { getByRole } = render(<Checkbox defaultChecked />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    expect(cb.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(cb)
    expect(cb.getAttribute('aria-checked')).toBe('false')
  })

  it('checked="mixed" yields aria-checked="mixed"', () => {
    const { getByRole, container } = render(<Checkbox defaultChecked="mixed" />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    expect(cb.getAttribute('aria-checked')).toBe('mixed')
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('Space on mixed toggles to true', () => {
    const seen: boolean[] = []
    const { getByRole } = render(
      <Checkbox defaultChecked="mixed" onCheckedChange={(v) => seen.push(v)} />,
    )
    const cb = getByRole('checkbox') as HTMLButtonElement
    fireEvent.keyDown(cb, { key: ' ' })
    expect(cb.getAttribute('aria-checked')).toBe('true')
    expect(seen).toEqual([true])
  })

  it('disabled uses the real disabled attribute (not just aria-disabled)', () => {
    const { getByRole } = render(<Checkbox disabled />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    expect(cb.disabled).toBe(true)
  })

  it('non-disabled checkbox does not have aria-disabled', () => {
    const { getByRole } = render(<Checkbox />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    expect(cb.hasAttribute('aria-disabled')).toBe(false)
  })

  it('SVG checkmark is rendered when checked', () => {
    const { container } = render(<Checkbox defaultChecked />)
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(svgs.length).toBeGreaterThan(0)
    const svg = svgs[0] as SVGElement
    const path = svg.querySelector('path')
    expect(path).toBeTruthy()
  })

  it('focus shows a 2px focus ring (outline sub-properties)', () => {
    const { getByRole } = render(<Checkbox />)
    const cb = getByRole('checkbox') as HTMLButtonElement
    fireEvent.focus(cb)
    expect(cb.style.outlineWidth).toBe('2px')
    expect(cb.style.outlineStyle).toBe('solid')
  })
})

// ─── NativeSelect ────────────────────────────────────────────────────────────

describe('NativeSelect', () => {
  it('renders a <select>', () => {
    const { container } = render(
      <NativeSelect options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />,
    )
    const sel = container.querySelector('select')
    expect(sel).toBeTruthy()
  })

  it('renders the options prop as <option> children', () => {
    const { container } = render(
      <NativeSelect
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
          { value: 'c', label: 'Gamma' },
        ]}
      />,
    )
    const opts = container.querySelectorAll('option')
    expect(opts.length).toBe(3)
    expect((opts[0] as HTMLOptionElement).value).toBe('a')
    expect((opts[0] as HTMLOptionElement).textContent).toBe('Alpha')
  })

  it('invalid sets aria-invalid and the danger border', () => {
    const { container } = render(
      <NativeSelect invalid options={[{ value: 'a', label: 'A' }]} />,
    )
    const sel = container.querySelector('select') as HTMLSelectElement
    expect(sel.getAttribute('aria-invalid')).toBe('true')
    expect(sel.getAttribute('style')).toContain('var(--ln-danger)')
  })

  it('size sets the height (sm=32, md=36, lg=44)', () => {
    const heights = { sm: '32px', md: '36px', lg: '44px' } as const
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { container, unmount } = render(
        <NativeSelect size={size} options={[{ value: 'a', label: 'A' }]} />,
      )
      const sel = container.querySelector('select') as HTMLSelectElement
      expect(sel.style.height).toBe(heights[size])
      unmount()
    }
  })

  it('disabled uses the real disabled attribute', () => {
    const { container } = render(
      <NativeSelect disabled options={[{ value: 'a', label: 'A' }]} />,
    )
    const sel = container.querySelector('select') as HTMLSelectElement
    expect(sel.disabled).toBe(true)
  })

  it('user-supplied style is spread last (overrides base)', () => {
    const { container } = render(
      <NativeSelect
        style={{ height: '60px', background: 'rebeccapurple' }}
        options={[{ value: 'a', label: 'A' }]}
      />,
    )
    const sel = container.querySelector('select') as HTMLSelectElement
    expect(sel.style.height).toBe('60px')
    expect(sel.style.background).toBe('rebeccapurple')
  })

  it('chevron SVG is present (custom inline-SVG chevron)', () => {
    const { container } = render(
      <NativeSelect options={[{ value: 'a', label: 'A' }]} />,
    )
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(svgs.length).toBe(1)
  })
})
