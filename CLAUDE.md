# AutoEdge — CLAUDE.md

## Project overview

AutoEdge is a valuation-first B2B SaaS platform for Dutch used-car dealers. It helps dealers identify profitable acquisition opportunities by analyzing asking prices against comparable dealer listings, expected costs, and deal scores.

The core loop: dealer submits a vehicle → engine finds comparables → valuation + profit estimate is produced → dealer tracks it through a lifecycle (new → saved → contacted → bought).

## Tech stack

- **Framework**: Next.js 15 (App Router, server actions, server components)
- **Database**: Supabase (PostgreSQL + Row-Level Security)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict)

## Architecture

```
src/
  app/
    (auth)/          # sign-in, sign-up pages
    (dealer)/        # protected dealer routes
      dashboard/
      deals/         # deal list, analyze, [id] detail
      saved/
      settings/
  actions/           # Next.js server actions (analyze, auth, deals, settings, ingest)
  components/
    deals/           # DealCard, DealsTable, DealsFilters, DealStatusActions, etc.
    layout/          # sidebar, nav
    ui/              # Button, Card, Input, Badge, Select, etc.
  lib/
    data/
      mock.ts        # mock listings, valuations, comparables, preferences
      mappers.ts     # DB row → domain type mappers
    services/
      analysis-service.ts     # orchestrates vehicle analysis + Supabase writes
      valuation-engine.ts     # ComparableInventoryValuationEngine + cost estimates
      deals.ts                # getDeals, getDealDetail, upsertDealStatus, getDealStatusHistory
      preferences.ts          # getDealerPreferences, upsertDealerPreferences
      dutch-market-baseline.ts # heuristic fallback when no comparables exist
      market-ingest.ts        # ingestMarketListings(brand, model) — writes market_data rows
      source-connectors.ts    # DealerSourceConnector interface + SourceConnectorRegistry
      connectors/
        autoscout24-connector.ts  # AutoScout24 NL fetcher + __NEXT_DATA__ parser
    supabase/        # client, server, env helpers
    utils/           # deal scoring labels, formatting, vehicle-suggestions fuzzy match
  types/
    domain.ts        # all domain interfaces (Listing, Valuation, DealOverview, etc.)
    database.ts      # Supabase DB row types (mirrors schema.sql)
supabase/
  schema.sql         # full DB schema + RLS policies (source of truth)
  migrations/        # incremental ALTER TABLE migrations
  seed.sql           # demo seed data
scripts/
  seed.ts               # TypeScript seed script (npm run seed)
  ingest-golf.ts        # one-off validation: ingest VW Golf from AutoScout24 → verify DB
  test-comparables.ts   # e2e test: ingest 5 models + assert comparableCount >= 3 for each
```

## Key domain concepts

- **DealOverview**: listing + valuation + dealer status + note + freshness — the main list item
- **DealDetail**: DealOverview + comparables array — the detail page
- **ValuationSource**: `"comparable_based"` (real market data) | `"model_based"` (Dutch heuristic fallback)
- **DealScore**: 0–100. ≥80 = High Potential, 60–79 = Interesting, 40–59 = Moderate, <40 = Risk
- **DealLifecycleStatus**: `new | saved | contacted | ignored | bought`
- **listing_type**: `"deal"` (manually-analyzed vehicle) | `"market_data"` (AutoScout24 ingested for comparables)

## Valuation engine

`ComparableInventoryValuationEngine` in `valuation-engine.ts`:

1. Finds comparable listings in Supabase (strict → relaxed query fallback)
2. **Comparable pool is `listing_type = 'market_data'` rows only** — manually-analyzed deals are excluded
3. Scores similarity by year distance, mileage, price, fuel, transmission
4. Computes `low/median/highEstimate` from comparable percentiles
5. Falls back to `dutchMarketBaselineEstimate()` when no comparables exist (marks as `model_based`)
6. Estimates costs: `reconCosts + holdingCost + riskBuffer` — all overridable per dealer via `DealerCostOverrides`
7. Returns `ComputedValuation` with scores, reasons, risks, and `valuationSource`

