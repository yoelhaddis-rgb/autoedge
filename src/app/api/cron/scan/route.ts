import { createAdminClient } from "@/lib/supabase/admin";
import { getDealerPreferences } from "@/lib/services/preferences";
import { runMonitoringScan } from "@/lib/services/monitoring-runner";
import { sendScanDigest } from "@/lib/services/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const supabase = createAdminClient();

  const { data: prefRows, error: prefError } = await supabase
    .from("dealer_preferences")
    .select("dealer_id");

  if (prefError) {
    console.error("AutoEdge cron: failed to load dealer_preferences", prefError.message);
    return Response.json({ ok: false, error: prefError.message }, { status: 500 });
  }

  if (!prefRows || prefRows.length === 0) {
    return Response.json({ ok: true, dealers: 0 });
  }

  const dealerIds = prefRows.map((r) => r.dealer_id);

  // Fetch emails from auth.users via admin client
  const emailMap = new Map<string, string>();
  for (const dealerId of dealerIds) {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(dealerId);
      if (userData?.user?.email) {
        emailMap.set(dealerId, userData.user.email);
      }
    } catch {
      // Non-fatal — skip email for this dealer
    }
  }

  const results: { dealerId: string; analyzed: number; profitable: number; emailed: boolean }[] = [];

  for (const dealerId of dealerIds) {
    let analyzed = 0;
    let profitableCount = 0;
    let emailed = false;

    try {
      const preferences = await getDealerPreferences(dealerId, supabase);

      if (!preferences.preferredBrands.length && !preferences.preferredModels.length) {
        continue;
      }

      const scanResult = await runMonitoringScan(dealerId, preferences, supabase);
      analyzed = scanResult.analyzed;

      if (analyzed > 0) {
        // Query deals added in the last 2 hours for this dealer with positive profit
        const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const { data: recentDeals } = await supabase
          .from("deal_statuses")
          .select("listing_id, updated_at")
          .eq("dealer_id", dealerId)
          .gte("updated_at", since);

        if (recentDeals && recentDeals.length > 0) {
          const listingIds = recentDeals.map((d) => d.listing_id);
          const { data: valuations } = await supabase
            .from("valuations")
            .select("listing_id, expected_profit")
            .in("listing_id", listingIds)
            .gt("expected_profit", 0)
            .order("expected_profit", { ascending: false });

          if (valuations && valuations.length > 0) {
            profitableCount = valuations.length;
            const email = emailMap.get(dealerId);

            if (email) {
              const topListingIds = valuations.slice(0, 3).map((v) => v.listing_id);
              const { data: topListings } = await supabase
                .from("listings")
                .select("id, title")
                .in("id", topListingIds);

              const topDeals = valuations.slice(0, 3).map((v) => {
                const listing = topListings?.find((l) => l.id === v.listing_id);
                return {
                  title: listing?.title ?? v.listing_id,
                  profit: v.expected_profit
                };
              });

              try {
                await sendScanDigest({
                  to: email,
                  profitableCount,
                  topDeals,
                  scansUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://autoedge.app"}/scans`
                });
                emailed = true;
              } catch (emailErr) {
                console.error("AutoEdge cron: failed to send email to", email, emailErr);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("AutoEdge cron: error processing dealer", dealerId, err);
    }

    results.push({ dealerId, analyzed, profitable: profitableCount, emailed });
  }

  return Response.json({ ok: true, dealers: results.length, results });
}
