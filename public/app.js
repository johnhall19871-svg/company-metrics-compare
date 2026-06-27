const form = document.getElementById('compare-form');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const compareBtn = document.getElementById('compare-btn');

const METRICS = [
  {
    label: 'Forward P/E (12 mo)',
    note: 'Price ÷ next fiscal-year EPS consensus',
    get: (c) => (c.forwardPe != null ? `${c.forwardPe}x` : '—'),
    sub: (c) =>
      c.forwardEps != null
        ? `EPS est. ${c.forwardEps}${c.forwardEpsFiscalYearEnd ? ` · FY ending ${c.forwardEpsFiscalYearEnd}` : ''}`
        : null,
  },
  {
    label: 'Gross margin',
    note: 'Last reported quarter',
    get: (c) => (c.grossMarginPct != null ? `${c.grossMarginPct}%` : '—'),
    sub: (c) => (c.lastQuarterLabel ? `As of ${c.lastQuarterLabel}` : null),
  },
  {
    label: 'Net margin',
    note: 'Last reported quarter',
    get: (c) => (c.netMarginPct != null ? `${c.netMarginPct}%` : '—'),
    sub: (c) => (c.lastQuarterLabel ? `As of ${c.lastQuarterLabel}` : null),
  },
  {
    label: 'Price / sales',
    note: 'Trailing twelve months',
    get: (c) => (c.priceToSales != null ? `${c.priceToSales}x` : '—'),
    sub: () => 'TTM ratio',
  },
  {
    label: 'Stock-based compensation',
    note: 'Last reported quarter (cash flow)',
    get: (c) => c.stockBasedCompensationFormatted ?? '—',
    sub: (c) => (c.sbcQuarterLabel ? `As of ${c.sbcQuarterLabel}` : null),
  },
];

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function getTickers() {
  return [1, 2, 3]
    .map((n) => document.getElementById(`ticker-${n}`).value.trim().toUpperCase())
    .filter(Boolean);
}

function renderResults(data) {
  const companies = data.companies;
  const okCompanies = companies.filter((c) => c.ok);
  const colCount = companies.length;

  const headersHtml = companies
    .map((c) => {
      if (!c.ok) {
        return `
          <div class="company-header">
            <div class="ticker">${c.ticker}</div>
            <div class="name cell-error">${c.error}</div>
          </div>`;
      }
      return `
        <div class="company-header">
          <div class="ticker">${c.ticker}</div>
          <div class="name">${c.companyName}</div>
          <div class="price">${c.price != null ? `$${c.price.toFixed(2)}` : ''}</div>
        </div>`;
    })
    .join('');

  const rowsHtml = METRICS.map((metric) => {
    const cells = companies
      .map((c) => {
        if (!c.ok) {
          return `<td class="cell-error">—</td>`;
        }
        const value = metric.get(c);
        const sub = metric.sub(c);
        return `<td>${value}${sub ? `<span class="metric-note">${sub}</span>` : ''}</td>`;
      })
      .join('');

    return `
      <tr>
        <th>${metric.label}<span class="metric-note">${metric.note}</span></th>
        ${cells}
      </tr>`;
  }).join('');

  resultsEl.innerHTML = `
    <div class="company-headers cols-${colCount}">${headersHtml}</div>
    <div class="table-wrap">
      <table>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;

  resultsEl.classList.remove('hidden');

  const failed = companies.length - okCompanies.length;
  if (failed === 0) {
    setStatus(`Loaded ${okCompanies.length} ${okCompanies.length === 1 ? 'company' : 'companies'}.`);
  } else {
    setStatus(`Loaded ${okCompanies.length} of ${companies.length}; ${failed} failed.`, true);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tickers = getTickers();
  if (tickers.length === 0) {
    setStatus('Enter at least one ticker symbol.', true);
    return;
  }

  compareBtn.disabled = true;
  setStatus('Loading metrics…');
  resultsEl.classList.add('hidden');

  try {
    const res = await fetch(`/api/compare?tickers=${encodeURIComponent(tickers.join(','))}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    renderResults(data);
  } catch (err) {
    setStatus(err.message || 'Something went wrong.', true);
  } finally {
    compareBtn.disabled = false;
  }
});

fetch('/api/health')
  .then((r) => r.json())
  .then((data) => {
    if (!data.apiKeyConfigured) {
      setStatus(
        'API key not configured — copy .env.example to .env and add your FMP_API_KEY, then restart the server.',
        true
      );
    }
  })
  .catch(() => {});
