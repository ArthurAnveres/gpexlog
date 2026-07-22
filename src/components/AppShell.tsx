import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { useApp } from '../context/AppContext'
import { PLANS } from '../data/mock'

const LINKS = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/products', label: 'Products' },
  { to: '/app/shipments', label: 'Shipments' },
  { to: '/app/maps', label: 'Maps' },
  { to: '/app/analytics', label: 'Analytics' },
  { to: '/app/proofs', label: 'Proofs' },
  { to: '/app/employees', label: 'Employees' },
  { to: '/app/billing', label: 'Billing' },
]

export function AppShell() {
  const { company, logout } = useApp()
  const navigate = useNavigate()
  const plan = PLANS.find((p) => p.id === company?.plan)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  function signOut() {
    closeMenu()
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div className="sidebar-top">
          <Logo to="/app" className="logo-on-dark" />
          <button
            type="button"
            className="nav-burger nav-burger-light mobile-only"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`sidebar-nav${menuOpen ? ' open' : ''}`}>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `side-link${isActive ? ' active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            className="side-link side-link-button mobile-only"
            onClick={signOut}
          >
            Sign out
          </button>
        </nav>

        <div className="side-foot">
          <strong>{company?.companyName ?? 'Demo company'}</strong>
          <span>{plan?.name ?? 'Pro'} plan</span>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            style={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.25)',
              marginTop: '0.4rem',
            }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-backdrop mobile-only"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}

      <div className="app-main">
        <div className="app-top">
          <div className="company-chip">
            <img
              src="/gpex-logo.jpg"
              alt=""
              className="logo-img logo-img-sm"
              width={28}
              height={28}
            />
            <span className="company-chip-text">
              {company?.companyName ?? 'Horizon Delivery Co.'}
            </span>
          </div>
          <div className="badge badge-info desktop-only">
            Web panel · prototype
          </div>
          <div className="badge badge-info mobile-only-inline">
            {plan?.name ?? 'Pro'}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
