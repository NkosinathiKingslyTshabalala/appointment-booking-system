import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getAvailability = async (_req: Request, res: Response) => {
  try {
    const availability = await prisma.availability.findMany({ include: { provider: true } });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ message: "Provider profile not found" });
    const availability = await prisma.availability.create({
      data: { ...req.body, providerId: provider.id },
    });
    res.status(201).json(availability);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const availability = await prisma.availability.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteAvailability = async (req: Request, res: Response) => {
  try {
    await prisma.availability.delete({ where: { id: req.params.id } });
    res.json({ message: "Availability deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};