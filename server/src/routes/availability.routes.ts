import { Router } from "express";
import { getAvailability, createAvailability, updateAvailability, deleteAvailability } from "../controllers/availability.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getAvailability);
router.post("/", authenticate, authorizeRoles("PROVIDER"), createAvailability);
router.put("/:id", authenticate, authorizeRoles("PROVIDER"), updateAvailability);
router.delete("/:id", authenticate, authorizeRoles("PROVIDER"), deleteAvailability);

export default router;