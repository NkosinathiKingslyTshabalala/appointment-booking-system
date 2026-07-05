import { Router } from "express";
import { getServices, getService, createService, updateService, deleteService } from "../controllers/service.controller";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getServices);
router.get("/:id", getService);
router.post("/", authenticate, authorizeRoles("PROVIDER"), createService);
router.put("/:id", authenticate, authorizeRoles("PROVIDER"), updateService);
router.delete("/:id", authenticate, authorizeRoles("PROVIDER"), deleteService);

export default router;