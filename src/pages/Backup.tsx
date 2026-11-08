import { useRef, useState } from 'react'
import { useStore } from '../store'
import type { Data } from '../types'
import { download, toCsv } from '../format'
import { sampleItems } from '../sample'
import { usePageTitle } from '../hooks'

export default function Backup() {
  usePageTitle('Backup')
  const { data, ready, replaceAll, addMany, clear } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [bad, setBad] = useState(false)
  const [erasing, setErasing] = useState(false)

  if (!ready) return null
  const items = data.items
  const files = items.reduce((n, i) => n + i.attachments.length, 0)
  const bytes = items.reduce((n, i) => n + i.attachments.reduce((m, a) => m + a.data.length * 0.75, 0), 0)

  function importJson(file: File) {
    file.text().then((t) => {
      try {
        const parsed = JSON.parse(t) as Data
        if (!Array.isArray(parsed.items)) throw new Error()
        replaceAll({ items: parsed.items, nextTag: parsed.nextTag ?? parsed.items.length + 1 })
        setBad(false)
        setMsg(`Imported ${parsed.items.length} items. Your previous list was replaced.`)
      } catch {
        setBad(true)
        setMsg('That file isn’t a Benchlog backup. Choose a .json file you exported from this page.')
      }
    })
  }

  return (
    <>
      <h1 className="page-title">Backup</h1>
      <p className="lede">
        Your list lives in this browser: {items.length} {items.length === 1 ? 'item' : 'items'}, {files} {files === 1 ? 'file' : 'files'} attached, about {(bytes / 1_048_576).toFixed(1)} MB. Clearing site data or switching browsers loses it, so export a copy now and then.
      </p>

      <div className="panels">
        <section className="panel">
          <h2>Export</h2>
          <p>The JSON backup includes photos and invoices and can be imported back here. The CSV opens in a spreadsheet and leaves attachments out.</p>
          <div className="actions left">
            <button className="btn primary" disabled={!items.length} onClick={() => download('benchlog-backup.json', JSON.stringify(data), 'application/json')}>
              Download backup (JSON)
            </button>
            <button className="btn ghost" disabled={!items.length} onClick={() => download('benchlog.csv', toCsv(items), 'text/csv')}>
              Download spreadsheet (CSV)
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Import</h2>
          <p>Restore a JSON backup. This replaces everything currently in Benchlog.</p>
          <div className="actions left">
            <button className="btn ghost" onClick={() => fileRef.current?.click()}>
              Choose backup file
            </button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </div>
        </section>

        <section className="panel">
          <h2>Examples</h2>
          <p>Add seven sample items to see how the pages look. Delete them one by one afterwards, or erase everything below.</p>
          <div className="actions left">
            <button className="btn ghost" onClick={() => addMany(sampleItems())}>
              Add seven examples
            </button>
          </div>
        </section>

        <section className="panel danger-zone">
          <h2>Erase everything</h2>
          <p>Deletes every item and attachment from this browser. Export a backup first if you might want them back.</p>
          <div className="actions left">
            {erasing ? (
              <>
                <button className="btn ghost" onClick={() => setErasing(false)}>
                  Keep my items
                </button>
                <button
                  className="btn danger"
                  onClick={() => {
                    clear()
                    setErasing(false)
                    setBad(false)
                    setMsg('Everything was erased.')
                  }}
                >
                  Erase {items.length} items
                </button>
              </>
            ) : (
              <button className="btn ghost" disabled={!items.length} onClick={() => setErasing(true)}>
                Erase everything
              </button>
            )}
          </div>
        </section>
      </div>

      {msg && (
        <p className={bad ? 'error' : 'note'} role={bad ? 'alert' : 'status'}>
          {msg}
        </p>
      )}
    </>
  )
}
