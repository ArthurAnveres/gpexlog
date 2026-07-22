import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PLANS, ROLE_LABEL, type EmployeeRole } from '../data/mock'

export function EmployeesPage() {
  const { employees, company, addEmployee, updateEmployeeStatus } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<EmployeeRole>('driver')

  const plan = PLANS.find((p) => p.id === company?.plan) ?? PLANS[1]
  const limit = plan.employees
  const used = employees.filter((e) => e.status !== 'inactive').length
  const atLimit = typeof limit === 'number' && used >= limit

  const usageLabel = useMemo(() => {
    if (limit === 'Unlimited') return `${used} team members`
    return `${used} of ${limit} on the ${plan.name} plan`
  }, [limit, used, plan.name])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (atLimit) return
    addEmployee({
      name,
      email,
      phone: phone || undefined,
      role,
      status: 'invite_pending',
    })
    setName('')
    setEmail('')
    setPhone('')
    setRole('driver')
    setOpen(false)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Employees</h1>
          <p>
            Invite the team that will use the web panel and mobile app.{' '}
            {usageLabel}.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setOpen(true)}
          disabled={atLimit}
          title={atLimit ? 'Plan limit reached' : undefined}
        >
          Invite employee
        </button>
      </div>

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
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone ?? '—'}</td>
                  <td>{ROLE_LABEL[employee.role]}</td>
                  <td>
                    <StatusBadge status={employee.status} />
                  </td>
                  <td>
                    {employee.status === 'invite_pending' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-soft"
                        onClick={() =>
                          updateEmployeeStatus(employee.id, 'active')
                        }
                      >
                        Activate
                      </button>
                    )}
                    {employee.status === 'active' && employee.role !== 'admin' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() =>
                          updateEmployeeStatus(employee.id, 'inactive')
                        }
                      >
                        Deactivate
                      </button>
                    )}
                    {employee.status === 'inactive' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-soft"
                        onClick={() =>
                          updateEmployeeStatus(employee.id, 'active')
                        }
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
          >
            <div className="modal-body">
              <h2 style={{ fontSize: '1.35rem' }}>Invite employee</h2>
              <p style={{ color: 'var(--muted)' }}>
                An invite will be sent by email (simulated in this prototype).
              </p>
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
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as EmployeeRole)}
                  >
                    <option value="driver">Driver</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send invite
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
  return <span className="badge badge-danger">Inactive</span>
}
