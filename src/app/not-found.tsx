import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-card p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-foreground/50">404</p>
        <h1 className="font-heading mt-3 text-3xl text-foreground">Deal not found</h1>
        <p className="mt-2 text-foreground/65">The listing may have been removed or your filters no longer include it.</p>
        <Link href="/deals" className={buttonClassName({ className: "mt-6" })}>
          Back to deals
        </Link>
      </div>
    </main>
  );
}
