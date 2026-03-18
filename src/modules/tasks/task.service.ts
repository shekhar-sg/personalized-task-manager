import { type Prisma, Status } from "../../../generated/prisma/client.js";
import { NotFoundError } from "../../shared/lib/appError.js";
import type { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from "./task.dto.js";
import { TaskRepository } from "./task.repository.js";

const taskRepository = new TaskRepository();

export class TaskService {
  async getAllTasks(userId: string, filters: TaskQueryDto) {
    const where: Prisma.TaskWhereInput = {
      userId,
      isDeleted: false,
    };
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.search?.trim()) {
      where.OR = [
        { title: { contains: filters.search.trim(), mode: "insensitive" } },
        { description: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [filters.sortBy || "createdAt"]: filters.sortOrder || "desc",
    };

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const { tasks, total } = await taskRepository.findMany(where, orderBy, skip, limit);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getTaskById(id: string, userId: string) {
    const task = await taskRepository.findOne({
      id,
      userId,
      isDeleted: false,
    });

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return task;
  }

  async createTask(userId: string, input: CreateTaskDto) {
    return taskRepository.create({
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
      user: { connect: { id: userId } },
    });
  }

  async updateTask(id: string, userId: string, input: UpdateTaskDto) {
    const task = await taskRepository.findOne({
      id,
      userId,
      isDeleted: false,
    });

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return taskRepository.update(
      { id },
      {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
      }
    );
  }

  async deleteTask(id: string, userId: string) {
    const task = await taskRepository.findOne({
      id,
      userId,
      isDeleted: false,
    });

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    await taskRepository.update({ id }, { isDeleted: true, deletedAt: new Date() });
  }

  async getTaskStats(userId: string) {
    const where: Prisma.TaskWhereInput = {
      userId,
      isDeleted: false,
    };

    const [total, completed, pending, inProgress, overdue] = await Promise.all([
      taskRepository.count(where),
      taskRepository.count({ ...where, status: Status.COMPLETED }),
      taskRepository.count({ ...where, status: Status.PENDING }),
      taskRepository.count({ ...where, status: Status.IN_PROGRESS }),
      taskRepository.count({
        ...where,
        status: { not: Status.COMPLETED },
        dueDate: { lt: new Date() },
      }),
    ]);

    return { total, completed, pending, inProgress, overdue };
  }
}
