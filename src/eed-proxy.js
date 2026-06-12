/**
 * api/eed-proxy.js
 *
 * Vercel serverless function — proxies requests to the Euras EED API.
 *
 * Key fix: shopurl MUST be the value registered for this test account ID.
 * The test account (AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZy) is registered with
 * shopurl = http://localhost:5173/ — sending any other URL returns HTTP 404.
 * We override it here server-side so the deployed domain doesn't break it.
 */

const EED_ID = process.env.VITE_EED_ID || 'AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZy'
// This must exactly match what the test account has registered with Euras
const REGISTERED_SHOP_URL = 'http://localhost:5173/'
const CUSTOMER_IP = 'f528764d624db129b32c21fbca0cb8d6'

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const params = url.searchParams

  // Force the shopurl to the registered value regardless of what the browser sent
  params.set('shopurl', encodeURIComponent(REGISTERED_SHOP_URL))
  params.set('customerip', CUSTOMER_IP)
  params.set('id', EED_ID)
  params.set('format', 'json')

  const targetUrl = `https://shop.euras.com/eed.php?${params.toString()}`

  console.log('[eed-proxy] →', targetUrl)

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'http://localhost:5173/',
      },
    })

    const text = await response.text()
    console.log('[eed-proxy] status:', response.status, '| preview:', text.slice(0, 120))

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(response.status).send(text)
  } catch (err) {
    console.error('[eed-proxy] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}