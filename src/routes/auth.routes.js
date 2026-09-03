import express from "express";
import { signin, refreshToken, getAllUsers} from "../controllers/auth.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/refresh-token", refreshToken);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

export default router;