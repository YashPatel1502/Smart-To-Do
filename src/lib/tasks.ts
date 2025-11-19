/**
 * Task Management Service
 * 
 * Core business logic for task CRUD operations, including:
 * - Database operations via Prisma ORM
 * - Email notifications via SendGrid
 * - Calendar event synchronization via Google Calendar API
 * - Status management and completion tracking
 * 
 * @module lib/tasks
 */

import { z } from "zod";

import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  sendTaskCreatedEmail,
  sendTaskUpdatedEmail,
  sendTaskDeletedEmail,
} from "./email";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "./calendar";
import {
  taskCreateSchema,
  taskQuerySchema,
  taskUpdateSchema,
} from "./validations";

type TaskPayload = z.infer<typeof taskCreateSchema>;
type TaskUpdatePayload = z.infer<typeof taskUpdateSchema>;
type TaskQuery = z.infer<typeof taskQuerySchema>;

/**
 * Normalizes task payload for creation (all fields required).
 * Handles null/undefined values safely.
 */
const normalizePayload = (payload: Partial<TaskPayload>) => {
  // Validate required fields for creation
  if (!payload.title || typeof payload.title !== "string") {
    throw new Error("Task title is required");
  }

  return {
  title: payload.title,
  description: payload.description ?? null,
    status: payload.status ?? "PENDING",
    priority: payload.priority ?? "MEDIUM",
  category: payload.category ?? null,
  dueDate: payload.dueDate ?? null,
    emailNotification: payload.emailNotification ?? true,
    calendarSync: payload.calendarSync ?? true,
  };
};

/**
 * Normalizes partial task payload for updates (only provided fields).
 * Handles null/undefined values safely.
 */
const normalizePartialPayload = (payload: Partial<TaskPayload>) => {
  const normalized: Partial<ReturnType<typeof normalizePayload>> = {};

  // Only include fields that are explicitly provided
  if (payload.title !== undefined) {
    if (!payload.title || typeof payload.title !== "string") {
      throw new Error("Task title must be a non-empty string");
    }
    normalized.title = payload.title;
  }
  if (payload.description !== undefined) {
    normalized.description = payload.description ?? null;
  }
  if (payload.status !== undefined) {
    normalized.status = payload.status;
  }
  if (payload.priority !== undefined) {
    normalized.priority = payload.priority;
  }
  if (payload.category !== undefined) {
    normalized.category = payload.category ?? null;
  }
  if (payload.dueDate !== undefined) {
    normalized.dueDate = payload.dueDate ?? null;
  }
  if (payload.emailNotification !== undefined) {
    normalized.emailNotification = payload.emailNotification;
  }
  if (payload.calendarSync !== undefined) {
    normalized.calendarSync = payload.calendarSync;
  }

  return normalized;
};

const computeCompletedAt = (
  previousStatus: string | null,
  nextStatus: string | undefined
) => {
  if (nextStatus === "COMPLETED") {
    return new Date();
  }

  if (previousStatus === "COMPLETED" && nextStatus !== "COMPLETED") {
    return null;
  }

  return undefined;
};

const buildWhereClause = (params: TaskQuery, userId: string): Prisma.TaskWhereInput => {
  const where: Prisma.TaskWhereInput = {
    userId, // Always filter by user
  };

  if (params.status) {
    where.status = params.status;
  }

  if (params.priority) {
    where.priority = params.priority;
  }

  if (params.category) {
    where.category = params.category;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.dueFrom || params.dueTo) {
    where.dueDate = {};
    if (params.dueFrom) {
      const from = new Date(params.dueFrom);
      if (!Number.isNaN(from.getTime())) {
        where.dueDate.gte = from;
      }
    }
    if (params.dueTo) {
      const to = new Date(params.dueTo);
      if (!Number.isNaN(to.getTime())) {
        where.dueDate.lte = to;
      }
    }
  }

  if (typeof params.completed !== "undefined") {
    where.completedAt = params.completed ? { not: null } : null;
  }

  return where;
};

/**
 * Synchronizes calendar events after task write operations.
 * Handles create, update, and delete of calendar events based on task state.
 * 
 * @param task - Task object with calendar sync information
 * @returns Promise resolving to calendar event ID or null
 */
