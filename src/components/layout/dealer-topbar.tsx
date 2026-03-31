import Link from "next/link";
import { LogOut, User2 } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DealerTopbarProps = {
  email: string;
  isDemo: boolean;
};

export function DealerTopbar({ email, isDemo }: DealerTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1019]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <p className="font-heading text-base text-foreground">AutoEdge Console</p>
          {isDemo && <Badge className="border-warning/40 bg-warning/15 text-warning">Demo Data Mode</Badge>}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/deals" className="text-sm text-foreground/70 hover:text-foreground">
            Live Opportunities
          </Link>
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 md:flex">
            <User2 className="h-4 w-4 text-foreground/50" />
            <span className="text-sm text-foreground/80">{email}</span>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
