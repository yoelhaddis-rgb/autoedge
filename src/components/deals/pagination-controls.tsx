import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClassName } from "@/components/ui/button";

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
};

export function PaginationControls({ page, pageSize, total, buildHref }: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between text-sm text-foreground/60">
      <span>
        {from}–{to} van {total} resultaten
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className={buttonClassName({ variant: "secondary", className: "gap-1.5" })}
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige
          </Link>
        ) : (
          <span
            className={buttonClassName({ variant: "secondary", className: "cursor-not-allowed gap-1.5 opacity-40" })}
            aria-disabled="true"
          >
            <ChevronLeft className="h-4 w-4" />
            Vorige
          </span>
        )}
        <span className="px-2">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className={buttonClassName({ variant: "secondary", className: "gap-1.5" })}
          >
            Volgende
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className={buttonClassName({ variant: "secondary", className: "cursor-not-allowed gap-1.5 opacity-40" })}
            aria-disabled="true"
          >
            Volgende
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
