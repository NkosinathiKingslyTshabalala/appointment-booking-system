import { Router } from "express";
import {
  getAvailability,
  getAvailabilityByProvider,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from "../controllers/availability.controller";
import { requireProvider } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getAvailability);
router.get("/:providerId", getAvailabilityByProvider);

// Protected routes — provider only
router.post("/", ...requireProvider, createAvailability);
router.put("/:id", ...requireProvider, updateAvailability);
router.delete("/:id", ...requireProvider, deleteAvailability);

export default router;