-- Add scan metadata columns to dealer_preferences.
-- last_scan_at: timestamp of the most recent monitoring scan run.
-- last_scan_analyzed: number of new deals created by that scan.
ALTER TABLE public.dealer_preferences
  ADD COLUMN IF NOT EXISTS last_scan_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_scan_analyzed integer;
