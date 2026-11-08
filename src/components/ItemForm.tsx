import { useState, type ChangeEvent, type FormEvent } from 'react'
import { CATEGORIES, type Attachment, type Category, type Draft, type Item } from '../types'

const MAX_BYTES = 4 * 1024 * 1024
const TERMS = [0, 6, 12, 24, 36]

export const blankDraft = (): Draft => ({
  name: '',
  category: 'Cable',
  brand: '',
  model: '',
  serial: '',
  quantity: 1,
  purchaseDate: new Date().toISOString().slice(0, 10),
  price: null,
  store: '',
  warrantyMonths: 12,
  location: '',
  notes: '',
  attachments: [],
})

const readFile = (f: File) =>
  new Promise<Attachment>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve({ id: crypto.randomUUID(), name: f.name, type: f.type, data: String(r.result) })
    r.onerror = () => reject(r.error)
    r.readAsDataURL(f)
  })

interface Props {
  initial?: Item
  seed?: Draft
  title: string
  onSave: (d: Draft, again: boolean) => void
  onCancel: () => void
  allowAgain?: boolean
}

export function ItemForm({ initial, seed, title, onSave, onCancel, allowAgain }: Props) {
  const [d, setD] = useState<Draft>(initial ? { ...initial } : (seed ?? blankDraft()))
  const [error, setError] = useState('')
  const up = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }))

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    const tooBig = files.find((f) => f.size > MAX_BYTES)
    if (tooBig) {
      setError(`${tooBig.name} is over 4 MB. Choose a smaller file or compress it first.`)
      return
    }
    setError('')
    const added = await Promise.all(files.map(readFile))
    setD((p) => ({ ...p, attachments: [...p.attachments, ...added] }))
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!d.name.trim()) {
      setError('Give the item a name so you can find it later.')
      return
    }
    const again = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === 'again'
    onSave({ ...d, name: d.name.trim(), quantity: Math.max(1, d.quantity || 1) }, again)
  }

  return (
    <form className="form" onSubmit={submit}>
      <h1 className="form-title">{title}</h1>

      <fieldset>
        <legend>What it is</legend>
        <label className="f wide">
          <span>Name</span>
          <input autoFocus value={d.name} onChange={(e) => up('name', e.target.value)} placeholder="USB-C to HDMI cable" />
        </label>
        <label className="f">
          <span>Category</span>
          <select value={d.category} onChange={(e) => up('category', e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="f">
          <span>Quantity</span>
          <input type="number" min={1} value={d.quantity} onChange={(e) => up('quantity', Number(e.target.value))} />
        </label>
        <label className="f">
          <span>Brand</span>
          <input value={d.brand} onChange={(e) => up('brand', e.target.value)} />
        </label>
        <label className="f">
          <span>Model</span>
          <input value={d.model} onChange={(e) => up('model', e.target.value)} />
        </label>
        <label className="f wide">
          <span>Serial number</span>
          <input value={d.serial} onChange={(e) => up('serial', e.target.value)} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Purchase and warranty</legend>
        <label className="f">
          <span>Purchase date</span>
          <input type="date" value={d.purchaseDate} onChange={(e) => up('purchaseDate', e.target.value)} />
        </label>
        <label className="f">
          <span>Price (₹)</span>
          <input type="number" min={0} value={d.price ?? ''} onChange={(e) => up('price', e.target.value === '' ? null : Number(e.target.value))} />
        </label>
        <label className="f wide">
          <span>Bought from</span>
          <input value={d.store} onChange={(e) => up('store', e.target.value)} />
        </label>
        <div className="f wide">
          <label htmlFor="months">Warranty length in months</label>
          <div className="months">
            <input id="months" type="number" min={0} value={d.warrantyMonths} onChange={(e) => up('warrantyMonths', Number(e.target.value))} />
            {TERMS.map((m) => (
              <button key={m} type="button" className="chip" aria-pressed={d.warrantyMonths === m} onClick={() => up('warrantyMonths', m)}>
                {m === 0 ? 'None' : m}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Where and why it matters</legend>
        <label className="f wide">
          <span>Where it lives</span>
          <input value={d.location} onChange={(e) => up('location', e.target.value)} placeholder="Cable drawer, backpack, shelf 2" />
        </label>
        <label className="f wide">
          <span>Notes</span>
          <textarea rows={3} value={d.notes} onChange={(e) => up('notes', e.target.value)} />
        </label>
        <div className="f wide">
          <span>Photos, invoice, warranty card</span>
          <input type="file" accept="image/*,application/pdf" multiple onChange={onFiles} />
          {d.attachments.length > 0 && (
            <ul className="files">
              {d.attachments.map((a) => (
                <li key={a.id}>
                  {a.name}
                  <button type="button" className="link" onClick={() => up('attachments', d.attachments.filter((x) => x.id !== a.id))}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        {allowAgain && (
          <button type="submit" value="again" className="btn ghost">
            Save and add another
          </button>
        )}
        <button type="submit" value="save" className="btn primary">
          Save item
        </button>
      </div>
    </form>
  )
}
