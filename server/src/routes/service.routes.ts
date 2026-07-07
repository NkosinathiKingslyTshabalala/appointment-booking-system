import { Router } from "express";
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.controller";
import { requireProvider } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getServices);
router.get("/:id", getService);

// Protected routes — provider only
router.post("/", ...requireProvider, createService);
router.put("/:id", ...requireProvider, updateService);
router.delete("/:id", ...requireProvider, deleteService);

export default router;