Cost assumption defaults (overridable in Settings):
- Recon base: €620
- Daily holding: €12 + 0.06% of asking price
- Risk buffer base: €220

## Market data ingestion (Phase 2)

AutoScout24 NL is the live market data source. The ingestion pipeline:

1. `AutoScout24Connector.fetchInventory(query)` — fetches pages 1–5 of search results (`sort=standard`), extracts `__NEXT_DATA__` JSON, normalizes fuel/transmission to domain types, returns `Listing[]` with `listingType: "market_data"`
2. `ingestMarketListings(brand, model)` — calls connector, upserts rows in batches of 20, returns `{ inserted, updated, skipped }`
3. `ingestListingsAction` — auth-gated server action; blocks demo mode

**One-off validation script:**
```bash
npx tsx --env-file .env.local scripts/ingest-golf.ts
```
Fetches VW Golf, upserts to Supabase, verifies rows, prints result counts.

**Key rules:**
- Market data rows have `listing_type = 'market_data'`, manually-analyzed deals have `listing_type = 'deal'`
- Comparables queries filter strictly on `listing_type = 'market_data'`
- Market data rows never appear in the Deals list (no `deal_statuses` entry)
- Deduplication via `UNIQUE(source, external_id)` + upsert `onConflict: "external_id,source"`

## Mock vs Supabase data

The app auto-detects which mode to use:

- **No Supabase config** → uses mock data from `mock.ts` (demo mode)
- **Supabase configured** → reads/writes real DB; returns empty array on errors (never mixes mock into prod)

Mock data includes 26 listings with valuations, comparables, and deal statuses.

## Constraints — what NOT to do

- **No monitoring service activation** — `monitoring-service.ts` and `scraper-pipeline.ts` are prepared stubs, not active
- **No mock data in production flows** — if Supabase is configured but a query fails, return empty, not mock
- **Do not include `listing_type = 'deal'` rows in comparable queries** — this creates circular valuation

## Development commands

```bash
npm run dev      # start dev server on localhost:3000
npm run build    # production build
npm run seed     # seed Supabase with demo data (requires .env.local)
npx tsx --env-file .env.local scripts/ingest-golf.ts       # validate AutoScout24 ingest pipeline
npx tsx --env-file .env.local scripts/test-comparables.ts  # e2e comparable return test (5 models)
```

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Database

Run `supabase/schema.sql` in the Supabase SQL Editor to initialize or re-sync the schema. Incremental migrations live in `supabase/migrations/`.

Current migrations applied:
- `20260329_dealer_preferences_price_range.sql` — min/max price columns on dealer_preferences
- `20260331_valuations_source.sql` — valuation_source column on valuations
- `20260331_deal_status_history.sql` — audit trail table for status changes
- `20260331_dealer_cost_overrides.sql` — cost override columns on dealer_preferences
- `20260402_listings_market_data.sql` — listing_type column + index on listings

## Completed improvements (all shipped)

1. Expanded vehicle catalog (~120 entries, 30 brands) in `vehicle-suggestions.ts`
2. ValuationSource visible in UI — amber badge on deal card, warning banner on detail page
3. Inline form errors in analyze wizard via `useActionState` — no redirect on failure
4. Dealer preferences filter the deals list as soft defaults (URL params override)
5. Pagination on deals page — 20 per page, URL-driven
6. Audit trail for deal status changes — `deal_status_history` table + timeline on detail page
7. Configurable cost overrides per dealer — recon, holding, risk buffer in Settings
8. Phase 2: AutoScout24 NL market data ingestion — `listing_type` column, connector, ingest service, server action
9. Fix: comparable selection now filters `listing_type = 'market_data'` only — manual deals excluded from comparable pool
10. Fix: AutoScout24 connector updated for new nested `__NEXT_DATA__` structure (vehicle/price/vehicleDetails objects); `sort=standard`; 5 pages; always stores canonical `modelSlug` as model field
11. Fix: pinned `@supabase/supabase-js@2.49.8` — v2.100.x bundled postgrest-js v2 with breaking type changes that caused `never` types on all `.from()` calls and blocked the build
12. Fix: ingest/test scripts use `async function main()` pattern — avoids top-level await CJS error under Node.js v24
