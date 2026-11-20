"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Advanced } from "./advanced";
import { Compare } from "./compare";
import { comboKey, comboLabel } from "./format";
import { PlanTable } from "./plan-table";
import { Requirements } from "./requirements";
import { SectionHeading } from "./section-heading";
import { Summary } from "./summary";
import { TitlePicker } from "./title-picker";
import {
  type Objective,
  type PlannerData,
  type PlannerInitialState,
  TITLE_KEYS,
  type TitleKey,
} from "./types";

const OBJECTIVES: { value: Objective; label: string }[] = [
  { value: "projects", label: "Fewest projects" },
  { value: "days", label: "Shortest time" },
];

/** Default selection: the cheapest single title (fewest projects). */
function cheapestSingle(data: PlannerData, mask: number): TitleKey {
  let best: TitleKey = TITLE_KEYS[0];
  let bestCount = Number.POSITIVE_INFINITY;
  for (const key of TITLE_KEYS) {
    const plan = data.variants[String(mask)]?.[key]?.projects;
    if (plan?.feasible && plan.n < bestCount) {
      best = key;
      bestCount = plan.n;
    }
  }
  return best;
}

export function Planner({
  data,
  initial,
}: { data: PlannerData; initial: PlannerInitialState }) {
  const [mask, setMask] = useState(initial.mask ?? data.full_mask);
  const [selected, setSelected] = useState<TitleKey[]>(
    () =>
      initial.titles ?? [cheapestSingle(data, initial.mask ?? data.full_mask)],
  );
  const [objective, setObjective] = useState<Objective>(initial.objective);

  // Keep the URL shareable without triggering navigations.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set(
      "titles",
      TITLE_KEYS.filter((k) => selected.includes(k)).join(","),
    );
    params.set("by", objective);
    if (mask !== data.full_mask) {
      params.set("chains", String(mask));
    }
    window.history.replaceState(
      null,
      "",
      `?${params.toString().replaceAll("%2C", ",")}`,
    );
  }, [selected, objective, mask, data.full_mask]);

  const toggle = (key: TitleKey) => {
    setSelected((current) => {
      if (!current.includes(key)) {
        return [...current, key];
      }
      return current.length > 1 ? current.filter((k) => k !== key) : current;
    });
  };

  const combos = data.variants[String(mask)] ?? {};
  const key = comboKey(selected);
  const combo = combos[key];
  const plan = combo?.[objective];

  return (
    <>
      <SectionHeading
        first
        title="Which titles do you want?"
        description="Pick one or more. The planner finds the smallest set of projects that covers all of them."
      />
      <TitlePicker
        titles={data.titles}
        selected={selected}
        onToggle={toggle}
      />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="font-medium text-sm">Optimise for</p>
        <SegmentedControl
          aria-label="Optimise for"
          value={objective}
          onValueChange={setObjective}
          options={OBJECTIVES}
          className="sm:w-80"
        />
      </div>

      <Separator className="my-6" />

      <SectionHeading
        title="Your plan"
        description={`${comboLabel(combo?.combo ?? selected)}, optimised for ${
          objective === "projects" ? "the fewest projects" : "the shortest time"
        }.`}
      />
      {plan ? (
        <div className="space-y-6">
          <Summary plan={plan} />
          {plan.feasible && (
            <>
              <Requirements
                checks={plan.checks}
                selected={combo.combo}
                titles={data.titles}
              />
              <PlanTable
                ids={plan.ids}
                data={data}
                mask={mask}
              />
            </>
          )}
          <p className="text-muted-foreground text-xs">
            Computed from level {data.baseline.level}
            {data.baseline.done.length > 0 &&
              ` with ${data.baseline.done.map((project) => project.n).join(", ")} already done`}
            .
          </p>
        </div>
      ) : null}

      <Separator className="my-6" />

      <div className="space-y-4">
        <Compare
          combos={combos}
          objective={objective}
          currentKey={key}
          onSelect={setSelected}
        />
        <Advanced
          chains={data.chains}
          mask={mask}
          onlyFull={data.only_full}
          rate={data.meta.rate}
          onMaskChange={setMask}
        />
      </div>
    </>
  );
}
