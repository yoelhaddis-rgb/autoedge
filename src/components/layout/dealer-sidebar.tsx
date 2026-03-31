"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import { dealerNavItems } from "@/lib/constants/nav";
import { cn } from "@/lib/utils/cn";

export function DealerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 border-r border-white/10 bg-[#090f19] px-5 py-6 lg:block">
      <Brand className="mb-8" />

      <nav className="space-y-2">
        {dealerNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-accent/20 text-accent"
                  : "text-foreground/70 hover:bg-white/10 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-foreground/70">
        <p className="mb-2 font-medium text-foreground">Edge Feed</p>
        <p>New listings are scored every 30 minutes. Connect scrapers in `src/lib/services/scraper-pipeline.ts`.</p>
      </div>
    </aside>
  );
}
