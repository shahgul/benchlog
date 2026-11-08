import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { CATEGORIES, CATEGORY_COLOR } from '../types'
import { warrantyOf } from '../warranty'
import { money, shortMoney } from '../format'
import { usePageTitle } from '../hooks'
import { CableRow } from '../components/CableRow'
import { GaugeHero } from '../components/Gauge'
import { EmptyBench } from '../components/EmptyBench'

export default function Overview() {
  usePageTitle('')
  const { data, ready } = useStore()
  const items = data.items

  const calc = useMemo(() => {
    const ws = items.map((item) => ({ item, w: warrantyOf(item) }))
    const live = ws.filter((x) => x.w.status === 'active' || x.w.status === 'soon').sort((a, b) => a.w.daysLeft - b.w.daysLeft)
    const ended = ws.filter((x) => x.w.status === 'expired').sort((a, b) => b.w.daysLeft - a.w.daysLeft)
    const units = items.reduce((n, i) => n + i.quantity, 0)
    const worth = items.reduce((n, i) => n + (i.price ?? 0) * i.quantity, 0)

    const byCat = CATEGORIES.map((c) => ({ c, n: items.filter((i) => i.category === c).reduce((n, i) => n + i.quantity, 0) }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)

    const years = new Map<string, number>()
    for (const i of items) {
      if (i.price == null || !i.purchaseDate) continue
      const y = i.purchaseDate.slice(0, 4)
      years.set(y, (years.get(y) ?? 0) + i.price * i.quantity)
    }
    const spend = [...years.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    return { live, ended, units, worth, byCat, spend }
  }, [items])

  if (!ready) return null
  if (items.length === 0) return <EmptyBench />

  const hero = calc.live[0]
  const rest = calc.live.slice(1, 6)
  const maxCat = Math.max(...calc.byCat.map((x) => x.n))
  const maxSpend = Math.max(1, ...calc.spend.map((x) => x[1]))

  let big = ''
  let unit = ''
  if (hero) {
    const d = hero.w.daysLeft
    if (d < 120) {
      big = String(d)
      unit = d === 1 ? 'day' : 'days'
    } else {
      big = String(Math.round(d / 30.4))
      unit = 'months'
    }
  }

  return (
    <>
      <p className="lede">
        {calc.units} {calc.units === 1 ? 'thing' : 'things'} on the bench, worth {money(calc.worth)}.{' '}
        {calc.live.length} under warranty, {calc.ended.length} unplugged.
      </p>

      {hero ? (
        <section className="hero" data-status={hero.w.status} aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            <Link to={`/items/${hero.item.id}`}>{hero.item.name}</Link>
          </h1>
          <p className="hero-line">
            runs out of warranty in{' '}
            <span className="hero-unit">
              <b className="hero-num">{big}</b> {unit}
            </span>
          </p>
          <GaugeHero item={hero.item} />
        </section>
      ) : (
        <section className="hero" data-status="expired">
          <h1 className="hero-title">Nothing is under warranty.</h1>
          <p className="hero-line">Every warranty on the bench has ended or was never recorded.</p>
        </section>
      )}

      {rest.length > 0 && (
        <section className="block" aria-labelledby="running">
          <div className="block-head">
            <h2 id="running">Running out next</h2>
            <Link to="/items">All items</Link>
          </div>
          <ul className="rows">
            {rest.map((x, n) => (
              <CableRow key={x.item.id} item={x.item} index={n} />
            ))}
          </ul>
        </section>
      )}

      {calc.ended.length > 0 && (
        <section className="block" aria-labelledby="unplugged">
          <div className="block-head">
            <h2 id="unplugged">Unplugged</h2>
            <Link to="/items?status=expired">See all ended</Link>
          </div>
          <ul className="rows">
            {calc.ended.slice(0, 4).map((x, n) => (
              <CableRow key={x.item.id} item={x.item} index={n} />
            ))}
          </ul>
        </section>
      )}

      <div className="duo">
        <section className="block" aria-labelledby="owned">
          <div className="block-head">
            <h2 id="owned">What you own</h2>
          </div>
          <ul className="bars">
            {calc.byCat.map(({ c, n }) => (
              <li key={c}>
                <span className="bar-label">{c}</span>
                <span className="bar-track">
                  <span className="bar" style={{ width: `${(n / maxCat) * 100}%`, ['--wire' as string]: CATEGORY_COLOR[c] }} />
                </span>
                <span className="bar-value">{n}</span>
              </li>
            ))}
          </ul>
        </section>

        {calc.spend.length > 0 && (
          <section className="block" aria-labelledby="spent">
            <div className="block-head">
              <h2 id="spent">What you spent</h2>
            </div>
            <ul className="bars">
              {calc.spend.map(([y, v]) => (
                <li key={y}>
                  <span className="bar-label">{y}</span>
                  <span className="bar-track">
                    <span className="bar" style={{ width: `${(v / maxSpend) * 100}%`, ['--wire' as string]: 'var(--blue)' }} />
                  </span>
                  <span className="bar-value">{shortMoney(v)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
