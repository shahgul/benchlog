import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { sampleItems } from '../sample'

export function EmptyBench() {
  const { addMany } = useStore()
  return (
    <div className="empty">
      <h1 className="page-title">Nothing on the bench yet.</h1>
      <p>Log your first device, cable or charger. Add the purchase date and warranty length and Benchlog tracks when it runs out.</p>
      <div className="actions left">
        <Link to="/items/new" className="btn primary">
          Add your first item
        </Link>
        <button className="btn ghost" onClick={() => addMany(sampleItems())}>
          Load seven examples
        </button>
      </div>
    </div>
  )
}
