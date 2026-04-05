import Link from "next/link";
import type { ScanSummary } from "@/lib/services/deals";
import { formatCurrency } from "@/lib/utils/format";

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 2) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function ScanSummaryCard({ summary }: { summary: ScanSummary }) {
  if (!summary.lastScanAt) {
    return (
      <p className="mb-3 text-sm text-foreground/45">No scan has been run yet. Use the button below to start.</p>
    );
  }

  const relativeTime = formatRelativeTime(summary.lastScanAt);
  const analyzed = summary.lastScanAnalyzed ?? 0;

  return (
    <div className="mb-3 space-y-1">
      <p className="text-sm text-foreground/60">
        Last scan: <span className="text-foreground/80">{relativeTime}</span>
        {analyzed > 0 && (
          <>
            {" · "}
            <span className="text-foreground/80">{analyzed} deal{analyzed === 1 ? "" : "s"} analyzed</span>
          </>
        )}
      </p>
      {summary.profitableCount > 0 && summary.topProfit !== null ? (
        <p className="text-sm text-foreground/60">
          <span className="text-emerald-400 font-medium">{summary.profitableCount} profitable opportunit{summary.profitableCount === 1 ? "y" : "ies"}</span>
          {" · "}best{" "}
          <span className="text-foreground/80">{formatCurrency(summary.topProfit)}</span>
          {" · "}
          <Link href="/scans" className="text-accent underline underline-offset-2 hover:text-accent/80">
            View results →
          </Link>
        </p>
      ) : (
        <p className="text-sm text-foreground/45">No profitable results from your latest scan.</p>
      )}
    </div>
  );
}
