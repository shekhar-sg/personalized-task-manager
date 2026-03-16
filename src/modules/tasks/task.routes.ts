import {Router} from "express";
import {authenticate} from "../../shared/middleware/auth.middleware";
import {TaskController} from "./task.controller";

const router = Router();
const taskController = new TaskController();
router.use(authenticate);

router.get("/stats", taskController.getTaskStats);
router.get("/", taskController.getAllTasks.bind(taskController));
router.post("/", taskController.createTask.bind(taskController));
router.get("/:id", taskController.getTaskById.bind(taskController));
router.patch("/:id", taskController.updateTask.bind(taskController));
router.delete("/:id", taskController.deleteTask.bind(taskController));

export default router;
