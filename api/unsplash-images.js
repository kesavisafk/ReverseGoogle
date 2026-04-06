module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const queryRaw = req.query.query;
  const countRaw = req.query.count;

  const query = typeof queryRaw === 'string' && queryRaw.trim() ? queryRaw.trim() : 'random';
  const parsedCount = Number.parseInt(typeof countRaw === 'string' ? countRaw : '6', 10);
  const count = Math.min(Math.max(Number.isFinite(parsedCount) ? parsedCount : 6, 1), 20);

  const accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
  if (!accessKey) {
    res.status(500).json({ error: 'Missing UNSPLASH_ACCESS_KEY environment variable' });
    return;
  }

  try {
    const apiUrl = new URL('https://api.unsplash.com/search/photos');
    apiUrl.searchParams.set('query', query);
    apiUrl.searchParams.set('per_page', String(count));
    apiUrl.searchParams.set('orientation', 'landscape');
    apiUrl.searchParams.set('content_filter', 'high');

    const upstream = await fetch(apiUrl, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1'
      }
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({ error: 'Unsplash request failed', detail });
      return;
    }

    const payload = await upstream.json();
    const images = (payload.results || [])
      .map((item) => item && item.urls && item.urls.small)
      .filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({
      error: 'Proxy error',
      detail: err && err.message ? err.message : String(err)
    });
  }
};
