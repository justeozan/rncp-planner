"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { comboKey, formatXp } from "./format";
import { Path } from "./path";
import { TitlePicker } from "./title-picker";
import {
  type PlannerData,
  type PlannerInitialState,
  TITLE_KEYS,
  type TitleKey,
} from "./types";

const DAYS_PER_MONTH = 30.4;

/** Default selection: the fastest single title. */
function fastestSingle(data: PlannerData): TitleKey {
  const combos = data.variants[String(data.full_mask)] ?? {};
  let best: TitleKey = TITLE_KEYS[0];
  for (const key of TITLE_KEYS) {
    const days = combos[key]?.days;
    const bestDays = combos[best]?.days;
    if (days?.feasible && (!bestDays?.feasible || days.days < bestDays.days)) {
      best = key;
    }
  }
  return best;
}

export function Planner({
  data,
  initial,
}: { data: PlannerData; initial: PlannerInitialState }) {
  const [selected, setSelected] = useState<TitleKey[]>(
    () => initial.titles ?? [fastestSingle(data)],
  );

  // Keep the URL shareable without triggering navigations.
  useEffect(() => {
    const titles = TITLE_KEYS.filter((k) => selected.includes(k)).join(",");
    window.history.replaceState(null, "", `?titles=${titles}`);
  }, [selected]);

  const toggle = (key: TitleKey) => {
    setSelected((current) => {
      if (!current.includes(key)) {
        return [...current, key];
      }
      return current.length > 1 ? current.filter((k) => k !== key) : current;
    });
  };

  const combos = data.variants[String(data.full_mask)] ?? {};
  const combo = combos[comboKey(selected)];
  const plan = combo?.days;

  const delta: Partial<Record<TitleKey, number>> = {};
  if (plan?.feasible) {
    for (const key of TITLE_KEYS) {
      const next = combos[comboKey([...selected, key])]?.days;
      if (!selected.includes(key) && next?.feasible) {
        delta[key] = Math.max(0, Math.round(next.days - plan.days));
      }
    }
  }

  const level = Math.max(...selected.map((key) => data.titles[key].level));
  const events = Math.max(...selected.map((key) => data.titles[key].events));
  const exp = Math.max(...selected.map((key) => data.titles[key].exp));
  const done = data.baseline.done.map((project) => project.n).join(", ");

  return (
    <div className="space-y-4">
      <TitlePicker
        titles={data.titles}
        selected={selected}
        delta={delta}
        onToggle={toggle}
      />

      {plan?.feasible ? (
        <>
          <div className="space-y-1">
            <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span>
                <span className="font-semibold text-4xl tracking-tight">
                  {Math.round(plan.days)}
                </span>{" "}
                <span className="text-muted-foreground">days</span>
              </span>
              <span className="text-muted-foreground">
                ≈ {Math.round(plan.days / DAYS_PER_MONTH)} months ·{" "}
                <span
                  title={
                    plan.proven
                      ? undefined
                      : "Upper bound: the solver did not prove a shorter list is impossible"
                  }
                >
                  {plan.proven ? "" : "≤ "}
                  {plan.n} projects
                </span>{" "}
                · {formatXp(plan.xp)} XP
              </span>
            </p>
            <p className="text-muted-foreground text-xs">
              Covers level {level}, {exp} internships and the suite project. Not
              included: {events} events to attend. From level{" "}
              {data.baseline.level}
              {done && ` (${done} done)`}, ~{data.meta.rate} days per 1000 XP.
            </p>
          </div>
          <Path
            ids={plan.ids}
            selected={combo.combo}
            data={data}
          />
        </>
      ) : (
        <div className="flex items-start gap-3 rounded-md border border-destructive/50 p-4 text-sm">
          <TriangleAlertIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <p>No path found for this combination.</p>
        </div>
      )}
    </div>
  );
}
