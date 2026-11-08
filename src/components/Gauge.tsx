import type { Item } from '../types'
import { warrantyOf } from '../warranty'
import { day } from '../format'

type Size = 'row' | 'hero'

/**
 * The warranty cable. The track runs from the purchase day (left) to the
 * warranty socket (right). The live cable is the warranty still left, and
 * its plug sits at today's position. When the warranty ends the plug is
 * pulled out and lies beside the socket.
 */
export function Gauge({ item, size = 'row', delay = 0 }: { item: Item; size?: Size; delay?: number }) {
  const w = warrantyOf(item)
  if (w.status === 'none') return <span className={`track none ${size}`} aria-hidden="true" />
  const left = `${(w.elapsed * 100).toFixed(2)}%`

  return (
    <span className={`track ${size}`} data-status={w.status} aria-hidden="true">
      <span className="trace" />
      {w.status === 'expired' ? (
        <span className="plug loose" />
      ) : (
        <>
          <span className="cable" style={{ left, animationDelay: `${delay}ms` }} />
          <span className="plug" style={{ left, animationDelay: `${delay + 650}ms` }} />
        </>
      )}
      <span className="socket" />
    </span>
  )
}

/** Large gauge with the three dates that matter written under it. */
export function GaugeHero({ item }: { item: Item }) {
  const w = warrantyOf(item)
  if (w.status === 'none') {
    return <p className="no-warranty">No warranty recorded for this item.</p>
  }
  const live = w.status !== 'expired'
  return (
    <div className="gauge-hero" data-status={w.status}>
      <Gauge item={item} size="hero" />
      <div className="scale">
        <span className="scale-start">
          {day(item.purchaseDate)}
          <small>Bought</small>
        </span>
        {live && (
          <span className="scale-today" style={{ left: `${(w.elapsed * 100).toFixed(2)}%` }}>
            Today
          </span>
        )}
        <span className="scale-end">
          {day(w.end)}
          <small>{live ? 'Warranty ends' : 'Warranty ended'}</small>
        </span>
      </div>
    </div>
  )
}
