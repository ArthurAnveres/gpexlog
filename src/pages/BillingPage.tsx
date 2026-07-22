import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PLANS, type PlanId } from '../data/mock'

export function BillingPage() {
  const { company, setPlan, employees, shipments } = useApp()
  const current = company?.plan ?? 'pro'
  const plan = PLANS.find((p) => p.id === current)!

  const employeeCount = employees.filter((e) => e.status !== 'inactive').length
  const deliveryCount = shipments.length

  function changePlan(id: PlanId) {
    setPlan(id)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Billing</h1>
          <p>
            Manage your company subscription. Employee and delivery limits
            follow the selected plan. Prices in USD.
          </p>
        </div>
      </div>

      <section className="panel panel-pad" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
          Current plan: {plan.name}
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          {plan.priceLabel}/mo · {employeeCount} active employees ·{' '}
          {deliveryCount} shipments this cycle (demo)
        </p>
        <div className="metric-grid" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <div className="metric">
            <span>Employees</span>
            <strong>
              {employeeCount}
              {plan.employees === 'Unlimited' ? '' : `/${plan.employees}`}
            </strong>
          </div>
          <div className="metric">
            <span>Deliveries / mo</span>
            <strong>
              {deliveryCount}
              {plan.deliveries === 'Unlimited' ? '' : `/${plan.deliveries}`}
            </strong>
          </div>
          <div className="metric">
            <span>Company</span>
            <strong style={{ fontSize: '1.1rem' }}>
              {company?.companyName ?? '—'}
            </strong>
          </div>
          <div className="metric">
            <span>EIN / Tax ID</span>
            <strong style={{ fontSize: '1.1rem' }}>
              {company?.taxId ?? '—'}
            </strong>
          </div>
        </div>
      </section>

      <div className="pricing-grid">
        {PLANS.map((p) => (
          <article
            key={p.id}
            className={`plan${p.id === current ? ' featured' : ''}`}
          >
            <div>
              <h3>{p.name}</h3>
              <p style={{ marginTop: '0.4rem' }}>{p.description}</p>
            </div>
            <div className="plan-price">
              {p.priceLabel}
              <small>/mo</small>
            </div>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {p.id === current ? (
              <button type="button" className="btn btn-accent" disabled>
                Current plan
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => changePlan(p.id)}
              >
                Switch to {p.name}
              </button>
            )}
          </article>
        ))}
      </div>

      <p style={{ marginTop: '1.2rem', color: 'var(--muted)' }}>
        Need to add your team? Go to{' '}
        <Link to="/app/employees">Employees</Link>.
      </p>
    </div>
  )
}
