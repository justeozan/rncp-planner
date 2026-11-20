import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { titleLabel } from "./format";
import { type PlannerData, TITLE_KEYS, type TitleKey } from "./types";

interface TitlePickerProps {
  titles: PlannerData["titles"];
  selected: TitleKey[];
  onToggle: (key: TitleKey) => void;
}

export function TitlePicker({ titles, selected, onToggle }: TitlePickerProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TITLE_KEYS.map((key) => {
        const info = titles[key];
        const active = selected.includes(key);

        return (
          <Button
            key={key}
            type="button"
            variant={active ? "default" : "secondary"}
            aria-pressed={active}
            onClick={() => onToggle(key)}
            className="relative h-auto min-h-[88px] flex-col items-center justify-center gap-1 whitespace-normal px-4 pt-7 pb-3"
          >
            <Badge
              variant={active ? "secondary" : "default"}
              className="absolute top-0 left-0 rounded-none rounded-tl-md rounded-br-md"
            >
              {titleLabel(key)}
            </Badge>
            {active && (
              <CheckIcon
                aria-hidden
                className="absolute top-2 right-2 size-4"
              />
            )}
            <span className="text-balance text-center">{info.name}</span>
            <span
              className={
                active
                  ? "text-primary-foreground/70 text-xs"
                  : "text-muted-foreground text-xs"
              }
            >
              Level {info.level} required
            </span>
          </Button>
        );
      })}
    </div>
  );
}
