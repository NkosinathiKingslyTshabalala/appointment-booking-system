import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/availability — provider adds availability for a date
export const createAvailability = async (req: AuthRequest, res: Response) => {
  try {
    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: req.userId },
    });
    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found. Create a provider profile first.",
      });
    }

    const { date, slots } = req.body;

    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({
        message: "date and slots (non-empty array) are required",
      });
    }

    // Check for duplicate date for this provider
    const existing = await prisma.availability.findFirst({
      where: {
        providerId: provider.id,
        date: new Date(date),
      },
    });
    if (existing) {
      return res.status(400).json({
        message: "Availability for this date already exists. Update it instead.",
      });
    }

    const availability = await prisma.availability.create({
      data: {
        providerId: provider.id,
        date: new Date(date),
        slots,
      },
    });

    res.status(201).json(availability);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/availability/:providerId — get all availability for a provider
export const getAvailabilityByProvider = async (
  req: Request,
  res: Response
) => {
  try {
    const { providerId } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const availability = await prisma.availability.findMany({
      where: { providerId },
      orderBy: { date: "asc" },
    });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/availability — get all availability
export const getAvailability = async (_req: Request, res: Response) => {
  try {
    const availability = await prisma.availability.findMany({
      include: { provider: true },
      orderBy: { date: "asc" },
    });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// PUT /api/availability/:id — update slots for an existing availability
export const updateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.availability.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Availability not found" });
    }

    // Verify ownership
    const provider = await prisma.provider.findUnique({
      where: { userId: req.userId },
    });
    if (!provider || existing.providerId !== provider.id) {
      return res.status(403).json({
        message: "You can only update your own availability",
      });
    }

    const availability = await prisma.availability.update({
      where: { id: req.params.id },
      data: { slots: req.body.slots },
    });

    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// DELETE /api/availability/:id — remove an availability slot
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.availability.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Availability not found" });
    }

    // Verify ownership
    const provider = await prisma.provider.findUnique({
      where: { userId: req.userId },
    });
    if (!provider || existing.providerId !== provider.id) {
      return res.status(403).json({
        message: "You can only delete your own availability",
      });
    }

    await prisma.availability.delete({ where: { id: req.params.id } });

    res.json({ message: "Availability deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};