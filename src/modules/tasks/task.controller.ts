import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { ApiResponse } from "../../shared/lib/response.js";
import type { AuthRequest } from "../../shared/types/index.js";
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "./task.dto.js";
import { TaskService } from "./task.service.js";

const taskService = new TaskService();

const extractTaskId = (id: string | string[] | undefined): string | null => {
  if (typeof id === "string") {
    return id;
  } else if (Array.isArray(id) && id.length > 0) {
    return id[0];
  }
  return null;
};

export class TaskController {
  async getAllTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = taskQuerySchema.safeParse(req.query);

      if (!result.success) {
        return ApiResponse.validationError(res, z.flattenError(result.error).fieldErrors);
      }

      const { tasks, pagination } = await taskService.getAllTasks(req.user!.userId, result.data);

      return ApiResponse.paginated(res, "Tasks retrieved successfully", tasks, pagination);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = extractTaskId(req.params.id);

      if (!taskId) {
        return ApiResponse.error(res, "Invalid task ID", StatusCodes.NOT_FOUND);
      }

      const task = await taskService.getTaskById(taskId, req.user!.userId);

      return ApiResponse.success(res, "Task retrieved successfully", task);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = createTaskSchema.safeParse(req.body);

      if (!result.success) {
        return ApiResponse.validationError(res, z.flattenError(result.error).fieldErrors);
      }

      const task = await taskService.createTask(req.user!.userId, result.data);
      return ApiResponse.created(res, "Task created successfully", task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = updateTaskSchema.safeParse(req.body);

      if (!result.success) {
        return ApiResponse.validationError(res, z.flattenError(result.error).fieldErrors);
      }

      const taskId = extractTaskId(req.params.id);
      if (!taskId) {
        return ApiResponse.error(res, "Invalid task ID", StatusCodes.NOT_FOUND);
      }

      const task = await taskService.updateTask(taskId, req.user!.userId, result.data);
      return ApiResponse.success(res, "Task updated successfully", task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = extractTaskId(req.params.id);
      if (!taskId) {
        return ApiResponse.error(res, "Invalid task ID", StatusCodes.NOT_FOUND);
      }

      await taskService.deleteTask(taskId, req.user!.userId);
      return ApiResponse.success(res, "Task deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  async getTaskStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await taskService.getTaskStats(req.user!.userId);
      return ApiResponse.success(res, "Task statistics retrieved successfully", stats);
    } catch (error) {
      next(error);
    }
  }
}
