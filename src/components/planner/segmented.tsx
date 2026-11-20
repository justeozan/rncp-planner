import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
  className?: string;
}

/** Two or three mutually exclusive buttons, in the shadcn button style. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      aria-label={label}
      className={cn(
        "inline-flex w-fit shrink-0 rounded-md bg-secondary p-1",
        className,
      )}
    >
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={cn(
            "cursor-pointer whitespace-nowrap rounded-sm px-3 py-1 font-medium text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            value === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
