export type PlanId = 'free' | 'pro' | 'pro_max'

export type EmployeeRole = 'admin' | 'operator' | 'driver'

/** Warehouse pickup → en route → drop-off photo completes delivery */
export type DeliveryStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'failed'

export interface Plan {
  id: PlanId
  name: string
  price: number
  priceLabel: string
  description: string
  employees: number | 'Unlimited'
  deliveries: number | 'Unlimited'
  features: string[]
  highlight?: boolean
}

export interface Employee {
  id: string
  name: string
  email: string
  role: EmployeeRole
  status: 'active' | 'invite_pending' | 'inactive'
  phone?: string
}

/** Catalog item (what you sell / stock) — not the delivery itself */
export interface Product {
  id: string
  name: string
  sku: string
  price: number
  weightLb: number
  category: string
  description?: string
}

export interface ShipmentPhoto {
  url: string
  takenAt: string
  lat: number
  lng: number
  kind: 'pickup' | 'delivery'
}

/** A delivery job: product + recipient + address + driver + Google ETA */
export interface Shipment {
  id: string
  code: string
  /** QR / barcode value scanned at warehouse pickup */
  scanCode: string
  productId: string
  productName: string
  recipient: string
  address: string
  zip: string
  lat?: number
  lng?: number
  status: DeliveryStatus
  assignedTo?: string
  createdAt: string
  distanceMiles?: number
  etaMinutes?: number
  predictedDeliveryAt?: string
  etaConfidence: 'high' | 'medium' | 'low'
  pickupPhoto?: ShipmentPhoto
  deliveryPhoto?: ShipmentPhoto
  scannedAt?: string
  pickedUpAt?: string
  deliveredAt?: string
  /** Actual minutes from pickup scan to delivery photo */
  actualDurationMinutes?: number
}

export interface Proof {
  id: string
  orderCode: string
  recipient: string
  courier: string
  photoUrl: string
  lat: number
  lng: number
  deliveredAt: string
  address: string
  kind: 'pickup' | 'delivery'
}

export const DEPOT_COORDS = { lat: 37.7749, lng: -122.4194 }

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    description: 'Validate your workflow with a small team.',
    employees: 2,
    deliveries: 50,
    features: [
      'Up to 2 team members',
      '50 deliveries / month',
      'Photo + GPS + timestamp',
      'Basic dashboard',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    priceLabel: '$99',
    description: 'Built for daily operations with control and scale.',
    employees: 15,
    deliveries: 1000,
    highlight: true,
    features: [
      'Up to 15 team members',
      '1,000 deliveries / month',
      'Google address + ETA tracking',
      'Heatmap, routes & monitoring',
      'QR/barcode pickup + POD photos',
    ],
  },
  {
    id: 'pro_max',
    name: 'Pro Max',
    price: 249,
    priceLabel: '$249',
    description: 'For high-volume fleets and multi-location networks.',
    employees: 'Unlimited',
    deliveries: 'Unlimited',
    features: [
      'Unlimited team members',
      'Unlimited deliveries',
      'Multi-location support',
      'API and webhooks',
      'Priority support',
    ],
  },
]

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Ana Souza',
    email: 'ana@horizondelivery.com',
    role: 'admin',
    status: 'active',
    phone: '(415) 555-1001',
  },
  {
    id: 'e2',
    name: 'Bruno Lima',
    email: 'bruno@horizondelivery.com',
    role: 'driver',
    status: 'active',
    phone: '(415) 555-2002',
  },
  {
    id: 'e3',
    name: 'Carla Mendes',
    email: 'carla@horizondelivery.com',
    role: 'operator',
    status: 'active',
    phone: '(415) 555-3003',
  },
  {
    id: 'e4',
    name: 'Diego Alves',
    email: 'diego@horizondelivery.com',
    role: 'driver',
    status: 'invite_pending',
  },
]

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'pr1',
    name: 'Batman action figure',
    sku: 'TOY-BAT-001',
    price: 29.99,
    weightLb: 1.2,
    category: 'Toys',
    description: 'Collector edition Batman figure, 7 inch.',
  },
  {
    id: 'pr2',
    name: 'Wireless earbuds Pro',
    sku: 'ELC-EAR-220',
    price: 89.0,
    weightLb: 0.4,
    category: 'Electronics',
  },
  {
    id: 'pr3',
    name: 'Organic coffee beans 2lb',
    sku: 'GRO-COF-02',
    price: 24.5,
    weightLb: 2.0,
    category: 'Grocery',
  },
  {
    id: 'pr4',
    name: 'Yoga mat premium',
    sku: 'FIT-YOG-10',
    price: 45.0,
    weightLb: 3.1,
    category: 'Fitness',
  },
]

