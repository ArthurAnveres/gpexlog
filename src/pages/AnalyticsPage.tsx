import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { STATUS_LABEL, formatDateTime } from '../data/mock'

export function AnalyticsPage() {
  const { shipments } = useApp()

  const delivered = shipments.filter(
    (s) => s.status === 'delivered' && s.actualDurationMinutes != null,
  )

  const avgActual = delivered.length
    ? Math.round(
        delivered.reduce((a, s) => a + (s.actualDurationMinutes ?? 0), 0) /
          delivered.length,
      )
    : 0

  const avgEta = shipments.filter((s) => s.etaMinutes != null).length
    ? Math.round(
        shipments
          .filter((s) => s.etaMinutes != null)
          .reduce((a, s) => a + (s.etaMinutes ?? 0), 0) /
          shipments.filter((s) => s.etaMinutes != null).length,
      )
    : 0

  const onTime = delivered.filter((s) => {
    if (!s.predictedDeliveryAt || !s.deliveredAt) return false
    return new Date(s.deliveredAt) <= new Date(s.predictedDeliveryAt)
  }).length

  const onTimeRate = delivered.length
    ? Math.round((onTime / delivered.length) * 100)
    : 0

  const withPickup = shipments.filter((s) => s.pickupPhoto).length
  const withDeliveryPhoto = shipments.filter((s) => s.deliveryPhoto).length

  const buckets = useMemo(() => {
    const labels = ['0-15m', '16-30m', '31-45m', '46-60m', '60m+']
    const counts = [0, 0, 0, 0, 0]
    for (const s of delivered) {
      const m = s.actualDurationMinutes ?? 0
      if (m <= 15) counts[0]++
      else if (m <= 30) counts[1]++
      else if (m <= 45) counts[2]++
      else if (m <= 60) counts[3]++
      else counts[4]++
    }
    const max = Math.max(1, ...counts)
    return labels.map((label, i) => ({
      label,
      count: counts[i],
      height: Math.round((counts[i] / max) * 100),
    }))
  }, [delivered])

  const etaVsActual = delivered.map((s) => ({
    code: s.code,
    eta: s.etaMinutes ?? 0,
    actual: s.actualDurationMinutes ?? 0,
    delta: (s.actualDurationMinutes ?? 0) - (s.etaMinutes ?? 0),
  }))

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Delivery time analytics</h1>
          <p>
            Compare predicted ETA vs actual time from warehouse QR scan to
            drop-off photo.
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span>Avg actual delivery time</span>
          <strong>{avgActual ? `${avgActual}m` : '—'}</strong>
        </div>
        <div className="metric">
          <span>Avg predicted ETA</span>
          <strong>{avgEta ? `${avgEta}m` : '—'}</strong>
        </div>
        <div className="metric">
          <span>On-time rate</span>
          <strong>{delivered.length ? `${onTimeRate}%` : '—'}</strong>
        </div>
        <div className="metric">
          <span>Completed with both photos</span>
          <strong>
            {withDeliveryPhoto}/{shipments.length}
          </strong>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span>Pickup scans captured</span>
          <strong>{withPickup}</strong>
        </div>
        <div className="metric">
          <span>Delivery photos captured</span>
          <strong>{withDeliveryPhoto}</strong>
        </div>
        <div className="metric">
          <span>Delivered jobs</span>
          <strong>{delivered.length}</strong>
        </div>
        <div className="metric">
          <span>Open / failed</span>
          <strong>
            {
              shipments.filter(
                (s) =>
                  s.status !== 'delivered' && s.status !== 'failed',
              ).length
            }
            /
            {shipments.filter((s) => s.status === 'failed').length}
          </strong>
        </div>
      </div>

      <div className="split-2">
        <section className="panel panel-pad">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
            Actual duration distribution
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1.4rem' }}>
            Minutes from pickup scan + photo to delivery photo.
          </p>
          <div className="chart-bars">
            {buckets.map((b) => (
              <div key={b.label} style={{ height: `${Math.max(8, b.height)}%` }}>
                <span>
                  {b.label}
                  <br />
                  {b.count}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div
            className="panel-pad"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <h2 style={{ fontSize: '1.15rem' }}>ETA vs actual</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>ETA</th>
                  <th>Actual</th>
                  <th>Delta</th>
                </tr>
              </thead>
              <tbody>
                {etaVsActual.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      Complete a delivery with both photos to populate this.
                    </td>
                  </tr>
                ) : (
                  etaVsActual.map((row) => (
                    <tr key={row.code}>
                      <td>{row.code}</td>
                      <td>{row.eta}m</td>
                      <td>{row.actual}m</td>
                      <td>
                        <span
                          className={`badge ${
                            row.delta <= 0 ? 'badge-ok' : 'badge-warn'
                          }`}
                        >
                          {row.delta > 0 ? `+${row.delta}m` : `${row.delta}m`}
                        </span>
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
        <div
          className="panel-pad"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <h2 style={{ fontSize: '1.15rem' }}>Timeline (pickup → delivery)</h2>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Code</th>
                <th>Status</th>
                <th>Scanned / picked up</th>
                <th>Delivered</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td>{s.code}</td>
                  <td>{STATUS_LABEL[s.status]}</td>
                  <td>
                    {s.pickedUpAt ? formatDateTime(s.pickedUpAt) : '—'}
                  </td>
                  <td>
                    {s.deliveredAt ? formatDateTime(s.deliveredAt) : '—'}
                  </td>
                  <td>
                    {s.actualDurationMinutes != null
                      ? `${s.actualDurationMinutes} min`
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
