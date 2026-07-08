import { Router } from "express";
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
} from "../controllers/appointment.controller";
import {
  requireClient,
  requireProvider,
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

// Public-ish routes
router.get("/", authenticate, getAppointments);
router.get("/:id", authenticate, getAppointment);

// Booking
router.post("/", ...requireClient, createAppointment);

// Status transitions
router.put("/:id/confirm", ...requireProvider, confirmAppointment);
router.put("/:id/complete", ...requireProvider, completeAppointment);
router.put("/:id/cancel", ...requireClient, cancelAppointment);

// Generic update and delete
router.put("/:id", authenticate, updateAppointment);
router.delete("/:id", ...requireClient, deleteAppointment);

export default router;