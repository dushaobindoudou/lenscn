import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlassSwitchDemo, GlassSliderDemo } from './widgets'
import './style.css'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <main className="demo">
      <h1>lenscn — React binding</h1>
      <p>
        Switch and slider rebuilt with <code>&lt;Glass&gt;</code>. Compare to the vanilla{' '}
        <a href="http://localhost:5180/">demo</a>.
      </p>
      <section className="row">
        <div className="card">
          <h2>Switch</h2>
          <GlassSwitchDemo />
        </div>
        <div className="card">
          <h2>Slider</h2>
          <GlassSliderDemo />
        </div>
      </section>
    </main>
  </StrictMode>,
)
