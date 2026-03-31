import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-sm text-foreground placeholder:text-foreground/40 outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/30",
        className
      )}
      {...props}
    />
  );
}