const syncCalendarAfterWrite = async (task: {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  calendarSync: boolean;
  calendarEventId: string | null;
  priority: string;
  userId: string | null;
}) => {
  if (!task.calendarSync || !task.dueDate) {
    try {
      await deleteCalendarEvent(task.calendarEventId ?? undefined, task.userId ?? undefined);
    } catch (error) {
      console.error("[tasks] Failed to delete calendar event during sync", error);
    }
    return null;
  }

  try {
  if (task.calendarEventId) {
      return await updateCalendarEvent(task.calendarEventId, {
        title: task.title,
        description: task.description ?? undefined,
        dueDate: task.dueDate,
        priority: task.priority,
        taskId: task.id,
        userId: task.userId ?? undefined,
      });
    }

    return await createCalendarEvent({
      title: task.title,
      description: task.description ?? undefined,
      dueDate: task.dueDate,
      priority: task.priority,
      taskId: task.id,
      userId: task.userId ?? undefined,
    });
  } catch (error) {
    console.error("[tasks] Calendar sync failed", error);
    return null;
  }
};

/**
 * Retrieves tasks from the database with optional filtering.
 * 
 * Supports filtering by status, priority, category, search query, and completion status.
 * Results are ordered by due date (ascending), priority (descending), and creation date (descending).
 * 
 * @param query - URLSearchParams or TaskQuery object with filter criteria
 * @returns Promise resolving to an array of tasks matching the query
 * @throws {z.ZodError} If query parameters fail validation
 */
export const listTasks = async (query: URLSearchParams | TaskQuery, userId: string) => {
  try {
  const parsed =
    query instanceof URLSearchParams
      ? taskQuerySchema.parse(Object.fromEntries(query.entries()))
      : query;

    const where = buildWhereClause(parsed, userId);

    return await prisma.task.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });
  } catch (error) {
    // Re-throw validation errors
    if (error instanceof z.ZodError) {
      throw error;
    }
    // Wrap database errors
    console.error("[tasks] Failed to list tasks", error);
    throw new Error("Failed to retrieve tasks from database");
  }
};

/**
 * Creates a new task in the database.
 * 
 * Automatically handles:
 * - Email notification (if enabled and task has due date)
 * - Calendar event creation (if enabled and task has due date)
 * - Calendar event ID storage for future updates
 * 
 * Integrations are non-blocking - failures don't prevent task creation.
 * 
 * @param payload - Validated task creation payload
 * @returns Promise resolving to the created task (with calendarEventId if applicable)
 * @throws {Error} If database operation fails
 */
export const createTask = async (payload: TaskPayload, userId: string, userEmail: string) => {
  try {
  const data = normalizePayload(payload);
  
  // Set completedAt if task is created as COMPLETED
  const completedAt = data.status === "COMPLETED" ? new Date() : null;
  
  const task = await prisma.task.create({
      data: {
        ...data,
        userId,
        completedAt,
      },
  });

  // Handle email and calendar for tasks with due dates
  // Note: Even if task is COMPLETED, we still create calendar events and send emails
  // as the user may have set a due date for tracking purposes
  if (task.dueDate) {
    // Send email notification (non-blocking)
    if (task.emailNotification) {
      try {
      await sendTaskCreatedEmail({
        title: task.title,
        description: task.description ?? undefined,
        dueDate: task.dueDate,
        priority: task.priority,
          status: task.status,
          category: task.category ?? undefined,
        }, userEmail);
      } catch (error) {
        console.error("[tasks] Email notification failed, task still created", error);
    }
    }

    // Create calendar event (non-blocking)
    // Create calendar event even for completed tasks if they have a due date
    if (task.calendarSync) {
      try {
      const eventId = await createCalendarEvent({
        title: task.title,
        description: task.description ?? undefined,
        dueDate: task.dueDate,
        priority: task.priority,
        taskId: task.id,
          userId,
      });

      if (eventId) {
        return prisma.task.update({
          where: { id: task.id },
          data: { calendarEventId: eventId },
        });
        }
      } catch (error) {
        console.error("[tasks] Calendar sync failed, task still created", error);
      }
    }
  } else if (task.status === "COMPLETED" && task.emailNotification) {
    // Send email notification even for completed tasks without due dates
    try {
      await sendTaskCreatedEmail({
        title: task.title,
        description: task.description ?? undefined,
        dueDate: null,
        priority: task.priority,
        status: task.status,
        category: task.category ?? undefined,
      }, userEmail);
    } catch (error) {
      console.error("[tasks] Email notification failed, task still created", error);
    }
  }

  return task;
  } catch (error) {
    // Handle Prisma errors
    console.error("[tasks] Failed to create task", error);
    if (error instanceof Error) {
      // Re-throw with original message for known errors
      throw error;
    }
    throw new Error("Failed to create task in database");
  }
};

/**
 * Updates an existing task in the database.
 * 
 * Handles:
 * - Status transitions and completion tracking
 * - Previous status restoration (for reactivating completed tasks)
 * - Calendar event synchronization (create/update/delete)
 * - Email notifications for all updates
 * 
 * Integrations are non-blocking - failures don't prevent task updates.
 * 
 * @param payload - Validated task update payload with task ID
 * @returns Promise resolving to the updated task
 * @throws {Error} If task not found or database operation fails
 */
