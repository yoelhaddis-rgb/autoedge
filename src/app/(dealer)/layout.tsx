import type { ReactNode } from "react";
import Link from "next/link";
import { DealerSidebar } from "@/components/layout/dealer-sidebar";
import { DealerTopbar } from "@/components/layout/dealer-topbar";
import { Brand } from "@/components/layout/brand";
import { getCurrentDealerContext } from "@/lib/services/auth";

export default async function DealerLayout({ children }: { children: ReactNode }) {
  const context = await getCurrentDealerContext();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <DealerSidebar />

      <div className="min-w-0">
        <div className="border-b border-white/10 px-4 py-4 lg:hidden">
          <Link href="/dashboard">
            <Brand compact />
          </Link>
        </div>

        <DealerTopbar email={context.email} isDemo={context.isDemo} />

        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
