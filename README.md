# Company Metrics Compare

A web app for comparing key financial metrics across up to three public companies by stock ticker symbol.

## Metrics compared

| Metric | Source |
|--------|--------|
| 12-month forward P/E (analyst consensus) | Financial API |
| Gross margin (last reported quarter) | SEC filings / income statement |
| Projected gross margins (next 4 quarters) | Analyst estimates (phase 2) |
| Net margin (last reported quarter) | SEC filings / income statement |
| Price-to-sales ratio | Financial API |
| Stock-based compensation (last quarter) | Cash flow statement |

## Project status

**Phase 1 — complete:** compare up to 3 tickers for forward P/E, gross margin, net margin, P/S, and stock-based compensation.

## Requirements

- [Node.js 18+](https://nodejs.org/) (includes npm)
- Free [Financial Modeling Prep](https://financialmodelingprep.com/developer/docs) API key

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure API key (free at https://financialmodelingprep.com/developer/docs)
copy .env.example .env
# Edit .env and set FMP_API_KEY=your_key

# 3. Run the app
npm run dev
```

Open **http://localhost:3001** in your browser, enter tickers (e.g. TSLA, AAPL, MSFT), and click **Compare**.

## Git workflow

This repo is connected to GitHub. To save your work:

```bash
git add .
git commit -m "Describe your change"
git push
```

To revert to a previous version, browse commit history on GitHub or run `git log` locally and `git checkout <commit>`.

## Disclaimer

This tool is for informational purposes only. Data may lag official filings. Not investment advice.
