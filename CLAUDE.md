# lenscn — agent instructions

Read these before any task, in this order:

1. `docs/PLAN.md` — engine invariants (absolute; violating them
   reintroduces fixed Safari/Chromium bugs) and working rules.
2. `DESIGN.md` — design source of truth: tokens, typography, spacing,
   motion, the Glass Grammar (G1–G9), glass parameter presets.
3. `docs/PLAN-COMPONENTS.md` — component-layer tasks (Milestones F–G)
   with per-component specs and acceptance criteria.

## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined
there. Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

Hard rules that come up constantly:
- Components consume `--ln-*` CSS variables only — never raw hex.
- Glass is interactive-only (handles, active indicators, scrubbers);
  content surfaces are matte. No `backdrop-filter`, ever.
- Glass parameters come from the DESIGN.md presets (lens-s/m/l).
- Every glass component ships an `isSupported()` solid fallback and a
  `prefersReducedMotion()` jump path.

## Commands

- `pnpm dev` — vanilla demo on :5180 · `pnpm typecheck` · `pnpm test` ·
  `pnpm build` (all must pass before every commit)
- Any change to `packages/lenscn` needs a manual Safari sanity check.

## CI gotchas (learned the hard way)

- Do not set a pnpm `version:` in workflows — `packageManager` in
  package.json is the single source of truth (action-setup errors on both).
- Typecheck must never depend on `dist/`: workspace imports resolve via
  tsconfig `paths` to package sources.
