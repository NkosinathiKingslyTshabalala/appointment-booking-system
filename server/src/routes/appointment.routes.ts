import { Router } from "express";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.controller";
import {
  requireClient,
  requireProvider,
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/", ...requireClient, getAppointments);
router.get("/:id", authenticate, getAppointment);
router.post("/", ...requireClient, createAppointment);
router.put("/:id", ...requireProvider, updateAppointment);
router.delete("/:id", ...requireClient, deleteAppointment);

export default router;