/**
 * api/eed-proxy.js
 *
 * Vercel serverless function — proxies requests to the Euras EED API.
 *
 * DYNAMIC ACCOUNT SUPPORT:
 * Set these in Vercel Dashboard → Settings → Environment Variables:
 *   EED_ID       — your real Euras account ID
 *   EED_SHOP_URL — the shopurl registered with your account (e.g. https://yourshop.com/)
 *
 * If EED_ID is set, the proxy always calls the real API (no mock fallback).
 * If not set, it tries the test account and falls back to mock data.
 */

// Server-side env vars — set in Vercel, not exposed to the browser
const EED_ID = process.env.EED_ID || 'AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZy'
const EED_SHOP_URL = process.env.EED_SHOP_URL || 'http://localhost:5173/'
const IS_REAL_ACCOUNT = !!process.env.EED_ID

const MOCK_ARTICLES = {
  SONY: [
    { artikelnummer: "1-492-803-19", artikelbezeichnung: "Sony Fernbedienung RM-ED011", ekpreis: "12.50", artikelhersteller: "SONY", lieferzeit: "2-3 Tage", lieferzeit_in_tagen: 3, bild: "N", bestellbar: "J" },
    { artikelnummer: "A-1998-398-A", artikelbezeichnung: "Sony Netzkabel AC-E0520E", ekpreis: "8.90", artikelhersteller: "SONY", lieferzeit: "1-2 Tage", lieferzeit_in_tagen: 2, bild: "N", bestellbar: "J" },
    { artikelnummer: "X-2581-366-1", artikelbezeichnung: "Sony Lautsprecher Einheit", ekpreis: "34.99", artikelhersteller: "SONY", lieferzeit: "3-5 Tage", lieferzeit_in_tagen: 5, bild: "N", bestellbar: "J" },
    { artikelnummer: "1-474-477-11", artikelbezeichnung: "Sony Kondensator 1000uF", ekpreis: "3.20", artikelhersteller: "SONY", lieferzeit: "2-4 Tage", lieferzeit_in_tagen: 4, bild: "N", bestellbar: "J" },
    { artikelnummer: "A-2058-671-A", artikelbezeichnung: "Sony Hauptplatine KDL-32", ekpreis: "89.00", artikelhersteller: "SONY", lieferzeit: "5-7 Tage", lieferzeit_in_tagen: 7, bild: "N", bestellbar: "J" },
    { artikelnummer: "1-789-023-11", artikelbezeichnung: "Sony Backlight Inverter", ekpreis: "22.50", artikelhersteller: "SONY", lieferzeit: "2-3 Tage", lieferzeit_in_tagen: 3, bild: "N", bestellbar: "J" },
  ],
  AEG: [
    { artikelnummer: "140112710019", artikelbezeichnung: "AEG Türdichtung Waschmaschine", ekpreis: "18.70", artikelhersteller: "AEG", lieferzeit: "2-3 Tage", lieferzeit_in_tagen: 3, bild: "N", bestellbar: "J" },
    { artikelnummer: "1113330116", artikelbezeichnung: "AEG Pumpenfilter L60260FL", ekpreis: "6.50", artikelhersteller: "AEG", lieferzeit: "1-2 Tage", lieferzeit_in_tagen: 2, bild: "N", bestellbar: "J" },
    { artikelnummer: "4055478894", artikelbezeichnung: "AEG Schlauch Ablauf", ekpreis: "11.20", artikelhersteller: "AEG", lieferzeit: "3-4 Tage", lieferzeit_in_tagen: 4, bild: "N", bestellbar: "J" },
    { artikelnummer: "140194018017", artikelbezeichnung: "AEG Kohlebürsten Motor", ekpreis: "7.80", artikelhersteller: "AEG", lieferzeit: "2-3 Tage", lieferzeit_in_tagen: 3, bild: "N", bestellbar: "J" },
    { artikelnummer: "1366052006", artikelbezeichnung: "AEG Laugenpumpe 30W", ekpreis: "28.40", artikelhersteller: "AEG", lieferzeit: "4-6 Tage", lieferzeit_in_tagen: 6, bild: "N", bestellbar: "J" },
  ],
  HDMI: [
    { artikelnummer: "KDL-HDMI-001", artikelbezeichnung: "HDMI Anschluss Buchse Typ A", ekpreis: "4.99", artikelhersteller: "DIVERSE", lieferzeit: "1-3 Tage", lieferzeit_in_tagen: 3, bild: "N", bestellbar: "J" },
    { artikelnummer: "KDL-HDMI-002", artikelbezeichnung: "HDMI Kabel 2.0 High Speed 2m", ekpreis: "9.90", artikelhersteller: "DIVERSE", lieferzeit: "1-2 Tage", lieferzeit_in_tagen: 2, bild: "N", bestellbar: "J" },
    { artikelnummer: "KDL-HDMI-003", artikelbezeichnung: "HDMI Adapter Buchse auf Stecker", ekpreis: "3.50", artikelhersteller: "DIVERSE", lieferzeit: "2-3 Tage", lieferzeit_in_tagen: 3, bild: "N", bestellbar: "J" },
    { artikelnummer: "KDL-HDMI-004", artikelbezeichnung: "HDMI Switch 3-Port 4K", ekpreis: "14.99", artikelhersteller: "DIVERSE", lieferzeit: "2-4 Tage", lieferzeit_in_tagen: 4, bild: "N", bestellbar: "J" },
  ]
}

