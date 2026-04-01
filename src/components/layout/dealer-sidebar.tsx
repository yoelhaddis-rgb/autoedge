"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { dealerNavItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";

export function DealerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-border/50 bg-background lg:flex">
      {/* Subtle amber line at top */}
      <div className="h-px w-full bg-gradient-to-r from-accent/50 via-accent/20 to-transparent" />

      <div className="flex flex-1 flex-col px-5 py-6">
        <Brand className="mb-10" />

        <nav className="space-y-0.5">
          {dealerNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/50 hover:bg-white/[0.05] hover:text-foreground/90"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-accent" : "text-foreground/35 group-hover:text-foreground/60")} />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom info panel */}
        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-accent/10 bg-accent/[0.03] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent/70">Edge Feed</p>
            <p className="text-xs leading-relaxed text-foreground/40">
              Listings are scored on analysis. Connect source connectors to activate live feed.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
