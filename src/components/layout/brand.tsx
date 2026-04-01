import { cn } from "@/lib/utils/cn";

type BrandProps = {
  compact?: boolean;
  className?: string;
};

export function Brand({ compact = false, className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo mark: geometric diamond */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-lg bg-accent/10 ring-1 ring-accent/30" />
        <svg viewBox="0 0 24 24" fill="none" className="relative h-5 w-5" aria-hidden="true">
          <path
            d="M12 2L20 8.5V15.5L12 22L4 15.5V8.5L12 2Z"
            stroke="rgb(212 160 48)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M12 2L12 22M4 8.5L20 8.5M4 15.5L20 15.5" stroke="rgb(212 160 48)" strokeWidth="0.75" opacity="0.4" />
        </svg>
      </div>
      {!compact && (
        <div>
          <p className="font-display text-xl leading-none tracking-wider text-foreground">AUTOEDGE</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-accent/70">Dealer Intelligence</p>
        </div>
      )}
    </div>
  );
}
