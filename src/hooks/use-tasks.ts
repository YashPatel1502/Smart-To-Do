import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";

import type {
  Task,
  TaskFilters,
  TaskFormValues,
  TaskWithDates,
} from "@/types/task";

const TASKS_KEY = ["tasks"];

/**
 * Safely parses a task from API response, converting date strings to Date objects.
 * Handles invalid dates gracefully.
 */
const parseTask = (task: Task): TaskWithDates => {
  const parseDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  return {
    ...task,
    dueDate: parseDate(task.dueDate),
    createdAt: parseDate(task.createdAt) ?? new Date(), // Fallback to current date if invalid
    updatedAt: parseDate(task.updatedAt) ?? new Date(),
    completedAt: parseDate(task.completedAt),
  };
};

const buildQueryString = (filters?: Partial<TaskFilters>) => {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (typeof filters.showCompleted === "boolean") {
    params.set("completed", String(filters.showCompleted));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
};

const serializePayload = (values: TaskFormValues) => ({
  title: values.title,
  description: values.description || null,
  status: values.status,
  priority: values.priority,
  category: values.category || null,
  dueDate: values.dueDate ? values.dueDate.toISOString() : null,
  emailNotification: values.emailNotification,
  calendarSync: values.calendarSync,
});

const serializePartialPayload = (values: Partial<TaskFormValues>) => {
  const payload: Record<string, unknown> = {};
  if (typeof values.title !== "undefined") payload.title = values.title;
  if (typeof values.description !== "undefined") {
    payload.description = values.description || null;
  }
  if (typeof values.status !== "undefined") payload.status = values.status;
  if (typeof values.priority !== "undefined")
    payload.priority = values.priority;
  if (typeof values.category !== "undefined") {
    payload.category = values.category || null;
  }
  if (typeof values.dueDate !== "undefined") {
    payload.dueDate = values.dueDate ? values.dueDate.toISOString() : null;
  }
  if (typeof values.emailNotification !== "undefined") {
    payload.emailNotification = values.emailNotification;
  }
  if (typeof values.calendarSync !== "undefined") {
    payload.calendarSync = values.calendarSync;
  }
  return payload;
};

/**
 * Safely handles API response, parsing JSON and checking for errors.
 * Handles network errors and invalid JSON gracefully.
 */
const handleResponse = async (response: Response) => {
  // Check if response is ok before parsing
  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errorPayload = await response.json();
      errorMessage = errorPayload.error ?? errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  // Parse JSON response
  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("Invalid response from server");
  }

  // Validate response structure
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid response format");
  }

  return payload.data as Task;
};

export const useTasksQuery = (filters?: Partial<TaskFilters>) => {
  const queryString = useMemo(() => buildQueryString(filters), [filters]);

  return useQuery({
    queryKey: [...TASKS_KEY, filters],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/tasks${queryString}`, {
          cache: "no-store",
        });

        // Handle network errors
        if (!response.ok) {
          let errorMessage = "Failed to fetch tasks";
          try {
            const errorPayload = await response.json();
            errorMessage = errorPayload.error ?? errorMessage;
          } catch {
            errorMessage = response.statusText || `HTTP ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        // Parse JSON response
        let result;
        try {
          result = await response.json();
        } catch (error) {
          throw new Error("Invalid response from server");
        }

        // Validate response structure
        if (!result || !Array.isArray(result.data)) {
          throw new Error("Invalid response format");
        }

        return (result.data as Task[]).map(parseTask);
      } catch (error) {
        // Re-throw with user-friendly message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Network error. Please check your connection.");
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes("HTTP 4")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: TaskFormValues) => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serializePayload(values)),
        });
        return parseTask(await handleResponse(response));
      } catch (error) {
        // Re-throw with user-friendly message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Network error. Please check your connection.");
      }
    },
    onSuccess: () => {
      // Toast is handled in the component
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Unable to create task");
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<TaskFormValues>;
    }) => {
      try {
        // Validate task ID
        if (!id || typeof id !== "string" || id.trim().length === 0) {
          throw new Error("Invalid task ID");
        }

        const response = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serializePartialPayload(values)),
        });
        return parseTask(await handleResponse(response));
      } catch (error) {
        // Re-throw with user-friendly message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Network error. Please check your connection.");
      }
    },
    onSuccess: () => {
      // Toast is handled in the component
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Unable to update task");
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Validate task ID
        if (!id || typeof id !== "string" || id.trim().length === 0) {
          throw new Error("Invalid task ID");
        }

        const response = await fetch(`/api/tasks/${id}`, {
          method: "DELETE",
        });
        return parseTask(await handleResponse(response));
      } catch (error) {
        // Re-throw with user-friendly message
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Network error. Please check your connection.");
      }
    },
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Unable to delete task");
    },
  });
};
