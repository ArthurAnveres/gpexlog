import { useMemo, useState } from 'react'
import { HeatmapMap, MonitoringMap, RoutesMap } from '../components/Maps'
import { useApp } from '../context/AppContext'
import {
  DRIVER_COLORS,
  HEATMAP_POINTS,
  STATUS_LABEL,
  formatDateTime,
} from '../data/mock'

type Tab = 'heatmap' | 'routes' | 'live'

export function MapsPage() {
  const { shipments } = useApp()
  const [tab, setTab] = useState<Tab>('heatmap')

  const heatPoints = useMemo(() => {
    const fromShipments = shipments
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({
        lat: s.lat!,
        lng: s.lng!,
        weight: s.status === 'delivered' ? 0.9 : 0.55,
      }))
    return [...HEATMAP_POINTS, ...fromShipments]
  }, [shipments])

  const routes = useMemo(() => {
    const byDriver = new Map<string, typeof shipments>()
    for (const s of shipments) {
      if (s.lat == null || s.lng == null) continue
      if (!s.assignedTo) continue
      const list = byDriver.get(s.assignedTo) ?? []
      list.push(s)
      byDriver.set(s.assignedTo, list)
    }
    return [...byDriver.entries()].map(([driver, list]) => ({
      driver,
      color: DRIVER_COLORS[driver] ?? '#64748b',
      path: list.map((s) => ({
        lat: s.lat!,
        lng: s.lng!,
        label: `${s.code} · ${s.productName} · ${STATUS_LABEL[s.status]}`,
      })),
    }))
  }, [shipments])

  const liveMarkers = useMemo(
    () =>
      shipments
        .filter(
          (s) =>
            s.lat != null &&
            s.lng != null &&
            (s.status === 'picked_up' ||
              s.status === 'in_transit' ||
              s.status === 'pending'),
        )
        .map((s) => ({
          id: s.id,
          lat: s.lat!,
          lng: s.lng!,
          label: `${s.code} · ${s.assignedTo ?? 'Unassigned'}`,
          status: STATUS_LABEL[s.status],
          color:
            s.status === 'in_transit'
              ? '#1ec8a5'
              : s.status === 'picked_up'
                ? '#f59e0b'
                : '#94a3b8',
        })),
    [shipments],
  )

  const openJobs = shipments.filter(
    (s) =>
      s.status === 'pending' ||
      s.status === 'picked_up' ||
      s.status === 'in_transit',
  )

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Maps & monitoring</h1>
          <p>
            Delivery heat density, driver route polylines, and live stop
            monitoring for the fleet.
          </p>
        </div>
      </div>

      <div className="map-tabs">
        {(
          [
            ['heatmap', 'Heatmap'],
            ['routes', 'Driver routes'],
            ['live', 'Live monitoring'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`map-tab${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="map-panel">
        {tab === 'heatmap' && (
          <>
            <div className="map-legend">
              <span className="dot hot" /> High drop-off density
              <span className="dot mid" /> Medium
              <span className="dot cool" /> Lower
            </div>
            <HeatmapMap points={heatPoints} />
          </>
        )}

        {tab === 'routes' && (
          <>
            <div className="map-legend">
              {routes.map((r) => (
                <span key={r.driver} className="route-chip">
                  <i style={{ background: r.color }} />
                  {r.driver} ({r.path.length})
                </span>
              ))}
              {routes.length === 0 && <span>No assigned routes yet.</span>}
            </div>
            <RoutesMap routes={routes} />
          </>
        )}

        {tab === 'live' && (
          <div className="split-2 map-live-grid">
            <div>
              <div className="map-legend">
                Open stops on the map · {liveMarkers.length} active
              </div>
              <MonitoringMap markers={liveMarkers} />
            </div>
            <section className="panel">
              <div
                className="panel-pad"
                style={{ borderBottom: '1px solid var(--line)' }}
              >
                <h2 style={{ fontSize: '1.1rem' }}>Live delivery board</h2>
              </div>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Driver</th>
                      <th>Status</th>
                      <th>ETA</th>
                      <th>Scan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openJobs.map((s) => (
                      <tr key={s.id}>
                        <td>{s.code}</td>
                        <td>{s.assignedTo ?? '—'}</td>
                        <td>{STATUS_LABEL[s.status]}</td>
                        <td>
                          {s.etaMinutes != null ? `~${s.etaMinutes}m` : '—'}
                          {s.predictedDeliveryAt && (
                            <div className="cell-sub">
                              {formatDateTime(s.predictedDeliveryAt)}
                            </div>
                          )}
                        </td>
                        <td>
                          {s.pickupPhoto ? (
                            <span className="badge badge-ok">Scanned</span>
                          ) : (
                            <span className="badge badge-warn">Need QR</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
