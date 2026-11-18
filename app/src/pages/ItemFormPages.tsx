import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import type { Draft } from '../types'
import { usePageTitle } from '../hooks'
import { ItemForm, blankDraft } from '../components/ItemForm'

export function NewItem() {
  usePageTitle('Add item')
  const { save } = useStore()
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [seed, setSeed] = useState<Draft | undefined>()
  const [saved, setSaved] = useState('')

  function onSave(d: Draft, again: boolean) {
    const id = save(d)
    if (!again) {
      navigate(`/items/${id}`)
      return
    }
    // keep what repeats across a batch of purchases, clear what doesn't
    setSeed({ ...blankDraft(), category: d.category, brand: d.brand, store: d.store, purchaseDate: d.purchaseDate, warrantyMonths: d.warrantyMonths, location: d.location })
    setSaved(`Saved ${d.name}. Add the next one.`)
    setRound((r) => r + 1)
    window.scrollTo(0, 0)
  }

  return (
    <div className="form-page">
      {saved && (
        <p className="note" role="status">
          {saved}
        </p>
      )}
      <ItemForm key={round} seed={seed} title="Add item" allowAgain onSave={onSave} onCancel={() => navigate(-1)} />
    </div>
  )
}

export function EditItem() {
  const { id } = useParams()
  const { data, ready, save } = useStore()
  const navigate = useNavigate()
  const item = data.items.find((i) => i.id === id)
  usePageTitle(item ? `Edit ${item.name}` : 'Edit item')

  if (!ready) return null
  if (!item) {
    return (
      <div className="empty">
        <h1 className="page-title">That item isn’t here.</h1>
        <Link to="/items" className="btn primary">
          Back to items
        </Link>
      </div>
    )
  }
  return (
    <div className="form-page">
      <ItemForm
        initial={item}
        title={`Edit ${item.name}`}
        onSave={(d) => {
          save(d)
          navigate(`/items/${item.id}`)
        }}
        onCancel={() => navigate(`/items/${item.id}`)}
      />
    </div>
  )
}
