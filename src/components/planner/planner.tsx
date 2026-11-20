"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { type Mode, comboKey, formatXp, rankCombos } from "./format";
import { Matrix } from "./matrix";
import { Path } from "./path";
import { Segmented } from "./segmented";
import { SolutionsBar } from "./solutions";
import { TitlePicker } from "./title-picker";
import {
  type PlannerData,
  type PlannerInitialState,
  TITLE_KEYS,
  type TitleKey,
} from "./types";

const DAYS_PER_MONTH = 30.4;

type View = PlannerInitialState["view"];

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
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [view, setView] = useState<View>(initial.view);

  // Keep the URL shareable without triggering navigations.
  useEffect(() => {
    const params = new URLSearchParams({
      titles: TITLE_KEYS.filter((k) => selected.includes(k)).join(","),
    });
    if (mode === "projects") {
      params.set("mode", mode);
    }
    if (view === "compare") {
      params.set("view", view);
    }
    window.history.replaceState(
      null,
      "",
      `?${params.toString().replaceAll("%2C", ",")}`,
    );
  }, [selected, mode, view]);

  const toggle = (key: TitleKey) => {
    setSelected((current) => {
      if (!current.includes(key)) {
        return [...current, key];
      }
      return current.length > 1 ? current.filter((k) => k !== key) : current;
    });
  };
  const pick = (key: string) => setSelected(key.split("+") as TitleKey[]);

  const combos = data.variants[String(data.full_mask)] ?? {};
  const selectedKey = comboKey(selected);
  const combo = combos[selectedKey];
  const plan = combo?.[mode];
  const ranked = rankCombos(data, mode);

  const delta: Partial<Record<TitleKey, number>> = {};
  if (plan?.feasible) {
    for (const key of TITLE_KEYS) {
      const next = combos[comboKey([...selected, key])]?.[mode];
      if (!selected.includes(key) && next?.feasible) {
        delta[key] = Math.max(
          0,
          Math.round(mode === "days" ? next.days - plan.days : next.n - plan.n),
        );
      }
    }
  }

  const level = Math.max(...selected.map((key) => data.titles[key].level));
  const events = Math.max(...selected.map((key) => data.titles[key].events));
  const done = data.baseline.done.map((project) => project.n).join(", ");
  const notes = [
    `Covers level ${level} and every condition; prerequisites needed to unlock a project are counted.`,
    `Not included: ${events} events to attend.`,
    `Rules: gcc.42.fr, Nov. 2026. From level ${data.baseline.level}${done ? ` (${done} done)` : ""}, ~${data.meta.rate} days per 1000 XP.`,
  ].join("\n");

  return (
    <div className="flex min-h-0 grow flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="space-y-1">
          <CardTitle tag="h1">RNCP planner</CardTitle>
          <CardDescription>
            Pick your titles, get the{" "}
            {mode === "days" ? "fastest path" : "fewest projects"}.
          </CardDescription>
        </div>
        <Segmented
          label="View"
          value={view}
          options={[
            ["plan", "Plan"],
            ["compare", "Compare"],
          ]}
          onChange={setView}
        />
        {plan?.feasible && (
          <p
            className="ml-auto flex items-baseline gap-x-3 text-muted-foreground"
            title={notes}
          >
            <span>
              <span className="font-semibold text-3xl text-foreground tracking-tight">
                {Math.round(plan.days)}
              </span>{" "}
              days
              {!plan.proven && (
                <span
                  className="ml-1.5 text-xs"
                  title="Best plan found within the search budget; a slightly shorter one is not ruled out"
                >
                  best found
                </span>
              )}
            </span>
            <span>
              ≈ {Math.round(plan.days / DAYS_PER_MONTH)} months ·{" "}
              <span className="text-foreground">{plan.n} projects</span> ·{" "}
              {formatXp(plan.xp)} XP
            </span>
            <InfoIcon
              aria-label={notes}
              className="size-3.5 shrink-0 self-center"
            />
          </p>
        )}
      </div>

      {view === "plan" && (
        <TitlePicker
          titles={data.titles}
          selected={selected}
          delta={delta}
          unit={mode === "days" ? "d" : "pj"}
          onToggle={toggle}
        />
      )}

      {plan?.feasible ? (
        view === "plan" ? (
          <Path
            ids={plan.ids}
            checks={plan.checks}
            selected={combo.combo}
            data={data}
          />
        ) : (
          <div className="relative min-h-[28rem] grow">
            <div className="md:absolute md:inset-0 md:flex md:flex-col">
              <Matrix
                ranked={ranked}
                selectedKey={selectedKey}
                onPick={pick}
                data={data}
              />
            </div>
          </div>
        )
      ) : (
        <div className="flex items-start gap-3 rounded-md border border-destructive/50 p-4 text-sm">
          <TriangleAlertIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-destructive"
          />
          <p>No path found for this combination.</p>
        </div>
      )}

      <SolutionsBar
        ranked={ranked}
        mode={mode}
        onMode={setMode}
        selectedKey={selectedKey}
        onPick={pick}
      />
    </div>
  );
}
