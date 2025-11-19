import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TaskWithDates } from "@/types/task";

type Props = {
  tasks: TaskWithDates[];
};

export function TaskSummary({ tasks }: Props) {
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
      {metrics.map((metric) => (
        <Card
          key={metric.label}
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
      ))}
    </div>
  );
}