function getMockResults(keyword, page, perPage) {
  const key = Object.keys(MOCK_ARTICLES).find(k => keyword.toUpperCase().includes(k))
  const all = key ? MOCK_ARTICLES[key] : []
  const start = (page - 1) * perPage
  const treffer = all.slice(start, start + perPage)
  const trefferObj = {}
  treffer.forEach((item, i) => { trefferObj[String(i + 1)] = item })
  return {
    fehlernummer: "0",
    treffer: trefferObj,
    gesamtanzahltreffer: String(all.length),
    trefferproseite: String(perPage),
    seite: String(page),
    anzahlseiten: String(Math.max(1, Math.ceil(all.length / perPage)))
  }
}

function getMockSession() {
  return { fehlernummer: "0", sessionid: "mock-session-" + Date.now() }
}

function getMockDetail(artnr) {
  const all = Object.values(MOCK_ARTICLES).flat()
  const article = all.find(a => a.artikelnummer === artnr) || all[0]
  return {
    fehlernummer: "0",
    ...article,
    artikeltext: "Originalersatzteil. Passend für verschiedene Modelle. Bitte Artikelnummer vor dem Kauf prüfen.",
    technischedaten: "Originalersatzteil des Herstellers",
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const params = url.searchParams
  const art = params.get('art')
  const keyword = params.get('suchbg') || ''
  const page = parseInt(params.get('seite') || '1')
  const perPage = parseInt(params.get('anzahl') || '24')
  const artnr = params.get('artnr') || ''

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Try the real API
  try {
    params.set('shopurl', encodeURIComponent(EED_SHOP_URL))
    params.set('customerip', 'f528764d624db129b32c21fbca0cb8d6')
    params.set('id', EED_ID)
    params.set('format', 'json')

    const targetUrl = `https://shop.euras.com/eed.php?${params.toString()}`
    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': EED_SHOP_URL,
      },
    })

    if (response.ok) {
      const text = await response.text()
      if (text.trim().startsWith('{')) {
        console.log('[eed-proxy] real API success')
        return res.status(200).send(text)
      }
    }

    // If real account is set but API failed, return the error — don't silently mock
    if (IS_REAL_ACCOUNT) {
      return res.status(502).json({ error: 'Real API call failed. Check EED_ID and EED_SHOP_URL env vars.' })
    }
  } catch (err) {
    if (IS_REAL_ACCOUNT) {
      return res.status(502).json({ error: err.message })
    }
  }

  // Fall back to mock data (test account only)
  console.log('[eed-proxy] falling back to mock data')
  if (art === 'neuesitzung') return res.status(200).json(getMockSession())
  if (art === 'artikelsuche') return res.status(200).json(getMockResults(keyword, page, perPage))
  if (art === 'artikeldetails') return res.status(200).json(getMockDetail(artnr))

  return res.status(200).json({ fehlernummer: "99", fehlermeldung: "Unknown action" })
}