import { Badge } from "@/components/ui/badge";
import { CircleAlertIcon } from "lucide-react";
import { formatXp } from "./format";
import type { PlannerData, Project, TitleKey } from "./types";

interface Group {
  name: string;
  need?: { xp: number; n: number };
  projects: Project[];
}

/** One group per required category, each project shown once. */
function groupProjects(
  ids: number[],
  selected: TitleKey[],
  data: PlannerData,
): Group[] {
  const required = new Map<string, { xp: number; n: number }>();
  for (const key of selected) {
    for (const option of data.titles[key].options) {
      const prev = required.get(option.t);
      required.set(option.t, {
        xp: Math.max(prev?.xp ?? 0, option.xp),
        n: Math.max(prev?.n ?? 0, option.n),
      });
    }
  }

  const groups = new Map<string, Group>();
  for (const [name, need] of required) {
    groups.set(name, { name, need, projects: [] });
  }
  const internships: Group = { name: "Internships", projects: [] };
  const extra: Group = { name: "Extra XP", projects: [] };

  for (const id of ids) {
    const project = data.projects[String(id)];
    if (!project) {
      continue;
    }
    const category = (project.c ?? [])
      .map((code) => data.meta.cats[code])
      .find((name) => name && required.has(name));
    const group = category
      ? groups.get(category)
      : project.t.includes("exp")
        ? internships
        : extra;
    group?.projects.push(project);
  }

  return [...groups.values(), internships, extra]
    .filter((group) => group.projects.length > 0)
    .map((group) => ({
      ...group,
      projects: group.projects.sort((a, b) => b.d - a.d),
    }));
}

function ProjectRow({ project }: { project: Project }) {
  const chain = project.ch;
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
      {project.t.includes("suite") && (
        <Badge
          variant="secondary"
          className="px-1.5 py-0 font-normal"
        >
          suite
        </Badge>
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
      ) : null}
      <span className="ml-auto shrink-0 whitespace-nowrap text-muted-foreground text-xs tabular-nums">
        {formatXp(project.xp)} · {project.d} d
      </span>
    </li>
  );
}

export function Path({
  ids,
  selected,
  data,
}: { ids: number[]; selected: TitleKey[]; data: PlannerData }) {
  const groups = groupProjects(ids, selected, data);
  const shown = new Set(groups.map((group) => group.name));
  const covered = [
    ...new Set(
      selected.flatMap((key) => data.titles[key].options.map((o) => o.t)),
    ),
  ].filter((name) => !shown.has(name));

  return (
    <div className="gap-3 sm:columns-2 lg:columns-3 2xl:columns-4">
      {groups.map((group) => (
        <section
          key={group.name}
          className="mb-3 break-inside-avoid rounded-md border px-3 py-2"
        >
          <h2 className="flex items-baseline justify-between gap-2">
            <span className="truncate font-semibold text-sm">{group.name}</span>
            {group.need && (
              <span className="shrink-0 text-muted-foreground text-xs">
                {formatXp(group.need.xp)} XP · {group.need.n} proj.
              </span>
            )}
          </h2>
          <ul className="mt-1">
            {group.projects.map((project) => (
              <ProjectRow
                key={project.n}
                project={project}
              />
            ))}
          </ul>
        </section>
      ))}
      {covered.length > 0 && (
        <p className="mb-3 break-inside-avoid px-1 text-muted-foreground text-xs">
          Also covered by these projects: {covered.join(", ")}.
        </p>
      )}
    </div>
  );
}
