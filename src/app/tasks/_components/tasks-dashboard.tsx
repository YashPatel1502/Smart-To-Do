"use client";

import { useMemo, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  useCreateTask,
  useDeleteTask,
  useTasksQuery,
  useUpdateTask,
} from "@/hooks/use-tasks";
import type {
  TaskFilters,
  TaskFormValues,
  TaskWithDates,
} from "@/types/task";

import { AnimatedText } from "@/components/animated-text";
import { GoogleCalendarButton } from "./google-calendar-button";
import { TaskFiltersBar } from "./tasks-filters";
import { TaskFormDialog } from "./tasks-form-dialog";
import { TaskList } from "./tasks-list";
import { TaskSummary } from "./tasks-summary";

const defaultFilters: TaskFilters = {
  status: "ALL",
  priority: "ALL",
  search: "",
  showCompleted: false,
};

const emptyFormValues: TaskFormValues = {
  title: "",
  description: "",
  status: "PENDING",
  priority: "MEDIUM",
  category: "",
  dueDate: null,
  emailNotification: true,
  calendarSync: true,
};

export function TasksDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithDates | null>(null);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  const queryFilters = useMemo(
    () => ({
      status: filters.status !== "ALL" ? filters.status : undefined,
      priority: filters.priority !== "ALL" ? filters.priority : undefined,
      search: filters.search || undefined,
      showCompleted: filters.showCompleted,
    }),
    [filters]
  );

  const { data: tasks = [], isLoading, isFetching } = useTasksQuery(queryFilters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isMutating =
    createTask.isPending || updateTask.isPending || deleteTask.isPending;

  const handleSubmit = async (values: TaskFormValues) => {
    const isEditing = !!editingTask;
    const toastId = toast.loading(
      isEditing ? "Updating your task..." : "Creating your task...",
      {
        icon: "⏳",
      }
    );

    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          values,
        });
        toast.success(
          `✅ Task "${values.title}" has been updated successfully!`,
          { id: toastId }
        );
      } else {
        await createTask.mutateAsync(values);
        toast.success(
          `🎉 Task "${values.title}" has been created successfully!`,
          { id: toastId }
        );
      }
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(
        isEditing
          ? "Failed to update task. Please try again."
          : "Failed to create task. Please try again.",
        { id: toastId }
      );
    }
  };

  const handleEdit = (task: TaskWithDates) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = (taskId: string) => {
    deleteTask.mutate(taskId);
  };

  const handleStatusToggle = (task: TaskWithDates) => {
    let nextStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    
    if (task.status === "COMPLETED") {
      // Restore to previous status if available, otherwise default to PENDING
      const prevStatus = task.previousStatus ?? null;
      if (prevStatus === "PENDING" || prevStatus === "IN_PROGRESS") {
        nextStatus = prevStatus;
      } else {
        nextStatus = "PENDING";
      }
    } else {
      nextStatus = "COMPLETED";
    }
    
    updateTask.mutate({
      id: task.id,
      values: { status: nextStatus },
    });
  };

  const currentInitialValues: TaskFormValues = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description ?? "",
        status: editingTask.status,
        priority: editingTask.priority,
        category: editingTask.category ?? "",
        dueDate: editingTask.dueDate,
        emailNotification: editingTask.emailNotification,
        calendarSync: editingTask.calendarSync,
      }
    : { ...emptyFormValues };

  return (
    <section className="space-y-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Smart To-Do
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-left">
            Plan, prioritize, and ship
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <GoogleCalendarButton />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          {session?.user?.email && (
            <p className="text-xs text-muted-foreground">
              {session.user.email}
            </p>
          )}
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2">
        <div className="flex-1">
          <AnimatedText className="text-center sm:text-left" speed={4000} tasks={tasks} />
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={isMutating}
          className="transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          New task
        </Button>
      </div>

      <div className="space-y-4">
        <TaskSummary tasks={tasks} />

        <TaskFiltersBar
          filters={filters}
          onChange={setFilters}
          isLoading={isFetching}
        />
      </div>

      <TaskList
        tasks={tasks}
        isLoading={isLoading || isFetching}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleStatusToggle}
        isMutating={isMutating}
        onCreate={() => setDialogOpen(true)}
      />

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={(next) => {
          if (!next) setEditingTask(null);
          setDialogOpen(next);
        }}
        initialValues={currentInitialValues}
        onSubmit={handleSubmit}
        mode={editingTask ? "edit" : "create"}
        isSubmitting={isMutating}
      />
    </section>
  );
}
