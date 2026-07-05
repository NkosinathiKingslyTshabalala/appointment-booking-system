import { Router } from "express";
import { register, login, getProfile, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../models/user.model";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/profile", authenticate, getProfile);
router.post("/logout", authenticate, logout);

export default router;