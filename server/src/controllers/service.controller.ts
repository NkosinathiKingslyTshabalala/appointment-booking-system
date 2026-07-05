import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getServices = async (_req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({ include: { provider: true } });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getService = async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ message: "Provider profile not found" });
    const service = await prisma.service.create({
      data: { ...req.body, providerId: provider.id },
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};