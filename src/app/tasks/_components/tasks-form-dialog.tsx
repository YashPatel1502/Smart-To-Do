"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TaskFormValues } from "@/types/task";

import { TaskForm } from "./tasks-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  mode: "create" | "edit";
  isSubmitting?: boolean;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  mode,
  isSubmitting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create a task" : "Update task"}
          </DialogTitle>
          <DialogDescription>
            Configure task metadata, integrations, and due date.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={onSubmit}
          initialValues={initialValues}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
