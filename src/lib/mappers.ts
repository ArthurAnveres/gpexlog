import type { Employee, Proof, Shipment, ShipmentPhoto } from '../data/mock'
import { DEPOT_COORDS } from '../data/mock'
import { storageUrl, type ApiDelivery, type ApiDriver } from './api'

export function mapDriverToEmployee(driver: ApiDriver): Employee {
  return {
    id: String(driver.id),
    name: driver.name,
    email: driver.email,
    phone: driver.phone ?? undefined,
    role: 'driver',
    status: driver.deleted_at ? 'inactive' : 'active',
  }
}

function toNumber(value: string | number | null | undefined) {
  if (value == null || value === '') return undefined
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : undefined
}

function mapStatus(status: ApiDelivery['status']): Shipment['status'] {
  switch (status) {
    case 'completed':
      return 'delivered'
    case 'in_transit':
      return 'in_transit'
    case 'failed':
      return 'failed'
    default:
      return 'pending'
  }
}

export function mapDeliveryToShipment(delivery: ApiDelivery): Shipment {
  const lat = toNumber(delivery.latitude)
  const lng = toNumber(delivery.longitude)
  const gpsLat = toNumber(delivery.delivery_gps_lat)
  const gpsLng = toNumber(delivery.delivery_gps_lng)

  let pickupPhoto: ShipmentPhoto | undefined
  if (delivery.scanned_at) {
    pickupPhoto = {
      kind: 'pickup',
      url: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80',
      takenAt: delivery.scanned_at,
      lat: DEPOT_COORDS.lat,
      lng: DEPOT_COORDS.lng,
    }
  }

  let deliveryPhoto: ShipmentPhoto | undefined
  const photoUrl = storageUrl(delivery.proof_photo_path)
  if (photoUrl && delivery.delivered_at) {
    deliveryPhoto = {
      kind: 'delivery',
      url: photoUrl,
      takenAt: delivery.delivered_at,
      lat: gpsLat ?? lat ?? DEPOT_COORDS.lat,
      lng: gpsLng ?? lng ?? DEPOT_COORDS.lng,
    }
  }

  const productHint =
    delivery.instructions?.match(/^Product:\s*(.+)$/m)?.[1] ||
    delivery.order_number ||
    'Delivery package'

  return {
    id: String(delivery.id),
    code: delivery.tracking_code,
    scanCode: delivery.barcode_scanner || delivery.tracking_code,
    productId: 'api',
    productName: productHint,
    recipient: delivery.customer_name,
    address: [
      delivery.destination_address,
      delivery.apartment_suite,
      delivery.zip_code,
    ]
      .filter(Boolean)
      .join(', '),
    zip: delivery.zip_code || '',
    lat,
    lng,
    status: mapStatus(delivery.status),
    assignedTo: delivery.driver?.name,
    createdAt: delivery.created_at?.slice(0, 10) || delivery.created_at,
    etaConfidence: 'medium',
    pickupPhoto,
    deliveryPhoto,
    scannedAt: delivery.scanned_at ?? undefined,
    pickedUpAt: delivery.scanned_at ?? undefined,
    deliveredAt: delivery.delivered_at ?? undefined,
  }
}

export function proofsFromApiShipments(shipments: Shipment[]): Proof[] {
  return shipments.flatMap((s) => {
    const items: Proof[] = []
    if (s.pickupPhoto) {
      items.push({
        id: `pu-${s.id}`,
        orderCode: s.code,
        recipient: s.recipient,
        courier: s.assignedTo ?? '—',
        photoUrl: s.pickupPhoto.url,
        lat: s.pickupPhoto.lat,
        lng: s.pickupPhoto.lng,
        deliveredAt: s.pickupPhoto.takenAt,
        address: 'Warehouse depot',
        kind: 'pickup',
      })
    }
    if (s.deliveryPhoto) {
      items.push({
        id: `de-${s.id}`,
        orderCode: s.code,
        recipient: s.recipient,
        courier: s.assignedTo ?? '—',
        photoUrl: s.deliveryPhoto.url,
        lat: s.deliveryPhoto.lat,
        lng: s.deliveryPhoto.lng,
        deliveredAt: s.deliveryPhoto.takenAt,
        address: s.address,
        kind: 'delivery',
      })
    }
    return items
  })
}
