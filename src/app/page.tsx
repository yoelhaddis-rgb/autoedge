import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Clock3, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { SectionHeader } from "@/components/marketing/section-header";
import { buttonClassName } from "@/components/ui/button";

const valuePoints = [
  {
    title: "Discover underpriced cars faster",
    description: "AutoEdge surfaces valuation opportunities where expected margin beats your floor.",
    icon: Clock3
  },
  {
    title: "Analyze opportunities with clarity",
    description: "Every listing shows market range, costs, confidence and risk in one panel.",
    icon: ChartNoAxesCombined
  },
  {
    title: "Scale with selective monitoring",
    description: "Targeted watchlists keep monitoring costs low while focusing on the right segments.",
    icon: ShieldCheck
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-spotlight bg-grid bg-[size:36px_36px]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Brand />
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-foreground/70 hover:text-foreground">
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonClassName()}>
            Start free
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-accent">
            B2B Deal Intelligence for Car Dealers
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            Value used cars with confidence before you buy.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-foreground/70">
            AutoEdge combines dealer inventory snapshots, comparables, and a valuation engine to estimate market range
            and expected profit for each opportunity.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/sign-up" className={buttonClassName({ className: "gap-2" })}>
              Create dealer account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className={buttonClassName({ variant: "secondary" })}>
              Open dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {valuePoints.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Icon className="mb-2 h-5 w-5 text-accent" />
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-foreground/60">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="From listing to decision in under 60 seconds"
          description="AutoEdge combines listing data, valuation logic and dealership preferences into one operational workflow."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
            <p className="mb-2 text-sm text-accent">01</p>
            <p className="font-heading text-xl text-foreground">Ingest listings</p>
            <p className="mt-2 text-foreground/65">
              Pull vehicle inventory from selected dealer source groups into a single normalized feed.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
            <p className="mb-2 text-sm text-accent">02</p>
            <p className="font-heading text-xl text-foreground">Score opportunities</p>
            <p className="mt-2 text-foreground/65">
              Estimate market range, expected costs and margin. AutoEdge highlights top opportunities and key risks.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
            <p className="mb-2 text-sm text-accent">03</p>
            <p className="font-heading text-xl text-foreground">Act immediately</p>
            <p className="mt-2 text-foreground/65">
              Save analyses, mark status, and open the original source listing in one click.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Key features"
          title="Built for dealers who optimize margin daily"
          description="Compact interfaces for fast scanning, clear analysis, and confident buying decisions."
        />
        <FeatureGrid />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing preview"
          title="Start small and scale by dealership volume"
          description="Simple plans for independent dealers and dealer groups."
        />
        <PricingPreview />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-accent/35 bg-accent/10 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-heading text-2xl text-foreground">Ready to find better deals, faster?</p>
            <p className="mt-1 text-foreground/70">Reduce wasted time on weak listings and focus on profitable inventory.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/sign-up" className={buttonClassName()}>
              Start your free trial
            </Link>
            <Link href="/dashboard" className={buttonClassName({ variant: "secondary" })}>
              View dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-2 px-4 text-sm text-foreground/55 sm:flex-row sm:px-6 lg:px-8">
          <p>AutoEdge - Deal intelligence for used-car dealers.</p>
          <p>Designed for speed, margin and risk clarity.</p>
        </div>
      </footer>
    </main>
  );
}
