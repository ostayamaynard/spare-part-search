/**
 * euras.ts
 *
 * Thin wrapper around the Euras EED API (https://shop.euras.com/eed.php).
 *
 * All requests go through /eed-proxy which is handled by:
 *  - Vite dev server proxy (vite.config.ts) during local development
 *  - Vercel serverless function (api/eed-proxy.js) in production
 *
 * The serverless function overrides shopurl to the registered test value,
 * so this works from any deployed domain.
 *
 * Docs: https://shop.euras.com/admin/Dok/eed-doku-eng.php
 */

const EED_ID = import.meta.env.VITE_EED_ID || 'AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZy'

// The test account is registered with localhost — proxy overrides this in prod
const SHOP_URL = encodeURIComponent(window.location.origin + '/')
// MD5 of "127.0.0.1" — placeholder for visitor IP hash
const CUSTOMER_IP = 'f528764d624db129b32c21fbca0cb8d6'

const SESSION_KEY = 'eed_sessionid'
// Both dev and prod use /eed-proxy — Vite handles it locally, serverless fn in prod
const BASE = '/eed-proxy'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ArticleHit {
  artikelnummer: string
  artikelbezeichnung: string
  ekpreis: string
  artikelhersteller: string
  lieferzeit: string
  lieferzeit_in_tagen: number
  bild: 'J' | 'N'
  thumbnailurl?: string
  bestellbar: 'J' | 'N'
  morepics?: 'J' | 'N'
  EAN?: string
  gewicht?: string
  vgruppenname?: string
  artikelmerkmal?: string[]
  storno_moeglich?: 'J' | 'N'
  ersatzartikel?: 'J' | 'N'
  originalnummer?: string
}

export interface ArticleDetail extends ArticleHit {
  artikeltext?: string
  technischedaten?: string
  vgruppenbaum?: Array<{ vgruppenname: string }>
  sperrgut?: 'J' | 'N'
}

export interface SearchResult {
  treffer: ArticleHit[]
  gesamtanzahltreffer: number
  trefferproseite: number
  seite: number
  anzahlseiten: number
}

// ─── Session helpers ──────────────────────────────────────────────────────────

async function getSession(): Promise<string> {
  const cached = sessionStorage.getItem(SESSION_KEY)
  if (cached) return cached
  return createSession()
}

async function createSession(): Promise<string> {
  const params = new URLSearchParams({
    format: 'json',
    id: EED_ID,
    art: 'neuesitzung',
    shopurl: SHOP_URL,
    customerip: CUSTOMER_IP,
  })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Session request failed: HTTP ${res.status}`)
  const data = await res.json()
  if (data.fehlernummer !== '0' && data.fehlernummer !== 0) {
    throw new Error(`EED session error: ${data.fehlermeldung}`)
  }
  sessionStorage.setItem(SESSION_KEY, data.sessionid)
  return data.sessionid as string
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

// ─── Generic request helper ───────────────────────────────────────────────────

async function eedRequest<T>(extra: Record<string, string | number>): Promise<T> {
  const sessionid = await getSession()
  const params = new URLSearchParams({
    format: 'json',
    id: EED_ID,
    sessionid,
    shopurl: SHOP_URL,
    customerip: CUSTOMER_IP,
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
  })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`EED request failed: HTTP ${res.status}`)
  const data = await res.json()
  if (data.fehlernummer !== '0' && data.fehlernummer !== 0) {
    if (String(data.fehlernummer) === '1') {
      clearSession()
      return eedRequest<T>(extra)
    }
    throw new Error(data.fehlermeldung || `EED error ${data.fehlernummer}`)
  }
  return data as T
}

// The API returns treffer as an object keyed by "1", "2", ... not a real array
function trefferToArray(treffer: unknown): ArticleHit[] {
  if (!treffer) return []
  if (Array.isArray(treffer)) return treffer as ArticleHit[]
  return Object.values(treffer as Record<string, unknown>) as ArticleHit[]
}

// ─── Public functions ─────────────────────────────────────────────────────────

export async function searchArticles(
  keyword: string,
  page = 1,
  perPage = 24
): Promise<SearchResult> {
  const data = await eedRequest<Record<string, unknown>>({
    art: 'artikelsuche',
    suchbg: keyword,
    anzahl: perPage,
    seite: page,
  })
  return {
    treffer: trefferToArray(data.treffer),
    gesamtanzahltreffer: Number(data.gesamtanzahltreffer ?? 0),
    trefferproseite: Number(data.trefferproseite ?? perPage),
    seite: Number(data.seite ?? page),
    anzahlseiten: Number(data.anzahlseiten ?? 1),
  }
}

export async function getArticleDetail(artnr: string): Promise<ArticleDetail> {
  const data = await eedRequest<Record<string, unknown>>({
    art: 'artikeldetails',
    artnr,
  })
  return data as unknown as ArticleDetail
}

export async function warmSession(): Promise<string> {
  return getSession()
}