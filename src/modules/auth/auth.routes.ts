import { Router } from "express";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { AuthController } from "./auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/refresh", authController.refresh.bind(authController));
router.post("/logout", authController.logout.bind(authController));

router.post("/logoutAll", authenticate, authController.logoutAll.bind(authController));
router.get("/profile", authenticate, authController.getProfile.bind(authController));

export default router;
