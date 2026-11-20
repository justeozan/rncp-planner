import { Badge } from "@/components/ui/badge";
import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { Fragment } from "react";
import { formatXp } from "./format";
import type { Check, PlannerData, Project, TitleKey } from "./types";

const SKIPPED_SHOWN = 3;
/** General conditions where listing every other project would only be noise. */
const NO_SKIPPED = new Set(["Projet suite", "Projets de groupe"]);

interface Entry {
  id: number;
  project: Project;
}

interface Section {
  name: string;
  need: { xp: number; n: number };
  pool: Set<number>;
  own: Entry[];
  shared: Entry[];
  skipped: Entry[];
  xp: number;
  n: number;
}

function entry(id: number, data: PlannerData): Entry | null {
  const project = data.projects[String(id)];
  return project ? { id, project } : null;
}

function isEntry(value: Entry | null): value is Entry {
  return value !== null;
}

/** One section per condition. A project is listed in the first section it
 * counts for, and only mentioned in the others. */
function buildSections(
  ids: number[],
  checks: Check[],
  selected: TitleKey[],
  data: PlannerData,
): Section[] {
  const had = new Map(checks.map((check) => [check.l, check.h ?? 0]));
  const done = data.baseline.done.map((project) => project.id);
  const required = new Map<string, Section>();
  const add = (name: string, xp: number, n: number, pool: number[]) => {
    const prev = required.get(name);
    if (prev) {
      prev.need = {
        xp: Math.max(prev.need.xp, xp),
        n: Math.max(prev.need.n, n),
      };
      for (const id of pool) {
        prev.pool.add(id);
      }
      return;
    }
    required.set(name, {
      name,
      need: { xp, n },
      pool: new Set(pool),
      own: [],
      shared: [],
      skipped: [],
      xp: 0,
      n: 0,
    });
  };
  for (const key of selected) {
    for (const option of data.titles[key].options) {
      add(option.t, option.xp, option.n, option.ids);
    }
  }
  const general: [string, number][] = [
    ["Experiences pro", Math.max(...selected.map((k) => data.titles[k].exp))],
    ["Projet suite", Math.max(...selected.map((k) => data.titles[k].suite))],
    [
      "Projets de groupe",
      Math.max(...selected.map((k) => data.titles[k].group)),
    ],
  ];
  for (const [name, n] of general) {
    if (n > 0) {
      add(name, 0, n, data.pools[name] ?? []);
    }
  }

  const chosen = ids.map((id) => entry(id, data)).filter(isEntry);
  const taken = new Set([...ids, ...done]);
  const placed = new Set<number>();
  const sections = [...required.values()];
  for (const section of sections) {
    // Totals come from the optimizer (they include already validated projects).
    section.xp = had.get(`${section.name} · XP`) ?? 0;
    section.n =
      had.get(`${section.name} · projets`) ?? had.get(section.name) ?? 0;
    for (const id of done) {
      const item = entry(id, data);
      if (item && section.pool.has(id)) {
        section.shared.push(item);
      }
    }
    for (const item of chosen) {
      if (!section.pool.has(item.id)) {
        continue;
      }
      if (placed.has(item.id)) {
        section.shared.push(item);
      } else {
        section.own.push(item);
        placed.add(item.id);
      }
    }
    section.skipped = NO_SKIPPED.has(section.name)
      ? []
      : [...section.pool]
          .filter((id) => !taken.has(id))
          .map((id) => entry(id, data))
          .filter(isEntry)
          .sort((a, b) => b.project.xp - a.project.xp);
    section.own.sort((a, b) => b.project.d - a.project.d);
  }

  const extra = chosen.filter((item) => !placed.has(item.id));
  if (extra.length > 0) {
    sections.push({
      name: "Extra XP",
      need: { xp: 0, n: 0 },
      pool: new Set(),
      own: extra,
      shared: [],
      skipped: [],
      xp: extra.reduce((sum, item) => sum + item.project.xp, 0),
      n: extra.length,
    });
  }
  return sections;
}

function ProjectRow({
  project,
  data,
}: { project: Project; data: PlannerData }) {
  const chain = project.ch;
  const pre = (project.pre ?? [])
    .map((id) => data.projects[String(id)]?.n)
    .filter(Boolean);
  return (
    <li className="flex items-center gap-2 py-0.5 text-sm">
      <span className="min-w-0 truncate">{project.n}</span>
      {project.t.includes("0 validation") && (
        <CircleAlertIcon
          aria-label="Never validated: may be closed on your campus"
          className="size-3.5 shrink-0 text-destructive"
        >
          <title>Never validated: may be closed on your campus</title>
        </CircleAlertIcon>
      )}
      {project.sub ? (
        <Badge
          variant="outline"
          className="px-1.5 py-0 font-normal"
          title={`Piscine: ${project.sub} modules`}
        >
          {project.sub} mod.
        </Badge>
      ) : null}
      {chain && chain[1] > 1 ? (
        <Badge
          variant="outline"
          className="px-1.5 py-0 font-normal"
          title={`Step ${chain[1]} of ${chain[2]}: the ${chain[1] - 1} previous ones are included in the time`}
        >
          {chain[0]} {chain[1]}/{chain[2]}
        </Badge>
      ) : pre.length > 0 ? (
        <span
          className="truncate text-muted-foreground text-xs"
          title={`Unlocked by ${pre.join(", ")}`}
        >
          after {pre.join(", ")}
        </span>
      ) : null}
      <span className="ml-auto shrink-0 whitespace-nowrap text-muted-foreground text-xs tabular-nums">
        {formatXp(project.xp)} · {project.d} d
      </span>
    </li>
  );
}

