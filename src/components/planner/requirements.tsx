import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircleCheckIcon, CircleHelpIcon, CircleXIcon } from "lucide-react";
import { type ParsedCheck, formatXp, parseCheck, titleLabel } from "./format";
import type { Check, PlannerData, TitleKey } from "./types";

function Requirement({ label, check }: { label: string; check: Check }) {
  const format = (value: number) =>
    check.u === "xp" ? formatXp(value) : value.toLocaleString("en-US");
  const unit = check.u === "xp" ? " XP" : "";
  const known = check.h !== null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 px-1 text-sm">
        <p className="flex min-w-0 items-center gap-2">
          {check.ok === true && (
            <CircleCheckIcon
              aria-label="Met"
              className="size-4 shrink-0 text-foreground"
            />
          )}
          {check.ok === false && (
            <CircleXIcon
              aria-label="Not met"
              className="size-4 shrink-0 text-destructive"
            />
          )}
          {check.ok === null && (
            <CircleHelpIcon
              aria-label="Not tracked"
              className="size-4 shrink-0 text-muted-foreground"
            />
          )}
          <span className="truncate">{label}</span>
        </p>
        <p className="whitespace-nowrap text-right font-medium">
          {known ? `${format(check.h ?? 0)} / ` : "? / "}
          {format(check.n)}
          {unit}
        </p>
      </div>
      <Progress
        max={check.n}
        value={Math.min(check.h ?? 0, check.n)}
        aria-label={`${label}: ${known ? check.h : "unknown"} out of ${check.n}`}
      />
      {!known && (
        <p className="px-1 text-muted-foreground text-xs">
          Not planned: attend events on your own.
        </p>
      )}
    </div>
  );
}

function Group({
  title,
  subtitle,
  children,
}: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle
          tag="h3"
          className="text-xl"
        >
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CategoryBlock({
  category,
  items,
}: { category: string; items: ParsedCheck[] }) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <p className="font-medium">{category}</p>
      {items.map(({ check, label }) => (
        <Requirement
          key={check.l}
          label={label}
          check={check}
        />
      ))}
    </div>
  );
}

interface RequirementsProps {
  checks: Check[];
  selected: TitleKey[];
  titles: PlannerData["titles"];
}

export function Requirements({ checks, selected, titles }: RequirementsProps) {
  const parsed = checks.map(parseCheck);
  const general = parsed.filter((item) => !item.category);

  // Each category belongs to exactly one title.
  const categoryOwner = new Map<string, TitleKey>();
  for (const key of selected) {
    for (const option of titles[key].options) {
      categoryOwner.set(option.t, key);
    }
  }

  return (
    <div className="space-y-4">
      <Group title="Requirements">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {general.map(({ check, label }) => (
            <Requirement
              key={check.l}
              label={label}
              check={check}
            />
          ))}
        </div>
      </Group>
      {selected.map((key) => {
        const items = parsed.filter(
          (item) => item.category && categoryOwner.get(item.category) === key,
        );
        const categories = [
          ...new Set(items.map((item) => item.category as string)),
        ];
        if (categories.length === 0) {
          return null;
        }
        return (
          <Group
            key={key}
            title={titleLabel(key)}
            subtitle={titles[key].name}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <CategoryBlock
                  key={category}
                  category={category}
                  items={items.filter((item) => item.category === category)}
                />
              ))}
            </div>
          </Group>
        );
      })}
    </div>
  );
}
