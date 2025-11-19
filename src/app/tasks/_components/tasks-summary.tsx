import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { TaskWithDates } from "@/types/task";

type Props = {
  tasks: TaskWithDates[];
  onCreate?: () => void;
  isMutating?: boolean;
};

export function TaskSummary({ tasks, onCreate, isMutating }: Props) {
  const completed = tasks.filter((task) => task.status === "COMPLETED").length;
  const active = tasks.length - completed;

  const dueSoon = tasks.filter((task) => {
    if (!task.dueDate || task.status === "COMPLETED") return false;
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + 2);
    return task.dueDate <= threshold && task.dueDate >= now;
  }).length;

  const metrics = [
    {
      label: "Open tasks",
      value: active,
      helper: `${completed} completed`,
    },
    {
      label: "Due in 48h",
      value: dueSoon,
      helper: "Keep momentum",
    },
    {
      label: "All tasks",
      value: tasks.length,
      helper: "Across statuses",
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="flex flex-col gap-2">
          {index === 2 && onCreate && (
            <Button
              onClick={onCreate}
              disabled={isMutating}
              className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              New task
            </Button>
          )}
          <Card
            className="border-muted/50 transition-all duration-300 hover:border-primary/30 hover:shadow-md"
          >
            <CardHeader className="pb-0.5 pt-1.5">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-1.5">
              <div className="flex items-baseline justify-between">
                <p className="text-4xl font-bold tracking-tight text-foreground">
                {metric.value}
              </p>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{metric.helper}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
