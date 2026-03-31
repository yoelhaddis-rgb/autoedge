"use server";

import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { asUpsertTable } from "@/lib/supabase/untyped";
import { ensureDealerProfileExists } from "@/lib/services/dealer-profile";

function getValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function signInAction(formData: FormData) {
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const nextPath = getValue(formData, "next") || "/dashboard";

  if (!email || !password) {
    redirect(`/sign-in?error=${encodeURIComponent("Email and password are required")}`);
  }

  if (!isSupabaseConfigured()) {
    redirect(nextPath);
  }

  const supabase = await createServerClient();

  if (!supabase) {
    redirect(`/sign-in?error=${encodeURIComponent("Supabase client unavailable")}`);
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  const signedInUserId = data.user?.id;
  if (signedInUserId) {
    await ensureDealerProfileExists(supabase, signedInUserId);
  }

  redirect(nextPath);
}

export async function signUpAction(formData: FormData) {
  const fullName = getValue(formData, "fullName");
  const companyName = getValue(formData, "companyName");
  const email = getValue(formData, "email");
  const password = getValue(formData, "password");

  if (!fullName || !companyName || !email || !password) {
    redirect(`/sign-up?error=${encodeURIComponent("All fields are required")}`);
  }

  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const supabase = await createServerClient();

  if (!supabase) {
    redirect(`/sign-up?error=${encodeURIComponent("Supabase client unavailable")}`);
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        company_name: companyName
      }
    }
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  const userId = data.user?.id;
  if (userId) {
    await asUpsertTable(supabase.from("profiles")).upsert(
      {
        id: userId,
        full_name: fullName,
        company_name: companyName,
        email
      },
      { onConflict: "id" }
    );
  }

  redirect(
    `/sign-in?message=${encodeURIComponent("Account created. Check your inbox if email confirmation is enabled.")}`
  );
}

export async function signOutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
