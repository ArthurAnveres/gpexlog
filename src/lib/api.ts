const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://46.202.150.246:8014'

const TOKEN_KEY = 'gpexlog_admin_token'
const USER_KEY = 'gpexlog_admin_user'
const COMPANY_KEY = 'gpexlog_prototype_v1'

export type AdminUser = {
  id: number
  name: string
  email: string
}

export type ApiDriver = {
  id: number
  name: string
  email: string
  phone: string | null
  vehicle: string | null
  deleted_at: string | null
  deliveries_count?: number
  created_at?: string
  updated_at?: string
}

export type ApiDelivery = {
  id: number
  driver_id: number | null
  tracking_code: string
  order_number: string | null
  barcode_scanner: string | null
  customer_name: string
  customer_phone: string | null
  destination_address: string
  apartment_suite: string | null
  zip_code: string | null
  instructions: string | null
  latitude: string | number
  longitude: string | number
  status: 'pending' | 'in_transit' | 'completed' | 'failed'
  scanned_at: string | null
  proof_photo_path: string | null
  delivery_gps_lat: string | number | null
  delivery_gps_lng: string | number | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  driver?: ApiDriver | null
}

type Paginated<T> = {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function getApiBase() {
  return API_BASE
}

export function storageUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE}/storage/${path.replace(/^\/+/, '')}`
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function saveSession(token: string, user: AdminUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  let payload: unknown = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = text
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : `Request failed (${response.status})`

    if (response.status === 401) {
      clearSession()
    }

    throw new ApiError(message, response.status, payload)
  }

  return payload as T
}

export async function adminLogin(email: string, password: string) {
  const result = await request<{
    success: boolean
    token: string
    user: AdminUser
  }>(
    '/api/admin/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  )

  saveSession(result.token, result.user)

  if (!localStorage.getItem(COMPANY_KEY)) {
    localStorage.setItem(
      COMPANY_KEY,
      JSON.stringify({
        companyName: 'GpexLog Logistics',
        taxId: '00-0000000',
        adminName: result.user.name,
        adminEmail: result.user.email,
        plan: 'pro',
      }),
    )
  }

  return result
}

export async function adminLogout() {
  try {
    await request('/api/admin/logout', { method: 'POST' })
  } catch {
    // ignore network/auth errors on logout
  } finally {
    clearSession()
  }
}

export async function fetchDrivers(withBlocked = true) {
  const query = new URLSearchParams({
    per_page: '100',
    with_blocked: withBlocked ? 'true' : 'false',
  })
  return request<Paginated<ApiDriver>>(`/api/admin/drivers?${query}`)
}

export async function createDriver(payload: {
  name: string
  email: string
  phone: string
  password: string
  vehicle?: string
}) {
  return request<{ success: boolean; data: ApiDriver }>('/api/admin/drivers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function blockDriver(id: string | number) {
  return request<{ success: boolean }>(`/api/admin/drivers/${id}/block`, {
    method: 'POST',
  })
}

export async function unblockDriver(id: string | number) {
  return request<{ success: boolean; data: ApiDriver }>(
    `/api/admin/drivers/${id}/unblock`,
    { method: 'POST' },
  )
}

export async function fetchDeliveries() {
  const query = new URLSearchParams({ per_page: '100' })
  return request<Paginated<ApiDelivery>>(`/api/admin/deliveries?${query}`)
}

export async function createDelivery(payload: {
  driver_id?: number | null
  order_number?: string
  barcode_scanner?: string
  customer_name: string
  customer_phone?: string
  destination_address: string
  apartment_suite?: string
  zip_code: string
  instructions?: string
  latitude: number
  longitude: number
}) {
  return request<{ success: boolean; data: ApiDelivery }>(
    '/api/admin/deliveries',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function cancelDelivery(id: string | number) {
  return request<{ success: boolean; data: ApiDelivery }>(
    `/api/admin/deliveries/${id}/cancel`,
    { method: 'POST' },
  )
}
