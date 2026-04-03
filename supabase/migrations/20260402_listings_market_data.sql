-- Add listing_type to distinguish user-submitted deals from market data ingested for comparables
ALTER TABLE listings
  ADD COLUMN listing_type TEXT NOT NULL DEFAULT 'deal'
    CHECK (listing_type IN ('deal', 'market_data'));

-- Existing rows are all 'deal' (the default covers them).
-- Fast scans when cleaning up stale market data:
CREATE INDEX idx_listings_type_first_seen
  ON listings (listing_type, first_seen_at DESC);
