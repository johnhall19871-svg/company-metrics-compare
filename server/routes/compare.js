import { Router } from 'express';
import { fetchCompanyMetrics } from '../metrics.js';

const router = Router();

/**
 * GET /api/compare?tickers=TSLA,AAPL,MSFT
 */
router.get('/', async (req, res) => {
  const raw = String(req.query.tickers || '')
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  const tickers = [...new Set(raw)].slice(0, 3);

  if (tickers.length === 0) {
    return res.status(400).json({ error: 'Provide at least one ticker via ?tickers=TSLA,AAPL' });
  }

  try {
    const results = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const metrics = await fetchCompanyMetrics(ticker);
          return { ok: true, ...metrics };
        } catch (err) {
          return {
            ok: false,
            ticker,
            error: err instanceof Error ? err.message : 'Failed to load metrics',
          };
        }
      })
    );

    res.json({ tickers, companies: results, fetchedAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Comparison failed';
    res.status(500).json({ error: message });
  }
});

export default router;
