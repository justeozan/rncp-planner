"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon } from "lucide-react";
import { formatXp, titleLabel } from "./format";
import type { Combo, Objective, TitleKey } from "./types";

const GROUPS: { kind: Combo["kind"]; label: string }[] = [
  { kind: "single", label: "1 title" },
  { kind: "pair", label: "2 titles" },
  { kind: "triple", label: "3 titles" },
  { kind: "quad", label: "All 4 titles" },
];

interface CompareProps {
  combos: Record<string, Combo>;
  objective: Objective;
  currentKey: string;
  onSelect: (titles: TitleKey[]) => void;
}

export function Compare({
  combos,
  objective,
  currentKey,
  onSelect,
}: CompareProps) {
  return (
    <Collapsible className="group/compare">
      <CollapsibleTrigger asChild>
        <Button
          variant="secondary"
          className="w-full justify-between"
        >
          Compare all combinations
          <ChevronDownIcon
            aria-hidden
            className="size-4 transition-transform group-data-[state=open]/compare:rotate-180"
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4">
        <p className="mb-2 text-muted-foreground text-sm">
          Values for{" "}
          {objective === "projects" ? "fewest projects" : "shortest time"}.
          Click a row to select it.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titles</TableHead>
              <TableHead className="text-right">Projects</TableHead>
              <TableHead className="text-right">Days</TableHead>
              <TableHead className="text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {GROUPS.map((group) => {
              const rows = Object.entries(combos).filter(
                ([, combo]) => combo.kind === group.kind,
              );
              return [
                <TableRow
                  key={group.kind}
                  className="hover:bg-transparent"
                >
                  <TableCell
                    colSpan={4}
                    className="pt-6 pb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide"
                  >
                    {group.label}
                  </TableCell>
                </TableRow>,
                ...rows.map(([key, combo]) => {
                  const plan = combo[objective];
                  const selected = key === currentKey;
                  return (
                    <TableRow
                      key={key}
                      data-state={selected ? "selected" : undefined}
                      onClick={() => onSelect(combo.combo)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          aria-pressed={selected}
                          className="cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {combo.combo.map((title, index) => (
                            <span key={title}>
                              {index > 0 && " + "}
                              <span className="whitespace-nowrap">
                                {titleLabel(title)}
                              </span>
                            </span>
                          ))}
                        </button>
                      </TableCell>
                      {plan.feasible ? (
                        <>
                          <TableCell className="text-right">
                            {plan.proven ? "" : "≤ "}
                            {plan.n}
                          </TableCell>
                          <TableCell className="text-right">
                            {plan.days}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {formatXp(plan.xp)}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell
                          colSpan={3}
                          className="text-right text-muted-foreground"
                        >
                          no plan
                        </TableCell>
                      )}
                    </TableRow>
                  );
                }),
              ];
            })}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}
