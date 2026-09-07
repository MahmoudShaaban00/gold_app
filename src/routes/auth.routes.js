import express from "express";
import { signin, refreshToken, getAllUsers} from "../controllers/auth.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";
import { validateSignin } from "../middlewares/validate.js";

const router = express.Router();

// validateSignin runs before the controller, so a malformed request is
// rejected with 400 without ever reaching User.findOne()/User.create().
router.post("/signin", validateSignin, signin);
router.post("/refresh-token", refreshToken);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

export default router;