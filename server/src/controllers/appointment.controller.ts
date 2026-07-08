import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  AppointmentStatus,
  isValidTransition,
} from "../types/appointment.types";

// POST /api/appointments — book an appointment
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { providerId, serviceId, date } = req.body;

    if (!providerId || !serviceId || !date) {
      return res.status(400).json({
        message: "providerId, serviceId, and date are required",
      });
    }

    // Step 1: check provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Step 2: check service exists and belongs to provider
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.providerId !== providerId) {
      return res.status(400).json({
        message: "Service does not belong to this provider",
      });
    }

    // Step 3: check slot is in provider availability
const appointmentDate = new Date(date);

// Use UTC date to avoid timezone issues
const dateOnly = new Date(Date.UTC(
  appointmentDate.getUTCFullYear(),
  appointmentDate.getUTCMonth(),
  appointmentDate.getUTCDate()
));

const availability = await prisma.availability.findFirst({
  where: {
    providerId,
    date: dateOnly,
  },
});

// Extract HH:MM in UTC to match stored slots
const hours = appointmentDate.getUTCHours().toString().padStart(2, "0");
const minutes = appointmentDate.getUTCMinutes().toString().padStart(2, "0");
const requestedTime = `${hours}:${minutes}`;

    if (!availability || !availability.slots.includes(requestedTime)) {
      return res.status(400).json({
        message: `Slot ${requestedTime} is not available for this provider`,
      });
    }

    // Step 4: check for double booking
    const conflict = await prisma.appointment.findFirst({
      where: {
        providerId,
        date: appointmentDate,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });
    if (conflict) {
      return res.status(409).json({
        message: "This slot is already booked",
      });
    }

    // Step 5: create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: req.userId!,
        providerId,
        serviceId,
        date: appointmentDate,
        status: "PENDING",
      },
      include: {
        service: true,
        provider: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    // Step 6: notify provider
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        message: `New appointment request for ${service.name} on ${appointmentDate.toDateString()}`,
      },
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/appointments — get appointments for logged-in user
export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const where =
      req.userRole === "PROVIDER"
        ? { providerId: req.userId }
        : { clientId: req.userId };

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        provider: {
          include: { user: { select: { name: true, email: true } } },
        },
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "asc" },
    });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/appointments/:id — get single appointment
export const getAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        provider: {
          include: { user: { select: { name: true, email: true } } },
        },
        client: { select: { id: true, name: true, email: true } },
      },
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// PUT /api/appointments/:id — update appointment status
export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Validate status transition
    const valid = isValidTransition(
      appointment.status as AppointmentStatus,
      status as AppointmentStatus,
      req.userRole!
    );
    if (!valid) {
      return res.status(400).json({
        message: `Invalid transition from ${appointment.status} to ${status} for role ${req.userRole}`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Notify the other party
    const notifyUserId =
      req.userRole === "PROVIDER"
        ? appointment.clientId
        : appointment.providerId;

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        message: `Your appointment status has been updated to ${status}`,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// DELETE /api/appointments/:id — cancel appointment
export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only client who owns the appointment can cancel
    if (appointment.clientId !== req.userId) {
      return res.status(403).json({
        message: "You can only cancel your own appointments",
      });
    }

    // Can only cancel PENDING or CONFIRMED
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot cancel an appointment with status ${appointment.status}`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED" },
    });

    res.json({ message: "Appointment cancelled", appointment: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};