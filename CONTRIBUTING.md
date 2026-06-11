# Contributing to lenscn

Thanks for your interest! Issues and pull requests are welcome.

## Setup

```bash
pnpm install
pnpm dev          # vanilla demo on http://localhost:5180
pnpm typecheck    # tsc across all packages
pnpm test         # vitest (50 tests, runs in plain Node + happy-dom)
pnpm build        # tsup for packages, vite build for demos
```

## Before you open a PR

- `pnpm typecheck`, `pnpm test` and `pnpm build` must pass.
- The demo must load with zero console errors in Chrome.
- Any change to `packages/lenscn` needs a manual sanity check in Safari:
  the lens follows the pointer smoothly and nothing blanks at panel edges.
- Read the **engine invariants** in [docs/PLAN.md](docs/PLAN.md) — they
  encode cross-browser bugs we already fixed. If your change seems to
  require breaking one, open an issue first.
- New public APIs get TSDoc comments in the style of the existing code.

## Architecture

[docs/how-it-works.md](docs/how-it-works.md) explains the displacement
map, the SVG filter chain and the browser quirks. Read it before touching
`packages/lenscn`.

## What not to build

See "Out of scope" in [docs/PLAN.md](docs/PLAN.md) — notably: no docs
website framework, no custom CLI, no styling-system lock-in inside
registry components, and never copy code from other glass implementations
(the technique is fair game; their code is not).
