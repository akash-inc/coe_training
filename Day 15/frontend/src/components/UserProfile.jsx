import './UserProfile.css'

function getInitials(email) {
  return (email?.[0] ?? '?').toUpperCase()
}

export default function UserProfile({ user, onLogout }) {
  return (
    <header className="user-bar">
      <div className="user-info">
        <span className="user-avatar" aria-hidden="true">
          {getInitials(user?.email)}
        </span>
        <div>
          <p className="user-greeting">Signed in as</p>
          <p className="user-email">{user?.email}</p>
        </div>
      </div>
      <button type="button" className="btn btn-ghost" onClick={onLogout}>
        Log out
      </button>
    </header>
  )
}
