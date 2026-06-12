/**
 * api/eed-proxy.js
 *
 * Vercel serverless function that proxies all requests to the Euras EED API.
 * This is needed because:
 *  1. The Euras API does not send CORS headers, so direct browser fetch is blocked.
 *  2. Vercel edge rewrites are not true proxies and return 502 for external APIs.
 *
 * In local dev, Vite's server.proxy handles this instead (vite.config.ts).
 * In production (Vercel), requests to /api/eed-proxy hit this function.
 */

export default async function handler(req, res) {
  // Forward the full query string to the Euras API
  const query = req.url.split('?')[1] || ''
  const targetUrl = `https://shop.euras.com/eed.php${query ? '?' + query : ''}`

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    const text = await response.text()

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(response.status).send(text)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}