import type { ReactNode } from 'react'

interface SiteHeaderProps {
  tagline?: ReactNode
  nav?: ReactNode
}

export function SiteHeader({ tagline, nav }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <h1>Task Manager</h1>
        {tagline}
      </div>
      {nav}
    </header>
  )
}
