import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEPOT_COORDS,
  INITIAL_EMPLOYEES,
  INITIAL_PRODUCTS,
  INITIAL_PROOFS,
  INITIAL_SHIPMENTS,
  type Employee,
  type Product,
  type PlanId,
  type Proof,
  type Shipment,
  type ShipmentPhoto,
} from '../data/mock'

export interface CompanyAccount {
  companyName: string
  taxId: string
  adminName: string
  adminEmail: string
  plan: PlanId
}

interface AppState {
  isAuthenticated: boolean
  company: CompanyAccount | null
  employees: Employee[]
  products: Product[]
  shipments: Shipment[]
  proofs: Proof[]
  login: (email: string) => void
  logout: () => void
  registerCompany: (data: CompanyAccount) => void
  setPlan: (plan: PlanId) => void
  addEmployee: (employee: Omit<Employee, 'id'>) => void
  updateEmployeeStatus: (id: string, status: Employee['status']) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  addShipment: (shipment: Omit<Shipment, 'id'>) => void
  updateShipment: (id: string, patch: Partial<Shipment>) => void
  /** Simulate warehouse QR/barcode scan + pickup photo */
  simulatePickup: (id: string) => void
  /** Simulate drop-off photo that completes the delivery */
  simulateDelivery: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEY = 'gpexlog_prototype_v1'

const PICKUP_PHOTO =
  'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80'
const DELIVERY_PHOTO =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'

function loadCompany(): CompanyAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CompanyAccount
  } catch {
    return null
  }
}

function proofsFromShipments(shipments: Shipment[]): Proof[] {
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyAccount | null>(() => loadCompany())
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(loadCompany()))
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS)
  const [proofs, setProofs] = useState<Proof[]>(INITIAL_PROOFS)

  const value = useMemo<AppState>(
    () => ({
      isAuthenticated,
      company,
      employees,
      products,
      shipments,
      proofs,
      login: (email: string) => {
        const stored = loadCompany()
        if (stored) {
          setCompany(stored)
        } else {
          const demo: CompanyAccount = {
            companyName: 'Horizon Delivery Co.',
            taxId: '12-3456789',
            adminName: 'Ana Souza',
            adminEmail: email || 'ana@horizondelivery.com',
            plan: 'pro',
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
          setCompany(demo)
        }
        setIsAuthenticated(true)
      },
      logout: () => setIsAuthenticated(false),
      registerCompany: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setCompany(data)
        setEmployees((prev) => [
          {
            id: `e-${Date.now()}`,
            name: data.adminName,
            email: data.adminEmail,
            role: 'admin',
            status: 'active',
          },
          ...prev.filter((e) => e.role !== 'admin'),
        ])
        setIsAuthenticated(true)
      },
      setPlan: (plan) => {
        setCompany((prev) => {
          if (!prev) return prev
          const next = { ...prev, plan }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          return next
        })
      },
      addEmployee: (employee) => {
        setEmployees((prev) => [
          { ...employee, id: `e-${Date.now()}` },
          ...prev,
        ])
      },
      updateEmployeeStatus: (id, status) => {
        setEmployees((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e)),
        )
      },
      addProduct: (product) => {
        setProducts((prev) => [{ ...product, id: `pr-${Date.now()}` }, ...prev])
      },
      addShipment: (shipment) => {
        setShipments((prev) => {
          const next = [{ ...shipment, id: `o-${Date.now()}` }, ...prev]
          setProofs(proofsFromShipments(next))
          return next
        })
      },
      updateShipment: (id, patch) => {
        setShipments((prev) => {
          const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
          setProofs(proofsFromShipments(next))
          return next
        })
      },
      simulatePickup: (id) => {
        const now = new Date().toISOString()
        const photo: ShipmentPhoto = {
          kind: 'pickup',
          url: PICKUP_PHOTO,
          takenAt: now,
          lat: DEPOT_COORDS.lat,
          lng: DEPOT_COORDS.lng,
        }
        setShipments((prev) => {
          const next = prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: 'in_transit' as const,
                  scannedAt: now,
                  pickedUpAt: now,
                  pickupPhoto: photo,
                }
              : s,
          )
          setProofs(proofsFromShipments(next))
          return next
        })
      },
      simulateDelivery: (id) => {
        const now = new Date().toISOString()
        setShipments((prev) => {
          const next = prev.map((s) => {
            if (s.id !== id) return s
            const picked = s.pickedUpAt ? new Date(s.pickedUpAt).getTime() : Date.now()
            const duration = Math.max(
              1,
              Math.round((Date.now() - picked) / 60_000),
            )
            const photo: ShipmentPhoto = {
              kind: 'delivery',
              url: DELIVERY_PHOTO,
              takenAt: now,
              lat: s.lat ?? DEPOT_COORDS.lat,
              lng: s.lng ?? DEPOT_COORDS.lng,
            }
            return {
              ...s,
              status: 'delivered' as const,
              deliveredAt: now,
              deliveryPhoto: photo,
              actualDurationMinutes: duration,
            }
          })
          setProofs(proofsFromShipments(next))
          return next
        })
      },
    }),
    [isAuthenticated, company, employees, products, shipments, proofs],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
