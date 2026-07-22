import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useApp } from '../context/AppContext'

export function LoginPage() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('ana@horizondelivery.com')
  const [password, setPassword] = useState('demo123')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    login(email)
    navigate('/app')
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <Logo />
        <h1>Sign in to the dashboard</h1>
        <p>Access your company web panel.</p>

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
        >
          Sign in
        </button>

        <p style={{ marginTop: '1.2rem', color: 'var(--muted)', fontSize: '0.92rem' }}>
          Haven&apos;t registered your company yet?{' '}
          <Link to="/signup">Create account</Link>
        </p>
        <p style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
          Prototype: any password works for the demo.
        </p>
      </form>
    </div>
  )
}
