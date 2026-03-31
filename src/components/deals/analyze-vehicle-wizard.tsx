"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CarFront, CheckCircle2, CircleHelp, PencilLine } from "lucide-react";
import { analyzeVehicleAction } from "@/actions/analyze";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getBrandAutocompleteOptions,
  getModelAutocompleteOptions,
  suggestVehicleIdentity,
  type VehicleSuggestionOption,
  type VehicleSuggestionResult
} from "@/lib/utils/vehicle-suggestions";

type AnalyzeVehicleWizardProps = {
  supabaseReady: boolean;
};

type AnalyzeVehicleDraft = {
  brand: string;
  model: string;
  variant: string;
  year: string;
  mileage: string;
  askingPrice: string;
  powerHp: string;
  fuel: string;
  transmission: string;
  location: string;
  sourceUrl: string;
  imageUrl: string;
  notes: string;
};

type ReviewNormalizationMeta = {
  originalBrand: string;
  originalModel: string;
  decision: "unchanged" | "suggested" | "kept_original";
  suggestionConfidence?: number;
};

const DEFAULT_DRAFT: AnalyzeVehicleDraft = {
  brand: "",
  model: "",
  variant: "",
  year: "",
  mileage: "",
  askingPrice: "",
  powerHp: "",
  fuel: "Diesel",
  transmission: "Automatic",
  location: "",
  sourceUrl: "",
  imageUrl: "",
  notes: ""
};

