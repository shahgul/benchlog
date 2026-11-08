import { Link } from 'react-router-dom'
import { CATEGORY_COLOR, type Item } from '../types'
import { warrantyOf } from '../warranty'
import { day, leftText, tagOf } from '../format'
import { Gauge } from './Gauge'

export function CableRow({ item, index = 0 }: { item: Item; index?: number }) {
  const w = warrantyOf(item)
  const sub = [item.brand, item.model].filter(Boolean).join(' ')

  return (
    <li className="row" data-status={w.status}>
      <Link className="row-link" to={`/items/${item.id}`} aria-label={`${item.name}. ${leftText(item)}.`}>
        <span className="tape" style={{ ['--wire' as string]: CATEGORY_COLOR[item.category] }}>
          {tagOf(item.tag)}
        </span>
        <span className="row-name">
          <span className="row-title">
            {item.name}
            {item.quantity > 1 && <span className="qty">×{item.quantity}</span>}
          </span>
          <span className="row-sub">{sub ? `${item.category}, ${sub}` : item.category}</span>
        </span>
        <Gauge item={item} delay={Math.min(index, 12) * 45} />
        <span className="row-end">
          <span className="time-left">{leftText(item)}</span>
          {w.end && <span className="until">{day(w.end)}</span>}
        </span>
      </Link>
    </li>
  )
}
