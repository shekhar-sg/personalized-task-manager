import cookieParser from "cookie-parser";
import cors from "cors";
import express, {urlencoded} from "express";
import authRoutes from "./modules/auth/auth.routes";

const app = express();
const port = process.env.PORT || 8080;
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

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Health check server is running on http://localhost:${port}/health`);
  console.log(`Server is running on http://localhost:${port}`);
});
