import type { LensMap } from './lens-map'

export interface GlassFilterOptions {
  /** Peak displacement in CSS px. */
  scale?: number
  /** Chromatic dispersion. 0 = none, 1 = strong color fringing at the rim. */
  chroma?: number
  /** Frosted-glass blur of the content under the lens, CSS px. */
  blur?: number
  /** Strength of the specular highlight encoded in the map's blue channel. */
  specularStrength?: number
  /** Darken instead of brighten — for glass over light backgrounds. */
  specularDark?: boolean
}

const DEFAULTS: Required<GlassFilterOptions> = {
  scale: 60,
  chroma: 0.2,
  blur: 0,
  specularStrength: 1,
  specularDark: false,
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'

// Safari caches SVG filter output by filter id: attribute updates alone do
// not invalidate it, so a moving lens freezes. Every update there must
// rotate the id. It also pays full-region cost for primitives that don't
// declare a subregion, so we scope more of the chain to the lens on Safari.
// (Chromium shows subregion edge artifacts on the specular pass, so it
// keeps the wider scope.)
const IS_SAFARI =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|chromium|android).)*safari/i.test(navigator.userAgent)

let nextUid = 0

/**
 * Owns one SVG <filter> applied to a target element via
 * `style.filter = url(#id)`, and keeps it in sync with lens shape,
 * position and look parameters.
 *
 * The filter chain refracts the element's own painted content
 * (SourceGraphic) — not a backdrop — which is what makes the effect work
 * in Chromium, Safari and Firefox alike. Primitives that belong to the
 * lens carry an explicit primitive subregion, so the browser only
 * evaluates displacement inside the lens rect, and moving the lens is
 * just an attribute update: the map is never regenerated for motion.
 *
 * Safari caches filter output by id, so any change to the map image
 * rotates the filter id to force re-evaluation.
 */
export class GlassFilter {
  private target: HTMLElement
  private map: LensMap
  private options: Required<GlassFilterOptions>
  private svg: SVGSVGElement
  private filter: SVGFilterElement
  private lensScoped: SVGElement[] = []
  private feImage: SVGElement | null = null
  private resizeObserver: ResizeObserver
  private uid = nextUid++
  private version = 0
  private cx = 0
  private cy = 0
  private refreshQueued = false

  constructor(target: HTMLElement, map: LensMap, options: GlassFilterOptions = {}) {
    this.target = target
    this.map = map
    this.options = { ...DEFAULTS, ...options }

    this.svg = document.createElementNS(SVG_NS, 'svg')
    this.svg.setAttribute('width', '0')
    this.svg.setAttribute('height', '0')
    this.svg.setAttribute('aria-hidden', 'true')
    this.svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
    const defs = document.createElementNS(SVG_NS, 'defs')
    this.filter = document.createElementNS(SVG_NS, 'filter')
    defs.appendChild(this.filter)
    this.svg.appendChild(defs)
    document.body.appendChild(this.svg)

    this.resizeObserver = new ResizeObserver(() => this.syncRegion())
    this.resizeObserver.observe(target)
    target.style.willChange = 'filter'

    this.rebuild()
    this.syncRegion()
  }

  /** Move the lens center to (x, y) in the target's local coordinates. */
  setPosition(x: number, y: number): void {
    this.cx = x
    this.cy = y
    const left = String(x - this.map.width / 2)
    const top = String(y - this.map.height / 2)
    for (const el of this.lensScoped) {
      el.setAttribute('x', left)
      el.setAttribute('y', top)
    }
    if (IS_SAFARI) this.queueRefresh()
  }

  /** Coalesce Safari id rotations to one per frame. */
  private queueRefresh(): void {
    if (this.refreshQueued) return
    this.refreshQueued = true
    requestAnimationFrame(() => {
      this.refreshQueued = false
      this.rotateId()
    })
  }

  /** Swap the displacement map (shape change). Rotates the filter id. */
  setLensMap(map: LensMap): void {
    this.map = map
    if (this.feImage) {
      this.feImage.setAttribute('href', map.url)
      this.feImage.setAttributeNS(XLINK_NS, 'xlink:href', map.url)
      this.sizeLensScoped()
      this.setPosition(this.cx, this.cy)
      this.rotateId()
    }
  }

  /** Update look parameters. Rebuilds the (small) filter DOM. */
  setOptions(options: GlassFilterOptions): void {
    this.options = { ...this.options, ...options }
    this.rebuild()
  }

  dispose(): void {
    this.resizeObserver.disconnect()
    this.svg.remove()
    this.target.style.filter = ''
    this.target.style.willChange = ''
  }

  private syncRegion(): void {
    const rect = this.target.getBoundingClientRect()
    this.filter.setAttribute('width', String(Math.max(1, rect.width)))
    this.filter.setAttribute('height', String(Math.max(1, rect.height)))
  }

  private rotateId(): void {
    this.version++
    const id = `lenscn-${this.uid}-v${this.version}`
    this.filter.setAttribute('id', id)
    this.target.style.filter = `url(#${id})`
  }

