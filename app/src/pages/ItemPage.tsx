import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { CATEGORY_COLOR } from '../types'
import { warrantyOf } from '../warranty'
import { day, leftText, money, tagOf } from '../format'
import { usePageTitle } from '../hooks'
import { GaugeHero } from '../components/Gauge'

function Plate({ k, v }: { k: string; v: string }) {
  if (!v) return null
  return (
    <div className="plate-row">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  )
}

export default function ItemPage() {
  const { id } = useParams()
  const { data, ready, remove } = useStore()
  const navigate = useNavigate()
  const item = data.items.find((i) => i.id === id)
  const [confirming, setConfirming] = useState(false)
  const [zoom, setZoom] = useState<string | null>(null)
  const dlg = useRef<HTMLDialogElement>(null)
  usePageTitle(item?.name ?? 'Item')

  if (!ready) return null
  if (!item) {
    return (
      <div className="empty">
        <h1 className="page-title">That item isn’t here.</h1>
        <p>It may have been deleted, or the link is from another browser.</p>
        <Link to="/items" className="btn primary">
          Back to items
        </Link>
      </div>
    )
  }

  const w = warrantyOf(item)
  const images = item.attachments.filter((a) => a.type.startsWith('image/'))
  const docs = item.attachments.filter((a) => !a.type.startsWith('image/'))
  const open = (data: string) => {
    setZoom(data)
    dlg.current?.showModal()
  }

  return (
    <article data-status={w.status}>
      <p className="crumb">
        <Link to="/items">All items</Link>
      </p>
      <div className="item-head">
        <span className="tape big" style={{ ['--wire' as string]: CATEGORY_COLOR[item.category] }}>
          {tagOf(item.tag)}
        </span>
        <h1 className="item-title">{item.name}</h1>
        <p className="item-sub">{[item.brand, item.model].filter(Boolean).join(' ') || item.category}</p>
      </div>

      <section className="status-line" aria-label="Warranty">
        <span className="dot" aria-hidden="true" />
        <b>{leftText(item)}</b>
        {w.end && <span>, {w.status === 'expired' ? 'ended' : 'ends'} {day(w.end)}</span>}
      </section>
      <GaugeHero item={item} />

      <div className="item-cols">
        <section aria-labelledby="specs">
          <h2 id="specs" className="sr">
            Details
          </h2>
          <dl className="plate">
            <Plate k="Category" v={item.category} />
            <Plate k="Brand" v={item.brand} />
            <Plate k="Model" v={item.model} />
            <Plate k="Serial" v={item.serial} />
            <Plate k="Quantity" v={item.quantity > 1 ? String(item.quantity) : ''} />
            <Plate k="Bought" v={day(item.purchaseDate)} />
            <Plate k="Price" v={money(item.price)} />
            <Plate k="From" v={item.store} />
            <Plate k="Warranty" v={item.warrantyMonths ? `${item.warrantyMonths} months` : 'None'} />
            <Plate k="Kept in" v={item.location} />
          </dl>
          {item.notes && <p className="notes">{item.notes}</p>}
        </section>

        <section aria-labelledby="files">
          <h2 id="files" className="block-title">
            Photos and papers
          </h2>
          {item.attachments.length === 0 ? (
            <p className="muted">
              Nothing attached. <Link to={`/items/${item.id}/edit`}>Add the invoice or a photo</Link> so the warranty claim is one tap away.
            </p>
          ) : (
            <>
              {images.length > 0 && (
                <div className="gallery">
                  {images.map((a) => (
                    <button key={a.id} onClick={() => open(a.data)} aria-label={`View ${a.name}`}>
                      <img src={a.data} alt={a.name} />
                    </button>
                  ))}
                </div>
              )}
              {docs.length > 0 && (
                <ul className="files docs">
                  {docs.map((a) => (
                    <li key={a.id}>
                      <a href={a.data} download={a.name}>
                        {a.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      <div className="actions left">
        {confirming ? (
          <>
            <span className="confirm">Delete {item.name}? This can’t be undone.</span>
            <button className="btn ghost" onClick={() => setConfirming(false)}>
              Keep it
            </button>
            <button
              className="btn danger"
              onClick={() => {
                remove(item.id)
                navigate('/items')
              }}
            >
              Delete item
            </button>
          </>
        ) : (
          <>
            <Link to={`/items/${item.id}/edit`} className="btn primary">
              Edit item
            </Link>
            <button className="btn ghost" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </>
        )}
      </div>

      <dialog ref={dlg} className="lightbox" aria-label="Attachment preview" onClick={() => dlg.current?.close()}>
        {zoom && <img src={zoom} alt="" />}
      </dialog>
    </article>
  )
}
