import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PLANS, ROLE_LABEL } from '../data/mock'
import { ApiError } from '../lib/api'

export function EmployeesPage() {
  const {
    employees,
    company,
    addEmployee,
    updateEmployeeStatus,
    loading,
    apiError,
    refreshData,
  } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('password123')
  const [vehicle, setVehicle] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const plan = PLANS.find((p) => p.id === company?.plan) ?? PLANS[1]
  const limit = plan.employees
  const used = employees.filter((e) => e.status !== 'inactive').length
  const atLimit = typeof limit === 'number' && used >= limit

  const usageLabel = useMemo(() => {
    if (limit === 'Unlimited') return `${used} drivers`
    return `${used} of ${limit} on the ${plan.name} plan`
  }, [limit, used, plan.name])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (atLimit) return
    setFormError(null)
    setSaving(true)
    try {
      await addEmployee({
        name,
        email,
        phone,
        password,
        vehicle: vehicle || undefined,
      })
      setName('')
      setEmail('')
      setPhone('')
      setPassword('password123')
      setVehicle('')
      setOpen(false)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create driver')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Drivers</h1>
          <p>
            Manage mobile app drivers synced with the GpexLog API. {usageLabel}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-soft" onClick={() => void refreshData()}>
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpen(true)}
            disabled={atLimit}
            title={atLimit ? 'Plan limit reached' : undefined}
          >
            Add driver
          </button>
        </div>
      </div>

      {(apiError || loading) && (
        <div className="panel panel-pad" style={{ marginBottom: '1rem' }}>
          {loading ? 'Loading drivers from API…' : apiError}
        </div>
      )}

      {atLimit && (
        <div
          className="panel panel-pad"
          style={{ marginBottom: '1rem', borderColor: 'rgba(217,119,6,0.45)' }}
        >
          <strong>{plan.name}</strong> plan limit reached. Upgrade in{' '}
          <Link to="/app/billing">Billing</Link> to add more people.
        </div>
      )}

      <section className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="empty">
                    No drivers yet. Add one to use the mobile app.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone ?? '—'}</td>
                    <td>{ROLE_LABEL[employee.role]}</td>
                    <td>
                      <StatusBadge status={employee.status} />
                    </td>
                    <td>
                      {employee.status === 'active' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() =>
                            void updateEmployeeStatus(employee.id, 'inactive')
                          }
                        >
                          Block
                        </button>
                      )}
                      {employee.status === 'inactive' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-soft"
                          onClick={() =>
                            void updateEmployeeStatus(employee.id, 'active')
                          }
                        >
                          Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => void onSubmit(e)}
          >
            <div className="modal-body">
              <h2 style={{ fontSize: '1.35rem' }}>Add driver</h2>
              <p style={{ color: 'var(--muted)' }}>
                Creates a driver account for the mobile app (Sanctum login).
              </p>
              {formError && (
                <div style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>{formError}</div>
              )}
              <div className="form-grid two" style={{ marginTop: '0.5rem' }}>
                <div className="field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="vehicle">Vehicle</label>
                  <input
                    id="vehicle"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder="Ford Transit"
                  />
                </div>
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
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="password">App password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Create driver'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: 'active' | 'invite_pending' | 'inactive'
}) {
  if (status === 'active') return <span className="badge badge-ok">Active</span>
  if (status === 'invite_pending')
    return <span className="badge badge-warn">Invite pending</span>
  return <span className="badge badge-danger">Blocked</span>
}
