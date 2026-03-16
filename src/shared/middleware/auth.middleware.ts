import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import type { AuthRequest } from "../types/index.js";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Access token expired.",
        });
      }
      if (error.name === "JsonWebTokenError") {
        res.status(401).json({
          success: false,
          message: "Invalid access token.",
        });
      }
    }

    res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};
