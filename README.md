# MegaPX - Profit Reality Calculator

A local-first, calm UI for dividend after-tax calculations and sell planning with CGT + fees. Built with Next.js App Router, Tailwind, Zustand, Dexie, Zod, and Recharts.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Core Routes

- `/` Dashboard (Dividend After Tax, Sell Planner, Compare)
- `/dividend` Dividend After-Tax module
- `/sell` Sell Planner module
- `/templates` Tax + Fee templates
- `/history` Saved scenarios
- `/settings` Theme, export/import, reset

## Keyboard Shortcuts

- `/` Focus global search
- `D` Go to Dividend module
- `S` Go to Sell Planner
- `C` Go to Compare (Dashboard)
- `Cmd/Ctrl + Enter` Save the current scenario

## Templates (Tax + Fee Profiles)

- **Tax Profiles** include dividend withholding rate and CGT slabs.
- **Fee Profiles** include percent-of-trade or fixed fees applied to buy/sell/both.
- Sample profiles are placeholders only — edit them for your broker and tax status.

## Import/Export Format

Exporting copies all scenarios and profiles as JSON. Importing merges by `id` and keeps the newest `updatedAt`.

```json
{
  "dividendScenarios": [],
  "sellScenarios": [],
  "taxProfiles": [],
  "feeProfiles": []
}
```

## Data Disclaimer

Enter rates based on your broker/tax status. Placeholders are not real rates.
