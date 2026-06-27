import { fmpFetch } from './fmpClient.js';

/**
 * @param {number | null | undefined} value
 * @param {number} [digits=1]
 */
function pct(value, digits = 1) {
  if (value == null || Number.isNaN(value)) return null;
  return Number((value * 100).toFixed(digits));
}

/**
 * @param {number | null | undefined} value
 * @param {number} [digits=2]
 */
function num(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return null;
  return Number(value.toFixed(digits));
}

/**
 * @param {number | null | undefined} value
 */
function formatLargeUsd(value) {
  if (value == null || Number.isNaN(value)) return null;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * @param {{ date?: string, period?: string, calendarYear?: number }} row
 */
function quarterLabel(row) {
  if (!row) return null;
  if (row.period && row.calendarYear) return `${row.period} ${row.calendarYear}`;
  if (row.period && row.date) {
    const year = row.date.slice(0, 4);
    return `${row.period} ${year}`;
  }
  if (row.date) {
    const d = new Date(`${row.date}T00:00:00Z`);
    const q = `Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
    return `${q} ${d.getUTCFullYear()}`;
  }
  return row.period || null;
}

/**
 * Pick the next fiscal-year EPS estimate on or after today.
 * @param {Array<{ date?: string, estimatedEpsAvg?: number, estimatedEps?: number }>} estimates
 */
function pickForwardEpsEstimate(estimates) {
  if (!Array.isArray(estimates) || estimates.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const future = estimates
    .filter((e) => e.date && e.date >= today)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const row = future[0] || estimates[0];
  const eps = row.estimatedEpsAvg ?? row.estimatedEps;
  if (eps == null || eps <= 0) return null;

  return { eps, fiscalYearEnd: row.date };
}

/**
 * @param {string} symbol
 */
export async function fetchCompanyMetrics(symbol) {
  const ticker = symbol.toUpperCase();

  const [quoteRows, incomeRows, cashFlowRows, ratioRows, estimateRows] = await Promise.all([
    fmpFetch(`/quote/${ticker}`),
    fmpFetch(`/income-statement/${ticker}`, { period: 'quarter', limit: 1 }),
    fmpFetch(`/cash-flow-statement/${ticker}`, { period: 'quarter', limit: 1 }),
    fmpFetch(`/ratios-ttm/${ticker}`),
    fmpFetch(`/analyst-estimates/${ticker}`, { period: 'annual', limit: 8 }),
  ]);

  const quote = Array.isArray(quoteRows) ? quoteRows[0] : null;
  if (!quote?.symbol) {
    throw new Error(`Unknown or invalid ticker: ${ticker}`);
  }

  const income = Array.isArray(incomeRows) ? incomeRows[0] : null;
  const cashFlow = Array.isArray(cashFlowRows) ? cashFlowRows[0] : null;
  const ratios = Array.isArray(ratioRows) ? ratioRows[0] : null;
  const estimates = Array.isArray(estimateRows) ? estimateRows : [];

  const price = quote.price ?? null;
  const forward = pickForwardEpsEstimate(estimates);
  const forwardPe =
    price != null && forward?.eps ? num(price / forward.eps, 1) : null;

  const grossMargin =
    income?.grossProfitRatio != null
      ? pct(income.grossProfitRatio)
      : income?.revenue && income?.grossProfit
        ? pct(income.grossProfit / income.revenue)
        : null;

  const netMargin =
    income?.netIncomeRatio != null
      ? pct(income.netIncomeRatio)
      : income?.revenue && income?.netIncome
        ? pct(income.netIncome / income.revenue)
        : null;

  const priceToSales =
    ratios?.priceToSalesRatioTTM ??
    ratios?.priceToSalesRatio ??
    null;

  const sbcRaw = cashFlow?.stockBasedCompensation ?? null;

  return {
    ticker,
    companyName: quote.name || ticker,
    price: num(price, 2),
    forwardPe,
    forwardEps: forward?.eps != null ? num(forward.eps, 2) : null,
    forwardEpsFiscalYearEnd: forward?.fiscalYearEnd ?? null,
    grossMarginPct: grossMargin,
    netMarginPct: netMargin,
    lastQuarterLabel: quarterLabel(income),
    lastQuarterDate: income?.date ?? null,
    priceToSales: num(priceToSales, 2),
    stockBasedCompensation: sbcRaw,
    stockBasedCompensationFormatted: formatLargeUsd(sbcRaw),
    sbcQuarterLabel: quarterLabel(cashFlow),
    dataAsOf: new Date().toISOString(),
  };
}
