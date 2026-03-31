-- Add optional min/max price range support for dealer preferences.
alter table public.dealer_preferences
  add column if not exists min_price int;

alter table public.dealer_preferences
  alter column max_price drop not null,
  alter column max_price drop default;

-- Ensure range values remain sensible even when written outside the UI flow.
alter table public.dealer_preferences
  drop constraint if exists dealer_preferences_min_price_non_negative,
  add constraint dealer_preferences_min_price_non_negative
    check (min_price is null or min_price >= 0);

alter table public.dealer_preferences
  drop constraint if exists dealer_preferences_max_price_non_negative,
  add constraint dealer_preferences_max_price_non_negative
    check (max_price is null or max_price >= 0);

alter table public.dealer_preferences
  drop constraint if exists dealer_preferences_price_range_valid,
  add constraint dealer_preferences_price_range_valid
    check (min_price is null or max_price is null or min_price <= max_price);
