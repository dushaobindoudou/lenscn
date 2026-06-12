import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GlassSwitch } from '../../../registry/components/glass-switch/glass-switch'
import { GlassSlider } from '../../../registry/components/glass-slider/glass-slider'
import { GlassSegmentedControl } from '../../../registry/components/glass-segmented-control/glass-segmented-control'
import { GlassTabs } from '../../../registry/components/glass-tabs/glass-tabs'
import { Button } from '../../../registry/components/glass-button/glass-button'
import { Badge } from '../../../registry/components/glass-badge/glass-badge'
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '../../../registry/components/glass-card/glass-card'
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

      {/* ── F2: Button ─────────────────────────────────────────────────── */}
      <section style={{ marginTop: 32 }}>
        <h2>Button — variants</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <h2>Button — sizes</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <h2>Button — disabled</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary" disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="ghost" disabled>Ghost</Button>
          <Button variant="danger" disabled>Danger</Button>
        </div>
      </section>

      {/* ── F2: Badge ──────────────────────────────────────────────────── */}
      <section style={{ marginTop: 32 }}>
        <h2>Badge — tones</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="neutral">Neutral</Badge>
        </div>
      </section>

      {/* ── F2: Card / StatCard ────────────────────────────────────────── */}
      <section style={{ marginTop: 32 }}>
        <h2>Card</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Card style={{ minWidth: 240 }}>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
            </CardHeader>
            <CardContent>
              This is the card body. Cards are matte surfaces — no glass (G1).
            </CardContent>
          </Card>
          <Card style={{ minWidth: 240 }}>
            <CardHeader>
              <CardTitle>Another card</CardTitle>
            </CardHeader>
            <CardContent>
              With a <Badge tone="success">success</Badge> badge inside.
            </CardContent>
          </Card>
        </div>

        <h2 style={{ marginTop: 24 }}>StatCard</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatCard
            label="Total revenue"
            value="¥124,580"
            delta={{ value: '12.4%', direction: 'up' }}
            style={{ minWidth: 200 }}
          />
          <StatCard
            label="Orders"
            value="3,842"
            delta={{ value: '2.1%', direction: 'down' }}
            style={{ minWidth: 200 }}
          />
          <StatCard
            label="Active users"
            value="18,294"
            style={{ minWidth: 200 }}
          />
          <StatCard
            label="Refund rate"
            value="0.8%"
            delta={{ value: '0.3%', direction: 'up' }}
            style={{ minWidth: 200 }}
          />
        </div>
      </section>
    </main>
  </StrictMode>,
)
