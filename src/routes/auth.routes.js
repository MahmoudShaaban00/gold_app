import express from "express";
import { login , getAllUsers} from "../controllers/auth.js";

const router = express.Router();

router.post("/signin", login);
router.get("/users", getAllUsers);



export default router;