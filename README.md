# Spare Parts Search

A small product-search web app built with React and TypeScript that integrates the [Euras EED API](https://shop.euras.com/admin/Dok/eed-doku-eng.php) — a spare-parts data gateway used by ASWO partner shops across Europe.

## Features

- **Real-time search** — results update as you type (400 ms debounce)
- **Product cards** — thumbnail image, article name, price, manufacturer, delivery time
- **Detail panel** — slides in from the right with full article information
- **Pagination** — navigate through large result sets
- **Responsive layout** — sidebar collapses on mobile

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 18 + TypeScript |
| Build tool | Vite 5 |
| Icons | lucide-react |
| API | Euras EED (JSON mode) |
| Proxy | Vite dev proxy / Vercel rewrites |

---

## Prerequisites

- **Node.js** v18 or later ([nodejs.org](https://nodejs.org))
- **npm** v9 or later (comes with Node)
- An Euras EED account ID (optional — the public DE test account is used by default)

---

## Running locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/spare-parts-search.git
cd spare-parts-search
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment (optional)

Copy the example file and fill in your own EED account ID if you have one:

```bash
cp .env.example .env
```

Then edit `.env`:

```
VITE_EED_ID=your_eed_account_id_here
```

If you skip this step the app will use the public **DE test account** which only allows searching for `SONY`, `AEG`, or `HDMI`. A production account has no such restriction.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Why a proxy?**  
> The Euras API does not send CORS headers, so direct browser `fetch()` calls are blocked. Vite's built-in proxy forwards `/eed-proxy/*` requests to `shop.euras.com` from the server side, making them appear same-origin to the browser. The same behaviour is replicated on Vercel via `vercel.json` rewrites.

### 5. Build for production

```bash
npm run build
```

The output goes to `dist/`. You can preview it locally with:

```bash
npm run preview
```

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel will detect the Vite project automatically.

### Option B — Vercel dashboard

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. Vercel auto-detects Vite. Leave the build settings as-is.
4. If you have a production EED account, add `VITE_EED_ID` under **Settings → Environment Variables**.
5. Click **Deploy**.

The `vercel.json` file in the repo already configures the `/eed-proxy/*` rewrite, so the API proxy works in production without any extra setup.

---

## Project structure

```
spare-parts-search/
├── public/               # Static assets (favicon, etc.)
├── src/
│   ├── api/
│   │   └── euras.ts      # Euras EED API client (session, search, detail)
│   ├── components/
│   │   ├── ArticleImage.tsx   # Thumbnail with placeholder fallback
│   │   ├── ProductCard.tsx    # Search result card
│   │   ├── ProductDetail.tsx  # Slide-in detail panel
│   │   └── SearchBar.tsx      # Search input with loading indicator
│   ├── hooks/
│   │   └── useSearch.ts  # Debounced search state management
│   ├── pages/
│   │   └── SearchPage.tsx # Main page layout
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json           # Vercel proxy rewrites
└── vite.config.ts        # Vite config + dev proxy
```

---

## How the API proxy works

The Euras API server blocks cross-origin requests (no `Access-Control-Allow-Origin` header). To work around this without a dedicated backend:

**Local development** — `vite.config.ts` proxies `/eed-proxy/*` to `https://shop.euras.com` and injects a browser-like `User-Agent` header.

**Production (Vercel)** — `vercel.json` rewrites `/eed-proxy/(.*)` to `https://shop.euras.com/$1`. Vercel's edge network makes the upstream request server-side, so CORS is not an issue.

All API calls in `src/api/euras.ts` use `/eed-proxy/eed.php` as the base URL, so the same code works in both environments.

---

## Euras EED API notes

- **Session management** — a session ID is created on first use and cached in `sessionStorage` (valid 3 hours). The client auto-renews it on expiry.
- **Test account limits** — the public DE test account (`AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZy`) only allows `artikelsuche` with keywords `SONY`, `AEG`, or `HDMI`, and `artikeldetails` for a small set of test article numbers. A production account has no such limits.
- **Field names** — the API returns German field names (`artikelnummer`, `ekpreis`, `artikelhersteller`, etc.) regardless of language setting. The `treffer` (hits) field is an object keyed by `"1"`, `"2"`, … rather than a proper array; `euras.ts` normalises this.
- **Images** — each article includes a `thumbnailurl` field with a direct CDN URL when `bild === "J"`.

---

## License

MIT
