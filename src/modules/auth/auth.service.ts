import bcrypt from "bcryptjs";
import {ConflictError, NotFoundError, UnauthorizedError} from "../../shared/lib/appError";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken,} from "../../shared/lib/jwt";
import {prisma} from "../../shared/lib/prisma";
import type {UserPayload} from "../../shared/types";
import type {ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto} from "./auth.dto";
import {AuthRepository} from "./auth.repository";

const authRepository = new AuthRepository();

const getRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
};

const formatUser = (user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}): UserPayload => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

export class AuthService {
  async register(input: RegisterDto) {
    const existingUser = await authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
      });

      const refreshToken = generateRefreshToken({
        userId: newUser.id,
        email: newUser.email,
      });

      await tx.refreshToken.create({
        data: {
          token: refreshToken,
          userId: newUser.id,
          expiresAt: getRefreshTokenExpiry(),
        },
      });

      return { newUser, refreshToken };
    });

    const accessToken = generateAccessToken({
      userId: user.newUser.id,
      email: user.newUser.email,
    });

    return {
      user: formatUser(user.newUser),
      accessToken,
      refreshToken: user.refreshToken,
    };
  }

  async login(input: LoginDto) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    await authRepository.saveRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    const savedToken = await authRepository.findRefreshToken(refreshToken);
    if (!savedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (savedToken.expiresAt < new Date()) {
      await authRepository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedError("Refresh token expired. Please log in again");
    }

    const payload = verifyRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });
    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
    });

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({ where: { token: refreshToken } });
      await tx.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: payload.userId,
          expiresAt: getRefreshTokenExpiry(),
        },
      });
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    const savedToken = await authRepository.findRefreshToken(refreshToken);
    if (!savedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    await authRepository.deleteRefreshToken(refreshToken);
  }

  async logoutAll(userId: string) {
    await authRepository.deleteAllRefreshTokens(userId);
  }

  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return formatUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    if (input.email) {
      const existingUser = await authRepository.findUserByEmail(input.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("Email already in use");
      }
    }

    const user = await authRepository.updateUser(userId, {
      ...(input.name && { name: input.name }),
      ...(input.email && { email: input.email }),
    });

    return formatUser(user);
  }

  async changePassword(userId: string, input: ChangePasswordDto) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(input.newPassword, 12);
    await authRepository.updateUser(userId, { password: hashedPassword });
  }
}
