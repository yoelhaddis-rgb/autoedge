-- AutoEdge MVP schema for Supabase/Postgres
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  company_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.dealer_preferences (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.profiles(id) on delete cascade,
  preferred_brands text[] not null default '{}',
  preferred_models text[] not null default '{}',
  min_year int not null default 2015,
  max_mileage int not null default 180000,
  min_price int,
  max_price int,
  min_expected_profit int not null default 1000,
  fuel_types text[] not null default '{Petrol,Diesel,Hybrid}',
  transmissions text[] not null default '{Manual,Automatic}',
  monitoring_intensity text not null default 'balanced' check (monitoring_intensity in ('low', 'balanced', 'high')),
  selected_source_groups text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dealer_id)
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  source_url text not null,
  title text not null,
  brand text not null,
  model text not null,
  variant text not null default '',
  year int not null,
  mileage int not null,
  asking_price int not null,
  fuel text not null,
  transmission text not null,
  power_hp int not null,
  location text not null,
  seller_type text not null,
  description text not null,
  image_urls text[] not null default '{}',
  first_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (source, external_id)
);

create table if not exists public.valuations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  low_estimate int not null,
  median_estimate int not null,
  high_estimate int not null,
  expected_costs int not null,
  expected_profit int not null,
  confidence_score int not null check (confidence_score >= 0 and confidence_score <= 100),
  deal_score int not null check (deal_score >= 0 and deal_score <= 100),
  reasons text[] not null default '{}',
  risks text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (listing_id)
);

create table if not exists public.comparables (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  comparable_title text not null,
  comparable_price int not null,
  comparable_year int not null,
  comparable_mileage int not null,
  comparable_source text not null,
  comparable_url text not null
);

create table if not exists public.deal_statuses (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  status text not null check (status in ('new', 'saved', 'ignored', 'contacted', 'bought')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (dealer_id, listing_id)
);

create index if not exists idx_listings_first_seen on public.listings(first_seen_at desc);
create index if not exists idx_valuations_deal_score on public.valuations(deal_score desc);
create index if not exists idx_deal_statuses_dealer on public.deal_statuses(dealer_id);
create index if not exists idx_listings_brand_model on public.listings(brand, model);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_preferences_updated_at on public.dealer_preferences;
create trigger trg_preferences_updated_at
before update on public.dealer_preferences
for each row execute function public.handle_updated_at();

drop trigger if exists trg_statuses_updated_at on public.deal_statuses;
create trigger trg_statuses_updated_at
before update on public.deal_statuses
for each row execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.dealer_preferences enable row level security;
alter table public.listings enable row level security;
alter table public.valuations enable row level security;
alter table public.comparables enable row level security;
alter table public.deal_statuses enable row level security;

-- Profiles
drop policy if exists "profile_read_own" on public.profiles;
create policy "profile_read_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profile_upsert_own" on public.profiles;
create policy "profile_upsert_own"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- Dealer preferences
drop policy if exists "preferences_read_own" on public.dealer_preferences;
create policy "preferences_read_own"
on public.dealer_preferences
for select
using (auth.uid() = dealer_id);

drop policy if exists "preferences_write_own" on public.dealer_preferences;
create policy "preferences_write_own"
on public.dealer_preferences
for all
using (auth.uid() = dealer_id)
with check (auth.uid() = dealer_id);

-- Listings and analytics are globally visible to authenticated dealers
drop policy if exists "listings_read_authenticated" on public.listings;
create policy "listings_read_authenticated"
on public.listings
for select
using (auth.role() = 'authenticated');

drop policy if exists "listings_insert_authenticated" on public.listings;
create policy "listings_insert_authenticated"
on public.listings
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "listings_update_authenticated" on public.listings;
create policy "listings_update_authenticated"
on public.listings
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "valuations_read_authenticated" on public.valuations;
create policy "valuations_read_authenticated"
on public.valuations
for select
using (auth.role() = 'authenticated');

drop policy if exists "valuations_insert_authenticated" on public.valuations;
create policy "valuations_insert_authenticated"
on public.valuations
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "valuations_update_authenticated" on public.valuations;
create policy "valuations_update_authenticated"
on public.valuations
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "comparables_read_authenticated" on public.comparables;
create policy "comparables_read_authenticated"
on public.comparables
for select
using (auth.role() = 'authenticated');

drop policy if exists "comparables_insert_authenticated" on public.comparables;
create policy "comparables_insert_authenticated"
on public.comparables
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "comparables_delete_authenticated" on public.comparables;
create policy "comparables_delete_authenticated"
on public.comparables
for delete
using (auth.role() = 'authenticated');

-- Deal statuses are scoped to dealer
drop policy if exists "deal_statuses_read_own" on public.deal_statuses;
create policy "deal_statuses_read_own"
on public.deal_statuses
for select
using (auth.uid() = dealer_id);

drop policy if exists "deal_statuses_write_own" on public.deal_statuses;
create policy "deal_statuses_write_own"
on public.deal_statuses
for all
using (auth.uid() = dealer_id)
with check (auth.uid() = dealer_id);
