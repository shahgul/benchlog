# Benchlog

A catalogue of everything you own that plugs in: laptops, tablets, monitors, cameras, chargers and the drawer full of cables. Every item gets an asset tag (BL-0001) and a warranty cable. The cable shrinks as the warranty runs down, and the plug comes out when it ends.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Overview: the warranty that runs out next, what's ending soon, what has ended, what you own and spent |
| `/items` | Every item with search, category, warranty filter and sort (filters live in the URL) |
| `/items/new` | Add an item, or "Save and add another" for a batch of cables |
| `/items/:id` | Full item page: warranty cable, spec plate, photos and invoices |
| `/items/:id/edit` | Edit an item |
| `/timeline` | Every warranty on one scrolling timeline with a line for today |
| `/places` | One drawer per location, listing what's inside |
| `/backup` | Export JSON or CSV, import a backup, load examples, erase everything |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Deploy

It's a static single-page app that uses real URLs, so the host must serve `index.html` for unknown paths.

**nginx (OCI VM)**

```nginx
location / {
  try_files $uri /index.html;
}
```

**Cloudflare Pages:** add a `public/_redirects` file containing `/* /index.html 200`. Build command `npm run build`, output directory `dist`.

## Data

Everything is stored in your browser (IndexedDB), so it works offline and nothing leaves your device. It also means the data is per browser. Use **Backup** to export a copy. Backups include serial numbers and invoices, so keep them out of public repos.

## Roadmap

- "Signal" redesign: a darker, more modern look built around a glowing warranty cable (in progress, mockup first)
- Sync across devices with a small API and database on the OCI VM (or Cloudflare D1 and R2), behind a login (after the redesign)
- Installable PWA with warranty expiry notifications
- QR labels that open an item's page when scanned
- Service and repair history per item

## Design

The current look comes from an electronics bench: a green cutting-mat grid, label-maker tape for asset tags, and wire colours for categories. Type is Big Shoulders Display for headings and Bricolage Grotesque for text. It is being replaced by "Signal" (near-black surfaces, a luminous warranty cable, bento Overview); see `CLAUDE.md`.
