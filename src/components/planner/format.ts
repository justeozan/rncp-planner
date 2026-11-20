import {
  type Combo,
  type Plan,
  type PlannerData,
  TITLE_KEYS,
  type TitleKey,
} from "./types";

const THOUSAND = 1000;

/** 12500 -> "12.5k", 15000 -> "15k", 966 -> "966". */
export function formatXp(value: number): string {
  if (value < THOUSAND) {
    return Math.round(value).toLocaleString("en-US");
  }
  const thousands = Math.round(value / 100) / 10;
  return `${thousands.toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
}

export function titleLabel(key: TitleKey): string {
  return key.replace("rncp", "RNCP ");
}

export function comboKey(selected: readonly TitleKey[]): string {
  return TITLE_KEYS.filter((key) => selected.includes(key)).join("+");
}

export type Mode = "days" | "projects";

export interface Ranked {
  key: string;
  combo: Combo;
  plan: Plan;
}

/** Every combination of titles, best first for the chosen mode. */
export function rankCombos(data: PlannerData, mode: Mode): Ranked[] {
  const combos = data.variants[String(data.full_mask)] ?? {};
  const primary = (p: Plan) => (mode === "days" ? p.days : p.n);
  const secondary = (p: Plan) => (mode === "days" ? p.n : p.days);
  return Object.entries(combos)
    .map(([key, combo]) => ({ key, combo, plan: combo[mode] }))
    .sort((a, b) => {
      if (a.plan.feasible !== b.plan.feasible) {
        return a.plan.feasible ? -1 : 1;
      }
      return (
        primary(a.plan) - primary(b.plan) ||
        secondary(a.plan) - secondary(b.plan)
      );
    });
}

/** "rncp6-1+rncp7-1" -> "61·71"; the four titles -> "All 4". */
export function comboShort(key: string): string {
  const parts = key.split("+");
  if (parts.length === TITLE_KEYS.length) {
    return "All 4";
  }
  return parts.map((part) => part.replace(/rncp(\d)-(\d)/, "$1$2")).join("·");
}

/** Shared by the comparison table and the bottom bar so their columns line up. */
export function comboColumns(count: number): string {
  return `minmax(20rem,1fr) repeat(${count}, minmax(0,4.25rem))`;
}
