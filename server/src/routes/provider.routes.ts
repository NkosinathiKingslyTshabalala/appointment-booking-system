import { Router } from "express";
import {
  createProvider,
  getProviders,
  getProvider,
  updateProvider,
} from "../controllers/provider.controller";
import {
  requireProvider,
  requireProviderOrAdmin,
} from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getProviders);
router.get("/:id", getProvider);

// Protected routes
router.post("/", ...requireProvider, createProvider);
router.put("/:id", ...requireProviderOrAdmin, updateProvider);

export default router;