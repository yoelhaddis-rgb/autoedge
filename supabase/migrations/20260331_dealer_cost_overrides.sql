-- Configurable cost assumptions per dealer.
-- Nullable = null means "use engine default".

ALTER TABLE public.dealer_preferences
  ADD COLUMN IF NOT EXISTS recon_cost_base_override integer,
  ADD COLUMN IF NOT EXISTS daily_holding_cost_override integer,
  ADD COLUMN IF NOT EXISTS risk_buffer_base_override integer;
