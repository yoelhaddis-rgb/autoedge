import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/30",
        className
      )}
      {...props}
    />
  );
}
