import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { PLANS } from '../data/mock'

export function LandingPage() {
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

  return (
    <div>
      <header className="container public-nav">
        <Logo />
        <nav className="public-nav-desktop">
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Sign in</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">
            Create account
          </Link>
        </nav>
        <button
          type="button"
          className="nav-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <a href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a href="#pricing" onClick={closeMenu}>
            Pricing
          </a>
          <Link to="/login" onClick={closeMenu}>
            Sign in
          </Link>
          <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>
            Create account
          </Link>
        </div>
      )}

      <main>
        <section className="container hero">
          <div className="hero-bg" aria-hidden />
          <div className="hero-content">
            <div className="hero-brand">
              <img
                src={`${import.meta.env.BASE_URL}gpex-logo.jpg`}
                alt="GpexLog"
                className="hero-logo"
                width={96}
                height={96}
              />
              <span>
                GpexLog<span className="hero-dot">.</span>
              </span>
            </div>
            <h1>Delivery proof with photo, GPS, and exact timestamps.</h1>
            <p>
              Drivers capture the package on mobile. Your ops team tracks
              everything on the web dashboard — with subscription plans built
              for U.S. delivery businesses.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-accent">
                Start free
              </Link>
              <a
                href="#pricing"
                className="btn btn-ghost"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}
              >
                View pricing
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section container">
          <div className="section-title">
            <h2>From catalog to proof of delivery</h2>
            <p>
              Manage products and shipments on the web. Drivers capture photo
              proof on mobile. Google Maps powers precise addresses and ETA.
            </p>
          </div>
          <div className="feature-list">
            <article className="feature-item">
              <h3>1. Register your company</h3>
              <p>
                Create your account, pick a plan, and invite team members as
                admin, operator, or driver.
              </p>
            </article>
            <article className="feature-item">
              <h3>2. Products, then shipments</h3>
              <p>
                Add catalog items (price, weight, SKU). Create deliveries by
                selecting a product, a driver, and an address with ZIP
                autocomplete.
              </p>
            </article>
            <article className="feature-item">
              <h3>3. Track ETA and prove drop-off</h3>
              <p>
                Drivers scan QR/barcode + take a pickup photo at the warehouse,
                then a delivery photo at the address. Heatmaps, routes, and
                delivery-time analytics keep ops in control.
              </p>
            </article>
          </div>
        </section>

        <section id="pricing" className="section container">
          <div className="section-title">
            <h2>Subscription pricing</h2>
            <p>
              Start on Free and upgrade to Pro or Pro Max as your volume grows.
              All prices in USD.
            </p>
          </div>
          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`plan${plan.highlight ? ' featured' : ''}`}
              >
                <div>
                  <h3>{plan.name}</h3>
                  <p style={{ marginTop: '0.4rem' }}>{plan.description}</p>
                </div>
                <div className="plan-price">
                  {plan.priceLabel}
                  <small>/mo</small>
                </div>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link
                  to={`/signup?plan=${plan.id}`}
                  className={`btn ${plan.highlight ? 'btn-accent' : 'btn-primary'}`}
                >
                  Choose {plan.name}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="container footer-public">
        <Logo to={null} />
        <span>Web prototype — photo proof of delivery for logistics teams.</span>
      </footer>
    </div>
  )
}
