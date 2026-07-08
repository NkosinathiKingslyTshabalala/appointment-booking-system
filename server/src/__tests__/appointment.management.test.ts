import request from "supertest";
import app from "../app";
import prisma from "../config/prisma";

// ── Helpers ──────────────────────────────────────────────
async function registerAndGetToken(
  email: string,
  role: "CLIENT" | "PROVIDER" | "ADMIN"
) {
  const res = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "password123",
    role,
  });
  return { token: res.body.token as string, userId: res.body.user.id as string };
}

async function setupProviderAndBook() {
  // Register provider
  const { token: providerToken } = await registerAndGetToken(
    "provider@example.com",
    "PROVIDER"
  );

  // Create provider profile
  const provider = await request(app)
    .post("/api/providers")
    .set("Authorization", `Bearer ${providerToken}`)
    .send({ bio: "Test bio", qualification: "Test qual" });

  // Create service
  const service = await request(app)
    .post("/api/services")
    .set("Authorization", `Bearer ${providerToken}`)
    .send({ name: "Haircut", price: 150, duration: 30 });

  // Create availability
  await request(app)
    .post("/api/availability")
    .set("Authorization", `Bearer ${providerToken}`)
    .send({ date: "2026-08-10", slots: ["09:00", "10:00"] });

  // Register client and book
  const { token: clientToken, userId: clientId } = await registerAndGetToken(
    "client@example.com",
    "CLIENT"
  );

  const appointment = await request(app)
    .post("/api/appointments")
    .set("Authorization", `Bearer ${clientToken}`)
    .send({
      providerId: provider.body.id,
      serviceId: service.body.id,
      date: "2026-08-10T09:00:00.000Z",
    });

  return {
    providerToken,
    clientToken,
    appointmentId: appointment.body.id,
    appointment: appointment.body,
  };
}

// ── Clean DB ─────────────────────────────────────────────
beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ── Tests ─────────────────────────────────────────────────
describe("Appointment Management", () => {

  // Test 1: provider confirms → 200 CONFIRMED
  it("provider confirms appointment → 200 CONFIRMED", async () => {
    const { providerToken, appointmentId } = await setupProviderAndBook();

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/confirm`)
      .set("Authorization", `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("CONFIRMED");
  });

  // Test 2: provider completes → 200 COMPLETED
  it("provider completes confirmed appointment → 200 COMPLETED", async () => {
    const { providerToken, appointmentId } = await setupProviderAndBook();

    // First confirm
    await request(app)
      .put(`/api/appointments/${appointmentId}/confirm`)
      .set("Authorization", `Bearer ${providerToken}`);

    // Then complete
    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/complete`)
      .set("Authorization", `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("COMPLETED");
  });

  // Test 3: client cancels → 200 CANCELLED
  it("client cancels appointment → 200 CANCELLED", async () => {
    const { clientToken, appointmentId } = await setupProviderAndBook();

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("CANCELLED");
  });

  // Test 4: invalid transition → 400 (cancel a COMPLETED)
  it("cannot cancel a COMPLETED appointment → 400", async () => {
    const { providerToken, clientToken, appointmentId } =
      await setupProviderAndBook();

    // Confirm then complete
    await request(app)
      .put(`/api/appointments/${appointmentId}/confirm`)
      .set("Authorization", `Bearer ${providerToken}`);

    await request(app)
      .put(`/api/appointments/${appointmentId}/complete`)
      .set("Authorization", `Bearer ${providerToken}`);

    // Try to cancel completed appointment
    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("COMPLETED");
  });

  // Test 5: cannot complete a PENDING appointment → 400
  it("cannot complete a PENDING appointment → 400", async () => {
    const { providerToken, appointmentId } = await setupProviderAndBook();

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/complete`)
      .set("Authorization", `Bearer ${providerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("PENDING");
  });

  // Test 6: client cannot confirm → 403
  it("CLIENT cannot confirm appointment → 403", async () => {
    const { clientToken, appointmentId } = await setupProviderAndBook();

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/confirm`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });

  // Test 7: unauthenticated cannot confirm → 401
  it("unauthenticated cannot confirm → 401", async () => {
    const { appointmentId } = await setupProviderAndBook();

    const res = await request(app)
      .put(`/api/appointments/${appointmentId}/confirm`);

    expect(res.status).toBe(401);
  });
});