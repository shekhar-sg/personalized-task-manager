import type {NextFunction, Request, Response} from "express";
import {StatusCodes} from "http-status-codes";
import z from "zod";
import {ApiResponse} from "../../shared/lib/response";
import type {AuthRequest} from "../../shared/types";
import {loginSchema, registerSchema} from "./auth.dto";
import {AuthService} from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: z.flattenError(result.error).fieldErrors,
        });
      }
      const data = await authService.register(result.data);

      ApiResponse.setAccessTokenCookie(res, data.accessToken);
      ApiResponse.setRefreshTokenCookie(res, data.refreshToken);

      return ApiResponse.created(res, "Account created successfully", {
        user: data.user,
        accessToken: data.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: z.flattenError(result.error).fieldErrors,
        });
      }

      const data = await authService.login(result.data);

      ApiResponse.setAccessTokenCookie(res, data.accessToken);
      ApiResponse.setRefreshTokenCookie(res, data.refreshToken);

      return ApiResponse.success(res, "Account login successfully", {
        user: data.user,
        accessToken: data.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const data = await authService.refresh(refreshToken);

      ApiResponse.setAccessTokenCookie(res, data.refreshToken);
      ApiResponse.setRefreshTokenCookie(res, data.refreshToken);

      return ApiResponse.success(res, "Token refreshed successfully", {
        accessToken: data.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      await authService.logout(refreshToken);

      ApiResponse.clearAccessTokenCookie(res);
      ApiResponse.clearRefreshTokenCookie(res);

      return ApiResponse.success(res, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logoutAll(req.user!.userId);

      ApiResponse.clearAccessTokenCookie(res);
      ApiResponse.clearRefreshTokenCookie(res);

      return ApiResponse.success(res, "Logged out from all devices");
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      return ApiResponse.success(res, "Profile retrieved successfully", {
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}
