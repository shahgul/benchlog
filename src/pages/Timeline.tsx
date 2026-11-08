import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { CATEGORY_COLOR } from '../types'
import { parseDate, warrantyOf } from '../warranty'
import { day } from '../format'
import { usePageTitle } from '../hooks'
import { EmptyBench } from '../components/EmptyBench'

const DAY = 86_400_000
const PX = 2.4 // pixels per day
const NAME_W = 210

export default function Timeline() {
  usePageTitle('Timeline')
  const { data, ready } = useStore()
  const scroller = useRef<HTMLDivElement>(null)

  const model = useMemo(() => {
    const rows = data.items
      .map((item) => ({ item, w: warrantyOf(item) }))
      .filter((r) => r.w.end)
      .sort((a, b) => a.w.end!.getTime() - b.w.end!.getTime())
    if (rows.length === 0) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const min = Math.min(today.getTime(), ...rows.map((r) => parseDate(r.item.purchaseDate).getTime()))
    const max = Math.max(today.getTime(), ...rows.map((r) => r.w.end!.getTime()))
    const start = new Date(min)
    start.setDate(1)
    const end = new Date(max)
    end.setMonth(end.getMonth() + 2, 1)
    const x = (t: number) => ((t - start.getTime()) / DAY) * PX
    const months: { left: number; label: string; year: boolean }[] = []
    for (const m = new Date(start); m < end; m.setMonth(m.getMonth() + 1)) {
      months.push({
        left: x(m.getTime()),
        label: m.toLocaleDateString('en-IN', { month: 'short' }) + (m.getMonth() === 0 || months.length === 0 ? ` ’${String(m.getFullYear()).slice(2)}` : ''),
        year: m.getMonth() === 0,
      })
    }
    return { rows, width: x(end.getTime()), months, x, todayX: x(today.getTime()), today: today.getTime() }
  }, [data.items])

  useEffect(() => {
    if (model && scroller.current) scroller.current.scrollLeft = Math.max(0, model.todayX - 120)
  }, [model])

  if (!ready) return null
  if (data.items.length === 0) return <EmptyBench />

  const skipped = data.items.length - (model?.rows.length ?? 0)

  return (
    <>
      <h1 className="page-title">Timeline</h1>
      <p className="lede">Every warranty on one line. The yellow line is today.</p>

      {!model ? (
        <p className="none-found">
          None of your items has a warranty recorded. <Link to="/items">Open the list</Link> and add a purchase date and warranty length.
        </p>
      ) : (
        <div className="tl" ref={scroller} tabIndex={0} role="region" aria-label="Warranty timeline, scrolls sideways">
          <div className="tl-inner" style={{ width: NAME_W + model.width }}>
            <div className="tl-head">
              <div className="tl-name" />
              <div className="tl-canvas" style={{ width: model.width }}>
                {model.months.map((m, i) => (
                  <span key={i} className={`tl-month${m.year ? ' year' : ''}`} style={{ left: m.left }}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="tl-body">
              <div className="tl-grid" style={{ left: NAME_W, width: model.width }} aria-hidden="true">
                {model.months.map((m, i) => (
                  <span key={i} className={`tl-line${m.year ? ' year' : ''}`} style={{ left: m.left }} />
                ))}
                <span className="tl-today" style={{ left: model.todayX }} />
              </div>

              {model.rows.map(({ item, w }) => {
                const s = model.x(parseDate(item.purchaseDate).getTime())
                const e = model.x(w.end!.getTime())
                const t = Math.min(Math.max(model.todayX, s), e)
                const expired = w.status === 'expired'
                return (
                  <div key={item.id} className="tl-row" data-status={w.status}>
                    <Link to={`/items/${item.id}`} className="tl-name" title={item.name}>
                      <i style={{ background: CATEGORY_COLOR[item.category] }} aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                    <div className="tl-canvas" style={{ width: model.width }}>
                      <span className="tl-trace" style={{ left: s, width: Math.max(0, t - s) }} />
                      {!expired && <span className="tl-cable" style={{ left: t, width: Math.max(2, e - t) }} />}
                      {!expired && <span className="tl-plug" style={{ left: t }} />}
                      <span className="tl-socket" style={{ left: e }} />
                      {expired && <span className="tl-plug loose" style={{ left: e + 26 }} />}
                      <span className="tl-date" style={{ left: e + (expired ? 52 : 18) }}>
                        {day(w.end)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      {skipped > 0 && <p className="muted">{skipped} {skipped === 1 ? 'item has' : 'items have'} no warranty and {skipped === 1 ? 'isn’t' : 'aren’t'} shown.</p>}
    </>
  )
}
