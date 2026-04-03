import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/layout/brand";

const bullets = [
  { label: "Comparable-based valuations", detail: "Score every listing against real dealer inventory." },
  { label: "Profit-first analysis", detail: "Expected margin, holding cost, and risk in one view." },
  { label: "Preference-driven filtering", detail: "Your buying range applied automatically across the queue." }
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-amber-glow bg-grid bg-[size:32px_32px] lg:flex">
      {/* Left branded panel — desktop only */}
      <div className="hidden lg:flex lg:w-[420px] lg:flex-shrink-0 lg:flex-col lg:justify-between border-r border-white/10 bg-card/60 backdrop-blur-sm px-10 py-10">
        <div>
          <div className="h-0.5 w-12 bg-accent mb-8 rounded-full" />
          <Link href="/" className="block mb-10">
            <Brand />
          </Link>
          <p className="font-display text-5xl tracking-wide text-foreground leading-none mb-4">
            DEALER<br />INTELLIGENCE
          </p>
          <p className="text-sm text-foreground/55 max-w-xs">
            AutoEdge surfaces margin opportunities in used-car inventory — scored, ranked, and ready to act on.
          </p>

          <div className="mt-10 space-y-5">
            {bullets.map((b) => (
              <div key={b.label} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground/90">{b.label}</p>
                  <p className="text-xs text-foreground/45 mt-0.5">{b.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-foreground/30">AutoEdge · Deal intelligence for used-car dealers</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex lg:hidden items-center px-4 py-6 sm:px-6">
          <Link href="/">
            <Brand />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
