import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  INITIAL_PRODUCTS,
  type Employee,
  type Product,
  type PlanId,
  type Proof,
  type Shipment,
} from '../data/mock'
import {
  adminLogin,
  adminLogout,
  blockDriver,
  cancelDelivery,
  createDelivery,
  createDriver,
  fetchDeliveries,
  fetchDrivers,
  getStoredUser,
  getToken,
  unblockDriver,
  type AdminUser,
} from '../lib/api'
import {
  mapDeliveryToShipment,
  mapDriverToEmployee,
  proofsFromApiShipments,
} from '../lib/mappers'

export interface CompanyAccount {
  companyName: string
  taxId: string
  adminName: string
  adminEmail: string
  plan: PlanId
}

interface AppState {
  isAuthenticated: boolean
  loading: boolean
  apiError: string | null
  company: CompanyAccount | null
  user: AdminUser | null
  employees: Employee[]
  products: Product[]
  shipments: Shipment[]
  proofs: Proof[]
  refreshData: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  registerCompany: (data: CompanyAccount) => void
  setPlan: (plan: PlanId) => void
  addEmployee: (employee: {
    name: string
    email: string
    phone: string
    password: string
    vehicle?: string
  }) => Promise<void>
  updateEmployeeStatus: (
    id: string,
    status: Employee['status'],
  ) => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => void
  addShipment: (input: {
    productName: string
    recipient: string
    address: string
    zip: string
    lat: number
    lng: number
    driverId?: string
    customerPhone?: string
    apartmentSuite?: string
    instructions?: string
  }) => Promise<void>
  updateShipment: (id: string, patch: Partial<Shipment>) => void
  cancelShipment: (id: string) => Promise<void>
  simulatePickup: (id: string) => void
  simulateDelivery: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEY = 'gpexlog_prototype_v1'

function loadCompany(): CompanyAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CompanyAccount
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyAccount | null>(() => loadCompany())
  const [user, setUser] = useState<AdminUser | null>(() => getStoredUser())
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()))
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [proofs, setProofs] = useState<Proof[]>([])

  const refreshData = useCallback(async () => {
    if (!getToken()) return
    setLoading(true)
    setApiError(null)
    try {
      const [driversRes, deliveriesRes] = await Promise.all([
        fetchDrivers(true),
        fetchDeliveries(),
      ])

      const mappedEmployees = driversRes.data.map(mapDriverToEmployee)
      const mappedShipments = deliveriesRes.data.map(mapDeliveryToShipment)

      setEmployees(mappedEmployees)
      setShipments(mappedShipments)
      setProofs(proofsFromApiShipments(mappedShipments))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load API data'
      setApiError(message)
      if (message.includes('(401)')) {
        setIsAuthenticated(false)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      void refreshData()
    }
  }, [isAuthenticated, refreshData])

  const value = useMemo<AppState>(
    () => ({
      isAuthenticated,
      loading,
      apiError,
      company,
      user,
      employees,
      products,
      shipments,
      proofs,
      refreshData,
      login: async (email, password) => {
        const result = await adminLogin(email, password)
        setUser(result.user)
        const stored = loadCompany()
        if (stored) {
          setCompany({
            ...stored,
            adminName: result.user.name,
            adminEmail: result.user.email,
          })
        } else {
          const demo: CompanyAccount = {
            companyName: 'GpexLog Logistics',
            taxId: '00-0000000',
            adminName: result.user.name,
            adminEmail: result.user.email,
            plan: 'pro',
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
          setCompany(demo)
        }
        setIsAuthenticated(true)
      },
      logout: async () => {
        await adminLogout()
        setIsAuthenticated(false)
        setUser(null)
        setEmployees([])
        setShipments([])
        setProofs([])
      },
      registerCompany: (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setCompany(data)
      },
      setPlan: (plan) => {
        setCompany((prev) => {
          if (!prev) return prev
          const next = { ...prev, plan }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          return next
        })
      },
      addEmployee: async (employee) => {
        await createDriver({
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          password: employee.password,
          vehicle: employee.vehicle,
        })
        await refreshData()
      },
      updateEmployeeStatus: async (id, status) => {
        if (status === 'inactive') {
          await blockDriver(id)
        } else {
          await unblockDriver(id)
        }
        await refreshData()
      },
      addProduct: (product) => {
        setProducts((prev) => [{ ...product, id: `pr-${Date.now()}` }, ...prev])
      },
      addShipment: async (input) => {
        await createDelivery({
          driver_id: input.driverId ? Number(input.driverId) : null,
          customer_name: input.recipient,
          customer_phone: input.customerPhone,
          destination_address: input.address,
          apartment_suite: input.apartmentSuite,
          zip_code: input.zip,
          latitude: input.lat,
          longitude: input.lng,
          order_number: `ORD-${Date.now()}`,
          instructions: [
            `Product: ${input.productName}`,
            input.instructions,
          ]
            .filter(Boolean)
            .join('\n'),
        })
        await refreshData()
      },
      updateShipment: (id, patch) => {
        setShipments((prev) => {
          const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
          setProofs(proofsFromApiShipments(next))
          return next
        })
      },
      cancelShipment: async (id) => {
        await cancelDelivery(id)
        await refreshData()
      },
      simulatePickup: () => {
        // Real pickup happens on the mobile driver app.
      },
      simulateDelivery: () => {
        // Real POD happens on the mobile driver app.
      },
    }),
    [
      isAuthenticated,
      loading,
      apiError,
      company,
      user,
      employees,
      products,
      shipments,
      proofs,
      refreshData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
