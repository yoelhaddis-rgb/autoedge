-- Audit trail for deal status changes.
-- Records every status transition per dealer+listing.

CREATE TABLE IF NOT EXISTS public.deal_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  old_status text,            -- null on first creation
  new_status text NOT NULL,
  note text NOT NULL DEFAULT '',
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_listing
  ON public.deal_status_history(listing_id, changed_at DESC);

ALTER TABLE public.deal_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers see own history"
  ON public.deal_status_history
  FOR ALL
  USING (auth.uid() = dealer_id);
