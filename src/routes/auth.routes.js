import express from "express";
import { login , getAllUsers} from "../controllers/auth.js";
import {authMiddleware , adminMiddleware} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signin", login);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);



export default router;