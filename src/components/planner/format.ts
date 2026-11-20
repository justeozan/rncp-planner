import { TITLE_KEYS, type TitleKey } from "./types";

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