function normalizeInline(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toDraft(formData: FormData): AnalyzeVehicleDraft {
  return {
    brand: normalizeInline(String(formData.get("brand") ?? "")),
    model: normalizeInline(String(formData.get("model") ?? "")),
    variant: normalizeInline(String(formData.get("variant") ?? "")),
    year: String(formData.get("year") ?? "").trim(),
    mileage: String(formData.get("mileage") ?? "").trim(),
    askingPrice: String(formData.get("askingPrice") ?? "").trim(),
    powerHp: String(formData.get("powerHp") ?? "").trim(),
    fuel: String(formData.get("fuel") ?? "Diesel").trim(),
    transmission: String(formData.get("transmission") ?? "Automatic").trim(),
    location: normalizeInline(String(formData.get("location") ?? "")),
    sourceUrl: String(formData.get("sourceUrl") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim()
  };
}

function isHttpImageUrl(value: string): boolean {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function toSuggestionKey(brand: string, model: string): string {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${normalize(brand)}|${normalize(model)}`;
}

function getSuggestionReasonLabel(reason: VehicleSuggestionOption["reason"]): string {
  switch (reason) {
    case "alias":
      return "alias match";
    case "typo":
      return "likely typo correction";
    case "fuzzy":
    default:
      return "fuzzy match";
  }
}

function getSuggestionConfidenceLabel(confidence: number): string {
  return `${Math.max(1, Math.round(confidence * 100))}% match`;
}

export function AnalyzeVehicleWizard({ supabaseReady }: AnalyzeVehicleWizardProps) {
  const [step, setStep] = useState<"edit" | "review">("edit");
  const [draft, setDraft] = useState<AnalyzeVehicleDraft>(DEFAULT_DRAFT);
  const [editBrand, setEditBrand] = useState(DEFAULT_DRAFT.brand);
  const [editModel, setEditModel] = useState(DEFAULT_DRAFT.model);
  const [pendingDraft, setPendingDraft] = useState<AnalyzeVehicleDraft | null>(null);
  const [suggestion, setSuggestion] = useState<VehicleSuggestionResult | null>(null);
  const [bypassedSuggestionKey, setBypassedSuggestionKey] = useState<string | null>(null);
  const [reviewMeta, setReviewMeta] = useState<ReviewNormalizationMeta | null>(null);

  const normalizedTitle = useMemo(() => {
    return [draft.brand, draft.model, draft.variant].filter(Boolean).join(" ");
  }, [draft.brand, draft.model, draft.variant]);

  const brandAutocompleteOptions = useMemo(() => getBrandAutocompleteOptions(editBrand, 6), [editBrand]);
  const modelAutocompleteOptions = useMemo(
    () => getModelAutocompleteOptions(editBrand, editModel, 6),
    [editBrand, editModel]
  );

  useEffect(() => {
    if (step === "edit") {
      setEditBrand(draft.brand);
      setEditModel(draft.model);
    }
  }, [step, draft.brand, draft.model]);

  function moveToReview(nextDraft: AnalyzeVehicleDraft, meta?: ReviewNormalizationMeta) {
    setDraft(nextDraft);
    setSuggestion(null);
    setPendingDraft(null);
    setReviewMeta(
      meta ?? {
        originalBrand: nextDraft.brand,
        originalModel: nextDraft.model,
        decision: "unchanged"
      }
    );
    setStep("review");
  }

  function handleAcceptSuggestion(option: VehicleSuggestionOption) {
    if (!pendingDraft) return;
    setBypassedSuggestionKey(null);
    moveToReview({
      ...pendingDraft,
      brand: option.brand,
      model: option.model
    }, {
      originalBrand: pendingDraft.brand,
      originalModel: pendingDraft.model,
      decision: "suggested",
      suggestionConfidence: option.confidence
    });
  }

  function handleKeepOriginal() {
    if (!pendingDraft) return;
    setBypassedSuggestionKey(toSuggestionKey(pendingDraft.brand, pendingDraft.model));
    moveToReview(pendingDraft, {
      originalBrand: pendingDraft.brand,
      originalModel: pendingDraft.model,
      decision: "kept_original"
    });
  }

  function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const nextDraft = toDraft(new FormData(form));
    const suggestionKey = toSuggestionKey(nextDraft.brand, nextDraft.model);
    const vehicleSuggestion = suggestVehicleIdentity(nextDraft.brand, nextDraft.model);

    if (vehicleSuggestion.status !== "none" && suggestionKey !== bypassedSuggestionKey) {
      setPendingDraft(nextDraft);
      setSuggestion(vehicleSuggestion);
      return;
    }

    moveToReview(nextDraft, {
      originalBrand: nextDraft.brand,
      originalModel: nextDraft.model,
      decision: "unchanged"
    });
  }

  if (step === "review") {
    const hasImagePreview = isHttpImageUrl(draft.imageUrl);

    return (
      <form action={analyzeVehicleAction} className="space-y-4">
        {Object.entries(draft).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

        <div className="rounded-xl border border-success/35 bg-success/10 p-3 text-sm text-success">
          Review this vehicle once before final analysis.
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            {hasImagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.imageUrl}
                alt={normalizedTitle || "Vehicle preview"}
                className="h-48 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.02] text-center">
                <CarFront className="h-8 w-8 text-foreground/45" />
                <p className="mt-2 text-sm text-foreground/70">No image provided</p>
                <p className="text-xs text-foreground/50">Manual entry</p>
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="inline-flex items-center gap-2 text-sm text-foreground/70">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Final review
            </p>
            <p className="font-heading text-xl text-foreground">{normalizedTitle || "Vehicle analysis"}</p>
            {reviewMeta?.decision === "suggested" && (
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success/95">
                Normalized from {reviewMeta.originalBrand} {reviewMeta.originalModel}
                {reviewMeta.suggestionConfidence
                  ? ` (${getSuggestionConfidenceLabel(reviewMeta.suggestionConfidence)})`
                  : ""}.
              </p>
            )}
            {reviewMeta?.decision === "kept_original" && (
              <p className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-foreground/70">
                Original brand/model input kept: {reviewMeta.originalBrand} {reviewMeta.originalModel}.
              </p>
            )}

            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p className="text-foreground/65">Brand: <span className="text-foreground">{draft.brand}</span></p>
              <p className="text-foreground/65">Model: <span className="text-foreground">{draft.model}</span></p>
              {draft.variant && (
                <p className="text-foreground/65">Variant: <span className="text-foreground">{draft.variant}</span></p>
              )}
              <p className="text-foreground/65">Year: <span className="text-foreground">{draft.year}</span></p>
              <p className="text-foreground/65">Mileage: <span className="text-foreground">{draft.mileage} km</span></p>
              <p className="text-foreground/65">
                Asking price: <span className="text-foreground">EUR {draft.askingPrice}</span>
              </p>
              <p className="text-foreground/65">Fuel: <span className="text-foreground">{draft.fuel}</span></p>
              <p className="text-foreground/65">
                Transmission: <span className="text-foreground">{draft.transmission}</span>
              </p>
              {draft.powerHp && (
                <p className="text-foreground/65">Power: <span className="text-foreground">{draft.powerHp} hp</span></p>
              )}
              {draft.sourceUrl && (
                <p className="text-foreground/65 sm:col-span-2">
                  Source URL: <span className="break-all text-foreground">{draft.sourceUrl}</span>
                </p>
              )}
            </div>
            <p className="text-xs text-foreground/55">
              Exact mileage and asking price will be used for this specific vehicle analysis.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={() => setStep("edit")}>
            <PencilLine className="h-4 w-4" />
            Edit details
          </Button>
          <Button type="submit" className="gap-2" disabled={!supabaseReady}>
            <CheckCircle2 className="h-4 w-4" />
            Confirm and analyze
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleReviewSubmit} className="grid gap-4 md:grid-cols-2">
      {suggestion && pendingDraft && (
        <div className="md:col-span-2 rounded-xl border border-accent/35 bg-accent/10 p-4">
          <p className="inline-flex items-center gap-2 text-sm text-foreground">
            <CircleHelp className="h-4 w-4 text-accent" />
            {suggestion.status === "single" ? "Did you mean this car?" : "Possible matches found"}
          </p>

          {suggestion.status === "single" ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-foreground/75">
                Did you mean{" "}
                <span className="font-semibold text-foreground">
                  {suggestion.options[0].brand} {suggestion.options[0].model}
                </span>{" "}
                ({getSuggestionConfidenceLabel(suggestion.options[0].confidence)})?
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" onClick={() => handleAcceptSuggestion(suggestion.options[0])}>
                  Use suggestion
                </Button>
                <Button type="button" variant="secondary" onClick={handleKeepOriginal}>
                  Keep original
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-foreground/65">
                Entered: {pendingDraft.brand} {pendingDraft.model}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestion.options.map((option) => (
                  <Button
                    key={`${option.brand}-${option.model}`}
                    type="button"
                    variant="secondary"
                    className="justify-between gap-2"
                    onClick={() => handleAcceptSuggestion(option)}
                  >
                    <span className="truncate text-left">
                      {option.brand} {option.model}
                    </span>
                    <span className="shrink-0 text-[11px] text-foreground/60">
                      {getSuggestionReasonLabel(option.reason)} • {getSuggestionConfidenceLabel(option.confidence)}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={handleKeepOriginal}>
                  Keep original entry
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="brand" className="text-sm text-foreground/70">
          Brand
        </label>
        <Input
          id="brand"
          name="brand"
          required
          placeholder="BMW"
          value={editBrand}
          onChange={(event) => {
            setEditBrand(event.currentTarget.value);
            setSuggestion(null);
            setPendingDraft(null);
            setBypassedSuggestionKey(null);
          }}
        />
        {editBrand.trim().length > 0 && brandAutocompleteOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {brandAutocompleteOptions
              .filter((option) => option.toLowerCase() !== editBrand.trim().toLowerCase())
              .map((option) => (
                <Button
                  key={`brand-option-${option}`}
                  type="button"
                  variant="ghost"
                  className="h-7 rounded-lg border border-white/15 bg-white/[0.03] px-2 text-xs text-foreground/80"
                  onClick={() => {
                    setEditBrand(option);
                    setSuggestion(null);
                    setPendingDraft(null);
                    setBypassedSuggestionKey(null);
                  }}
                >
                  {option}
                </Button>
              ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="model" className="text-sm text-foreground/70">
          Model
        </label>
        <Input
          id="model"
          name="model"
          required
          placeholder="320d Touring"
          value={editModel}
          onChange={(event) => {
            setEditModel(event.currentTarget.value);
            setSuggestion(null);
            setPendingDraft(null);
            setBypassedSuggestionKey(null);
          }}
        />
        {editModel.trim().length > 0 && modelAutocompleteOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {modelAutocompleteOptions
              .filter((option) => option.toLowerCase() !== editModel.trim().toLowerCase())
              .map((option) => (
                <Button
                  key={`model-option-${option}`}
                  type="button"
                  variant="ghost"
                  className="h-7 rounded-lg border border-white/15 bg-white/[0.03] px-2 text-xs text-foreground/80"
                  onClick={() => {
                    setEditModel(option);
                    setSuggestion(null);
                    setPendingDraft(null);
                    setBypassedSuggestionKey(null);
                  }}
                >
                  {option}
                </Button>
              ))}
          </div>
        )}
      </div>

      <div className="space-y-1 md:col-span-2">
        <label htmlFor="variant" className="text-sm text-foreground/70">
          Variant
        </label>
        <Input id="variant" name="variant" placeholder="M Sport" defaultValue={draft.variant} />
      </div>

      <div className="space-y-1">
        <label htmlFor="year" className="text-sm text-foreground/70">
          Year
        </label>
        <Input
          id="year"
          name="year"
          type="number"
          min={1995}
          max={2030}
          required
          placeholder="2019"
          defaultValue={draft.year}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="mileage" className="text-sm text-foreground/70">
          Mileage (km)
        </label>
        <Input id="mileage" name="mileage" type="number" min={0} required placeholder="124000" defaultValue={draft.mileage} />
      </div>

      <div className="space-y-1">
        <label htmlFor="askingPrice" className="text-sm text-foreground/70">
          Asking price (EUR)
        </label>
        <Input
          id="askingPrice"
          name="askingPrice"
          type="number"
          min={500}
          required
          placeholder="18950"
          defaultValue={draft.askingPrice}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="powerHp" className="text-sm text-foreground/70">
          Power (HP, optional)
        </label>
        <Input id="powerHp" name="powerHp" type="number" min={0} max={1500} placeholder="190" defaultValue={draft.powerHp} />
      </div>

      <div className="space-y-1">
        <label htmlFor="location" className="text-sm text-foreground/70">
          Location (context only)
        </label>
        <Input
          id="location"
          name="location"
          required
          placeholder="Rotterdam"
          defaultValue={draft.location}
        />
        <p className="text-xs text-foreground/55">Valuation defaults to nationwide Netherlands comparables.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="fuel" className="text-sm text-foreground/70">
          Fuel
        </label>
        <Select id="fuel" name="fuel" defaultValue={draft.fuel || "Diesel"}>
          <option value="Diesel">Diesel</option>
          <option value="Petrol">Petrol</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Electric">Electric</option>
        </Select>
      </div>

      <div className="space-y-1">
        <label htmlFor="transmission" className="text-sm text-foreground/70">
          Transmission
        </label>
        <Select id="transmission" name="transmission" defaultValue={draft.transmission || "Automatic"}>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
        </Select>
      </div>

      <div className="space-y-1 md:col-span-2">
        <label htmlFor="sourceUrl" className="text-sm text-foreground/70">
          Source URL (optional)
        </label>
        <Input
          id="sourceUrl"
          name="sourceUrl"
          type="url"
          placeholder="https://dealer-site.example/listing/123"
          defaultValue={draft.sourceUrl}
        />
      </div>

      <div className="space-y-1 md:col-span-2">
        <label htmlFor="imageUrl" className="text-sm text-foreground/70">
          Image URL (optional)
        </label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://images.example.com/car.jpg"
          defaultValue={draft.imageUrl}
        />
      </div>

      <div className="space-y-1 md:col-span-2">
        <label htmlFor="notes" className="text-sm text-foreground/70">
          Notes (optional)
        </label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Condition notes, expected repairs, contact context..."
          defaultValue={draft.notes}
        />
      </div>

      <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-foreground/65">
        <p>Review vehicle details before starting valuation analysis.</p>
        <Button type="submit" className="gap-2" disabled={!supabaseReady}>
          <CheckCircle2 className="h-4 w-4" />
          Review details
        </Button>
      </div>
    </form>
  );
}
