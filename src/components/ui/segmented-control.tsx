"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SegmentedControlProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: { value: T; label: string }[]
  "aria-label": string
  className?: string
}

/** Radio-group style toggle, styled like shadcn's Tabs list. */
function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={props["aria-label"]}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {options.map((option) => (
        // biome-ignore lint/a11y/useSemanticElements: custom radio styling
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value === option.value
              ? "bg-background text-foreground shadow-xs"
              : "hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export { SegmentedControl }