  private sizeLensScoped(): void {
    for (const el of this.lensScoped) {
      el.setAttribute('width', String(this.map.width))
      el.setAttribute('height', String(this.map.height))
    }
  }

  private el(name: string, attrs: Record<string, string>, lensScoped = false): SVGElement {
    const node = document.createElementNS(SVG_NS, name)
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
    if (lensScoped) this.lensScoped.push(node)
    this.filter.appendChild(node)
    return node
  }

  private rebuild(): void {
    const { scale, chroma, blur, specularStrength, specularDark } = this.options
    this.filter.replaceChildren()
    this.lensScoped = []
    this.feImage = null

    this.filter.setAttribute('filterUnits', 'userSpaceOnUse')
    this.filter.setAttribute('primitiveUnits', 'userSpaceOnUse')
    this.filter.setAttribute('color-interpolation-filters', 'sRGB')
    this.filter.setAttribute('x', '0')
    this.filter.setAttribute('y', '0')

    // Neutral gray everywhere the lens image doesn't cover, so pixels
    // outside the lens are not displaced.
    this.el('feFlood', { 'flood-color': 'rgb(128,128,128)', 'flood-opacity': '1', result: 'mapBg' })
    this.feImage = this.el(
      'feImage',
      { href: this.map.url, preserveAspectRatio: 'none', result: 'rawMap' },
      true,
    )
    this.feImage.setAttributeNS(XLINK_NS, 'xlink:href', this.map.url)
    this.el('feComposite', { in: 'rawMap', in2: 'mapBg', operator: 'over', result: 'map' })

    let source = 'SourceGraphic'
    if (blur > 0) {
      this.el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: String(blur), result: 'blurred' })
      source = 'blurred'
    }

    if (chroma > 0) {
      // Three displacement taps at slightly different strengths, one per
      // color channel, recombined additively — light bends by wavelength.
      const taps: Array<[number, string]> = [
        [scale * (1 + 0.2 * chroma), '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'],
        [scale * (1 + 0.1 * chroma), '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'],
        [scale, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'],
      ]
      taps.forEach(([tapScale, matrix], i) => {
        this.el(
          'feDisplacementMap',
          {
            in: source,
            in2: 'map',
            scale: String(tapScale),
            xChannelSelector: 'R',
            yChannelSelector: 'G',
          },
          true,
        )
        this.el('feColorMatrix', { type: 'matrix', values: matrix, result: `disp${i}` }, IS_SAFARI)
      })
      this.el('feComposite', { in: 'disp0', in2: 'disp1', operator: 'arithmetic', k1: '0', k2: '1', k3: '1', k4: '0' }, IS_SAFARI)
      this.el('feComposite', { in2: 'disp2', operator: 'arithmetic', k1: '0', k2: '1', k3: '1', k4: '0', result: 'lensResult' }, IS_SAFARI)
    } else {
      this.el(
        'feDisplacementMap',
        {
          in: source,
          in2: 'map',
          scale: String(scale),
          xChannelSelector: 'R',
          yChannelSelector: 'G',
          result: 'lensResult',
        },
        true,
      )
    }

    if (specularStrength > 0) {
      if (specularDark) {
        const s = specularStrength
        const row = `0 0 ${-s} 0 ${1 + (128 * s) / 255}`
        this.el(
          'feColorMatrix',
          {
            in: 'map',
            type: 'matrix',
            values: `${row}  ${row}  ${row}  0 0 0 0 1`,
            result: 'specMask',
          },
          IS_SAFARI,
        )
        this.el(
          'feComposite',
          {
            in: 'specMask',
            in2: 'lensResult',
            operator: 'arithmetic',
            k1: '1',
            k2: '0',
            k3: '0',
            k4: '0',
            result: 'lensResult',
          },
          IS_SAFARI,
        )
      } else {
        // White, with alpha lifted from the map's blue channel (>128).
        this.el(
          'feColorMatrix',
          {
            in: 'map',
            type: 'matrix',
            values: `0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 1 0 ${-128 / 255}`,
            result: 'specMask',
          },
          IS_SAFARI,
        )
        this.el(
          'feComposite',
          {
            in: 'specMask',
            in2: 'lensResult',
            operator: 'arithmetic',
            k1: '0',
            k2: String(specularStrength),
            k3: '1',
            k4: '0',
            result: 'lensResult',
          },
          IS_SAFARI,
        )
      }
    }

    // Punch the lens rect out of the source, then lay the refracted lens
    // back over the hole. lensResult is clipped to the lens subregion, so
    // everything outside it shows the untouched source.
    this.el('feFlood', { 'flood-color': 'black', 'flood-opacity': '1', result: 'lensMask' }, true)
    this.el('feComposite', { in: 'SourceGraphic', in2: 'lensMask', operator: 'out', result: 'holedSG' })
    this.el('feComposite', { in: 'lensResult', in2: 'holedSG', operator: 'over' })

    this.sizeLensScoped()
    this.setPosition(this.cx, this.cy)
    this.rotateId()
  }
}
