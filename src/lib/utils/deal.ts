import type { DealLifecycleStatus } from "@/types/domain";

export function getDealScoreLabel(score: number): "High Potential" | "Interesting" | "Moderate" | "Risk" {
  if (score >= 80) return "High Potential";
  if (score >= 60) return "Interesting";
  if (score >= 40) return "Moderate";
  return "Risk";
}

export function getDealScoreClass(score: number): string {
  if (score >= 80) return "bg-success/20 text-success border-success/40";
  if (score >= 60) return "bg-accent/20 text-accent border-accent/40";
  if (score >= 40) return "bg-warning/20 text-warning border-warning/40";
  return "bg-danger/20 text-danger border-danger/40";
}

export function calculateProfit(medianEstimate: number, askingPrice: number, expectedCosts: number): number {
  return Math.round(medianEstimate - askingPrice - expectedCosts);
}

export function getDealStatusLabel(status: DealLifecycleStatus): string {
  switch (status) {
    case "saved":
      return "Saved";
    case "ignored":
      return "Ignored";
    case "contacted":
      return "Contacted";
    case "bought":
      return "Bought";
    case "new":
    default:
      return "New";
  }
}

export function getDealStatusClass(status: DealLifecycleStatus): string {
  switch (status) {
    case "saved":
      return "border-accent/40 bg-accent/15 text-accent";
    case "ignored":
      return "border-danger/35 bg-danger/10 text-danger";
    case "contacted":
      return "border-warning/35 bg-warning/15 text-warning";
    case "bought":
      return "border-success/35 bg-success/15 text-success";
    case "new":
    default:
      return "border-white/15 bg-white/10 text-foreground/80";
  }
}

export function getConfidenceLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 75) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

export function getConfidenceClass(score: number): string {
  if (score >= 75) return "border-success/35 bg-success/10 text-success";
  if (score >= 50) return "border-warning/35 bg-warning/10 text-warning";
  return "border-danger/35 bg-danger/10 text-danger";
}
