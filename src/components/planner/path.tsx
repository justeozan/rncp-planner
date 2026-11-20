import { CircleAlertIcon, CircleIcon } from "lucide-react";
import { formatXp } from "./format";
import type { Check, PlannerData, Project, TitleKey } from "./types";

const SKIPPED_SHOWN = 2;
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

const GOLD = "bg-[#b0954c] text-neutral-900";

/** Short card titles, so the two bars fit next to them. */
const SHORT: Record<string, string> = {
  "Object Oriented Programming": "OOP",
  "Functional programming": "Functional",
  "Imperative programming": "Imperative",
  "System administration": "SysAdmin",
  "Artificial Intelligence": "AI",
  "Web - Database": "Web · DB",
  "Experiences pro": "Internships",
};

function names(ids: number[] | undefined, data: PlannerData): string[] {
  return (ids ?? [])
    .map((id) => data.projects[String(id)]?.n)
    .filter((name): name is string => Boolean(name));
}

function ChosenRow({ project, data }: { project: Project; data: PlannerData }) {
  const chain = project.ch;
  const pre = names(project.pre, data);
  const tip = [
    `${formatXp(project.xp)} XP · ${project.d} days`,
    project.sub ? `Piscine: ${project.sub} modules` : "",
    chain && chain[1] > 1
      ? `Step ${chain[1]}/${chain[2]} of ${chain[0]}: previous steps included`
      : "",
    pre.length > 0 ? `Unlocked by ${pre.join(", ")}` : "",
    project.t.includes("0 validation")
      ? "Never validated: may be closed on your campus"
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <li
      title={tip}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-1 text-sm ${GOLD}`}
    >
      <CircleIcon
        aria-hidden
        className="size-4 shrink-0"
      />
      <span className="min-w-0 truncate font-medium">{project.n}</span>
      {project.t.includes("0 validation") && (
        <CircleAlertIcon
          aria-hidden
          className="size-3.5 shrink-0"
        />
      )}
      {chain && chain[1] > 1 ? (
        <span className="shrink-0 text-xs opacity-70">
          {chain[1]}/{chain[2]}
        </span>
      ) : pre.length > 0 && project.n.length + pre[0].length < 16 ? (
        <span className="truncate text-xs opacity-70">after {pre[0]}</span>
      ) : null}
      <span className="ml-auto shrink-0 tabular-nums">
        {formatXp(project.xp)} xp
      </span>
    </li>
  );
}

/** What taking this project instead would cost, as one stat. */
function cost(
  item: Entry,
  section: Section,
  taken: Set<number>,
  data: PlannerData,
): { label: string; tip: string } {
  const missing = (item.project.pre ?? []).filter((id) => !taken.has(id));
  if (missing.length > 0) {
    return {
      label: `+${missing.length} project${missing.length > 1 ? "s" : ""}`,
      tip: `Needs ${names(missing, data).join(", ")} first`,
    };
  }
  const pool = section.own.length > 0 ? section.own : section.shared;
  const ref = pool.reduce<Entry | null>(
    (low, e) => (low && low.project.xp <= e.project.xp ? low : e),
    null,
  );
  if (ref && item.project.xp < ref.project.xp) {
    return {
      label: `−${formatXp(ref.project.xp - item.project.xp)} xp`,
      tip: `${formatXp(item.project.xp)} XP, less than ${ref.project.n}`,
    };
  }
  const extra = ref ? item.project.d - ref.project.d : item.project.d;
  return {
    label: `+${Math.max(extra, 1)} d`,
    tip: ref
      ? `${item.project.d} days, ${extra} more than ${ref.project.n}`
      : `${item.project.d} days`,
  };
}

function SkippedRows({
  section,
  taken,
  data,
}: { section: Section; taken: Set<number>; data: PlannerData }) {
  if (section.skipped.length === 0) {
    return null;
  }
  const shown = section.skipped.slice(0, SKIPPED_SHOWN);
  const rest = section.skipped.slice(SKIPPED_SHOWN);
  return (
    <>
      {shown.map((item) => {
        const c = cost(item, section, taken, data);
        return (
          <li
            key={item.id}
            title={`Not in the plan · ${c.tip}`}
            className="flex items-center gap-2.5 px-3 py-0.5 text-sm"
          >
            <CircleIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 truncate">{item.project.n}</span>
            <span className="ml-auto shrink-0 text-red-400 tabular-nums">
              {c.label}
            </span>
          </li>
        );
      })}
      {rest.length > 0 && (
        <li
          className="px-3 pl-[2.375rem] text-muted-foreground text-xs"
          title={rest.map((item) => item.project.n).join("\n")}
        >
          +{rest.length} other projects
        </li>
      )}
    </>
  );
}

function Bar({
  have,
  need,
  unit,
}: { have: number; need: number; unit: "xp" | "pj" }) {
  const ok = have >= need;
  const pct = need > 0 ? Math.min(100, (have / need) * 100) : 100;
  const value =
    unit === "xp"
      ? `${formatXp(have)} / ${formatXp(need)} XP`
      : `${have} / ${need} projects`;
  return (
    <span
      className="flex min-w-0 flex-1 items-center gap-1.5"
      title={value}
    >
      <span className="h-2.5 min-w-6 flex-1 overflow-hidden rounded-full bg-muted">
        <span
          className={`block h-full rounded-full ${ok ? "bg-[#b0954c]" : "bg-red-400"}`}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="shrink-0 text-muted-foreground text-xs">
        {unit === "pj" ? `${have}/${need}` : formatXp(have)} {unit}
      </span>
    </span>
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

  const taken = new Set([
    ...ids,
    ...data.baseline.done.map((project) => project.id),
  ]);

  return (
    <div className="gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
      {sections.map((section) => (
        <section
          key={section.name}
          className="mb-3 break-inside-avoid rounded-2xl border px-3 py-2.5"
        >
          <h2 className="mb-2 flex items-center gap-3 px-1">
            <span
              className="max-w-[45%] shrink-0 truncate font-semibold text-base"
              title={section.name}
            >
              {SHORT[section.name] ?? section.name}
            </span>
            {section.pool.size > 0 && (
              <>
                {section.need.xp > 0 && (
                  <Bar
                    have={section.xp}
                    need={section.need.xp}
                    unit="xp"
                  />
                )}
                <Bar
                  have={section.n}
                  need={section.need.n}
                  unit="pj"
                />
              </>
            )}
          </h2>
          <ul className="space-y-1">
            {section.own.map((item) => (
              <ChosenRow
                key={item.id}
                project={item.project}
                data={data}
              />
            ))}
            <SkippedRows
              section={section}
              taken={taken}
              data={data}
            />
          </ul>
          {section.shared.length > 0 && (
            <p className="mt-1.5 truncate px-3 text-muted-foreground text-xs">
              Also counts:{" "}
              {section.shared.map((item) => item.project.n).join(", ")}
            </p>
          )}
        </section>
      ))}
      {compact.length > 0 && (
        <section className="mb-3 break-inside-avoid space-y-2 rounded-2xl border px-4 py-3">
          {compact.map((section) => (
            <div key={section.name}>
              <p className="flex items-center gap-3">
                <span className="shrink-0 font-semibold text-sm">
                  {section.name}
                </span>
                <Bar
                  have={section.n}
                  need={section.need.n}
                  unit="pj"
                />
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {section.shared.map((item) => item.project.n).join(", ")}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
