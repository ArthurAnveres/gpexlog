/** Google Maps / Places helpers for GpexLog prototype */

export const DEPOT = {
  lat: 37.7749,
  lng: -122.4194,
  label: 'SF Depot',
}

export interface AddressSuggestion {
  id: string
  description: string
  street: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
}

export interface RouteEstimate {
  distanceMiles: number
  etaMinutes: number
  predictedDeliveryAt: string
  etaConfidence: 'high' | 'medium' | 'low'
  source: 'google_directions' | 'haversine_fallback'
}

declare global {
  interface Window {
    google?: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string
                componentRestrictions?: { country: string }
                types?: string[]
              },
              callback: (
                predictions: Array<{ description: string; place_id: string }> | null,
                status: string,
              ) => void,
            ) => void
          }
          PlacesService: new (attrContainer: HTMLElement) => {
            getDetails: (
              request: { placeId: string; fields: string[] },
              callback: (
                place: {
                  formatted_address?: string
                  geometry?: { location?: { lat: () => number; lng: () => number } }
                  address_components?: Array<{
                    long_name: string
                    short_name: string
                    types: string[]
                  }>
                } | null,
                status: string,
              ) => void,
            ) => void
          }
        }
        DistanceMatrixService: new () => {
          getDistanceMatrix: (
            request: {
              origins: Array<{ lat: number; lng: number }>
              destinations: Array<{ lat: number; lng: number }>
              travelMode: string
              drivingOptions?: { departureTime: Date }
            },
            callback: (
              response: {
                rows: Array<{
                  elements: Array<{
                    status: string
                    distance?: { value: number; text: string }
                    duration?: { value: number; text: string }
                    duration_in_traffic?: { value: number; text: string }
                  }>
                }>
              } | null,
              status: string,
            ) => void,
          ) => void
        }
        TravelMode: { DRIVING: string }
      }
    }
    __gpexGoogleMapsPromise?: Promise<void>
  }
}

export function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
}

export function hasGoogleMapsKey() {
  return Boolean(getGoogleMapsApiKey()?.trim())
}

export function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve()
  if (window.__gpexGoogleMapsPromise) return window.__gpexGoogleMapsPromise

  const key = getGoogleMapsApiKey()
  if (!key) return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))

  window.__gpexGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps JS'))
    document.head.appendChild(script)
  })

  return window.__gpexGoogleMapsPromise
}

/** Demo ZIP → address dataset used when no API key is configured */
const MOCK_ADDRESSES: AddressSuggestion[] = [
  {
    id: 'm1',
    description: '120 Market St, San Francisco, CA 94105',
    street: '120 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    lat: 37.7936,
    lng: -122.3965,
  },
  {
    id: 'm2',
    description: '890 Mission St, San Francisco, CA 94103',
    street: '890 Mission St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    lat: 37.7825,
    lng: -122.4056,
  },
  {
    id: 'm3',
    description: '45 Geary St, San Francisco, CA 94108',
    street: '45 Geary St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94108',
    lat: 37.7877,
    lng: -122.4048,
  },
  {
    id: 'm4',
    description: '310 Valencia St, San Francisco, CA 94103',
    street: '310 Valencia St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    lat: 37.7679,
    lng: -122.4219,
  },
  {
    id: 'm5',
    description: '1500 Van Ness Ave, San Francisco, CA 94109',
    street: '1500 Van Ness Ave',
    city: 'San Francisco',
    state: 'CA',
    zip: '94109',
    lat: 37.7886,
    lng: -122.4214,
  },
  {
    id: 'm6',
    description: '1 Ferry Building, San Francisco, CA 94111',
    street: '1 Ferry Building',
    city: 'San Francisco',
    state: 'CA',
    zip: '94111',
    lat: 37.7955,
    lng: -122.3937,
  },
  {
    id: 'm7',
    description: '24 Willie Mays Plaza, San Francisco, CA 94107',
    street: '24 Willie Mays Plaza',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    lat: 37.7786,
    lng: -122.3893,
  },
  {
    id: 'm8',
    description: '200 Fillmore St, San Francisco, CA 94117',
    street: '200 Fillmore St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94117',
    lat: 37.7849,
    lng: -122.4094,
  },
]

