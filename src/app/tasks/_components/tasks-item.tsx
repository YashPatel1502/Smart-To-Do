"use client";

import {
  CalendarDays,
  Check,
  Edit,
  Mail,
  MoreVertical,
  Trash,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskWithDates } from "@/types/task";
import { cn } from "@/lib/utils";

type Props = {
  task: TaskWithDates;
  onEdit: (task: TaskWithDates) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (task: TaskWithDates) => void;
  disabled?: boolean;
};

export function TaskItem({ task, onEdit, onDelete, onToggleStatus, disabled }: Props) {
  const dueDateText = task.dueDate
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(task.dueDate)
    : "No due date";

  const isCompleted = task.status === "COMPLETED";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "text-lg font-semibold transition-all duration-300",
                isCompleted && "text-muted-foreground line-through opacity-75"
              )}
            >
              {task.title}
            </h3>
            <Badge className={priorityClass(task.priority)}>
              {task.priority.toLowerCase()}
            </Badge>
          </div>
          {task.category && (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {task.category}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusClass(task.status)}>
            {task.status.replace("_", " ").toLowerCase()}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={disabled}>
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Task actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground">{task.description}</p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs sm:text-sm">{dueDateText}</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              !task.emailNotification && "opacity-60"
            )}
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              !task.calendarSync && "opacity-60"
            )}
          >
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </span>
        </div>

        <Button
          size="sm"
          variant={isCompleted ? "outline" : "secondary"}
          onClick={() => onToggleStatus(task)}
          disabled={disabled}
          className="w-full sm:w-auto transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isCompleted ? "Mark active" : "Complete task"}
        </Button>
      </div>
    </div>
  );
}

const priorityClass = (priority: TaskWithDates["priority"]) => {
  switch (priority) {
    case "HIGH":
      return "bg-destructive text-destructive-foreground";
    case "MEDIUM":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const statusClass = (status: TaskWithDates["status"]) => {
  switch (status) {
    case "IN_PROGRESS":
      return "border-blue-500/40 text-blue-600 dark:text-blue-300";
    case "COMPLETED":
      return "border-emerald-500/40 text-emerald-600 dark:text-emerald-300";
    default:
      return "";
  }
};
