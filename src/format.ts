import type { Item } from './types'
import { warrantyOf } from './warranty'

export const money = (n: number | null) =>
  n == null ? '' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

/** ₹1.2 L, ₹45 K: short enough for chart labels. */
export function shortMoney(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)} K`
  return `₹${n}`
}

export const day = (d: Date | string | null) => {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00') : d
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const tagOf = (n: number) => `BL-${String(n).padStart(4, '0')}`

export function leftText(item: Item): string {
  const w = warrantyOf(item)
  if (w.status === 'none') return 'No warranty'
  if (w.status === 'expired') {
    const n = -w.daysLeft
    return n === 0 ? 'Ended today' : `Ended ${n} day${n === 1 ? '' : 's'} ago`
  }
  if (w.daysLeft === 0) return 'Ends today'
  if (w.daysLeft < 90) return `${w.daysLeft} day${w.daysLeft === 1 ? '' : 's'} left`
  const months = Math.round(w.daysLeft / 30.4)
  if (months < 24) return `${months} months left`
  return `${(w.daysLeft / 365).toFixed(1)} years left`
}

export function download(name: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function toCsv(items: Item[]): string {
  const cols = ['tag', 'name', 'category', 'brand', 'model', 'serial', 'quantity', 'purchaseDate', 'price', 'store', 'warrantyMonths', 'warrantyEnds', 'location', 'notes'] as const
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = items.map((i) => {
    const w = warrantyOf(i)
    const vals: Record<string, unknown> = {
      ...i,
      tag: tagOf(i.tag),
      warrantyEnds: w.end ? w.end.toISOString().slice(0, 10) : '',
    }
    return cols.map((c) => esc(vals[c])).join(',')
  })
  return [cols.join(','), ...rows].join('\n')
}
