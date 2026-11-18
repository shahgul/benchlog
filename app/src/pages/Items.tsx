import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import { CATEGORIES, type Category, type Item } from '../types'
import { warrantyOf, type Status } from '../warranty'
import { usePageTitle } from '../hooks'
import { CableRow } from '../components/CableRow'
import { EmptyBench } from '../components/EmptyBench'

type Sort = 'ending' | 'newest' | 'name' | 'price'
const statusRank: Record<Status, number> = { soon: 0, active: 1, none: 2, expired: 3 }

export default function Items() {
  usePageTitle('Items')
  const { data, ready } = useStore()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const cat = (params.get('cat') ?? 'All') as Category | 'All'
  const status = (params.get('status') ?? 'any') as Status | 'any'
  const sort = (params.get('sort') ?? 'ending') as Sort

  const set = (k: string, v: string, empty: string) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        if (v === empty) n.delete(k)
        else n.set(k, v)
        return n
      },
      { replace: true },
    )

  const items = data.items
  const present = useMemo(() => CATEGORIES.filter((c) => items.some((i) => i.category === c)), [items])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = items.filter((i) => {
      if (cat !== 'All' && i.category !== cat) return false
      if (status !== 'any' && warrantyOf(i).status !== status) return false
      if (!needle) return true
      return [i.name, i.brand, i.model, i.serial, i.store, i.location, i.notes].join(' ').toLowerCase().includes(needle)
    })
    const by: Record<Sort, (a: Item, b: Item) => number> = {
      ending: (a, b) => {
        const wa = warrantyOf(a)
        const wb = warrantyOf(b)
        return statusRank[wa.status] - statusRank[wb.status] || wa.daysLeft - wb.daysLeft
      },
      newest: (a, b) => b.createdAt - a.createdAt,
      name: (a, b) => a.name.localeCompare(b.name),
      price: (a, b) => (b.price ?? 0) - (a.price ?? 0),
    }
    return [...list].sort(by[sort])
  }, [items, q, cat, status, sort])

  if (!ready) return null
  if (items.length === 0) return <EmptyBench />

  return (
    <>
      <h1 className="page-title">Items</h1>
      <p className="lede">
        {shown.length === items.length ? `All ${items.length} items.` : `${shown.length} of ${items.length} items.`}
      </p>

      <section className="tools" aria-label="Find and filter">
        <input className="search" type="search" placeholder="Search name, serial, store, location" value={q} onChange={(e) => set('q', e.target.value, '')} aria-label="Search items" />
        <select value={status} onChange={(e) => set('status', e.target.value, 'any')} aria-label="Warranty status">
          <option value="any">Any warranty</option>
          <option value="active">Active</option>
          <option value="soon">Ending within 30 days</option>
          <option value="expired">Ended</option>
          <option value="none">No warranty</option>
        </select>
        <select value={sort} onChange={(e) => set('sort', e.target.value, 'ending')} aria-label="Sort by">
          <option value="ending">Ending soonest</option>
          <option value="newest">Recently added</option>
          <option value="name">Name</option>
          <option value="price">Price, high to low</option>
        </select>
        <div className="chips" role="group" aria-label="Category">
          {(['All', ...present] as const).map((c) => (
            <button key={c} className="chip" aria-pressed={cat === c} onClick={() => set('cat', c, 'All')}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {shown.length === 0 ? (
        <p className="none-found">
          Nothing matches those filters. <Link to="/items">Clear filters</Link>
        </p>
      ) : (
        <>
          <div className="legend" aria-hidden="true">
            <span className="legend-track">
              <span>Bought</span>
              <span>Warranty ends</span>
            </span>
          </div>
          <ul className="rows">
            {shown.map((i, n) => (
              <CableRow key={i.id} item={i} index={n} />
            ))}
          </ul>
        </>
      )}
    </>
  )
}
