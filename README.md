# MegaPX - Profit Reality Calculator

A local-first toolkit for dividend, sell, and portfolio planning with a PSX daily-price backend API.

## Install

```bash
npm install
```

## Run (Web + API)

```bash
npm run dev
```

This starts:
- Web: http://localhost:3000
- API: http://localhost:8787

### Run individually

```bash
npm run dev:web
npm run dev:api
```

## Ingest Daily Prices (Mock first)

```bash
npm run ingest
```

By default, the ingest uses the mock provider and seeds 60 days of data for LUCK, MLCF, SYS.

### Switch to PSX provider

Create `apps/api/.env` with:

```
PORT=8787
DATABASE_URL="file:./prisma/dev.db"
WEB_ORIGIN="http://localhost:5173"
DATA_PROVIDER=psx
PSX_PORTAL_SYMBOLS_URL="https://your-psx-portal/symbols.json"
PSX_PORTAL_PRICES_URL="https://your-psx-portal/daily-prices?date={date}"
```

Then run ingest again. The PSX provider accepts JSON or CSV feeds. JSON should be an array
of records (or `{ data: [...] }`) with keys like `symbol`, `name`, `sector`, `open`, `high`,
`low`, `close`, `volume`, and `value`. CSV headers are normalized to lowercase/underscores
so `Symbol`, `Company Name`, `Closing Price`, etc. work as well.

## API Endpoints

- `GET /api/health`
- `GET /api/symbols?q=`
- `GET /api/quote/:symbol`
- `GET /api/history/:symbol?from=YYYY-MM-DD&to=YYYY-MM-DD`

### Example Responses

**Health**
```json
{ "ok": true, "time": "2026-02-02T12:00:00.000Z" }
```

**Quote**
```json
{ "id": 1, "symbol": "LUCK", "date": "2026-02-01T00:00:00.000Z", "close": 852.3 }
```

**History**
```json
[{ "id": 1, "symbol": "LUCK", "date": "2026-01-01T00:00:00.000Z", "close": 840.5 }]
```

## Frontend Market Page

Open `/market` to test the local PSX API integration. It searches symbols, shows the latest close, and lists the last 30 closes.

## Troubleshooting

- Reset DB: delete `apps/api/prisma/dev.db` and run `npx prisma migrate dev` in `apps/api`.
- Prisma generate: `npm --prefix apps/api run prisma:generate`
- If the API port is blocked, change `PORT` in `apps/api/.env`.

## Core Routes

- `/` Dashboard (tool hub)
- `/tools` Core tools (Dividend After Tax, Sell Planner, Compare)
- `/market` Market lookup (local API)
- `/goal` Monthly Contribution to 2030 Goal calculator
- `/risk` Position Sizing + Risk Guardrail calculator
- `/inflation` Inflation calculator (Pakistan)
- `/templates` Tax + Fee templates
- `/history` Saved scenarios
- `/settings` Theme, export/import, reset

## Keyboard Shortcuts

- `/` Focus global search
- `D` Go to Dividend module (Tools)
- `S` Go to Sell Planner (Tools)
- `C` Go to Compare (Tools)
- `Cmd/Ctrl + Enter` Save the current scenario

## Templates (Tax + Fee Profiles)

- **Tax Profiles** include dividend withholding rate and CGT slabs.
- **Fee Profiles** include percent-of-trade or fixed fees applied to buy/sell/both.
- Sample profiles are placeholders only — edit them for your broker and tax status.

## Additional Calculators

- **Monthly Contribution to 2030 Goal**: projects a future value curve, required monthly contribution, and inflation-adjusted targets.
- **Position Sizing + Risk Guardrail**: estimates safe allocation limits and suggests next actions based on exposure rules.
- **Inflation (Pakistan)**: estimates future cost and purchasing power erosion.
