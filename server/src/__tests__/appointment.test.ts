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

async function createProviderProfile(token: string) {
  const res = await request(app)
    .post("/api/providers")
    .set("Authorization", `Bearer ${token}`)
    .send({ bio: "Test bio", qualification: "Test qual" });
  return res.body;
}

async function createService(token: string, providerId?: string) {
  const res = await request(app)
    .post("/api/services")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Haircut", price: 150, duration: 30 });
  return res.body;
}

async function createAvailability(token: string, date: string, slots: string[]) {
  const res = await request(app)
    .post("/api/availability")
    .set("Authorization", `Bearer ${token}`)
    .send({ date, slots });
  return res.body;
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
describe("Booking API", () => {

  // Test 1: valid booking → 201 PENDING
  it("CLIENT can book a valid slot → 201 PENDING", async () => {
    // Setup provider
    const { token: providerToken } = await registerAndGetToken(
      "provider@example.com",
      "PROVIDER"
    );
    const provider = await createProviderProfile(providerToken);
    const service = await createService(providerToken);
    await createAvailability(providerToken, "2026-08-10", ["09:00", "10:00"]);

    // Book as client
    const { token: clientToken } = await registerAndGetToken(
      "client@example.com",
      "CLIENT"
    );

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        providerId: provider.id,
        serviceId: service.id,
        date: "2026-08-10T09:00:00.000Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("PENDING");
    expect(res.body.service.name).toBe("Haircut");
  });

  // Test 2: book same slot again → 409
  it("booking same slot twice → 409 conflict", async () => {
    const { token: providerToken } = await registerAndGetToken(
      "provider2@example.com",
      "PROVIDER"
    );
    const provider = await createProviderProfile(providerToken);
    const service = await createService(providerToken);
    await createAvailability(providerToken, "2026-08-10", ["09:00"]);

    const { token: clientToken } = await registerAndGetToken(
      "client2@example.com",
      "CLIENT"
    );

    // First booking
    await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        providerId: provider.id,
        serviceId: service.id,
        date: "2026-08-10T09:00:00.000Z",
      });

    // Second booking — same slot
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        providerId: provider.id,
        serviceId: service.id,
        date: "2026-08-10T09:00:00.000Z",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("This slot is already booked");
  });

  // Test 3: book unavailable provider → 404
  it("booking non-existent provider → 404", async () => {
    const { token: clientToken } = await registerAndGetToken(
      "client3@example.com",
      "CLIENT"
    );

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        providerId: "non-existent-id",
        serviceId: "non-existent-id",
        date: "2026-08-10T09:00:00.000Z",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Provider not found");
  });

  // Test 4: unauthenticated booking → 401
  it("unauthenticated booking → 401", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({
        providerId: "some-id",
        serviceId: "some-id",
        date: "2026-08-10T09:00:00.000Z",
      });

    expect(res.status).toBe(401);
  });

  // Test 5: book unavailable slot → 400
  it("booking slot not in provider availability → 400", async () => {
    const { token: providerToken } = await registerAndGetToken(
      "provider3@example.com",
      "PROVIDER"
    );
    const provider = await createProviderProfile(providerToken);
    const service = await createService(providerToken);
    await createAvailability(providerToken, "2026-08-10", ["14:00", "15:00"]);

    const { token: clientToken } = await registerAndGetToken(
      "client4@example.com",
      "CLIENT"
    );

    // Try to book 09:00 which is not in availability
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        providerId: provider.id,
        serviceId: service.id,
        date: "2026-08-10T09:00:00.000Z",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("not available");
  });

  // Test 6: get appointments → 200
  it("CLIENT can get their own appointments → 200", async () => {
    const { token: clientToken } = await registerAndGetToken(
      "client5@example.com",
      "CLIENT"
    );

    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});