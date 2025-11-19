"use client";

import { Inbox } from "lucide-react";
import { AnimatedText } from "@/components/animated-text";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { TaskWithDates } from "@/types/task";

import { TaskItem } from "./tasks-item";

type Props = {
  tasks: TaskWithDates[];
  isLoading?: boolean;
  isMutating?: boolean;
  onEdit: (task: TaskWithDates) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (task: TaskWithDates) => void;
  onCreate?: () => void;
};

export function TaskList({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  isMutating,
  onCreate,
}: Props) {
  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-gradient-to-br from-card/60 to-card/40 py-16 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="rounded-full bg-muted p-4 text-muted-foreground animate-bounce">
          <Inbox className="h-6 w-6" />
        </div>
        <AnimatedText className="mt-4" speed={3500} />
        <p className="mt-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 delay-300">
          Create a task to kick-off your next sprint.
        </p>
        <Button
          className="mt-6 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 animate-in fade-in slide-in-from-bottom-2 delay-500"
          onClick={onCreate}
          disabled={isMutating}
          type="button"
        >
          Add a new task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="group rounded-2xl border bg-background p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "both",
          }}
        >
          <TaskItem
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            disabled={isMutating}
          />
          {index < tasks.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  );
}

const TaskListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={`skeleton-${index}`} className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-3 h-4 w-40" />
      </div>
    ))}
  </div>
);
