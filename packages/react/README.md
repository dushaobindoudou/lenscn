# @lenscn/react

React binding for [lenscn](https://github.com/dushaobindoudou/lenscn) — true optical refraction glass for the web, built on SVG `feDisplacementMap`. Works in Chromium, Safari and Firefox.

## Install

```bash
npm install @lenscn/react lenscn
```

## Usage

```tsx
import { Glass } from '@lenscn/react'

<Glass
  lens={{ width: 68, height: 68, borderRadius: 34, depth: 18 }}
  look={{ scale: 26, chroma: 0.2 }}
  x={x}
  y={y}
>
  <SwitchTrack />
</Glass>
```

- `lens` shape changes regenerate the displacement map (maps are cached and refcounted).
- `x` / `y` number changes move the lens — a pure attribute write, no map regen, no re-render churn.
- The component is SSR-safe: all DOM access happens in effects.
- Unmount removes the hidden SVG and clears the element's `filter` style.

For imperative control over an element you already have a ref to:

```tsx
import { useGlass } from '@lenscn/react'

const { setPosition } = useGlass(ref, lens, look)
```

## Components

Ready-made accessible components (Switch, Slider, Tabs, SegmentedControl) are distributed **as source** through the [lenscn registry](https://github.com/dushaobindoudou/lenscn/tree/main/registry) — shadcn style: copy them into your project and own the code.

## License

MIT
