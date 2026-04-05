"use client";

import { useEffect } from "react";

export default function DealerError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AutoEdge dealer error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Something went wrong</p>
      <p className="font-display text-4xl tracking-wide text-foreground">PAGE ERROR</p>
      <p className="max-w-sm text-sm text-foreground/50">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground/70 hover:bg-white/[0.08] transition"
      >
        Try again
      </button>
    </div>
  );
}
