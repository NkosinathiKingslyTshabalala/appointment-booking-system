import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: req.userId },
      include: { service: true, provider: { include: { user: { select: { name: true } } } } },
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { service: true, provider: true, client: true },
    });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { providerId, serviceId, date } = req.body;
    const conflict = await prisma.appointment.findFirst({
      where: { providerId, date: new Date(date), status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (conflict) return res.status(409).json({ message: "Slot already booked" });
    const appointment = await prisma.appointment.create({
      data: { clientId: req.userId!, providerId, serviceId, date: new Date(date), status: "PENDING" },
    });
    await prisma.notification.create({
      data: { userId: req.userId!, message: "Your appointment has been booked." },
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};