export const updateTask = async (payload: TaskUpdatePayload, userId: string, userEmail: string) => {
  try {
  const existing = await prisma.task.findUnique({
    where: { id: payload.id },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

    // Verify task belongs to user
    if (existing.userId !== userId) {
      throw new Error("Unauthorized");
    }

  const completedAt = computeCompletedAt(existing.status, payload.status);
    
    // Store previous status when marking as completed (for restoration)
    let previousStatus = existing.previousStatus;
    if (payload.status === "COMPLETED" && existing.status !== "COMPLETED") {
      previousStatus = existing.status;
    }
    // Clear previousStatus when reactivating from completed
    if (existing.status === "COMPLETED" && payload.status !== "COMPLETED") {
      previousStatus = null;
    }

  const updated = await prisma.task.update({
    where: { id: payload.id },
    data: {
        ...normalizePartialPayload(payload),
        previousStatus,
      completedAt:
        typeof completedAt === "undefined"
          ? existing.completedAt
          : completedAt,
    },
  });

  let nextTask = updated;

  // Sync calendar events (non-blocking)
  if (updated.dueDate) {
    try {
      const eventId = await syncCalendarAfterWrite({
        ...updated,
        userId: updated.userId,
      });
    if (eventId && eventId !== updated.calendarEventId) {
      nextTask = await prisma.task.update({
        where: { id: updated.id },
        data: { calendarEventId: eventId },
      });
    }
    } catch (error) {
      console.error("[tasks] Calendar sync failed, task still updated", error);
    }
  } else {
    try {
      await deleteCalendarEvent(updated.calendarEventId ?? undefined, userId);
      if (updated.calendarEventId) {
        nextTask = await prisma.task.update({
          where: { id: updated.id },
          data: { calendarEventId: null },
        });
      }
    } catch (error) {
      console.error("[tasks] Calendar cleanup failed, task still updated", error);
    }
  }

  // Send email notification for all updates (non-blocking)
  // Ensures emails are sent for ANY update: priority change, status change, description change, etc.
    if (nextTask.emailNotification) {
    try {
      await sendTaskUpdatedEmail({
        title: nextTask.title,
        description: nextTask.description ?? undefined,
        dueDate: nextTask.dueDate,
        priority: nextTask.priority,
        status: nextTask.status,
        category: nextTask.category ?? undefined,
      }, userEmail);
    } catch (error) {
      console.error("[tasks] Email notification failed, task still updated", error);
    }
  }

    return nextTask;
  } catch (error) {
    // Handle Prisma errors
    console.error("[tasks] Failed to update task", error);
    if (error instanceof Error) {
      // Re-throw known errors (e.g., "Task not found")
      throw error;
    }
    throw new Error("Failed to update task in database");
  }
};

/**
 * Deletes a task from the database.
 * 
 * Handles cleanup:
 * - Sends email notification before deletion (if enabled)
 * - Deletes associated calendar event
 * - Removes task from database
 * 
 * Integrations are non-blocking - failures don't prevent task deletion.
 * 
 * @param id - Task ID to delete
 * @returns Promise resolving to the deleted task
 * @throws {Error} If task not found or database operation fails
 */
export const deleteTask = async (id: string, userId: string, userEmail: string) => {
  try {
    // Validate ID format
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new Error("Invalid task ID");
    }

    // Fetch task data before deleting so we can send email notification
    const task = await prisma.task.findUnique({
    where: { id },
  });

    if (!task) {
      throw new Error("Task not found");
    }

    // Verify task belongs to user
    if (task.userId !== userId) {
      throw new Error("Unauthorized");
    }

  // Send email notification before deleting (non-blocking)
  if (task.emailNotification) {
    try {
      await sendTaskDeletedEmail({
        title: task.title,
        description: task.description ?? undefined,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        category: task.category ?? undefined,
      }, userEmail);
    } catch (error) {
      console.error("[tasks] Email notification failed, task still deleted", error);
    }
  }

  // Delete calendar event if it exists (non-blocking)
  if (task.calendarEventId) {
    try {
      await deleteCalendarEvent(task.calendarEventId, userId);
    } catch (error) {
      console.error("[tasks] Calendar cleanup failed, task still deleted", error);
    }
  }

    // Delete the task from database
    return await prisma.task.delete({
      where: { id },
    });
  } catch (error) {
    // Handle Prisma errors
    console.error("[tasks] Failed to delete task", error);
    if (error instanceof Error) {
      // Re-throw known errors (e.g., "Task not found", "Invalid task ID")
      throw error;
    }
    throw new Error("Failed to delete task from database");
  }
};
