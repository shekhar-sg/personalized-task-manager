import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {urlencoded} from "express";
import helmet from "helmet";
import {StatusCodes} from "http-status-codes";
import authRoutes from "./modules/auth/auth.routes";
import taskRoutes from "./modules/tasks/task.routes";
import {AppError} from "./shared/lib/appError";
import {ApiResponse} from "./shared/lib/response";

const app = express();
const port = process.env.PORT || 8080;
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (_req, res) => {
  res.status(StatusCodes.OK).json({
    status: "ok",
    message: "Task management API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use((_req, res) => {
  return ApiResponse.error(res, "Route Not Found", StatusCodes.NOT_FOUND);
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }
  console.error(err.stack);
  return ApiResponse.error(res, "Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR);
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Health check server is running on http://localhost:${port}/health`);
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;
