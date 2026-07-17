import express from "express";
import { signin, refreshToken, getAllUsers} from "../controllers/auth.js";

const router = express.Router();

router.post("/signin", signin);
router.post("/refresh-token", refreshToken);
router.get("/users", getAllUsers);

export default router;