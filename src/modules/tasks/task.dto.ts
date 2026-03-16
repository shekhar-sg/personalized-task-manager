import {z} from "zod";
import {Priority, Status} from "../../../generated/prisma";

export const createTaskSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot exceed 255 characters")
    .trim(),

  description: z
    .string({ error: "Description must be a string" })
    .min(0, "Description cannot be empty")
    .max(1000, "Description must be less than 1000 characters")
    .trim(),

  priority: z
    .enum(Priority, {
      error: "Priority must be LOW, MEDIUM or HIGH",
    })
    .default(Priority.MEDIUM),

  status: z
    .enum(Status, {
      error: "Status must be PENDING, IN_PROGRESS, COMPLETED or OVERDUE",
    })
    .default(Status.PENDING),

  dueDate: z.iso.datetime({ message: "Invalid date format" }).optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be less than 255 characters")
    .trim()
    .optional(),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .optional(),

  priority: z
    .enum(Priority, {
      error: "Priority must be LOW, MEDIUM or HIGH",
    })
    .optional(),

  status: z
    .enum(Status, {
      error: "Status must be PENDING, IN_PROGRESS, COMPLETED or OVERDUE",
    })
    .optional(),

  dueDate: z.iso.datetime({ message: "Invalid date format" }).optional().nullable(),
});

export const taskQuerySchema = z.object({
  status: z.enum(Status).optional(),

  priority: z.enum(Priority).optional(),

  search: z.string().trim().optional(),

  page: z.coerce.number().min(1, "Page must be at least 1").default(1),

  limit: z.coerce.number().min(1).max(100, "Limit must be less than 100").default(10),

  sortBy: z.enum(["createdAt", "dueDate", "priority", "title"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
