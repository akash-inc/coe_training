import { useState } from 'react'

export default function LoginForm({ onSubmit }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" onClick={() => onSubmit({ email, password })}>Login</button>
      </form>
    )
  }