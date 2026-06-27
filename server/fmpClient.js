const FMP_BASE = 'https://financialmodelingprep.com/api/v3';
const CACHE_TTL_MS = 15 * 60 * 1000;

/** @type {Map<string, { expires: number, data: unknown }>} */
const cache = new Map();

function getApiKey() {
  const key = process.env.FMP_API_KEY;
  if (!key || key === 'your_api_key_here') {
    throw new Error(
      'FMP_API_KEY is not configured. Copy .env.example to .env and add your key from https://financialmodelingprep.com/developer/docs'
    );
  }
  return key;
}

/**
 * @param {string} path - e.g. "/quote/AAPL"
 * @param {Record<string, string | number>} [params]
 */
export async function fmpFetch(path, params = {}) {
  const apiKey = getApiKey();
  const search = new URLSearchParams({ ...params, apikey: apiKey });
  const url = `${FMP_BASE}${path}?${search}`;

  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`FMP request failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  cache.set(url, { data, expires: Date.now() + CACHE_TTL_MS });
  return data;
}

export function clearCache() {
  cache.clear();
}
