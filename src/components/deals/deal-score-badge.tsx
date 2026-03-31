import { Badge } from "@/components/ui/badge";
import { getDealScoreClass } from "@/lib/utils/deal";

type DealScoreBadgeProps = {
  score: number;
  label: string;
};

export function DealScoreBadge({ score, label }: DealScoreBadgeProps) {
  return <Badge className={getDealScoreClass(score)}>{label}</Badge>;
}
