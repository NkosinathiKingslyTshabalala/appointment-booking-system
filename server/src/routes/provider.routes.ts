import { Router } from "express";
import { getProviders, getProvider, updateProvider } from "../controllers/provider.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getProviders);
router.get("/:id", getProvider);
router.put("/:id", authenticate, authorizeRoles("PROVIDER", "ADMIN"), updateProvider);

export default router;