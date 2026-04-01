-- Add valuation_source column to valuations table.
-- Tracks whether a valuation was derived from real comparable listings
-- ("comparable_based") or the Dutch market heuristic baseline ("model_based").
-- Existing rows default to "comparable_based" as a safe assumption.

ALTER TABLE public.valuations
  ADD COLUMN IF NOT EXISTS valuation_source text NOT NULL DEFAULT 'comparable_based';
