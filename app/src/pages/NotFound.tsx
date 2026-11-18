import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks'

export default function NotFound() {
  usePageTitle('Not found')
  return (
    <div className="empty">
      <h1 className="page-title">Nothing plugged in here.</h1>
      <p>This page doesn’t exist. Check the address, or head back to the overview.</p>
      <Link to="/" className="btn primary">
        Go to overview
      </Link>
    </div>
  )
}
