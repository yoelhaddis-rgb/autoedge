import Link from "next/link";
import { Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
};

type DealsFiltersProps = {
  sources: string[];
  fuels: string[];
  transmissions: string[];
  statuses: string[];
  current: Record<string, string | undefined>;
  preferencesActive?: boolean;
};

function toOptions(values: string[]): Option[] {
  return values.map((value) => ({ label: value, value }));
}

export function DealsFilters({ sources, fuels, transmissions, statuses, current, preferencesActive }: DealsFiltersProps) {
  return (
    <div className="space-y-2">
      {preferencesActive && (
        <div className="flex items-center gap-2 text-sm text-accent">
          <Settings2 className="h-3.5 w-3.5 shrink-0" />
          <span>Filtered by your preferences</span>
          <Link href="/deals" className="ml-auto text-foreground/50 hover:text-foreground">
            Reset
          </Link>
        </div>
      )}
    <Card>
      <form className="grid gap-3 lg:grid-cols-9">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <Input
            name="search"
            placeholder="Search model, city, brand"
            defaultValue={current.search}
            className="pl-9"
          />
        </div>

        <Select name="source" defaultValue={current.source ?? ""}>
          <option value="">All sources</option>
          {toOptions(sources).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select name="fuel" defaultValue={current.fuel ?? ""}>
          <option value="">All fuel types</option>
          {toOptions(fuels).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select name="transmission" defaultValue={current.transmission ?? ""}>
          <option value="">All gearboxes</option>
          {toOptions(transmissions).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select name="status" defaultValue={current.status ?? ""}>
          <option value="">All statuses</option>
          {toOptions(statuses).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Input
          name="minScore"
          type="number"
          min={0}
          max={100}
          defaultValue={current.minScore}
          placeholder="Min score"
        />

        <Select name="sort" defaultValue={current.sort ?? "score_desc"}>
          <option value="score_desc">Sort: Score</option>
          <option value="profit_desc">Sort: Profit</option>
          <option value="fresh">Sort: Freshness</option>
          <option value="price_asc">Sort: Price Low to High</option>
          <option value="price_desc">Sort: Price High to Low</option>
        </Select>

        <div className="flex items-center gap-2">
          <Button type="submit" fullWidth>
            Apply
          </Button>
          <Link href="/deals" className="text-sm text-foreground/60 hover:text-foreground">
            Clear
          </Link>
        </div>
      </form>
    </Card>
    </div>
  );
}
