import type { Item } from './types'

export type Status = 'active' | 'soon' | 'expired' | 'none'

export interface Warranty {
  status: Status
  end: Date | null
  daysLeft: number
  /** 0 at purchase, 1 at expiry */
  elapsed: number
}

const DAY = 86_400_000
export const SOON_DAYS = 30

export function parseDate(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}

export function warrantyOf(item: Item, now = new Date()): Warranty {
  if (!item.warrantyMonths || !item.purchaseDate) {
    return { status: 'none', end: null, daysLeft: 0, elapsed: 0 }
  }
  const start = parseDate(item.purchaseDate)
  const end = new Date(start)
  end.setMonth(end.getMonth() + item.warrantyMonths)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY))
  const daysLeft = Math.round((end.getTime() - today.getTime()) / DAY)
  const elapsed = Math.min(1, Math.max(0, 1 - daysLeft / total))
  const status: Status = daysLeft < 0 ? 'expired' : daysLeft <= SOON_DAYS ? 'soon' : 'active'
  return { status, end, daysLeft, elapsed }
}
