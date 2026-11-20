import { type Check, TITLE_KEYS, type TitleKey } from "./types";

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

export function comboLabel(keys: TitleKey[]): string {
  return keys.map(titleLabel).join(" + ");
}

export function comboKey(selected: readonly TitleKey[]): string {
  return TITLE_KEYS.filter((key) => selected.includes(key)).join("+");
}

const DAYS_PER_MONTH = 30.4;

export function formatDuration(days: number): string {
  const months = days / DAYS_PER_MONTH;
  if (months < 1.5) {
    return `${Math.round(days)} days`;
  }
  return `about ${Math.round(months)} months`;
}

export interface ParsedCheck {
  check: Check;
  label: string;
  /** Category name for "<Category> · XP" / "<Category> · projets". */
  category: string | null;
}

const LEVEL_RE = /^Niveau (\d+)$/;
const OPTION_RE = /^(.*) · (XP|projets)$/;

/** Translates the French labels produced by the optimizer. */
export function parseCheck(check: Check): ParsedCheck {
  const level = LEVEL_RE.exec(check.l);
  if (level) {
    return { check, label: `Level ${level[1]}`, category: null };
  }
  const option = OPTION_RE.exec(check.l);
  if (option) {
    return {
      check,
      label: option[2] === "XP" ? "Experience" : "Projects",
      category: option[1],
    };
  }
  if (check.l === "Experiences pro") {
    return { check, label: "Professional experiences", category: null };
  }
  if (check.l === "Projet suite") {
    return { check, label: "Suite project", category: null };
  }
  return { check, label: check.l, category: null };
}
