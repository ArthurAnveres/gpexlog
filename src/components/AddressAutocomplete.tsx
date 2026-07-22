import { useEffect, useId, useRef, useState } from 'react'
import {
  hasGoogleMapsKey,
  resolveAddress,
  searchAddresses,
  type AddressSuggestion,
} from '../lib/googleMaps'

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (address: AddressSuggestion) => void
  label?: string
  placeholder?: string
  required?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  label = 'Delivery address',
  placeholder = 'Start typing a ZIP or street address…',
  required,
}: Props) {
  const listId = useId()
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const usingGoogle = hasGoogleMapsKey()

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    let cancelled = false
    const q = value.trim()
    if (q.length < 2) {
      setSuggestions([])
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      const results = await searchAddresses(q)
      if (!cancelled) {
        setSuggestions(results)
        setOpen(results.length > 0)
        setLoading(false)
      }
    }, 280)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [value])

  async function pick(item: AddressSuggestion) {
    setLoading(true)
    const resolved = await resolveAddress(item)
    onChange(resolved.description)
    onSelect(resolved)
    setSuggestions([])
    setOpen(false)
    setLoading(false)
  }

  return (
    <div className="field address-autocomplete" ref={wrapRef}>
      <label htmlFor={listId}>{label}</label>
      <input
        id={listId}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      <p className="address-hint">
        {usingGoogle
          ? 'Powered by Google Places autocomplete + geocoding.'
          : 'Demo mode: type a ZIP (e.g. 94105) for autocomplete. Add VITE_GOOGLE_MAPS_API_KEY for live Google Places.'}
        {loading ? ' Searching…' : ''}
      </p>
      {open && suggestions.length > 0 && (
        <ul className="address-suggestions" role="listbox">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => void pick(item)}>
                {item.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
