import { Fragment, useEffect } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { DEPOT_COORDS } from '../data/mock'

// Fix default marker icons under Vite
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const SF_CENTER: [number, number] = [37.7749, -122.4194]

function FitBounds({
  points,
}: {
  points: Array<{ lat: number; lng: number }>
}) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds.pad(0.2))
  }, [map, points])
  return null
}

export function HeatmapMap({
  points,
}: {
  points: Array<{ lat: number; lng: number; weight: number }>
}) {
  return (
    <MapContainer center={SF_CENTER} zoom={13} className="map-canvas" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {points.map((p, i) => (
        <CircleMarker
          key={`${p.lat}-${p.lng}-${i}`}
          center={[p.lat, p.lng]}
          radius={14 + p.weight * 22}
          pathOptions={{
            color: 'transparent',
            fillColor:
              p.weight > 0.75 ? '#ef4444' : p.weight > 0.5 ? '#f59e0b' : '#1ec8a5',
            fillOpacity: 0.28 + p.weight * 0.35,
          }}
        >
          <Popup>
            Delivery density: {(p.weight * 100).toFixed(0)}%
          </Popup>
        </CircleMarker>
      ))}
      <Marker position={[DEPOT_COORDS.lat, DEPOT_COORDS.lng]}>
        <Popup>Warehouse depot</Popup>
      </Marker>
    </MapContainer>
  )
}

export function RoutesMap({
  routes,
}: {
  routes: Array<{
    driver: string
    color: string
    path: Array<{ lat: number; lng: number; label: string }>
  }>
}) {
  const allPoints = routes.flatMap((r) => r.path)

  return (
    <MapContainer center={SF_CENTER} zoom={13} className="map-canvas" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={allPoints.length ? allPoints : [DEPOT_COORDS]} />
      <Marker position={[DEPOT_COORDS.lat, DEPOT_COORDS.lng]}>
        <Popup>Warehouse depot (start)</Popup>
      </Marker>
      {routes.map((route) => (
        <Fragment key={route.driver}>
          {route.path.length >= 1 && (
            <Polyline
              positions={[
                [DEPOT_COORDS.lat, DEPOT_COORDS.lng],
                ...route.path.map((p) => [p.lat, p.lng] as [number, number]),
              ]}
              pathOptions={{ color: route.color, weight: 4, opacity: 0.85 }}
            />
          )}
          {route.path.map((stop) => (
            <CircleMarker
              key={`${route.driver}-${stop.label}`}
              center={[stop.lat, stop.lng]}
              radius={9}
              pathOptions={{
                color: route.color,
                fillColor: route.color,
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <strong>{route.driver}</strong>
                <br />
                {stop.label}
              </Popup>
            </CircleMarker>
          ))}
        </Fragment>
      ))}
    </MapContainer>
  )
}

export function MonitoringMap({
  markers,
}: {
  markers: Array<{
    id: string
    lat: number
    lng: number
    label: string
    status: string
    color: string
  }>
}) {
  return (
    <MapContainer center={SF_CENTER} zoom={13} className="map-canvas" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds
        points={
          markers.length
            ? markers
            : [DEPOT_COORDS]
        }
      />
      <Marker position={[DEPOT_COORDS.lat, DEPOT_COORDS.lng]}>
        <Popup>Warehouse depot</Popup>
      </Marker>
      {markers.map((m) => (
        <CircleMarker
          key={m.id}
          center={[m.lat, m.lng]}
          radius={11}
          pathOptions={{
            color: '#0e2433',
            fillColor: m.color,
            fillOpacity: 0.95,
            weight: 2,
          }}
        >
          <Popup>
            <strong>{m.label}</strong>
            <br />
            {m.status}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
