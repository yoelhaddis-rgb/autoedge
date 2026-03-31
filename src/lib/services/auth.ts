import { createClient as createServerClient } from "@/lib/supabase/server";
import { DEMO_DEALER_ID } from "@/lib/data/mock";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ensureDealerProfileExists } from "@/lib/services/dealer-profile";

export type CurrentDealerContext = {
  dealerId: string;
  email: string;
  isDemo: boolean;
};

export async function getCurrentDealerContext(): Promise<CurrentDealerContext> {
  if (!isSupabaseConfigured()) {
    return {
      dealerId: DEMO_DEALER_ID,
      email: "demo@autoedge.app",
      isDemo: true
    };
  }

  const supabase = await createServerClient();

  if (!supabase) {
    return {
      dealerId: DEMO_DEALER_ID,
      email: "demo@autoedge.app",
      isDemo: true
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      dealerId: DEMO_DEALER_ID,
      email: "demo@autoedge.app",
      isDemo: true
    };
  }

  await ensureDealerProfileExists(supabase, user.id);

  return {
    dealerId: user.id,
    email: user.email ?? "dealer@autoedge.app",
    isDemo: false
  };
}