const PICKUP_PHOTO =
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80'
const DELIVERY_PHOTO =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'
const DELIVERY_PHOTO_2 =
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80'

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'o1',
    code: 'DLV-1042',
    scanCode: 'DLV-1042',
    productId: 'pr1',
    productName: 'Batman action figure',
    recipient: 'Mariana Costa',
    address: '120 Market St, San Francisco, CA 94105',
    zip: '94105',
    lat: 37.7936,
    lng: -122.3965,
    status: 'delivered',
    assignedTo: 'Bruno Lima',
    createdAt: '2026-07-21',
    distanceMiles: 2.4,
    etaMinutes: 18,
    predictedDeliveryAt: '2026-07-21T16:40:00',
    etaConfidence: 'high',
    scannedAt: '2026-07-21T16:12:04',
    pickedUpAt: '2026-07-21T16:12:04',
    deliveredAt: '2026-07-21T16:42:18',
    actualDurationMinutes: 30,
    pickupPhoto: {
      kind: 'pickup',
      url: PICKUP_PHOTO,
      takenAt: '2026-07-21T16:12:04',
      lat: DEPOT_COORDS.lat,
      lng: DEPOT_COORDS.lng,
    },
    deliveryPhoto: {
      kind: 'delivery',
      url: DELIVERY_PHOTO,
      takenAt: '2026-07-21T16:42:18',
      lat: 37.7936,
      lng: -122.3965,
    },
  },
  {
    id: 'o2',
    code: 'DLV-1043',
    scanCode: 'DLV-1043',
    productId: 'pr2',
    productName: 'Wireless earbuds Pro',
    recipient: 'Pedro Santos',
    address: '890 Mission St, San Francisco, CA 94103',
    zip: '94103',
    lat: 37.7825,
    lng: -122.4056,
    status: 'in_transit',
    assignedTo: 'Bruno Lima',
    createdAt: '2026-07-22',
    distanceMiles: 3.1,
    etaMinutes: 24,
    predictedDeliveryAt: '2026-07-22T14:55:00',
    etaConfidence: 'high',
    scannedAt: '2026-07-22T14:20:11',
    pickedUpAt: '2026-07-22T14:20:11',
    pickupPhoto: {
      kind: 'pickup',
      url: PICKUP_PHOTO,
      takenAt: '2026-07-22T14:20:11',
      lat: DEPOT_COORDS.lat,
      lng: DEPOT_COORDS.lng,
    },
  },
  {
    id: 'o3',
    code: 'DLV-1044',
    scanCode: 'DLV-1044',
    productId: 'pr3',
    productName: 'Organic coffee beans 2lb',
    recipient: 'Helena Rocha',
    address: '45 Geary St, San Francisco, CA 94108',
    zip: '94108',
    lat: 37.7877,
    lng: -122.4048,
    status: 'pending',
    createdAt: '2026-07-22',
    distanceMiles: 1.8,
    etaMinutes: 14,
    predictedDeliveryAt: '2026-07-22T16:10:00',
    etaConfidence: 'medium',
  },
  {
    id: 'o4',
    code: 'DLV-1045',
    scanCode: 'DLV-1045',
    productId: 'pr1',
    productName: 'Batman action figure',
    recipient: 'Igor Martins',
    address: '310 Valencia St, San Francisco, CA 94103',
    zip: '94103',
    lat: 37.7679,
    lng: -122.4219,
    status: 'picked_up',
    assignedTo: 'Diego Alves',
    createdAt: '2026-07-22',
    distanceMiles: 4.6,
    etaMinutes: 32,
    predictedDeliveryAt: '2026-07-22T17:20:00',
    etaConfidence: 'medium',
    scannedAt: '2026-07-22T16:05:40',
    pickedUpAt: '2026-07-22T16:05:40',
    pickupPhoto: {
      kind: 'pickup',
      url: PICKUP_PHOTO,
      takenAt: '2026-07-22T16:05:40',
      lat: DEPOT_COORDS.lat,
      lng: DEPOT_COORDS.lng,
    },
  },
  {
    id: 'o5',
    code: 'DLV-1040',
    scanCode: 'DLV-1040',
    productId: 'pr4',
    productName: 'Yoga mat premium',
    recipient: 'Luiza Freitas',
    address: '1500 Van Ness Ave, San Francisco, CA 94109',
    zip: '94109',
    lat: 37.7886,
    lng: -122.4214,
    status: 'failed',
    assignedTo: 'Bruno Lima',
    createdAt: '2026-07-20',
    distanceMiles: 2.9,
    etaMinutes: 22,
    predictedDeliveryAt: '2026-07-20T15:00:00',
    etaConfidence: 'low',
    scannedAt: '2026-07-20T14:10:00',
    pickedUpAt: '2026-07-20T14:10:00',
    pickupPhoto: {
      kind: 'pickup',
      url: PICKUP_PHOTO,
      takenAt: '2026-07-20T14:10:00',
      lat: DEPOT_COORDS.lat,
      lng: DEPOT_COORDS.lng,
    },
  },
  {
    id: 'o6',
    code: 'DLV-1038',
    scanCode: 'DLV-1038',
    productId: 'pr2',
    productName: 'Wireless earbuds Pro',
    recipient: 'Rafael Nunes',
    address: '200 Fillmore St, San Francisco, CA 94117',
    zip: '94117',
    lat: 37.7849,
    lng: -122.4094,
    status: 'delivered',
    assignedTo: 'Bruno Lima',
    createdAt: '2026-07-20',
    distanceMiles: 2.1,
    etaMinutes: 16,
    predictedDeliveryAt: '2026-07-20T11:10:00',
    etaConfidence: 'high',
    scannedAt: '2026-07-20T10:48:00',
    pickedUpAt: '2026-07-20T10:48:00',
    deliveredAt: '2026-07-20T11:15:03',
    actualDurationMinutes: 27,
    pickupPhoto: {
      kind: 'pickup',
      url: PICKUP_PHOTO,
      takenAt: '2026-07-20T10:48:00',
      lat: DEPOT_COORDS.lat,
      lng: DEPOT_COORDS.lng,
    },
    deliveryPhoto: {
      kind: 'delivery',
      url: DELIVERY_PHOTO_2,
      takenAt: '2026-07-20T11:15:03',
      lat: 37.7849,
      lng: -122.4094,
    },
  },
]

