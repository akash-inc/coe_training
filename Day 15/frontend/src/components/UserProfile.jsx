export default function UserProfile({ user, onLogout }) {
  return (
    <>
      <h1 style={{ fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
        Welcome, {user?.email}
      </h1>
      <button type="button" onClick={onLogout}>
        Logout
      </button>
    </>
  )
}