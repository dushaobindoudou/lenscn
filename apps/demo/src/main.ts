import { GlassFilter, generateLensMap } from 'lenscn'
import type { LensMap } from 'lenscn'
import { initSlider, initSwitch } from './widgets'

initSwitch(document.getElementById('glass-switch')!)
initSlider(document.getElementById('glass-slider')!)

const content = document.getElementById('content')!
const stage = document.getElementById('stage')!
const controls = document.getElementById('controls')!

const shape = {
  width: 220,
  height: 140,
  borderRadius: 70,
  depth: 36,
  domeDepth: 0,
  splay: 1,
  glowStrength: 0.35,
  edgeStrength: 0.25,
}

// Tuned to match the Aave article demo defaults (chroma 0.20).
const look = {
  scale: 52,
  chroma: 0.2,
  blur: 0,
  specularStrength: 1,
}

let map: LensMap = generateLensMap(shape)
const glass = new GlassFilter(content, map, look)
glass.setPosition(360, 220)

let regenQueued = false
function regenerateMap() {
  if (regenQueued) return
  regenQueued = true
  requestAnimationFrame(() => {
    regenQueued = false
    map = generateLensMap(shape)
    glass.setLensMap(map)
    stats.textContent = `map ${map.resolution}×${map.resolution} regenerated in ${map.generateMs.toFixed(1)}ms`
  })
}

stage.addEventListener('pointermove', (e) => {
  const rect = content.getBoundingClientRect()
  glass.setPosition(e.clientX - rect.left, e.clientY - rect.top)
})

function slider(
  title: string,
  min: number,
  max: number,
  step: number,
  value: number,
  onInput: (v: number) => void,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'control'
  const label = document.createElement('label')
  const out = document.createElement('output')
  out.textContent = String(value)
  label.append(title, out)
  const input = document.createElement('input')
  input.type = 'range'
  input.min = String(min)
  input.max = String(max)
  input.step = String(step)
  input.value = String(value)
  input.addEventListener('input', () => {
    const v = Number(input.value)
    out.textContent = String(v)
    onInput(v)
  })
  wrap.append(label, input)
  return wrap
}

function heading(text: string): HTMLElement {
  const h = document.createElement('h2')
  h.textContent = text
  return h
}

const stats = document.createElement('div')
stats.id = 'stats'
stats.textContent = `map ${map.resolution}×${map.resolution} generated in ${map.generateMs.toFixed(1)}ms`

controls.append(
  heading('Lens shape'),
  slider('Width', 60, 480, 2, shape.width, (v) => { shape.width = v; shape.borderRadius = Math.min(shape.borderRadius, Math.min(shape.width, shape.height) / 2); regenerateMap() }),
  slider('Height', 60, 360, 2, shape.height, (v) => { shape.height = v; shape.borderRadius = Math.min(shape.borderRadius, Math.min(shape.width, shape.height) / 2); regenerateMap() }),
  slider('Radius', 0, 180, 1, shape.borderRadius, (v) => { shape.borderRadius = v; regenerateMap() }),
  slider('Depth', 2, 120, 1, shape.depth, (v) => { shape.depth = v; regenerateMap() }),
  slider('Dome', 0, 60, 1, shape.domeDepth, (v) => { shape.domeDepth = v; regenerateMap() }),
  slider('Splay', 0, 1, 0.05, shape.splay, (v) => { shape.splay = v; regenerateMap() }),
  slider('Glow', 0, 1, 0.05, shape.glowStrength, (v) => { shape.glowStrength = v; regenerateMap() }),
  slider('Edge light', 0, 1, 0.05, shape.edgeStrength, (v) => { shape.edgeStrength = v; regenerateMap() }),
  heading('Refraction'),
  slider('Scale', 0, 200, 1, look.scale, (v) => { look.scale = v; glass.setOptions(look) }),
  slider('Chroma', 0, 1, 0.05, look.chroma, (v) => { look.chroma = v; glass.setOptions(look) }),
  slider('Blur', 0, 12, 0.5, look.blur, (v) => { look.blur = v; glass.setOptions(look) }),
  slider('Specular', 0, 2, 0.1, look.specularStrength, (v) => { look.specularStrength = v; glass.setOptions(look) }),
  stats,
)
