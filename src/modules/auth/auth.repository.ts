import type {User} from "../../../generated/prisma/client.js";
import {prisma} from "../../shared/lib/prisma.js";

export class AuthRepository implements AuthRepository {
  async createUser(data: { name: string; email: string; password: string }): Promise<User> {
    return prisma.user.create({ data });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateUser(
    id: string,
    data: Partial<{ name: string; email: string; password: string }>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async saveRefreshToken(data: { token: string; userId: string; expiresAt: Date }): Promise<void> {
    await prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { token } });
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
