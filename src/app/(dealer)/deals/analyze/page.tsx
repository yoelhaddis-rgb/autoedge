import Link from "next/link";
import { ArrowLeft, Database, ScanSearch } from "lucide-react";
import { AnalyzeVehicleWizard } from "@/components/deals/analyze-vehicle-wizard";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AnalyzeVehiclePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AnalyzeVehiclePage({ searchParams }: AnalyzeVehiclePageProps) {
  const params = await searchParams;
  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Manual valuation</p>
          <h1 className="font-display mt-1 text-5xl tracking-wide text-foreground">ANALYZE VEHICLE</h1>
          <p className="mt-2 text-sm text-foreground/45">
            Enter a vehicle manually and AutoEdge will calculate valuation, profit potential, and comparable coverage.
          </p>
        </div>
        <Link href="/deals" className={buttonClassName({ variant: "secondary", className: "gap-2" })}>
          <ArrowLeft className="h-4 w-4" />
          Back to deals
        </Link>
      </div>

      {params.error && (
        <Card className="border-danger/40 bg-danger/10">
          <p className="text-sm text-danger">{params.error}</p>
        </Card>
      )}

      {!supabaseReady && (
        <Card className="border-warning/40 bg-warning/10">
          <p className="text-sm text-warning">
            Supabase is not configured. Add `NEXT_PUBLIC_SUPABASE_URL` and
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` and restart `npm run dev`.
          </p>
        </Card>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <AnalyzeVehicleWizard supabaseReady={supabaseReady} />
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="font-heading text-xl text-foreground">What happens on submit</p>
            <p className="mt-1 text-sm text-foreground/60">AutoEdge runs a full valuation flow against stored inventory.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm text-foreground">
              <Database className="h-4 w-4 text-accent" />
              Supabase write flow
            </p>
            <p className="text-sm text-foreground/65">
              The listing is saved first, then valuation/comparables are generated and stored in `valuations` and
              `comparables`.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-2 inline-flex items-center gap-2 text-sm text-foreground">
              <ScanSearch className="h-4 w-4 text-accent" />
              Comparable matching
            </p>
            <p className="text-sm text-foreground/65">
              Comparables are selected nationwide by brand/model, year, mileage, fuel and transmission, with relaxed
              fallback matching when coverage is low. Location remains a soft context signal.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
