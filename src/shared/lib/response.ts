import type {Response} from "express";
import {StatusCodes} from "http-status-codes";

const isProduction = process.env.NODE_ENV === "production";

export class ApiResponse {
  static success(
    res: Response,
    message: string,
    data: unknown = null,
    statusCode: number = StatusCodes.OK
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  static validationError(res: Response, errors: Record<string, string[] | undefined>) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  static paginated(
    res: Response,
    message: string,
    data: unknown[],
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }
  ) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static created(res: Response, message: string, data: unknown = null) {
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res: Response) {
    return res.status(StatusCodes.NO_CONTENT).json({});
  }

  static setAccessTokenCookie(res: Response, token: string) {
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });
  }

  static clearAccessTokenCookie(res: Response) {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
    });
  }

  static setRefreshTokenCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  static clearRefreshTokenCookie(res: Response) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
    });
  }
}
