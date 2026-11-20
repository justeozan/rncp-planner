import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import {
  type Mode,
  type Ranked,
  comboColumns,
  comboShort,
  formatXp,
} from "./format";
import { Segmented } from "./segmented";

interface SolutionsBarProps {
  ranked: Ranked[];
  mode: Mode;
  onMode: (mode: Mode) => void;
  selectedKey: string;
  onPick: (key: string) => void;
}

/** Bottom bar: the objective on the left, every combination best first on
 * the right (same columns as the comparison table). */
export function SolutionsBar({
  ranked,
  mode,
  onMode,
  selectedKey,
  onPick,
}: SolutionsBarProps) {
  return (
    <div
      style={{ "--cols": comboColumns(ranked.length) } as CSSProperties}
      className="-mx-4 md:-mx-6 bottom-0 z-10 mt-auto flex flex-col gap-2 rounded-b-lg border-t bg-background px-4 py-2 md:sticky md:grid md:items-center md:gap-0 md:px-6 md:[grid-template-columns:var(--cols)]"
    >
      <Segmented
        label="Optimise for"
        value={mode}
        options={[
          ["days", "Fastest"],
          ["projects", "Fewest projects"],
        ]}
        onChange={onMode}
      />
      <ol className="grid grid-cols-5 gap-1 md:contents">
        {ranked.map(({ key, plan }) => {
          const active = key === selectedKey;
          const days = `${Math.round(plan.days)} d`;
          const projects = `${plan.n} pj`;
          return (
            <li
              key={key}
              className="min-w-0"
            >
              <button
                type="button"
                aria-pressed={active}
                disabled={!plan.feasible}
                onClick={() => onPick(key)}
                title={
                  plan.feasible
                    ? `${key.split("+").join(" + ")}\n${Math.round(plan.days)} days · ${plan.n} projects · ${formatXp(plan.xp)} XP${plan.proven ? "" : "\nBest found, not proven optimal"}`
                    : `${key}: no path`
                }
                className={cn(
                  "flex w-full min-w-0 cursor-pointer flex-col items-center rounded-md px-1 py-0.5 leading-tight transition-colors disabled:cursor-default disabled:opacity-40 md:mx-auto md:w-[calc(100%-0.25rem)]",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "max-w-full truncate text-[10px] tracking-tight",
                    active
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {comboShort(key)}
                </span>
                <span className="font-semibold text-sm tabular-nums">
                  {plan.feasible ? (mode === "days" ? days : projects) : "—"}
                </span>
                <span className="text-[10px] tabular-nums opacity-70">
                  {plan.feasible ? (mode === "days" ? projects : days) : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
