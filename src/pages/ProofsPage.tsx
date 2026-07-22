import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatDateTime, type Proof } from '../data/mock'

export function ProofsPage() {
  const { proofs } = useApp()
  const [selected, setSelected] = useState<Proof | null>(null)
  const [filter, setFilter] = useState<'all' | 'pickup' | 'delivery'>('all')

  const filtered = useMemo(
    () =>
      filter === 'all' ? proofs : proofs.filter((p) => p.kind === filter),
    [proofs, filter],
  )

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Proofs</h1>
          <p>
            Pickup photos (QR/barcode at warehouse) and delivery photos (at
            address) with GPS and timestamps.
          </p>
        </div>
        <div className="map-tabs">
          {(
            [
              ['all', 'All'],
              ['pickup', 'Pickup'],
              ['delivery', 'Delivery'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`map-tab${filter === id ? ' active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="proof-grid">
        {filtered.map((proof) => (
          <button
            key={proof.id}
            type="button"
            className="proof-card"
            onClick={() => setSelected(proof)}
          >
            <img src={proof.photoUrl} alt={`Proof ${proof.orderCode}`} />
            <div className="body">
              <strong>
                {proof.orderCode}{' '}
                <span className={`badge ${proof.kind === 'pickup' ? 'badge-info' : 'badge-ok'}`}>
                  {proof.kind === 'pickup' ? 'Pickup' : 'Delivery'}
                </span>
              </strong>
              <span className="meta">{proof.recipient}</span>
              <span className="meta">
                {formatDateTime(proof.deliveredAt)} · {proof.lat.toFixed(4)},{' '}
                {proof.lng.toFixed(4)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <img src={selected.photoUrl} alt={`Photo ${selected.orderCode}`} />
            <div className="modal-body">
              <h2 style={{ fontSize: '1.35rem' }}>
                {selected.kind === 'pickup' ? 'Pickup' : 'Delivery'} proof{' '}
                {selected.orderCode}
              </h2>
              <p>
                <strong>Recipient:</strong> {selected.recipient}
              </p>
              <p>
                <strong>Driver:</strong> {selected.courier}
              </p>
              <p>
                <strong>Address:</strong> {selected.address}
              </p>
              <p>
                <strong>Date & time:</strong>{' '}
                {formatDateTime(selected.deliveredAt)}
              </p>
              <p>
                <strong>Geolocation:</strong> {selected.lat}, {selected.lng}
              </p>
              <a
                href={`https://www.google.com/maps?q=${selected.lat},${selected.lng}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-soft btn-sm"
                style={{ width: 'fit-content' }}
              >
                Open in Maps
              </a>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
