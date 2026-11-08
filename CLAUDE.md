# Benchlog

Personal inventory for electronics (laptops, tablets, monitors, cameras, chargers, cables) with warranty tracking. Owner: ShahGul. Hosting target: Cloudflare Pages or an Oracle OCI VM. Repo: github.com/shahgul/benchlog.

## Commands

- `npm install` once, then `npm run dev` (http://localhost:5173)
- `npm run build` runs `tsc -b` then `vite build`. Run it before finishing any change.

## Stack

Vite, React 19, TypeScript, react-router-dom (BrowserRouter), idb-keyval for storage. No UI framework and no CSS framework: all styling is in `src/index.css` using CSS variables. Fonts come from `@fontsource` packages.

## Where things are

- `src/types.ts`: `Item`, `Draft`, `CATEGORIES`, `CATEGORY_COLOR`
- `src/warranty.ts`: `warrantyOf(item)` returns status (`active`, `soon`, `expired`, `none`), end date, days left, elapsed fraction. "Soon" means 30 days or fewer.
- `src/store.tsx`: `StoreProvider` and `useStore()`. The whole data set (`{ items, nextTag }`) lives in IndexedDB under key `benchlog-v1`. Attachments are data URLs inside each item (4 MB limit per file).
- `src/format.ts`: money (₹, en-IN), dates, `leftText`, CSV and download helpers
- `src/components/`: `Layout` (side rail, bottom nav on mobile), `Gauge` and `GaugeHero` (the warranty cable), `CableRow`, `ItemForm`, `EmptyBench`
- `src/pages/`: Overview `/`, Items `/items` (filters live in the URL query), ItemPage `/items/:id`, ItemFormPages `/items/new` and `/items/:id/edit`, Timeline `/timeline`, Places `/places`, Backup `/backup`, NotFound

## Design rules (keep these)

The look is an electronics bench. Do not replace it with a generic component-library look.

- Background is a green cutting-mat grid (`--mat`). Light "paper" surfaces use label-tape white (`--tape`) with ink text (`--ink`).
- The warranty cable is the one memorable element: a track from purchase date to a socket, a coloured cable for the warranty left, a plug at today. When the warranty ends the plug lies loose beside the socket. Reuse `Gauge` instead of inventing new progress bars.
- Asset tags are label-maker strips (BL-0001). Their left stripe is the category's wire colour from `CATEGORY_COLOR`. Colour is never the only signal: category and status are also written as text.
- Status colours come from `data-status` on an ancestor, which sets `--c`: blue is active, yellow is ending within 30 days, grey or red is ended.
- Type: Big Shoulders Display for headings and asset tags, Bricolage Grotesque for body text. Sentence case. No all-caps labels, no eyebrow labels above headings, no identical rounded cards with soft shadows.
- Motion: cables draw in once when a list mounts. Anything else should respond to a user action. Respect `prefers-reduced-motion`.
- Copy: plain verbs, active voice, specific errors that say how to fix the problem. Keep action names consistent ("Save item" then "Saved").
- Responsive down to 390 px wide, with visible keyboard focus.
- If you add a component library, use headless primitives (Radix, React Aria) for behaviour only and style them with the existing CSS variables.

## Gotchas already hit

- `useEffect` callbacks must not return a value: use a block body, not an arrow expression.
- Import fontsource weights without the `.css` suffix (`@fontsource/big-shoulders-display/700`); `src/fonts.d.ts` declares the module.
- Chrome blocks opening `data:` URLs in a new tab, so images open in the lightbox `<dialog>` and PDFs use a `download` link.
- Don't reuse short class names across components (`.left` once collided with `.actions.left`).
- The app uses real URLs, so the server must fall back to `index.html` (see README).

## Roadmap

1. Sync across devices: a small API and database on the OCI VM (or Cloudflare D1 and R2), with a login. Keep the storage layer behind `useStore` so the backend is swappable and JSON export keeps working.
2. Installable PWA with warranty expiry notifications
3. QR labels that open `/items/:id` when scanned
4. Service and repair history per item

Data contains serial numbers and invoices. Keep the repo private and never commit exported backups.
