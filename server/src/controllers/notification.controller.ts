import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { id: req.params.id as string },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id as string },
      data: { read: true },
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
