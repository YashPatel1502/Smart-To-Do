import {
  taskPriorityValues,
  taskStatusValues,
} from "@/lib/validations";

export type TaskPriority = (typeof taskPriorityValues)[number];
export type TaskStatus = (typeof taskStatusValues)[number];

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: Date | null;
  emailNotification: boolean;
  calendarSync: boolean;
};

export type TaskFilters = {
  status?: TaskStatus | "ALL";
  priority?: TaskPriority | "ALL";
  category?: string;
  search?: string;
  showCompleted?: boolean;
};

export const taskPriorityOptions: { value: TaskPriority; label: string }[] =
  taskPriorityValues.map((priority) => ({
    value: priority,
    label: priority.replace("_", " "),
  }));

export const taskStatusOptions: { value: TaskStatus; label: string }[] =
  taskStatusValues.map((status) => ({
    value: status,
    label: status.replace("_", " "),
  }));

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  previousStatus: TaskStatus | null;
  priority: TaskPriority;
  category: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  emailNotification: boolean;
  calendarSync: boolean;
  calendarEventId: string | null;
};

export type TaskWithDates = Omit<
  Task,
  "dueDate" | "completedAt" | "createdAt" | "updatedAt"
> & {
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
