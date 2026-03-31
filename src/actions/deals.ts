"use server";

import { revalidatePath } from "next/cache";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { upsertDealStatus } from "@/lib/services/deals";
import type { DealLifecycleStatus } from "@/types/domain";

function sanitizeStatus(value: string): DealLifecycleStatus {
  const allowed: DealLifecycleStatus[] = ["new", "saved", "ignored", "contacted", "bought"];
  if (allowed.includes(value as DealLifecycleStatus)) {
    return value as DealLifecycleStatus;
  }
  return "new";
}

export async function updateDealStatusAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const status = sanitizeStatus(String(formData.get("status") ?? "new"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);

  if (!listingId) return;

  const context = await getCurrentDealerContext();
  await upsertDealStatus({
    dealerId: context.dealerId,
    listingId,
    status,
    note
  });

  revalidatePath("/dashboard");
  revalidatePath("/deals");
  revalidatePath(`/deals/${listingId}`);
  revalidatePath("/saved");
}
