import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { formatDuration, formatXp } from "./format";
import type { Plan } from "./types";

function Stat({
  label,
  value,
  hint,
}: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-4 md:p-6">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="font-semibold text-2xl tracking-tight md:text-3xl">
          {value}
        </p>
        <p className="min-h-4 text-muted-foreground text-xs">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function Summary({ plan }: { plan: Plan }) {
  if (!plan.feasible) {
    return (
      <div className="flex items-start gap-3 rounded-md border border-destructive/50 p-4 text-sm">
        <TriangleAlertIcon
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-destructive"
        />
        <p>
          No plan found for this combination with the current settings. Try
          another selection or change the prerequisite chains below.
        </p>
      </div>
    );
  }

  const bound = plan.proven ? "" : "≤ ";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Stat
          label="Projects"
          value={`${bound}${plan.n}`}
          hint={
            plan.n_raw > plan.n
              ? `${plan.n_raw} with piscine modules`
              : undefined
          }
        />
        <Stat
          label="Estimated days"
          value={String(plan.days)}
          hint={formatDuration(plan.days)}
        />
        <Stat
          label="Total XP"
          value={formatXp(plan.xp)}
        />
      </div>

      {!plan.proven && (
        <div className="flex items-start gap-3 rounded-md border p-4 text-muted-foreground text-sm">
          <InfoIcon
            aria-hidden
            className="mt-0.5 size-4 shrink-0"
          />
          <p>
            This is an upper bound: the optimizer ran out of budget before
            proving that no shorter list exists, so the real minimum may be
            lower.
          </p>
        </div>
      )}
    </div>
  );
}
