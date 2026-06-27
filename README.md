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

**Phase 1 — in progress:** repository and GitHub setup complete; app implementation coming next.

## Quick start

```bash
# 1. Install dependencies (once backend is added)
npm install

# 2. Configure API key
cp .env.example .env
# Edit .env and add your FMP_API_KEY

# 3. Run the dev server (once implemented)
npm run dev
```

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
