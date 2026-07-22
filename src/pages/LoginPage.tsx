import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useApp } from '../context/AppContext'
import { ApiError } from '../lib/api'

export function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@gpexlog.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Unable to sign in. Check the API connection.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={(e) => void onSubmit(e)}>
        <Logo />
        <h1>Sign in to the dashboard</h1>
        <p>Access your company web panel.</p>

        {error && (
          <div
            className="panel panel-pad"
            style={{
              marginBottom: '1rem',
              borderColor: 'rgba(220,38,38,0.4)',
              color: '#b91c1c',
            }}
          >
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1.25rem' }}
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={{ marginTop: '1.2rem', color: 'var(--muted)', fontSize: '0.92rem' }}>
          Demo admin: <code>admin@gpexlog.com</code> / <code>password123</code>
        </p>
        <p style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
          Haven&apos;t registered your company yet?{' '}
          <Link to="/signup">Create account</Link>
        </p>
      </form>
    </div>
  )
}
