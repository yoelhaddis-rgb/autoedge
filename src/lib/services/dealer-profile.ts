import { createClient as createServerClient } from "@/lib/supabase/server";
import { asUpsertTable } from "@/lib/supabase/untyped";

type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createServerClient>>>;

function safeMetadataText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function ensureDealerProfileExists(
  supabase: ServerSupabase,
  dealerId: string
): Promise<void> {
  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", dealerId)
    .maybeSingle();

  if (profileReadError) {
    throw new Error(`Unable to verify dealer profile: ${profileReadError.message}`);
  }

  if (existingProfile) return;

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Unable to resolve authenticated user: ${userError.message}`);
  }

  if (!user) {
    throw new Error("Authenticated user not found while creating dealer profile.");
  }

  if (user.id !== dealerId) {
    throw new Error("Authenticated user does not match dealer context.");
  }

  const email = user.email?.trim();
  if (!email) {
    throw new Error("Authenticated user has no email address.");
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const defaultName = email.split("@")[0] || "AutoEdge Dealer";
  const fullName = safeMetadataText(metadata.full_name) || defaultName;
  const companyName = safeMetadataText(metadata.company_name) || "AutoEdge Dealer";

  const profileUpsert = await asUpsertTable(supabase.from("profiles")).upsert(
    {
      id: user.id,
      full_name: fullName,
      company_name: companyName,
      email
    },
    { onConflict: "id" }
  );

  if (profileUpsert.error) {
    throw new Error(`Unable to create dealer profile: ${profileUpsert.error.message}`);
  }
}
