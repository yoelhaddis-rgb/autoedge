import Link from "next/link";
import { signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;

  return (
    <Card className="w-full max-w-md space-y-5">
      <div>
        <p className="font-heading text-3xl text-foreground">Create dealer account</p>
        <p className="mt-1 text-sm text-foreground/65">Start scanning profitable opportunities with AutoEdge.</p>
      </div>

      {params.error && <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{params.error}</p>}

      <form action={signUpAction} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-foreground/70" htmlFor="fullName">
            Full name
          </label>
          <Input id="fullName" name="fullName" required placeholder="Alex de Vries" />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-foreground/70" htmlFor="companyName">
            Company name
          </label>
          <Input id="companyName" name="companyName" required placeholder="Edge Motors" />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-foreground/70" htmlFor="email">
            Work email
          </label>
          <Input id="email" name="email" type="email" required placeholder="team@edgemotors.nl" />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-foreground/70" htmlFor="password">
            Password
          </label>
          <Input id="password" name="password" type="password" minLength={6} required />
        </div>

        <Button type="submit" fullWidth>
          Create account
        </Button>
      </form>

      <p className="text-sm text-foreground/65">
        Already registered?{" "}
        <Link href="/sign-in" className="text-accent hover:text-accent/80">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
