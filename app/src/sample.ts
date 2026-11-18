import type { Item } from './types'

type Draft = Omit<Item, 'id' | 'tag' | 'createdAt'>

const iso = (monthsAgo: number, extraDays = 0) => {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo)
  d.setDate(d.getDate() + extraDays)
  return d.toISOString().slice(0, 10)
}

const base = { serial: '', notes: '', attachments: [], quantity: 1, location: '', store: '' }

export const sampleItems = (): Draft[] => [
  { ...base, name: 'Work laptop', category: 'Laptop', brand: 'Lenovo', model: 'ThinkPad T14', serial: 'PF3K91LX', purchaseDate: iso(10), price: 92000, store: 'Croma', warrantyMonths: 36, location: 'Desk' },
  { ...base, name: 'Gaming tablet', category: 'Tablet', brand: 'Lenovo', model: 'Legion Y700', serial: 'HA2201B7', purchaseDate: iso(5), price: 32999, store: 'Amazon', warrantyMonths: 12, location: 'Bag' },
  { ...base, name: 'Main monitor', category: 'Monitor', brand: 'Dell', model: 'U2723QE', serial: 'CN0W8M44', purchaseDate: iso(11, 12), price: 54500, store: 'Dell store', warrantyMonths: 12, location: 'Desk' },
  { ...base, name: 'Mirrorless body', category: 'Camera', brand: 'Sony', model: 'A7 III', serial: '4829113', purchaseDate: iso(30), price: 148000, store: 'Sony Center', warrantyMonths: 24, location: 'Dry cabinet' },
  { ...base, name: 'USB-C to HDMI cable', category: 'Cable', brand: 'Anker', model: '2 m 4K', purchaseDate: iso(3), price: 1299, store: 'Amazon', warrantyMonths: 18, quantity: 2, location: 'Cable drawer' },
  { ...base, name: 'GaN charger', category: 'Charger', brand: 'Ugreen', model: '100 W 4-port', purchaseDate: iso(14), price: 3499, store: 'Amazon', warrantyMonths: 12, location: 'Desk' },
  { ...base, name: 'Desk lamp', category: 'Other', brand: 'Xiaomi', model: 'Mi LED 1S', purchaseDate: iso(2), price: 2499, store: 'Mi Home', warrantyMonths: 0 },
]
