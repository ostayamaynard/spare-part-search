/**
 * api/eed-proxy.js
 * Vercel serverless function — proxies requests to the Euras EED API.
 */

export default async function handler(req, res) {
  // Vercel passes the full URL including query string in req.url
  // but the path part will be /api/eed-proxy, so we just need the query string
  const url = new URL(req.url, 'http://localhost')
  const queryString = url.searchParams.toString()

  const targetUrl = `https://shop.euras.com/eed.php${queryString ? '?' + queryString : ''}`

  console.log('[eed-proxy] forwarding to:', targetUrl)

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://shop.euras.com/',
      },
    })

    const text = await response.text()
    console.log('[eed-proxy] response status:', response.status, '| body preview:', text.slice(0, 100))

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(response.status).send(text)
  } catch (err) {
    console.error('[eed-proxy] fetch error:', err)
    res.status(500).json({ error: err.message })
  }
}