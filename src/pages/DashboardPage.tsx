import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { STATUS_LABEL } from '../data/mock'
import { hasGoogleMapsKey } from '../lib/googleMaps'

export function DashboardPage() {
  const { shipments, employees, proofs, company, products } = useApp()

  const delivered = shipments.filter((o) => o.status === 'delivered').length
  const inTransit = shipments.filter(
    (o) => o.status === 'in_transit' || o.status === 'picked_up',
  ).length
  const pending = shipments.filter((o) => o.status === 'pending').length
  const activeDrivers = employees.filter(
    (e) => e.role === 'driver' && e.status === 'active',
  ).length

  const activeTracking = shipments.filter(
    (s) =>
      s.status === 'in_transit' ||
      s.status === 'pending' ||
      s.status === 'picked_up',
  )

  const avgEta = activeTracking.length
    ? Math.round(
        activeTracking.reduce((sum, s) => sum + (s.etaMinutes ?? 0), 0) /
          activeTracking.length,
      )
    : 0

  const avgActual = (() => {
    const done = shipments.filter((s) => s.actualDurationMinutes != null)
    if (!done.length) return 0
    return Math.round(
      done.reduce((a, s) => a + (s.actualDurationMinutes ?? 0), 0) / done.length,
    )
  })()

  const bars = [42, 58, 35, 70, 48, 82, 64]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const googleLive = hasGoogleMapsKey()

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            Operations overview for {company?.companyName ?? 'your company'} —
            catalog, live deliveries, ETA, and proof photos.
          </p>
        </div>
        <span className={`badge ${googleLive ? 'badge-ok' : 'badge-warn'}`}>
          {googleLive ? 'Google Maps live' : 'Google Maps demo mode'}
        </span>
      </div>

      <div className="quick-links">
        <Link to="/app/analytics" className="btn btn-soft btn-sm">
          Delivery time analytics
        </Link>
        <Link to="/app/maps" className="btn btn-soft btn-sm">
          Heatmap & routes
        </Link>
        <Link to="/app/maps" className="btn btn-soft btn-sm">
          Live monitoring
        </Link>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span>Delivered</span>
          <strong>{delivered}</strong>
        </div>
        <div className="metric">
          <span>In transit / picked up</span>
          <strong>{inTransit}</strong>
        </div>
        <div className="metric">
          <span>Awaiting pickup</span>
          <strong>{pending}</strong>
        </div>
        <div className="metric">
          <span>Catalog products</span>
          <strong>{products.length}</strong>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span>Active drivers</span>
          <strong>{activeDrivers}</strong>
        </div>
        <div className="metric">
          <span>Avg ETA (open)</span>
          <strong>{avgEta ? `${avgEta}m` : '—'}</strong>
        </div>
        <div className="metric">
          <span>Avg actual time</span>
          <strong>{avgActual ? `${avgActual}m` : '—'}</strong>
        </div>
        <div className="metric">
          <span>Proof photos</span>
          <strong>{proofs.length}</strong>
        </div>
      </div>

      <div className="split-2">
        <section className="panel panel-pad">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
            Weekly volume
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.4rem' }}>
            Completed deliveries per day (demo data).
          </p>
          <div className="chart-bars">
            {bars.map((h, i) => (
              <div key={days[i]} style={{ height: `${h}%` }}>
                <span>{days[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-pad" style={{ borderBottom: '1px solid var(--line)' }}>
            <h2 style={{ fontSize: '1.15rem' }}>ETA predictions</h2>
            <p style={{ color: 'var(--muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
              Traffic-aware arrival windows from Google routing (or demo estimate).
            </p>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product</th>
                  <th>ETA</th>
                  <th>Photos</th>
                </tr>
              </thead>
              <tbody>
                {activeTracking.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      No open shipments to track.
                    </td>
                  </tr>
                ) : (
                  activeTracking.slice(0, 6).map((s) => (
                    <tr key={s.id}>
                      <td>{s.code}</td>
                      <td>{s.productName}</td>
                      <td>
                        {s.etaMinutes != null ? `~${s.etaMinutes} min` : '—'}
                        <div className="cell-sub capitalize">{s.etaConfidence}</div>
                      </td>
                      <td>
                        {s.pickupPhoto ? 'Pickup ✓' : 'Need scan'}
                        {' / '}
                        {s.deliveryPhoto ? 'Drop ✓' : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: '1rem' }}>
        <div className="panel-pad" style={{ borderBottom: '1px solid var(--line)' }}>
          <h2 style={{ fontSize: '1.15rem' }}>Latest shipments</h2>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Status</th>
                <th>Driver</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 5).map((shipment) => (
                <tr key={shipment.id}>
                  <td>{shipment.code}</td>
                  <td>{shipment.productName}</td>
                  <td>
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td>{shipment.assignedTo ?? '—'}</td>
                  <td>
                    {shipment.distanceMiles != null
                      ? `${shipment.distanceMiles} mi`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatusBadge({ status }: { status: keyof typeof STATUS_LABEL }) {
  const map = {
    delivered: 'badge-ok',
    in_transit: 'badge-info',
    picked_up: 'badge-info',
    pending: 'badge-warn',
    failed: 'badge-danger',
  } as const

  return <span className={`badge ${map[status]}`}>{STATUS_LABEL[status]}</span>
}
