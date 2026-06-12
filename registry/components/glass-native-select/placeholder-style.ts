// Shared between Input, Textarea, and NativeSelect: the form set must have
// a uniform placeholder hue, but inline styles cannot target ::placeholder.
// Inject one <style> element, guarded by id so the same rule never gets
// written twice (React StrictMode double-invokes effects; multiple components
// may mount in any order).

const PLACEHOLDER_STYLE_ID = 'ln-form-placeholder-style'

export function injectPlaceholderStyle(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(PLACEHOLDER_STYLE_ID)) return
  const el = document.createElement('style')
  el.id = PLACEHOLDER_STYLE_ID
  el.textContent = `
.ln-input::placeholder,
.ln-textarea::placeholder,
.ln-select::placeholder {
  color: var(--ln-text-faint);
  opacity: 1;
}
`
  document.head.appendChild(el)
}
