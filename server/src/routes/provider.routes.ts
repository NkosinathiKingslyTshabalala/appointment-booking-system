import { Router } from "express";
import {
  getProviders,
  getProvider,
  updateProvider,
} from "../controllers/provider.controller";
import { requireProviderOrAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getProviders);
router.get("/:id", getProvider);
router.put("/:id", ...requireProviderOrAdmin, updateProvider);

export default router;