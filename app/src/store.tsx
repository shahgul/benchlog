import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { get, set } from 'idb-keyval'
import type { Data, Draft, Item } from './types'

const KEY = 'benchlog-v1'
const empty: Data = { items: [], nextTag: 1 }

interface Store {
  data: Data
  ready: boolean
  /** Creates or updates an item and returns its id. */
  save: (draft: Draft) => string
  remove: (id: string) => void
  addMany: (items: Draft[]) => void
  replaceAll: (next: Data) => void
  clear: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(empty)
  const [ready, setReady] = useState(false)
  const loaded = useRef(false)

  useEffect(() => {
    get<Data>(KEY)
      .then((d) => d && setData(d))
      .catch(() => {})
      .finally(() => {
        loaded.current = true
        setReady(true)
      })
  }, [])

  useEffect(() => {
    if (loaded.current) set(KEY, data).catch(() => {})
  }, [data])

  const save = useCallback((draft: Draft) => {
    const id = draft.id ?? crypto.randomUUID()
    setData((d) => {
      if (draft.id && d.items.some((i) => i.id === draft.id)) {
        return { ...d, items: d.items.map((i) => (i.id === draft.id ? ({ ...i, ...draft } as Item) : i)) }
      }
      const item: Item = { ...draft, id, tag: d.nextTag, createdAt: Date.now() }
      return { items: [item, ...d.items], nextTag: d.nextTag + 1 }
    })
    return id
  }, [])

  const remove = useCallback((id: string) => setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) })), [])

  const addMany = useCallback((items: Draft[]) => {
    setData((d) => {
      let tag = d.nextTag
      const made = items.map((i) => ({ ...i, id: crypto.randomUUID(), tag: tag++, createdAt: Date.now() }))
      return { items: [...made, ...d.items], nextTag: tag }
    })
  }, [])

  const replaceAll = useCallback((next: Data) => setData(next), [])
  const clear = useCallback(() => setData(empty), [])

  const value = useMemo(() => ({ data, ready, save, remove, addMany, replaceAll, clear }), [data, ready, save, remove, addMany, replaceAll, clear])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore must be used inside StoreProvider')
  return c
}
