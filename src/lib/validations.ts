import { z } from "zod";

export const taskStatusValues = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export const taskPriorityValues = ["LOW", "MEDIUM", "HIGH"] as const;

const optionalText = (max: number) =>
  z
    .union([z.string().max(max), z.string().length(0), z.null()])
    .optional()
    .transform((value) => (value ? value : null));

const optionalDate = z
  .union([z.string().datetime({ offset: true }), z.string().length(0), z.null()])
  .optional()
  .transform((value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  });

const baseTaskSchema = z.object({
  title: z.string().min(1).max(140),
  description: optionalText(2000),
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(taskPriorityValues).optional(),
  category: optionalText(120),
  dueDate: optionalDate,
  emailNotification: z.boolean().optional(),
  calendarSync: z.boolean().optional(),
});

export const taskCreateSchema = baseTaskSchema.extend({
  status: z.enum(taskStatusValues).default("PENDING"),
  priority: z.enum(taskPriorityValues).default("MEDIUM"),
  emailNotification: z.boolean().default(true),
  calendarSync: z.boolean().default(true),
});

export const taskUpdateSchema = baseTaskSchema.partial().extend({
  id: z.string().cuid(),
});

export const taskQuerySchema = z.object({
  status: z.enum(taskStatusValues).optional(),
  priority: z.enum(taskPriorityValues).optional(),
  category: z
    .string()
    .optional()
    .transform((val) => (val ? val : undefined)),
  search: z
    .string()
    .optional()
    .transform((val) => (val ? val : undefined)),
  dueFrom: z.string().optional(),
  dueTo: z.string().optional(),
  completed: z
    .string()
    .optional()
    .transform((val) => (val ? val === "true" : undefined)),
});
