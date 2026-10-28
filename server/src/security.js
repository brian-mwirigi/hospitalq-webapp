// Keys come from the environment, never from source code.
function validKeys() {
  return (process.env.API_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
}

export function apiKeyCount() {
  return validKeys().length;
}

export function requireApiKey(req, res, next) {
  const key = req.get('X-API-Key');
  if (!key || !validKeys().includes(key)) {
    return res.status(401).json({
      success: false,
      message: 'Missing or invalid API key',
      error: 'INVALID_API_KEY',
    });
  }
  req.apiKey = key;
  next();
}

const hits = new Map();

export function rateLimit(req, res, next) {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
  const max = Number(process.env.RATE_LIMIT_MAX) || 100;
  const id = req.apiKey || req.ip;
  const now = Date.now();
  let entry = hits.get(id);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    hits.set(id, entry);
  }

  entry.count += 1;

  if (entry.count > max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Too many requests',
      error: 'RATE_LIMITED',
      retryAfter,
    });
  }

  next();
}
