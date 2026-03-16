import type {Prisma, Task} from "../../../generated/prisma";
import {prisma} from "../../shared/lib/prisma";

export class TaskRepository {
  async findMany(
    where: Prisma.TaskWhereInput,
    orderBy?: Prisma.TaskOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<{ tasks: Task[]; total: number }> {
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async findOne(where: Prisma.TaskWhereInput): Promise<Task | null> {
    return prisma.task.findFirst({ where });
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({ data });
  }

  async update(where: Prisma.TaskWhereUniqueInput, data: Prisma.TaskUpdateInput): Promise<Task> {
    return prisma.task.update({ where, data });
  }

  async delete(where: Prisma.TaskWhereUniqueInput): Promise<void> {
    await prisma.task.delete({ where });
  }

  async count(where: Prisma.TaskWhereInput): Promise<number> {
    return prisma.task.count({ where });
  }
}
