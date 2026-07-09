import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import providerRoutes from "./routes/provider.routes";
import serviceRoutes from "./routes/service.routes";
import availabilityRoutes from "./routes/availability.routes";
import appointmentRoutes from "./routes/appointment.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);

// Root
app.get("/", (_req, res) => {
  res.json({ message: "Appointment Booking API running" });
});

// Health check — no auth, used by CI/CD and monitoring
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

export default app;