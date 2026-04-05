"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowUpRight } from "lucide-react";
import { runMonitoringScanAction, type MonitoringScanState } from "@/actions/monitor";
import { Button } from "@/components/ui/button";

export function ScanTrigger({ intensity }: { intensity: string }) {
  const [state, action, pending] = useActionState<MonitoringScanState, FormData>(
    runMonitoringScanAction,
    null
  );

  return (
    <form action={action} className="flex items-start justify-between gap-4">
      <div className="text-sm">
        <p className="font-medium text-foreground">Market scan</p>
        <p className="text-xs text-foreground/45 mt-0.5">
          Finds new listings matching your preferences · intensity: {intensity}
        </p>
        {state?.success === false && (
          <p className="mt-1 text-xs text-red-400">{state.error}</p>
        )}
        {state?.success === true && (
          <span className="mt-1 flex items-center gap-3">
            <span className="text-xs text-foreground/55">
              {state.result.analyzed} new · {state.result.skipped} skipped
              {state.result.overCap > 0 && ` · ${state.result.overCap} not processed (run again)`}
              {state.result.errors > 0 && ` · ${state.result.errors} failed`}
            </span>
            <Link
              href="/scans"
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-accent/70 hover:text-accent transition-colors"
            >
              View results
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </span>
        )}
      </div>
      <Button type="submit" disabled={pending} className="shrink-0 px-3 py-1.5 text-xs">
        {pending ? "Scanning…" : "Run scan"}
      </Button>
    </form>
  );
}
