import { deleteUser } from '../api'
import { formatRole, hasPermission, isAdmin } from '../permissions'
import type { User } from '../types'
import './UserPanel.css'

interface UserPanelProps {
  currentUser: User
  users: User[]
  selectedUserId: number
  onSelectUser: (user: User) => void
  onChanged: () => Promise<void>
  onError: (message: string) => void
  onSuccess: (message: string) => void
}

export function UserPanel({
  currentUser,
  users,
  selectedUserId,
  onSelectUser,
  onChanged,
  onError,
  onSuccess,
}: UserPanelProps) {
  const canDeleteUsers = hasPermission(currentUser.role, 'users:delete')
  const canSelectUsers = isAdmin(currentUser.role)

  async function handleDelete(user: User, event: React.MouseEvent) {
    event.stopPropagation()
    if (user.id === currentUser.id) return
    if (!confirm(`Delete ${user.name}? This removes their tasks and sessions.`)) return

    try {
      await deleteUser(user.id)
      onSuccess(`${user.name} deleted`)
      await onChanged()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  return (
    <section className="panel" aria-labelledby="users-heading">
      <div className="panel-head">
        <h2 id="users-heading">Users</h2>
        <span className="badge">{users.length}</span>
      </div>

      <p className="user-panel-hint">
        {canSelectUsers
          ? 'Select a user to view and manage their tasks.'
          : canDeleteUsers
            ? 'Admins can remove other accounts.'
            : 'Team directory (read-only).'}
      </p>

      <ul className="item-list">
        {users.length === 0 ? (
          <li className="empty-state">No users found.</li>
        ) : (
          users.map((user) => {
            const isSelected = canSelectUsers && user.id === selectedUserId
            const rowClass = `user-row${isSelected ? ' user-row-selected' : ''}${canSelectUsers ? ' user-row-clickable' : ''}`

            const content = (
              <>
                <div className="user-row-main">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <span className={`role-chip role-${user.role}`}>{formatRole(user.role)}</span>
                </div>
                {canDeleteUsers && user.id !== currentUser.id && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={(event) => handleDelete(user, event)}
                  >
                    Delete
                  </button>
                )}
              </>
            )

            return (
              <li key={user.id} className={rowClass}>
                {canSelectUsers ? (
                  <button
                    type="button"
                    className="user-row-button"
                    aria-pressed={isSelected}
                    onClick={() => onSelectUser(user)}
                  >
                    {content}
                  </button>
                ) : (
                  content
                )}
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
