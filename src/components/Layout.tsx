import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NAV = [
  { to: '/', label: 'Overview', end: true },
  { to: '/items', label: 'Items' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/places', label: 'Places' },
  { to: '/backup', label: 'Backup' },
]

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="rail">
        <Link to="/" className="wordmark" aria-label="Benchlog, home">
          Bench
          <br />
          log
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/items/new" className="btn primary add">
          Add item
        </Link>
        <p className="rail-note">Everything stays in this browser until you export it.</p>
      </aside>
      <main id="main" className="page">
        <Outlet />
      </main>
    </div>
  )
}
