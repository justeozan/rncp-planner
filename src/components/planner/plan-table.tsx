import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatXp } from "./format";
import type { PlannerData, Project } from "./types";

interface PlanTableProps {
  ids: number[];
  data: PlannerData;
  mask: number;
}

function categoryNames(project: Project, data: PlannerData): string[] {
  return (project.c ?? []).map((code) => data.meta.cats[code] ?? code);
}

function chainIsActive(project: Project, data: PlannerData, mask: number) {
  if (!project.ch) {
    return false;
  }
  const index = data.chains.findIndex((chain) => chain.id === project.ch?.[0]);
  return index >= 0 && ((mask >> index) & 1) === 1;
}

function ProjectBadges({
  project,
  data,
  mask,
}: { project: Project; data: PlannerData; mask: number }) {
  const chain = project.ch;
  return (
    <>
      {project.t.includes("exp") && (
        <Badge variant="secondary">experience</Badge>
      )}
      {project.t.includes("suite") && <Badge variant="secondary">suite</Badge>}
      {project.t.includes("0 validation") && (
        <Badge
          variant="outline"
          className="border-destructive/60 text-destructive"
          title="Nobody has ever validated it: it may be closed on your campus."
        >
          0 validation
        </Badge>
      )}
      {project.sub ? (
        <Badge variant="outline">+{project.sub} modules</Badge>
      ) : null}
      {chain && chainIsActive(project, data, mask) && (
        <Badge
          variant="outline"
          title={`Step ${chain[1]} of ${chain[2]}: requires the ${chain[1] - 1} previous ones`}
        >
          {chain[0]} {chain[1]}/{chain[2]}
        </Badge>
      )}
    </>
  );
}

export function PlanTable({ ids, data, mask }: PlanTableProps) {
  const rows = ids
    .map((id) => ({ id, project: data.projects[String(id)] }))
    .filter((row) => row.project)
    .sort((a, b) => b.project.xp - a.project.xp);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle
          tag="h3"
          className="text-xl"
        >
          Projects
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Sorted by XP. A tag like kfs 4/10 means the project is step 4 of a
          chain, so steps 1 to 3 are part of the plan too.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead className="hidden md:table-cell">Categories</TableHead>
              <TableHead className="text-right">XP</TableHead>
              <TableHead className="text-right">Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ id, project }) => {
              const categories = categoryNames(project, data);
              return (
                <TableRow key={id}>
                  <TableCell className="align-top">
                    <p className="font-medium">{project.n}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <ProjectBadges
                        project={project}
                        data={data}
                        mask={mask}
                      />
                    </div>
                    <p className="mt-1 text-muted-foreground text-xs md:hidden">
                      {categories.join(" · ")}
                    </p>
                  </TableCell>
                  <TableCell className="hidden align-top md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {categories.map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="font-normal"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right align-top">
                    {formatXp(project.xp)}
                  </TableCell>
                  <TableCell className="text-right align-top">
                    {project.d}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
