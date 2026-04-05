import Link from "next/link";
import { ArrowUpRight, ScanSearch, Settings2 } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

export function DashboardEmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-16 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <ScanSearch className="h-6 w-6 text-accent/70" />
      </div>

      <h2 className="font-display text-3xl tracking-wide text-foreground">NO DEALS YET</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-foreground/50">
        AutoEdge needs two things to find profitable opportunities for you: your buying preferences and at
        least one market scan. Follow the steps below to get started.
      </p>

      <div className="mx-auto mt-10 grid max-w-lg gap-4 text-left sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent/60">Step 1</p>
          <p className="font-heading text-base font-semibold text-foreground">Set your preferences</p>
          <p className="mt-1 text-sm text-foreground/50">
            Tell AutoEdge which brands, models, and price ranges you buy. This shapes every scan and valuation.
          </p>
          <Link
            href="/settings"
            className={buttonClassName({ variant: "secondary", className: "mt-4 gap-2 text-xs" })}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Open settings
          </Link>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent/60">Step 2</p>
          <p className="font-heading text-base font-semibold text-foreground">Run your first scan</p>
          <p className="mt-1 text-sm text-foreground/50">
            AutoEdge scans AutoScout24 and Marktplaats against your preferences and returns ranked, valued
            opportunities.
          </p>
          <Link
            href="/scans"
            className={buttonClassName({ className: "mt-4 gap-2 text-xs" })}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Go to scans
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-foreground/30">
        You can also{" "}
        <Link href="/deals/analyze" className="underline underline-offset-2 hover:text-foreground/50 transition-colors">
          analyze a vehicle manually
        </Link>{" "}
        by pasting its URL or entering the details directly.
      </p>
    </div>
  );
}
