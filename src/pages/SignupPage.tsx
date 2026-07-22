import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useApp } from '../context/AppContext'
import { PLANS, type PlanId } from '../data/mock'

const STEPS = ['Company', 'Plan', 'Admin']

function isPlanId(value: string | null): value is PlanId {
  return value === 'free' || value === 'pro' || value === 'pro_max'
}

export function SignupPage() {
  const { registerCompany } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const planParam = params.get('plan')
  const initialPlan: PlanId = isPlanId(planParam) ? planParam : 'pro'

  const [step, setStep] = useState(0)
  const [companyName, setCompanyName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [plan, setPlan] = useState<PlanId>(initialPlan)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === plan)!,
    [plan],
  )

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (step < STEPS.length - 1) {
      next()
      return
    }
    registerCompany({
      companyName,
      taxId,
      adminName,
      adminEmail,
      plan,
    })
    navigate('/app')
  }

  return (
    <div className="auth-shell">
      <form className="auth-card wide" onSubmit={onSubmit}>
        <Logo />
        <h1>Create your company account</h1>
        <p>Register your operation and choose a subscription plan.</p>

        <div className="steps" aria-label="Signup progress">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`step-pill${i === step ? ' active' : ''}`}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="form-grid two">
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Horizon Delivery Co."
              />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="taxId">EIN / Tax ID</label>
              <input
                id="taxId"
                required
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="12-3456789"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="plan-picker">
            {PLANS.map((p) => (
              <button
                type="button"
                key={p.id}
                className={`plan-option${plan === p.id ? ' selected' : ''}`}
                onClick={() => setPlan(p.id)}
              >
                <strong>
                  {p.name} — {p.priceLabel}/mo
                </strong>
                <span>
                  {p.employees === 'Unlimited'
                    ? 'Unlimited team members'
                    : `Up to ${p.employees} team members`}
                  {' · '}
                  {p.deliveries === 'Unlimited'
                    ? 'unlimited deliveries'
                    : `${p.deliveries} deliveries / month`}
                </span>
              </button>
            ))}
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Selected: <strong>{selectedPlan.name}</strong>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid two">
            <div className="field">
              <label htmlFor="adminName">Your name</label>
              <input
                id="adminName"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Account owner"
              />
            </div>
            <div className="field">
              <label htmlFor="adminEmail">Admin email</label>
              <input
                id="adminEmail"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginTop: '1.4rem',
          }}
        >
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={back}>
              Back
            </button>
          ) : (
            <Link to="/" className="btn btn-ghost">
              Cancel
            </Link>
          )}
          <button type="submit" className="btn btn-primary">
            {step === STEPS.length - 1 ? 'Create company' : 'Continue'}
          </button>
        </div>

        <p style={{ marginTop: '1.2rem', color: 'var(--muted)', fontSize: '0.92rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
