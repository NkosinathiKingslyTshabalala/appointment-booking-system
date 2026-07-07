import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/services — create service for logged-in provider
export const createService = async (req: AuthRequest, res: Response) => {
  try {
    // Find the provider profile linked to this user
    const provider = await prisma.provider.findUnique({
      where: { userId: req.userId },
    });
    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found. Create a provider profile first.",
      });
    }

    const { name, price, duration } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({
        message: "name, price, and duration are required",
      });
    }

    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
      },
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/services?providerId= — list all or filter by provider
export const getServices = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.query;

    const services = await prisma.service.findMany({
      where: providerId ? { providerId: providerId as string } : undefined,
      include: {
        provider: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/services/:id — get single service
export const getService = async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        provider: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// PUT /api/services/:id — update service
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    // Verify service exists
    const existing = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Verify the logged-in provider owns this service
    const provider = await prisma.provider.findUnique({
      where: { userId: req.userId },
    });
    if (!provider || existing.providerId !== provider.id) {
      return res.status(403).json({
        message: "You can only update your own services",
      });
    }

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        duration: req.body.duration ? parseInt(req.body.duration) : undefined,
      },
    });

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// DELETE /api/services/:id — delete service
export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    // Verify service exists
    const existing = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Verify the logged-in provider owns this service
    const provider = await prisma.provider.findUnique({
      where: { userId: req.userId },
    });
    if (!provider || existing.providerId !== provider.id) {
      return res.status(403).json({
        message: "You can only delete your own services",
      });
    }

    await prisma.service.delete({ where: { id: req.params.id } });

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};