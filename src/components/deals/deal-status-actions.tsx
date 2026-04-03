import { updateDealStatusAction } from "@/actions/deals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getDealStatusClass, getDealStatusLabel } from "@/lib/utils/deal";
import type { DealLifecycleStatus } from "@/types/domain";

type DealStatusActionsProps = {
  listingId: string;
  note: string;
  status: DealLifecycleStatus;
};

const primaryActions = [
  { label: "Saved", value: "saved" },
  { label: "Ignored", value: "ignored" },
  { label: "Contacted", value: "contacted" },
  { label: "Bought", value: "bought" }
] as const;

export function DealStatusActions({ listingId, note, status }: DealStatusActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground/65">Current status</p>
        <Badge className={getDealStatusClass(status)}>{getDealStatusLabel(status)}</Badge>
      </div>

      <form action={updateDealStatusAction} className="space-y-3">
        <input type="hidden" name="listingId" value={listingId} />
        <Textarea name="note" defaultValue={note} rows={4} placeholder="Internal note for your team" />
        <div className="grid gap-2 sm:grid-cols-2">
          {primaryActions.map((action) => (
            <Button
              key={action.value}
              type="submit"
              name="status"
              value={action.value}
              variant={status === action.value ? "primary" : "secondary"}
              className="w-full text-xs sm:text-sm"
            >
              {action.label}
            </Button>
          ))}
        </div>
        {status !== "new" && (
          <Button
            type="submit"
            name="status"
            value="new"
            variant="ghost"
            fullWidth
            className="text-xs text-foreground/45 hover:text-foreground/70"
          >
            Reset to New
          </Button>
        )}
        <p className="text-xs text-foreground/55">Click an action to save both status and note.</p>
      </form>
    </div>
  );
}
