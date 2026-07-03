import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import providerRoutes from "./routes/provider.routes";
import serviceRoutes from "./routes/service.routes";
import availabilityRoutes from "./routes/availability.routes";
import appointmentRoutes from "./routes/appointment.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Appointment Booking API running" });
});

export default app;
