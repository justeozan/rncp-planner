import { Planner } from "@/components/planner/planner";
import {
  type Objective,
  type PlannerData,
  type PlannerInitialState,
  TITLE_KEYS,
  type TitleKey,
} from "@/components/planner/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import plannerData from "@/data/planner.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RNCP planner",
  description:
    "Shortest list of projects to get any combination of the four RNCP titles",
};

const data = plannerData as unknown as PlannerData;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseInitial(params: SearchParams): PlannerInitialState {
  const titles = (first(params.titles) ?? "")
    .split(",")
    .filter((key): key is TitleKey => TITLE_KEYS.includes(key as TitleKey));

  const by: Objective = first(params.by) === "days" ? "days" : "projects";

  const chains = Number.parseInt(first(params.chains) ?? "", 10);
  const mask =
    !data.only_full && chains >= 0 && chains <= data.full_mask ? chains : null;

  return { titles: titles.length > 0 ? titles : null, objective: by, mask };
}

export default async function PlannerPage({
  searchParams,
}: { searchParams: Promise<SearchParams> }) {
  const initial = parseInitial(await searchParams);

  return (
    <main className="@container flex grow items-start justify-center p-4 md:p-12 lg:p-24">
      <Card className="@max-[1400px]:w-full @min-[1400px]:w-[1400px] bg-card/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle tag="h1">RNCP planner</CardTitle>
          <CardDescription>
            The shortest list of projects to get the RNCP titles you want.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Planner
            data={data}
            initial={initial}
          />
        </CardContent>
      </Card>
    </main>
  );
}