function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function estimateRoute(
  destination: { lat: number; lng: number },
  origin = DEPOT,
): RouteEstimate {
  const distanceMiles = Number((haversineMiles(origin, destination) * 1.35).toFixed(1))
  const avgMph = 18
  const etaMinutes = Math.max(8, Math.round((distanceMiles / avgMph) * 60) + 5)
  const predicted = new Date(Date.now() + etaMinutes * 60_000)
  return {
    distanceMiles,
    etaMinutes,
    predictedDeliveryAt: predicted.toISOString(),
    etaConfidence: distanceMiles < 5 ? 'high' : distanceMiles < 12 ? 'medium' : 'low',
    source: 'haversine_fallback',
  }
}

export async function estimateRouteWithGoogle(
  destination: { lat: number; lng: number },
  origin = DEPOT,
): Promise<RouteEstimate> {
  if (!hasGoogleMapsKey()) return estimateRoute(destination, origin)

  try {
    await loadGoogleMaps()
    const service = new window.google!.maps.DistanceMatrixService()
    const result = await new Promise<RouteEstimate>((resolve) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: window.google!.maps.TravelMode.DRIVING,
          drivingOptions: { departureTime: new Date() },
        },
        (response, status) => {
          const el = response?.rows?.[0]?.elements?.[0]
          if (status !== 'OK' || !el || el.status !== 'OK' || !el.distance || !el.duration) {
            resolve(estimateRoute(destination, origin))
            return
          }
          const durationSec =
            el.duration_in_traffic?.value ?? el.duration.value
          const etaMinutes = Math.max(5, Math.round(durationSec / 60))
          const distanceMiles = Number((el.distance.value / 1609.34).toFixed(1))
          resolve({
            distanceMiles,
            etaMinutes,
            predictedDeliveryAt: new Date(
              Date.now() + etaMinutes * 60_000,
            ).toISOString(),
            etaConfidence: 'high',
            source: 'google_directions',
          })
        },
      )
    })
    return result
  } catch {
    return estimateRoute(destination, origin)
  }
}

export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim()
  if (q.length < 2) return []

  if (!hasGoogleMapsKey()) {
    const lower = q.toLowerCase()
    return MOCK_ADDRESSES.filter(
      (a) =>
        a.zip.startsWith(q.replace(/\D/g, '').slice(0, 5)) ||
        a.description.toLowerCase().includes(lower) ||
        a.street.toLowerCase().includes(lower),
    ).slice(0, 6)
  }

  try {
    await loadGoogleMaps()
    const autocomplete = new window.google!.maps.places.AutocompleteService()
    const predictions = await new Promise<
      Array<{ description: string; place_id: string }>
    >((resolve) => {
      autocomplete.getPlacePredictions(
        {
          input: q,
          componentRestrictions: { country: 'us' },
          types: ['address'],
        },
        (preds, status) => {
          if (status !== 'OK' || !preds) resolve([])
          else resolve(preds)
        },
      )
    })

    return predictions.slice(0, 6).map((p) => ({
      id: p.place_id,
      description: p.description,
      street: p.description,
      city: '',
      state: '',
      zip: '',
      lat: 0,
      lng: 0,
    }))
  } catch {
    return MOCK_ADDRESSES.filter((a) =>
      a.description.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 6)
  }
}

export async function resolveAddress(
  suggestion: AddressSuggestion,
): Promise<AddressSuggestion> {
  if (!hasGoogleMapsKey()) return suggestion
  if (suggestion.lat && suggestion.lng) return suggestion

  try {
    await loadGoogleMaps()
    const div = document.createElement('div')
    const service = new window.google!.maps.places.PlacesService(div)
    const place = await new Promise<{
      formatted_address?: string
      geometry?: { location?: { lat: () => number; lng: () => number } }
      address_components?: Array<{
        long_name: string
        short_name: string
        types: string[]
      }>
    } | null>((resolve) => {
      service.getDetails(
        {
          placeId: suggestion.id,
          fields: ['formatted_address', 'geometry', 'address_components'],
        },
        (result, status) => {
          if (status !== 'OK' || !result) resolve(null)
          else resolve(result)
        },
      )
    })

    if (!place?.geometry?.location) return suggestion

    const zip =
      place.address_components?.find((c) => c.types.includes('postal_code'))
        ?.long_name ?? ''
    const city =
      place.address_components?.find((c) => c.types.includes('locality'))
        ?.long_name ?? ''
    const state =
      place.address_components?.find((c) =>
        c.types.includes('administrative_area_level_1'),
      )?.short_name ?? ''

    return {
      id: suggestion.id,
      description: place.formatted_address ?? suggestion.description,
      street: place.formatted_address ?? suggestion.description,
      city,
      state,
      zip,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }
  } catch {
    return suggestion
  }
}
