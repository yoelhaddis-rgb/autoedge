# AutoEdge

AutoEdge is een B2B SaaS-platform voor autodealers dat voertuigen analyseert op basis van marktwaarde, vergelijkbare dealerlistings en verwachte marge.

Deze MVP is bewust **valuation-first** gebouwd:

- marktwaarde-inschatting
- vergelijkbare voertuigen
- expected profit
- risicoduiding
- dealer-dashboard workflow

## Nieuwe productrichting

AutoEdge richt zich nu primair op:

1. een valuation engine op basis van geselecteerde dealer-inventory bronnen
2. vergelijkbare listings en prijsrange-analyse
3. marge-gestuurde beslissingen voor inkopers
4. voorbereidende architectuur voor later: selective monitoring i.p.v. full-market live scraping

## Waarom niet continu heel Marktplaats/marketplaces scrapen?

Volledige, continue marketplace-monitoring is vaak:

- duur
- operationeel zwaar
- slecht schaalbaar voor een vroege MVP
- inefficiënt omdat maar een klein percentage echt interessante kansen oplevert

Daarom is AutoEdge bewust opgezet als:

- valuation platform
- comparable analysis tool
- selective monitoring ready

## Huidige MVP scope

De app bevat:

- Landing page
- Sign in / sign up (Supabase Auth)
- Beschermde dealer-routes
- Dashboard met valuation KPI’s
- Deals-overzicht als valuation opportunities
- Handmatige `Analyze Vehicle` workflow (`/deals/analyze`)
- Deal detail als kernanalyse-pagina
- Saved analyses
- Settings met dealer voorkeuren + monitoring controls (UI-first)
- Realistische mock/seed data
- Voorbereide service-interfaces voor source connectors, monitoring en deep analysis

## Kernlogica

Per listing toont AutoEdge o.a.:

- asking price
- market value range (low / median / high)
- expected costs
- expected profit
- deal score
- confidence score
- redenen (why interesting)
- risico’s
- comparable dealer listings

Formule:

```ts
expected_profit = median_estimate - asking_price - expected_costs;
```

Deal score categorieën:

- 80-100: High Potential
- 60-79: Interesting
- 40-59: Moderate
- <40: Risk

## Projectstructuur

```txt
autoedge/
  supabase/
    schema.sql
    seed.sql
  scripts/
    seed.ts
  src/
    app/
      (auth)/
        sign-in/page.tsx
        sign-up/page.tsx
      (dealer)/
        dashboard/page.tsx
        deals/page.tsx
        deals/analyze/page.tsx
        deals/[id]/page.tsx
        saved/page.tsx
        settings/page.tsx
    actions/
      analyze.ts
      auth.ts
      deals.ts
      settings.ts
    components/
      deals/*
      layout/*
      marketing/*
      ui/*
    lib/
      data/
        mock.ts
        mappers.ts
      services/
        analysis-service.ts
        deals.ts
        preferences.ts
        source-connectors.ts
        monitoring-service.ts
        valuation-engine.ts
        deep-analysis-pipeline.ts
        scraper-pipeline.ts
      supabase/*
      utils/*
    types/
      domain.ts
      database.ts
```

## Datamodel (MVP)

Belangrijkste tabellen:

- `profiles`
- `dealer_preferences`
- `listings` (met `asking_price`)
- `valuations`
- `comparables`
- `deal_statuses`

Nieuw in preferences:

- `monitoring_intensity`
- `selected_source_groups`

## Nieuwe schemawijzigingen (voor deze stap)

De code verwacht nu expliciet:

1. `listings.asking_price` (i.p.v. `price`)
2. `dealer_preferences.monitoring_intensity`
3. `dealer_preferences.selected_source_groups`
4. RLS insert/update policies voor:
   - `listings`
   - `valuations`
   - `comparables`

Voer `supabase/schema.sql` opnieuw uit in Supabase SQL Editor om het schema en policies te synchroniseren.

## Analyze Vehicle workflow (echt MVP pad)

Route: `/deals/analyze`

Flow:

1. Dealer vult voertuigdata in (merk, model, jaar, km, vraagprijs, etc.)
2. Listing wordt opgeslagen in `listings`
3. Valuation engine zoekt vergelijkbare voertuigen in bestaande inventory
4. Engine berekent:
   - `low_estimate`
   - `median_estimate`
   - `high_estimate`
   - `expected_costs`
   - `expected_profit`
   - `confidence_score`
   - `deal_score`
5. Resultaat wordt opgeslagen in `valuations`
6. Geselecteerde vergelijkers worden opgeslagen in `comparables`
7. Dealer-note wordt opgeslagen via `deal_statuses.note`
8. UI redirectt naar de nieuwe deal detail pagina

## Mock data en seeding

De MVP bevat realistische mock/seed data met o.a. BMW, Audi, Volkswagen, Mercedes, Toyota, Ford, Skoda en Peugeot.

Inbegrepen:

- 26 listings
- valuations per listing
- comparables per listing
- verschillende score/confidence/profit scenario’s
- statusworkflow (saved, ignored, contacted, bought)

Seeden:

```bash
npm run seed
```

Demo login (na seed):

- `demo@autoedge.app`
- `AutoEdgeDemo123!`

## Lokaal draaien

1. Installeer dependencies:

```bash
npm install
```

2. Maak env-bestand:

```bash
cp .env.example .env.local
```

3. Vul `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start app:

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Wat is al gebouwd?

- Valuation-first UI en flows
- Supabase-backed analyze workflow met echte writes naar `listings`, `valuations` en `comparables`
- Dashboard met expected profit / high confidence / saved analyses
- Deal analysepagina met sections:
  - Why this looks interesting
  - Main risks
  - Comparable dealer listings
- Settings voor voorkeuren + monitoring-intensiteit + bron-groepen
- Service abstractions voor toekomstige uitbreiding

## Wat moet nog gebouwd worden?

- Echte dealer source connectors (per website/provider)
- Productie-waardige valuation engine (betere vergelijkingslogica)
- Selective monitoring jobs met planning/frequentie per dealer
- Deep analysis verrijking (taal/risico-analyse op beschrijvingen)
- Ranking-feedback loop op basis van dealer outcomes

## Architectuur voor volgende fases

### Fase 1 (nu)

- valuation MVP
- comparables
- profit-based dashboard

### Fase 2

- targeted source connectors
- selective watchlists
- monitoring per voorkeursegment

### Fase 3

- deep analysis pipeline
- verbeterde confidence calibration
- semi-live candidate detection op geselecteerde segmenten

## Productfilosofie

AutoEdge probeert bewust **niet** alles tegelijk te doen.

Wel:

- snel waarde leveren aan dealers
- marge en risico zichtbaar maken
- schaalbare basis bouwen

Niet:

- full-market scraping op hoge frequentie
- dure infrastructuur zonder bewezen core value

AutoEdge is daarmee expliciet:

**valuation-first, selective-monitoring next.**
