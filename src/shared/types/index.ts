import type {Request} from "express";
import type {Priority, Status} from "../../../generated/prisma/enums.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
}

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "dueDate" | "priority" | "title";
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
