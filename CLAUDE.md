# Company Metrics Compare — Project Context

Read this file at the start of every session. It describes what this project is, what's built, and what's planned.

## What this is

A **browser web app** that compares key financial metrics for up to **3 US public companies** side by side. The user enters stock ticker symbols (e.g. `TSLA`, `AAPL`, `MSFT`) and sees a comparison table.

**GitHub:** https://github.com/johnhall19871-svg/company-metrics-compare

**Disclaimer:** Informational only — not investment advice.

---

## Current status

| Phase | Status | Scope |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | Forward P/E, gross margin, net margin, P/S, stock-based compensation |
| **Phase 2** | 🔲 Not started | Projected gross margins for next 4 quarters (analyst estimates) |
| **Phase 3** | 🔲 Not started | Polish — export CSV, sparklines, better error UX |

---

## Metrics (Phase 1)

| Metric | Implementation | FMP source |
|--------|----------------|------------|
| Forward P/E (12 mo) | `price / forwardEps` | `/quote` + `/analyst-estimates?period=annual` |
| Gross margin (last Q) | `grossProfitRatio` or `grossProfit/revenue` | `/income-statement?period=quarter&limit=1` |
| Net margin (last Q) | `netIncomeRatio` or `netIncome/revenue` | same income statement |
| Price / sales (TTM) | `priceToSalesRatioTTM` | `/ratios-ttm` |
| Stock-based compensation (last Q) | `stockBasedCompensation` | `/cash-flow-statement?period=quarter&limit=1` |

**Phase 2 note:** Analyst APIs typically provide revenue/EPS estimates, not gross margin forecasts. Phase 2 will need estimation logic or a premium data source — label estimated vs reported clearly in the UI.

---

## Tech stack

- **Runtime:** Node.js 18+ (ES modules — `"type": "module"` in package.json)
- **Backend:** Express (`server/`)
- **Frontend:** Vanilla HTML/CSS/JS (`public/`) — no React yet
- **Data:** [Financial Modeling Prep (FMP)](https://financialmodelingprep.com/developer/docs) **stable** API (`https://financialmodelingprep.com/stable/`)
- **Config:** `dotenv` — `FMP_API_KEY` and optional `PORT` (default 3001)

---

## Project layout

```
company-metrics-compare/
├── CLAUDE.md              ← this file (persistent AI context)
├── README.md              ← user-facing docs
├── .env.example           ← template (copy to .env)
├── .env                   ← gitignored — API key lives here
├── package.json
├── server/
│   ├── index.js           ← Express app, serves public/, mounts /api/*
│   ├── fmpClient.js       ← FMP fetch + 15-min in-memory cache
│   ├── metrics.js         ← fetchCompanyMetrics() — all metric logic
│   └── routes/
│       └── compare.js     ← GET /api/compare?tickers=TSLA,AAPL,MSFT
└── public/
    ├── index.html         ← 3 ticker inputs + compare form
    ├── styles.css
    └── app.js             ← calls /api/compare, renders table
```

---

## API endpoints

| Route | Purpose |
|-------|---------|
| `GET /api/compare?tickers=TSLA,AAPL,MSFT` | Compare 1–3 tickers; returns `{ tickers, companies[], fetchedAt }` |
| `GET /api/health` | `{ ok, apiKeyConfigured }` |
| `GET /` | Serves the frontend |

Each company in `companies[]` has `ok: true` with metrics, or `ok: false` with `error` for invalid tickers.

---

## Running locally

```powershell
cd "C:\Users\user\Desktop\claude code test"
npm install
copy .env.example .env   # then set FMP_API_KEY
npm run dev              # http://localhost:3001
```

FMP free tier: ~250 requests/day. The backend caches responses for 15 minutes to reduce API usage (~5 calls per ticker per compare).

---

## Development conventions

- **Keep scope minimal** — match existing vanilla JS + Express patterns; don't introduce React/frameworks unless asked.
- **Never commit `.env`** — only `.env.example` with placeholders.
- **US tickers only** for now (NYSE/NASDAQ). International symbols need separate handling.
- **Backend proxies FMP** — the browser never calls FMP directly (CORS + API key security).
- **Per-ticker errors are non-fatal** — one bad ticker shouldn't fail the whole comparison.
- **Only commit when the user asks** — they use GitHub for snapshots and revert.

---

## Git workflow

```powershell
git add .
git commit -m "Describe your change"
git push
```

Remote: `origin` → `https://github.com/johnhall19871-svg/company-metrics-compare.git` (branch: `master`).

---

## Original user requirements (full vision)

The user wants to compare companies on:

1. 12-month forward P/E (analyst forecasts) ✅ Phase 1
2. Current gross margin (last reported quarter) ✅ Phase 1
3. Projected gross margins (next 4 quarters) 🔲 Phase 2
4. Current net margin (last reported quarter) ✅ Phase 1
5. Price-to-sales ratio ✅ Phase 1
6. Stock-based compensation (from earnings reports) ✅ Phase 1

Data sources discussed: Yahoo Finance, company investor relations / SEC filings. **Current implementation uses FMP** (SEC-parsed data + analyst estimates) as the primary source.

---

## Files intentionally excluded from repo

- `.env` — secrets
- `node_modules/` — dependencies
- `tictactoe.html` — unrelated scratch file in workspace root
