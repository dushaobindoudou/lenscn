import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, ReactNode, Ref } from 'react'
import {
  generateLensMap,
  releaseLensMap,
  GlassFilter,
  type GlassFilterOptions,
  type LensMap,
  type LensMapOptions,
} from 'lenscn'

export interface GlassLensOptions {
  width: number
  height: number
  borderRadius?: number
  depth?: number
  domeDepth?: number
  splay?: number
  glowStrength?: number
  edgeStrength?: number
}

export interface GlassLookOptions {
  scale?: number
  chroma?: number
  blur?: number
  specularStrength?: number
  specularDark?: boolean
}

export interface GlassProps {
  /** Lens shape. Changing this object regenerates the map. */
  lens: GlassLensOptions
  /** Refraction look. Changing this updates the filter. */
  look?: GlassLookOptions
  /** Lens center in target's local coordinates. Number changes move the lens without remounting. */
  x?: number
  y?: number
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** Element to render. Defaults to 'div'. */
  as?: 'div' | 'span' | 'section' | 'article'
}

export interface GlassRef {
  /** The DOM element the filter is attached to. */
  element: HTMLElement | null
  /** The underlying GlassFilter instance (advanced use). */
  filter: GlassFilter | null
}

/**
 * Apply a lenscn refraction filter to its children. The component owns
 * the GlassFilter lifecycle: one is created on mount, disposed on
 * unmount. `lens` shape changes regenerate the map; `x`/`y` updates
 * just move the lens (no map regen).
 *
 * The wrapper is a block (or inline-block) element — `display: contents`
 * is unsafe with SVG filters in Safari. The host element exposes the
 * filter through `style.filter = url(#id)`.
 */
export const Glass = forwardRef(function Glass(
  { lens, look, x = 0, y = 0, children, className, style, as = 'div' }: GlassProps,
  ref: Ref<GlassRef>,
) {
  const hostRef = useRef<HTMLElement | null>(null)
  const filterRef = useRef<GlassFilter | null>(null)
  const [map, setMap] = useState<LensMap | null>(null)

  // Generate the map on mount and whenever the shape changes.
  useEffect(() => {
    let cancelled = false
    const next = generateLensMap(lens as LensMapOptions)
    if (cancelled) {
      releaseLensMap(next)
      return
    }
    setMap((prev) => {
      if (prev) releaseLensMap(prev)
      return next
    })
    return () => {
      cancelled = true
    }
  }, [
    lens.width,
    lens.height,
    lens.borderRadius,
    lens.depth,
    lens.domeDepth,
    lens.splay,
    lens.glowStrength,
    lens.edgeStrength,
  ])

  // Create / dispose the GlassFilter when the map or host changes.
  useEffect(() => {
    if (!map || !hostRef.current) return
    const target = hostRef.current
    const filter = new GlassFilter(target, map, look as GlassFilterOptions)
    filterRef.current = filter
    filter.setPosition(x, y)
    return () => {
      filter.dispose()
      filterRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Push look changes into the existing filter.
  useEffect(() => {
    if (filterRef.current && look) {
      filterRef.current.setOptions(look as GlassFilterOptions)
    }
  }, [look?.scale, look?.chroma, look?.blur, look?.specularStrength, look?.specularDark])

  // Position updates are pure attribute writes — no map regen, no remount.
  useEffect(() => {
    filterRef.current?.setPosition(x, y)
  }, [x, y])

  useImperativeHandle(
    ref,
    () => ({
      get element() {
        return hostRef.current
      },
      get filter() {
        return filterRef.current
      },
    }),
    [],
  )

  const setRef = useCallback((node: HTMLElement | null) => {
    hostRef.current = node
  }, [])

  const Tag = as
  return (
    <Tag
      ref={setRef as never}
      className={className}
      style={{ display: 'inline-block', ...style }}
    >
      {children}
    </Tag>
  )
})

/**
 * Imperative hook for advanced cases: attach a GlassFilter to an
 * element you already have a ref to. Returns a setter for x/y.
 */
export function useGlass(
  ref: { current: HTMLElement | null },
  lens: GlassLensOptions,
  look?: GlassLookOptions,
): { setPosition: (x: number, y: number) => void } {
  const filterRef = useRef<GlassFilter | null>(null)
  const mapRef = useRef<LensMap | null>(null)
  const lookRef = useRef<GlassLookOptions | undefined>(look)
  lookRef.current = look

  // Regenerate map on shape change.
  useEffect(() => {
    const next = generateLensMap(lens as LensMapOptions)
    if (mapRef.current) releaseLensMap(mapRef.current)
    mapRef.current = next
    const el = ref.current
    if (el) {
      if (filterRef.current) filterRef.current.dispose()
      filterRef.current = new GlassFilter(el, next, lookRef.current as GlassFilterOptions)
    }
    return () => {
      if (filterRef.current) {
        filterRef.current.dispose()
        filterRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lens.width,
    lens.height,
    lens.borderRadius,
    lens.depth,
    lens.domeDepth,
    lens.splay,
    lens.glowStrength,
    lens.edgeStrength,
  ])

  useEffect(() => () => {
    if (mapRef.current) {
      releaseLensMap(mapRef.current)
      mapRef.current = null
    }
  }, [])

  return {
    setPosition(x: number, y: number) {
      filterRef.current?.setPosition(x, y)
    },
  }
}
