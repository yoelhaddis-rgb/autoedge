"use client";

import { useActionState } from "react";
import { ingestListingsAction, type IngestActionState } from "@/actions/ingest";
import { Button } from "@/components/ui/button";
import type { MarketDataCount } from "@/lib/services/market-ingest";

function MarketDataRow({ brand, model, count }: MarketDataCount) {
  const [state, action, pending] = useActionState<IngestActionState, FormData>(
    ingestListingsAction,
    null
  );
  const displayCount = state?.success === true ? count + state.result.inserted : count;

  return (
    <form
      action={action}
      className="flex items-center justify-between gap-4 border-b border-border/30 py-2.5 last:border-0"
    >
      <input type="hidden" name="brand" value={brand} />
      <input type="hidden" name="model" value={model} />
      <div className="text-sm">
        <p className="font-medium text-foreground">
          {brand} {model}
        </p>
        <p className="mt-0.5 text-xs">
          {displayCount === 0 ? (
            <span className="text-amber-400/80">No data — monitoring scan will skip this model</span>
          ) : (
            <span className="text-foreground/45">{displayCount.toLocaleString("nl-NL")} comparable listings</span>
          )}
        </p>
        {state?.success === true && (
          <p className="mt-0.5 text-xs text-foreground/45">
            {state.result.inserted} new · {state.result.updated} updated
          </p>
        )}
        {state?.success === false && (
          <p className="mt-0.5 text-xs text-red-400">{state.error}</p>
        )}
      </div>
      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="shrink-0 px-3 py-1.5 text-xs"
      >
        {pending ? "Fetching…" : "Refresh"}
      </Button>
    </form>
  );
}

export function MarketDataPanel({ counts }: { counts: MarketDataCount[] }) {
  if (counts.length === 0) {
    return (
      <p className="text-sm text-foreground/40">
        Set preferred brands and models above to manage market data.
      </p>
    );
  }
  return (
    <div>
      {counts.map((item) => (
        <MarketDataRow key={`${item.brand}||${item.model}`} {...item} />
      ))}
    </div>
  );
}
