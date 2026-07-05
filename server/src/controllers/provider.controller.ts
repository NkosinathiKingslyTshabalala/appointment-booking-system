import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getProviders = async (_req: Request, res: Response) => {
  try {
    const providers = await prisma.provider.findMany({
      include: { user: { select: { name: true, email: true } }, services: true },
    });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getProvider = async (req: Request, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true } }, services: true, availability: true },
    });
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateProvider = async (req: AuthRequest, res: Response) => {
  try {
    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: { bio: req.body.bio, qualification: req.body.qualification },
    });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};