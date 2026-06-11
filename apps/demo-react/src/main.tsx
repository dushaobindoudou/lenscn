import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlassSwitch } from '../../../registry/components/glass-switch/glass-switch'
import { GlassSlider } from '../../../registry/components/glass-slider/glass-slider'
import { GlassSegmentedControl } from '../../../registry/components/glass-segmented-control/glass-segmented-control'
import { GlassTabs } from '../../../registry/components/glass-tabs/glass-tabs'
import './style.css'

const root = document.getElementById('root')!
createRoot(root).render(
  <StrictMode>
    <main className="demo">
      <h1>lenscn — React binding</h1>
      <p>
        Components from the <code>registry/</code> directory (shadcn-style source
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
      <section className="row" style={{ marginTop: 24 }}>
        <div className="card">
          <h2>GlassSegmentedControl</h2>
          <GlassSegmentedControl
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
            defaultValue="week"
          />
        </div>
        <div className="card">
          <h2>GlassTabs</h2>
          <GlassTabs
            tabs={[
              { value: 'overview', label: 'Overview', content: <p>Overview content.</p> },
              { value: 'activity', label: 'Activity', content: <p>Activity log.</p> },
              { value: 'settings', label: 'Settings', content: <p>Settings panel.</p> },
            ]}
            defaultValue="activity"
          />
        </div>
      </section>
    </main>
  </StrictMode>,
)
