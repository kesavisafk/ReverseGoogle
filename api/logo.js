module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.LOGODEV_PUBLISHABLE_KEY || '';
  if (!token) {
    res.status(500).json({ error: 'Missing LOGODEV_PUBLISHABLE_KEY environment variable' });
    return;
  }

  const domainRaw = typeof req.query.domain === 'string' ? req.query.domain.trim().toLowerCase() : '';
  const domain = domainRaw.replace(/[^a-z0-9.-]/g, '');
  if (!domain || !domain.includes('.')) {
    res.status(400).json({ error: 'A valid domain is required' });
    return;
  }

  const sizeRaw = Number.parseInt(typeof req.query.size === 'string' ? req.query.size : '64', 10);
  const size = Math.min(Math.max(Number.isFinite(sizeRaw) ? sizeRaw : 64, 16), 800);

  const formatRaw = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'webp';
  const format = ['webp', 'png', 'jpg'].includes(formatRaw) ? formatRaw : 'webp';

  const themeRaw = typeof req.query.theme === 'string' ? req.query.theme.toLowerCase() : 'auto';
  const theme = ['light', 'dark', 'auto'].includes(themeRaw) ? themeRaw : 'auto';

  const fallbackRaw = typeof req.query.fallback === 'string' ? req.query.fallback : '404';
  const fallback = fallbackRaw === '404' ? '404' : 'monogram';

  try {
    const logoUrl = new URL(`https://img.logo.dev/${domain}`);
    logoUrl.searchParams.set('token', token);
    logoUrl.searchParams.set('size', String(size));
    logoUrl.searchParams.set('format', format);
    logoUrl.searchParams.set('theme', theme);
    logoUrl.searchParams.set('fallback', fallback);
    logoUrl.searchParams.set('retina', 'true');

    const upstream = await fetch(logoUrl, { method: 'GET' });
    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const contentType = upstream.headers.get('content-type') || (format === 'png' ? 'image/png' : format === 'jpg' ? 'image/jpeg' : 'image/webp');
    const arrayBuffer = await upstream.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({
      error: 'Logo proxy error',
      detail: err && err.message ? err.message : String(err)
    });
  }
};
