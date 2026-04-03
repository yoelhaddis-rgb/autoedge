import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  displayTitle?: boolean;
};

export function SectionHeader({ eyebrow, title, description, action, displayTitle }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs uppercase tracking-[0.24em] text-accent/90">{eyebrow}</p>}
        <h2 className={displayTitle ? "font-display text-4xl tracking-wide text-foreground sm:text-5xl" : "font-heading text-3xl font-semibold text-foreground sm:text-4xl"}>
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-foreground/65">{description}</p>
      </div>
      {action}
    </div>
  );
}
