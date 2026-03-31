import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/layout/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-spotlight bg-grid bg-[size:32px_32px]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/">
          <Brand />
        </Link>
      </div>
      <div className="mx-auto flex max-w-6xl items-start justify-center px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
