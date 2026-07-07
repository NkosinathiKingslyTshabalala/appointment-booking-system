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
  return res.body.token as string;
}

async function createProviderProfile(token: string) {
  const res = await request(app)
    .post("/api/providers")
    .set("Authorization", `Bearer ${token}`)
    .send({ bio: "Test bio", qualification: "Test qual" });
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
describe("Availability System", () => {

  // Test 1: add slots → 201
  it("PROVIDER can add availability slots → 201", async () => {
    const token = await registerAndGetToken("provider@example.com", "PROVIDER");
    await createProviderProfile(token);

    const res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-08-01",
        slots: ["09:00", "10:00", "11:00"],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.slots).toEqual(["09:00", "10:00", "11:00"]);
  });

  // Test 2: overlapping slot (same date) → 400
  it("should return 400 for duplicate date → overlapping slot", async () => {
    const token = await registerAndGetToken("provider2@example.com", "PROVIDER");
    await createProviderProfile(token);

    // Add first availability
    await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-08-01", slots: ["09:00", "10:00"] });

    // Try to add same date again
    const res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-08-01", slots: ["11:00", "12:00"] });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("already exists");
  });

  // Test 3: get slots for a provider → returns array
  it("should return availability array for a provider → 200", async () => {
    const token = await registerAndGetToken("provider3@example.com", "PROVIDER");
    const provider = await createProviderProfile(token);

    await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-08-01", slots: ["09:00", "10:00"] });

    await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-08-02", slots: ["14:00", "15:00"] });

    const res = await request(app)
      .get(`/api/availability/${provider.id}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  // Test 4: delete availability → 200
  it("PROVIDER can delete their own availability → 200", async () => {
    const token = await registerAndGetToken("provider4@example.com", "PROVIDER");
    await createProviderProfile(token);

    const created = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-08-03", slots: ["09:00"] });

    const availId = created.body.id;

    const res = await request(app)
      .delete(`/api/availability/${availId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Availability deleted successfully");
  });

  // Test 5: unauthenticated create → 401
  it("unauthenticated user cannot add availability → 401", async () => {
    const res = await request(app)
      .post("/api/availability")
      .send({ date: "2026-08-01", slots: ["09:00"] });

    expect(res.status).toBe(401);
  });

  // Test 6: missing slots → 400
  it("should return 400 when slots array is missing → 400", async () => {
    const token = await registerAndGetToken("provider5@example.com", "PROVIDER");
    await createProviderProfile(token);

    const res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-08-01" });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("slots");
  });

  // Test 7: CLIENT cannot add availability → 403
  it("CLIENT cannot add availability → 403", async () => {
    const token = await registerAndGetToken("client@example.com", "CLIENT");

    const res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-08-01", slots: ["09:00"] });

    expect(res.status).toBe(403);
  });
});