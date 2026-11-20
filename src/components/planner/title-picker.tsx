import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { titleLabel } from "./format";
import { type PlannerData, TITLE_KEYS, type TitleKey } from "./types";

interface TitlePickerProps {
  titles: PlannerData["titles"];
  selected: TitleKey[];
  /** Extra days if this title is added to the selection (unselected only). */
  delta: Partial<Record<TitleKey, number>>;
  onToggle: (key: TitleKey) => void;
}

export function TitlePicker({
  titles,
  selected,
  delta,
  onToggle,
}: TitlePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {TITLE_KEYS.map((key) => {
        const info = titles[key];
        const active = selected.includes(key);
        const extra = delta[key];

        return (
          <Button
            key={key}
            type="button"
            variant={active ? "default" : "secondary"}
            aria-pressed={active}
            onClick={() => onToggle(key)}
            className="h-auto justify-start gap-3 whitespace-normal px-3 py-2 text-left"
          >
            <Badge
              variant={active ? "secondary" : "default"}
              className="shrink-0"
            >
              {titleLabel(key)}
            </Badge>
            <span className="min-w-0 grow">
              <span
                className="block truncate"
                title={info.name}
              >
                {info.name}
              </span>
              <span
                className={cn(
                  "block font-normal text-xs",
                  active
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                Level {info.level}
              </span>
            </span>
            {active ? (
              <CheckIcon
                aria-hidden
                className="size-4 shrink-0"
              />
            ) : (
              extra !== undefined && (
                <span
                  className="shrink-0 font-normal text-muted-foreground text-xs"
                  title="Extra days if you add this title"
                >
                  +{extra} d
                </span>
              )
            )}
          </Button>
        );
      })}
    </div>
  );
}
