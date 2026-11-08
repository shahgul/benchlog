export const CATEGORIES = [
  'Laptop',
  'Tablet',
  'Phone',
  'Monitor',
  'Camera',
  'Audio',
  'Storage',
  'Charger',
  'Cable',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Every category gets a wire colour, like colour-coded cable ties. */
export const CATEGORY_COLOR: Record<Category, string> = {
  Laptop: '#66a3ff',
  Tablet: '#4fd1c5',
  Phone: '#8bd450',
  Monitor: '#b48cff',
  Camera: '#ff9f43',
  Audio: '#ff7eb6',
  Storage: '#7fd7ff',
  Charger: '#e9f0ea',
  Cable: '#c8e65a',
  Other: '#9bb0a6',
}

export interface Attachment {
  id: string
  name: string
  type: string
  data: string // data URL
}

export interface Item {
  id: string
  tag: number
  name: string
  category: Category
  brand: string
  model: string
  serial: string
  quantity: number
  purchaseDate: string // yyyy-mm-dd
  price: number | null
  store: string
  warrantyMonths: number
  location: string
  notes: string
  attachments: Attachment[]
  createdAt: number
}

export type Draft = Omit<Item, 'id' | 'tag' | 'createdAt'> & Partial<Pick<Item, 'id' | 'tag' | 'createdAt'>>

export interface Data {
  items: Item[]
  nextTag: number
}