function Meter({
  have,
  need,
  unit,
}: { have: number; need: number; unit: string }) {
  const ok = have >= need;
  return (
    <span
      className={`inline-flex items-center gap-0.5 tabular-nums ${ok ? "text-foreground" : "text-destructive"}`}
    >
      {ok && (
        <CheckIcon
          aria-hidden
          className="size-3"
        />
      )}
      {unit === "XP" ? formatXp(have) : have}
      <span className="text-muted-foreground">
        /{unit === "XP" ? formatXp(need) : need} {unit}
      </span>
    </span>
  );
}

function Skipped({ items, data }: { items: Entry[]; data: PlannerData }) {
  if (items.length === 0) {
    return null;
  }
  const shown = items.slice(0, SKIPPED_SHOWN);
  const rest = items.slice(SKIPPED_SHOWN);
  const tip = (item: Entry) => {
    const pre = (item.project.pre ?? [])
      .map((id) => data.projects[String(id)]?.n)
      .filter(Boolean);
    return `Not done: −${formatXp(item.project.xp)} XP, −1 project, saves ${item.project.d} days${
      pre.length ? ` · needs ${pre.join(", ")} first` : ""
    }`;
  };
  return (
    <p className="mt-1.5 break-words border-t border-dashed pt-1.5 text-muted-foreground text-xs leading-relaxed">
      <span className="mr-1">Skipped</span>
      {shown.map((item, i) => (
        <Fragment key={item.id}>
          <span
            title={tip(item)}
            className="whitespace-nowrap"
          >
            {item.project.n.length > 22
              ? `${item.project.n.slice(0, 20)}…`
              : item.project.n}{" "}
            <span className="tabular-nums opacity-70">
              −{formatXp(item.project.xp)}
            </span>
          </span>
          {i < shown.length - 1 || rest.length > 0 ? " · " : ""}
        </Fragment>
      ))}
      {rest.length > 0 && (
        <span
          title={rest
            .map((item) => `${item.project.n} −${formatXp(item.project.xp)}`)
            .join("\n")}
        >
          +{rest.length} more
        </span>
      )}
    </p>
  );
}

export function Path({
  ids,
  selected,
  data,
  checks,
}: {
  ids: number[];
  selected: TitleKey[];
  data: PlannerData;
  checks: Check[];
}) {
  const all = buildSections(ids, checks, selected, data);
  // Conditions met only through projects listed elsewhere: one line each.
  const compact = all.filter(
    (section) => section.own.length === 0 && section.skipped.length === 0,
  );
  const sections = all.filter((section) => !compact.includes(section));

  return (
    <div className="gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
      {sections.map((section) => (
        <section
          key={section.name}
          className="mb-3 break-inside-avoid rounded-md border px-3 py-2"
        >
          <h2 className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="truncate font-semibold text-sm">
              {section.name}
            </span>
            {section.pool.size > 0 && (
              <span className="flex shrink-0 gap-2 text-xs">
                {section.need.xp > 0 && (
                  <Meter
                    have={section.xp}
                    need={section.need.xp}
                    unit="XP"
                  />
                )}
                <Meter
                  have={section.n}
                  need={section.need.n}
                  unit="proj."
                />
              </span>
            )}
          </h2>
          {section.own.length > 0 && (
            <ul className="mt-1">
              {section.own.map((item) => (
                <ProjectRow
                  key={item.id}
                  project={item.project}
                  data={data}
                />
              ))}
            </ul>
          )}
          {section.shared.length > 0 && (
            <p className="mt-0.5 truncate text-muted-foreground text-xs">
              Also counts:{" "}
              {section.shared.map((item) => item.project.n).join(", ")}
            </p>
          )}
          <Skipped
            items={section.skipped}
            data={data}
          />
        </section>
      ))}
      {compact.length > 0 && (
        <section className="mb-3 break-inside-avoid space-y-0.5 rounded-md border px-3 py-2 text-xs">
          {compact.map((section) => (
            <p
              key={section.name}
              className="flex items-baseline gap-2"
            >
              <span className="shrink-0 font-semibold text-sm">
                {section.name}
              </span>
              <span className="min-w-0 truncate text-muted-foreground">
                {section.shared.map((item) => item.project.n).join(", ")}
              </span>
              <span className="ml-auto shrink-0">
                <Meter
                  have={section.n}
                  need={section.need.n}
                  unit="proj."
                />
              </span>
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