/** Extra density points for heatmap prototype (SF bay area) */
export const HEATMAP_POINTS: Array<{ lat: number; lng: number; weight: number }> = [
  { lat: 37.7936, lng: -122.3965, weight: 0.9 },
  { lat: 37.7825, lng: -122.4056, weight: 0.8 },
  { lat: 37.7877, lng: -122.4048, weight: 0.7 },
  { lat: 37.7679, lng: -122.4219, weight: 0.85 },
  { lat: 37.7886, lng: -122.4214, weight: 0.6 },
  { lat: 37.7849, lng: -122.4094, weight: 0.75 },
  { lat: 37.7793, lng: -122.4192, weight: 0.95 },
  { lat: 37.7955, lng: -122.3937, weight: 0.55 },
  { lat: 37.7786, lng: -122.3893, weight: 0.7 },
  { lat: 37.7699, lng: -122.4469, weight: 0.5 },
  { lat: 37.7599, lng: -122.4148, weight: 0.65 },
  { lat: 37.8001, lng: -122.4101, weight: 0.45 },
  { lat: 37.7765, lng: -122.4506, weight: 0.4 },
  { lat: 37.7812, lng: -122.398, weight: 0.88 },
  { lat: 37.7912, lng: -122.432, weight: 0.52 },
]

export const DRIVER_COLORS: Record<string, string> = {
  'Bruno Lima': '#1ec8a5',
  'Diego Alves': '#f59e0b',
  Unassigned: '#94a3b8',
}

export const INITIAL_PROOFS: Proof[] = INITIAL_SHIPMENTS.flatMap((s) => {
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

export const ROLE_LABEL: Record<EmployeeRole, string> = {
  admin: 'Admin',
  operator: 'Operator',
  driver: 'Driver',
}

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: 'Awaiting pickup',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  delivered: 'Delivered',
  failed: 'Failed',
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
