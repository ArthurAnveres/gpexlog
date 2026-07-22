import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AddressAutocomplete } from '../components/AddressAutocomplete'
import { useApp } from '../context/AppContext'
import {
  STATUS_LABEL,
  formatDateTime,
  formatUsd,
  type DeliveryStatus,
  type Shipment,
} from '../data/mock'
import { ApiError } from '../lib/api'
import {
  estimateRouteWithGoogle,
  hasGoogleMapsKey,
  type AddressSuggestion,
} from '../lib/googleMaps'

export function ShipmentsPage() {
  const {
    shipments,
    products,
    employees,
    addShipment,
    cancelShipment,
    loading,
    apiError,
    refreshData,
  } = useApp()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Shipment | null>(null)
  const [productId, setProductId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [driverId, setDriverId] = useState('')
  const [address, setAddress] = useState('')
  const [zip, setZip] = useState('')
  const [resolved, setResolved] = useState<AddressSuggestion | null>(null)
  const [etaPreview, setEtaPreview] = useState<Awaited<
    ReturnType<typeof estimateRouteWithGoogle>
  > | null>(null)
  const [estimating, setEstimating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const drivers = employees.filter((e) => e.role === 'driver' && e.status === 'active')
  const productMap = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products],
  )

  const selectedLive =
    selected == null
      ? null
      : (shipments.find((s) => s.id === selected.id) ?? selected)

  async function handleAddressSelect(suggestion: AddressSuggestion) {
    setResolved(suggestion)
    setZip(suggestion.zip || '')
    if (!suggestion.lat || !suggestion.lng) {
      setEtaPreview(null)
      return
    }
    setEstimating(true)
    const estimate = await estimateRouteWithGoogle({
      lat: suggestion.lat,
      lng: suggestion.lng,
    })
    setEtaPreview(estimate)
    setEstimating(false)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const lat = resolved?.lat
    const lng = resolved?.lng
    const finalZip = resolved?.zip || zip

    if (lat == null || lng == null || !finalZip) {
      setFormError('Select an address with coordinates and ZIP code.')
      return
    }

    setFormError(null)
    setSaving(true)
    try {
      await addShipment({
        productName: product.name,
        recipient,
        address: resolved?.description || address,
        zip: finalZip,
        lat,
        lng,
        driverId: driverId || undefined,
      })
      resetModal()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create shipment')
    } finally {
      setSaving(false)
    }
  }

  function resetModal() {
    setOpen(false)
    setProductId('')
    setRecipient('')
    setDriverId('')
    setAddress('')
    setZip('')
    setResolved(null)
    setEtaPreview(null)
    setFormError(null)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Shipments</h1>
          <p>
            Create deliveries in the API and assign drivers. Scan + POD are
            completed in the mobile app.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-soft" onClick={() => void refreshData()}>
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpen(true)}
            disabled={products.length === 0}
          >
            New shipment
          </button>
        </div>
      </div>

      {(apiError || loading) && (
        <div className="panel panel-pad" style={{ marginBottom: '1rem' }}>
          {loading ? 'Loading shipments from API…' : apiError}
        </div>
      )}

      {products.length === 0 && (
        <div className="panel panel-pad" style={{ marginBottom: '1rem' }}>
          Add products in the <Link to="/app/products">Products</Link> tab
          before creating shipments.
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Code / QR</th>
                <th>Product</th>
                <th>Recipient</th>
                <th>Driver</th>
                <th>Photos</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No shipments yet.
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>
                      <button
                        type="button"
                        className="linkish"
                        onClick={() => setSelected(shipment)}
                      >
                        {shipment.code}
                      </button>
                      <div className="cell-sub">Scan: {shipment.scanCode}</div>
                    </td>
                    <td>
                      {shipment.productName}
                      {productMap[shipment.productId] && (
                        <div className="cell-sub">
                          {formatUsd(productMap[shipment.productId].price)} ·{' '}
                          {productMap[shipment.productId].weightLb} lb
                        </div>
                      )}
                    </td>
                    <td>
                      {shipment.recipient}
                      <div className="cell-sub">{shipment.address}</div>
                    </td>
                    <td>{shipment.assignedTo ?? '—'}</td>
                    <td>
                      <div className="photo-pills">
                        <span
                          className={`badge ${shipment.pickupPhoto ? 'badge-ok' : 'badge-warn'}`}
                        >
                          Pickup {shipment.pickupPhoto ? '✓' : '—'}
                        </span>
                        <span
                          className={`badge ${shipment.deliveryPhoto ? 'badge-ok' : 'badge-warn'}`}
                        >
                          Drop-off {shipment.deliveryPhoto ? '✓' : '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {shipment.etaMinutes != null ? (
                        <>
                          ~{shipment.etaMinutes} min
                          <div className="cell-sub">
                            {shipment.distanceMiles?.toFixed(1)} mi
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <StatusBadge status={shipment.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="modal-backdrop" role="presentation" onClick={resetModal}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => void onSubmit(e)}
          >
            <div className="modal-body">
              <h2 style={{ fontSize: '1.35rem' }}>Create shipment</h2>
              <p style={{ color: 'var(--muted)' }}>
                Saves the delivery in the backend for the assigned driver app.
              </p>
              {formError && (
                <div style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>{formError}</div>
              )}
              <div className="form-grid two" style={{ marginTop: '0.5rem' }}>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="productId">Product</label>
                  <select
                    id="productId"
                    required
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    <option value="">Select a product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatUsd(p.price)} ({p.weightLb} lb)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="recipient">Recipient</label>
                  <input
                    id="recipient"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="driverId">Driver</label>
                  <select
                    id="driverId"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <AddressAutocomplete
                    value={address}
                    required
                    onChange={setAddress}
                    onSelect={(a) => void handleAddressSelect(a)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="zip">ZIP code</label>
                  <input
                    id="zip"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="10003"
                  />
                </div>
              </div>

              {(estimating || etaPreview) && (
                <div className="eta-box">
                  <strong>Delivery estimate</strong>
                  {estimating ? (
                    <p>Calculating route with Google…</p>
                  ) : etaPreview ? (
                    <ul>
                      <li>
                        Distance: <strong>{etaPreview.distanceMiles} mi</strong>
                      </li>
                      <li>
                        ETA: <strong>~{etaPreview.etaMinutes} minutes</strong>
                      </li>
                      <li>
                        Predicted arrival:{' '}
                        <strong>
                          {formatDateTime(etaPreview.predictedDeliveryAt)}
                        </strong>
                      </li>
                      <li>
                        Confidence:{' '}
                        <strong className="capitalize">
                          {etaPreview.etaConfidence}
                        </strong>
                        {' · '}
                        {etaPreview.source === 'google_directions'
                          ? 'Google Distance Matrix (traffic-aware)'
                          : hasGoogleMapsKey()
                            ? 'Fallback estimate'
                            : 'Demo estimate (add API key for live Google routing)'}
                      </li>
                    </ul>
                  ) : null}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={resetModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create shipment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {selectedLive && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <h2 style={{ fontSize: '1.35rem' }}>
                Shipment {selectedLive.code}
              </h2>
              <p style={{ color: 'var(--muted)' }}>
                Flow: driver scans barcode in the mobile app → delivers with POD
                photo + GPS.
              </p>

              <div className="flow-steps">
                <div
                  className={`flow-step${selectedLive.pickupPhoto ? ' done' : ' current'}`}
                >
                  <strong>1. Warehouse pickup</strong>
                  <span>Scan QR/barcode in the driver app</span>
                </div>
                <div
                  className={`flow-step${
                    selectedLive.pickupPhoto && !selectedLive.deliveryPhoto
                      ? ' current'
                      : selectedLive.deliveryPhoto
                        ? ' done'
                        : ''
                  }`}
                >
                  <strong>2. In transit</strong>
                  <span>Track ETA / GPS en route to recipient</span>
                </div>
                <div
                  className={`flow-step${selectedLive.deliveryPhoto ? ' done' : ''}`}
                >
                  <strong>3. Drop-off photo</strong>
                  <span>POD photo + GPS completes the delivery</span>
                </div>
              </div>

              <div className="tracking-grid">
                <div>
                  <span>Product</span>
                  <strong>{selectedLive.productName}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>
                    <StatusBadge status={selectedLive.status} />
                  </strong>
                </div>
                <div>
                  <span>QR / barcode</span>
                  <strong className="scan-code">{selectedLive.scanCode}</strong>
                </div>
                <div>
                  <span>Driver</span>
                  <strong>{selectedLive.assignedTo ?? 'Unassigned'}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span>Address</span>
                  <strong>{selectedLive.address}</strong>
                </div>
              </div>

              <div className="photo-pair">
                <article className="photo-card">
                  <h3>Pickup (warehouse scan)</h3>
                  {selectedLive.pickupPhoto ? (
                    <>
                      <img
                        src={selectedLive.pickupPhoto.url}
                        alt={`Pickup ${selectedLive.code}`}
                      />
                      <p>
                        Scanned {selectedLive.scanCode} ·{' '}
                        {formatDateTime(selectedLive.pickupPhoto.takenAt)}
                      </p>
                    </>
                  ) : (
                    <div className="photo-empty">
                      Waiting for driver scan in the mobile app
                    </div>
                  )}
                </article>
                <article className="photo-card">
                  <h3>Delivery photo (POD)</h3>
                  {selectedLive.deliveryPhoto ? (
                    <>
                      <img
                        src={selectedLive.deliveryPhoto.url}
                        alt={`Delivery ${selectedLive.code}`}
                      />
                      <p>
                        {formatDateTime(selectedLive.deliveryPhoto.takenAt)} ·{' '}
                        {selectedLive.deliveryPhoto.lat.toFixed(4)},{' '}
                        {selectedLive.deliveryPhoto.lng.toFixed(4)}
                      </p>
                    </>
                  ) : (
                    <div className="photo-empty">
                      Waiting for POD photo from the mobile app
                    </div>
                  )}
                </article>
              </div>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <div>
                  {selectedLive.status !== 'delivered' &&
                    selectedLive.status !== 'failed' && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          void cancelShipment(selectedLive.id).then(() =>
                            setSelected(null),
                          )
                        }}
                      >
                        Cancel delivery
                      </button>
                    )}
                </div>
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

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const map = {
    delivered: 'badge-ok',
    in_transit: 'badge-info',
    picked_up: 'badge-info',
    pending: 'badge-warn',
    failed: 'badge-danger',
  } as const

  return <span className={`badge ${map[status]}`}>{STATUS_LABEL[status]}</span>
}
