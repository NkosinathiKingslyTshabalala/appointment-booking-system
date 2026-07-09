import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// POST /api/providers — create provider profile for logged-in user
export const createProvider = async (req: AuthRequest, res: Response) => {
  try {
    // Check if profile already exists
    const existing = await prisma.provider.findUnique({
      where: { userId: req.userId },
    });
    if (existing) {
      return res.status(409).json({ message: "Provider profile already exists" });
    }

    const provider = await prisma.provider.create({
      data: {
        userId: req.userId!,
        bio: req.body.bio || null,
        qualification: req.body.qualification || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/providers — get all providers with their services
export const getProviders = async (_req: Request, res: Response) => {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        services: true,
      },
    });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// GET /api/providers/:id — get single provider with services
export const getProvider = async (req: Request, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id as string },
      include: {
        user: { select: { id: true, name: true, email: true } },
        services: true,
        availability: true,
      },
    });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// PUT /api/providers/:id — update bio and qualification
export const updateProvider = async (req: AuthRequest, res: Response) => {
  try {
    // Make sure provider exists
    const existing = await prisma.provider.findUnique({
      where: { id: req.params.id as string },
    });
    if (!existing) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const provider = await prisma.provider.update({
      where: { id: req.params.id as string },
      data: {
        bio: req.body.bio,
        qualification: req.body.qualification,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
