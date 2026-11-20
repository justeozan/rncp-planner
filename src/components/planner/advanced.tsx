"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import type { Chain } from "./types";

const CHAIN_TEXT: Record<string, { title: string; description: string }> = {
  kfs: {
    title: "kfs series",
    description:
      "Each kfs project requires the previous one, from kfs-1 to kfs-10.",
  },
  "appr-1an": {
    title: "Work-study, 1 year",
    description: "The 4 sub-projects are successive evaluation periods.",
  },
  "appr-2ans": {
    title: "Work-study, 2 years",
    description: "Year 2 comes after year 1, with 4 periods each.",
  },
  virus: {
    title: "Malware series",
    description:
      "woody-woodpacker, famine, pestilence, war, death. Check on your campus intra that they really are chained; if not, turn it off.",
  },
};

interface AdvancedProps {
  chains: Chain[];
  mask: number;
  onlyFull: boolean;
  rate: number;
  onMaskChange: (mask: number) => void;
}

export function Advanced({
  chains,
  mask,
  onlyFull,
  rate,
  onMaskChange,
}: AdvancedProps) {
  return (
    <Collapsible className="group/advanced">
      <CollapsibleTrigger asChild>
        <Button
          variant="secondary"
          className="w-full justify-between"
        >
          Advanced
          <ChevronDownIcon
            aria-hidden
            className="size-4 transition-transform group-data-[state=open]/advanced:rotate-180"
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <p className="text-muted-foreground text-sm">
          Prerequisite chains: when a chain is on, picking step N also means
          doing steps 1 to N-1, and the plan counts them.
        </p>
        <div className="divide-y rounded-md border">
          {chains.map((chain, index) => {
            const text = CHAIN_TEXT[chain.id] ?? {
              title: chain.label,
              description: chain.note,
            };
            const id = `chain-${chain.id}`;
            const checked = ((mask >> index) & 1) === 1;
            return (
              <div
                key={chain.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="space-y-1">
                  <label
                    htmlFor={id}
                    className="flex flex-wrap items-center gap-2 font-medium text-sm"
                  >
                    {text.title}
                    <Badge
                      variant="outline"
                      className="font-normal"
                    >
                      {chain.n} steps
                    </Badge>
                    {chain.confidence !== "certain" && (
                      <Badge
                        variant="secondary"
                        className="font-normal"
                      >
                        unverified
                      </Badge>
                    )}
                  </label>
                  <p className="text-muted-foreground text-sm">
                    {text.description}
                  </p>
                </div>
                <Switch
                  id={id}
                  checked={checked}
                  disabled={onlyFull}
                  onCheckedChange={(on) =>
                    onMaskChange(
                      on ? mask | (1 << index) : mask & ~(1 << index),
                    )
                  }
                />
              </div>
            );
          })}
        </div>
        <p className="text-muted-foreground text-xs">
          How it's computed: the time estimate is about {rate} days per 1,000 XP
          (or the duration reported on the intra when known), and durations add
          up rather than run in parallel. Events are not planned.{" "}
          <Link
            className="underline underline-offset-1 transition-colors hover:text-foreground"
            prefetch={false}
            href="https://github.com/justeozan/rncp-planner/blob/main/optimizer/README.md"
          >
            Learn more.
          </Link>
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
