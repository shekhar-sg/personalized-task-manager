import type { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../lib/jwt.js";
import { ApiResponse } from "../lib/response.js";
import type { AuthRequest } from "../types/index.js";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const tokenFromCookie = req.cookies?.accessToken;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      ApiResponse.error(res, "Access denied. No token provided.", StatusCodes.UNAUTHORIZED);
      return;
    }

    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        ApiResponse.error(res, "Token expired. Please log in again.", StatusCodes.UNAUTHORIZED);
        return;
      }
      if (error.name === "JsonWebTokenError") {
        ApiResponse.error(res, "Invalid token", StatusCodes.UNAUTHORIZED);
        return;
      }
    }

    ApiResponse.error(res, "Authentication failed", StatusCodes.UNAUTHORIZED);
  }
};
