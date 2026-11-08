import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { CATEGORY_COLOR, type Item } from '../types'
import { usePageTitle } from '../hooks'
import { EmptyBench } from '../components/EmptyBench'

const UNFILED = 'Not filed yet'

export default function Places() {
  usePageTitle('Places')
  const { data, ready } = useStore()

  const drawers = useMemo(() => {
    const map = new Map<string, { name: string; items: Item[] }>()
    for (const i of data.items) {
      const raw = i.location.trim()
      const key = raw ? raw.toLowerCase() : UNFILED
      const entry = map.get(key) ?? { name: raw || UNFILED, items: [] }
      entry.items.push(i)
      map.set(key, entry)
    }
    return [...map.values()].sort((a, b) => (a.name === UNFILED ? 1 : b.name === UNFILED ? -1 : b.items.length - a.items.length || a.name.localeCompare(b.name)))
  }, [data.items])

  if (!ready) return null
  if (data.items.length === 0) return <EmptyBench />

  return (
    <>
      <h1 className="page-title">Places</h1>
      <p className="lede">Where everything lives, so you stop turning the house over for one HDMI cable.</p>
      <div className="drawers">
        {drawers.map((d) => (
          <section key={d.name} className="drawer" aria-label={d.name}>
            <header className="drawer-head">
              <span className="holder">
                <span className="tape">{d.name}</span>
              </span>
              <span className="muted">
                {d.items.length} {d.items.length === 1 ? 'item' : 'items'}
              </span>
            </header>
            <ul>
              {d.items.map((i) => (
                <li key={i.id}>
                  <Link to={`/items/${i.id}`}>
                    <i style={{ background: CATEGORY_COLOR[i.category] }} aria-hidden="true" />
                    <span>
                      {i.name}
                      {i.quantity > 1 && <span className="qty">×{i.quantity}</span>}
                    </span>
                    <small>{i.category}</small>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="handle" aria-hidden="true" />
          </section>
        ))}
      </div>
    </>
  )
}
