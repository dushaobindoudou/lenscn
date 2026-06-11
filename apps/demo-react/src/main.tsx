import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlassSwitch } from '../../../registry/components/glass-switch/glass-switch'
import { GlassSlider } from '../../../registry/components/glass-slider/glass-slider'
import './style.css'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <main className="demo">
      <h1>lenscn — React binding</h1>
      <p>
        Switch and slider from the <code>registry/</code> directory (shadcn-style source
        distribution). Compare to the vanilla <a href="http://localhost:5180/">demo</a>.
      </p>
      <section className="row">
        <div className="card">
          <h2>GlassSwitch</h2>
          <GlassSwitch />
        </div>
        <div className="card">
          <h2>GlassSlider</h2>
          <GlassSlider />
        </div>
      </section>
    </main>
  </StrictMode>,
)
