import { useState, type FormEvent } from 'react'
import { createUser } from '../api'
import type { User } from '../types'
import './UserPanel.css'

interface UserPanelProps {
  users: User[]
  onCreated: () => Promise<void>
  onError: (message: string) => void
}

export function UserPanel({ users, onCreated, onError }: UserPanelProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await createUser({ name, email, password })
      setName('')
      setEmail('')
      setPassword('')
      await onCreated()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="panel" aria-labelledby="users-heading">
      <div className="panel-head">
        <h2 id="users-heading">Users</h2>
        <span className="badge">{users.length}</span>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={1}
            maxLength={255}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            minLength={3}
            maxLength={255}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            maxLength={128}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add user'}
        </button>
      </form>

      <ul className="item-list">
        {users.length === 0 ? (
          <li className="empty-state">No users yet. Add one above.</li>
        ) : (
          users.map((user) => (
            <li key={user.id}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
