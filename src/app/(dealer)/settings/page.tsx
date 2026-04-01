import { updatePreferencesAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getCurrentDealerContext } from "@/lib/services/auth";
import { getDealerPreferences } from "@/lib/services/preferences";

export default async function SettingsPage() {
  const context = await getCurrentDealerContext();
  const preferences = await getDealerPreferences(context.dealerId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent/60">Dealer profile</p>
        <h1 className="font-display mt-1 text-5xl tracking-wide text-foreground">PREFERENCES</h1>
        <p className="mt-2 text-sm text-foreground/45">
          Tune your buying range so AutoEdge prioritizes opportunities within your practical price and mileage bands.
        </p>
      </div>

      <Card>
        <form action={updatePreferencesAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="preferredBrands" className="text-sm text-foreground/70">
              Preferred brands (comma separated)
            </label>
            <Input
              id="preferredBrands"
              name="preferredBrands"
              defaultValue={preferences.preferredBrands.join(", ")}
              placeholder="BMW, Audi, Volkswagen"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label htmlFor="preferredModels" className="text-sm text-foreground/70">
              Preferred models (comma separated)
            </label>
            <Input
              id="preferredModels"
              name="preferredModels"
              defaultValue={preferences.preferredModels.join(", ")}
              placeholder="Golf, A4 Avant, 320d Touring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="minYear" className="text-sm text-foreground/70">
              Minimum year
            </label>
            <Input id="minYear" name="minYear" type="number" defaultValue={preferences.minYear} />
          </div>

          <div className="space-y-1">
            <label htmlFor="maxMileage" className="text-sm text-foreground/70">
              Maximum mileage (km)
            </label>
            <Input id="maxMileage" name="maxMileage" type="number" defaultValue={preferences.maxMileage} />
          </div>

          <div className="space-y-1">
            <label htmlFor="minPrice" className="text-sm text-foreground/70">
              Minimum asking price (EUR, optional)
            </label>
            <Input id="minPrice" name="minPrice" type="number" defaultValue={preferences.minPrice ?? ""} placeholder="7000" />
          </div>

          <div className="space-y-1">
            <label htmlFor="maxPrice" className="text-sm text-foreground/70">
              Maximum asking price (EUR, optional)
            </label>
            <Input id="maxPrice" name="maxPrice" type="number" defaultValue={preferences.maxPrice ?? ""} placeholder="26000" />
          </div>

          <div className="space-y-1">
            <label htmlFor="minExpectedProfit" className="text-sm text-foreground/70">
              Minimum expected profit (EUR)
            </label>
            <Input
              id="minExpectedProfit"
              name="minExpectedProfit"
              type="number"
              defaultValue={preferences.minExpectedProfit}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="fuelTypes" className="text-sm text-foreground/70">
              Fuel types (comma separated)
            </label>
            <Input
              id="fuelTypes"
              name="fuelTypes"
              defaultValue={preferences.fuelTypes.join(", ")}
              placeholder="Petrol, Diesel, Hybrid"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="transmissions" className="text-sm text-foreground/70">
              Transmissions (comma separated)
            </label>
            <Input
              id="transmissions"
              name="transmissions"
              defaultValue={preferences.transmissions.join(", ")}
              placeholder="Automatic, Manual"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="monitoringIntensity" className="text-sm text-foreground/70">
              Monitoring intensity
            </label>
            <Select id="monitoringIntensity" name="monitoringIntensity" defaultValue={preferences.monitoringIntensity}>
              <option value="low">Low (cost-efficient)</option>
              <option value="balanced">Balanced</option>
              <option value="high">High (more frequent checks)</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label htmlFor="selectedSourceGroups" className="text-sm text-foreground/70">
              Selected dealer source groups (comma separated)
            </label>
            <Input
              id="selectedSourceGroups"
              name="selectedSourceGroups"
              defaultValue={preferences.selectedSourceGroups.join(", ")}
              placeholder="DealerStock NL, PremiumLease Exchange, RegionalAutoHub"
            />
          </div>

          <div className="md:col-span-2 border-t border-white/10 pt-4">
            <p className="mb-3 text-sm font-medium text-foreground/80">Geavanceerde kosteninstelling</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="reconCostBaseOverride" className="text-sm text-foreground/70">
                  Basis reconditiekosten (EUR)
                </label>
                <Input
                  id="reconCostBaseOverride"
                  name="reconCostBaseOverride"
                  type="number"
                  min={0}
                  max={10000}
                  defaultValue={preferences.reconCostBaseOverride ?? ""}
                  placeholder="Standaard: €620"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="dailyHoldingCostOverride" className="text-sm text-foreground/70">
                  Dagelijkse holdingkosten (EUR/dag)
                </label>
                <Input
                  id="dailyHoldingCostOverride"
                  name="dailyHoldingCostOverride"
                  type="number"
                  min={0}
                  max={500}
                  defaultValue={preferences.dailyHoldingCostOverride ?? ""}
                  placeholder="Standaard: €12 + 0,06% van prijs"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="riskBufferBaseOverride" className="text-sm text-foreground/70">
                  Basis risicobudget (EUR)
                </label>
                <Input
                  id="riskBufferBaseOverride"
                  name="riskBufferBaseOverride"
                  type="number"
                  min={0}
                  max={10000}
                  defaultValue={preferences.riskBufferBaseOverride ?? ""}
                  placeholder="Standaard: €220"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-foreground/65">
            <p>
              Monitoring runs against nationwide NL inventory by default. Price range accepts min only, max only, both, or neither.
              If min is higher than max, AutoEdge automatically normalizes the range.
            </p>
            <Button type="submit">Save preferences</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
