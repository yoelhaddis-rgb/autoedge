import Link from "next/link";
import { LogOut, User2 } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dealerNavItems } from "@/lib/constants/nav";

type DealerTopbarProps = {
  email: string;
  isDemo: boolean;
};

export function DealerTopbar({ email, isDemo }: DealerTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/90 backdrop-blur-md">
      {/* Amber accent line */}
      <div className="h-px w-full bg-gradient-to-r from-accent/40 via-accent/10 to-transparent" />
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <p className="font-display text-base tracking-widest text-foreground/80">CONSOLE</p>
          {isDemo && (
            <Badge className="border-warning/30 bg-warning/8 text-warning/80 text-[10px] tracking-wider">
              DEMO MODE
            </Badge>
          )}
          {/* Mobile nav — visible below lg where sidebar is hidden */}
          <nav className="flex items-center gap-1 lg:hidden">
            {dealerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground/50 transition hover:bg-white/[0.06] hover:text-foreground/90"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-border/50 bg-white/[0.03] px-3 py-1.5 md:flex">
            <User2 className="h-3.5 w-3.5 text-foreground/30" />
            <span className="text-xs text-foreground/55">{email}</span>
          </div>

          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="gap-1.5 text-xs text-foreground/40 hover:text-foreground/80">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
