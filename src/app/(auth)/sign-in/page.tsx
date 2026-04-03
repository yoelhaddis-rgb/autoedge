import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/actions/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  if (isSupabaseConfigured()) {
    const supabase = await createServerClient();
    const {
      data: { user }
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <Card className="w-full max-w-md space-y-5">
      <div>
        <p className="font-display text-4xl tracking-wide text-foreground">DEALER SIGN IN</p>
        <p className="mt-1 text-sm text-foreground/65">Access your AutoEdge deal intelligence dashboard.</p>
      </div>

      {params.message && <p className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">{params.message}</p>}
      {params.error && <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{params.error}</p>}

      <form action={signInAction} className="space-y-3">
        <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
        <div className="space-y-1">
          <label className="text-sm text-foreground/70" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" type="email" required placeholder="dealer@company.com" />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-foreground/70" htmlFor="password">
            Password
          </label>
          <Input id="password" name="password" type="password" required placeholder="********" />
        </div>

        <Button type="submit" fullWidth>
          Sign in
        </Button>
      </form>

      {!isSupabaseConfigured() && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          Supabase env vars are not set. App runs in demo data mode and auth is bypassed.
        </p>
      )}

      <p className="text-sm text-foreground/65">
        No account yet?{" "}
        <Link href="/sign-up" className="text-accent hover:text-accent/80">
          Create one
        </Link>
      </p>
    </Card>
  );
}
