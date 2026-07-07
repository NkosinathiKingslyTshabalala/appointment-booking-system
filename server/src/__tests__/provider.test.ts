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
describe("Provider Profile", () => {

  // Test 1: create profile → 201
  it("should create a provider profile and return 201", async () => {
    const token = await registerAndGetToken("provider@example.com", "PROVIDER");

    const res = await request(app)
      .post("/api/providers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bio: "Experienced hair stylist",
        qualification: "NVQ Level 3",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.bio).toBe("Experienced hair stylist");
    expect(res.body.qualification).toBe("NVQ Level 3");
    expect(res.body.user).toHaveProperty("email", "provider@example.com");
  });

  // Test 2: duplicate profile → 409
  it("should return 409 if provider profile already exists", async () => {
    const token = await registerAndGetToken("provider2@example.com", "PROVIDER");

    await request(app)
      .post("/api/providers")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "First profile" });

    const res = await request(app)
      .post("/api/providers")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "Duplicate profile" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Provider profile already exists");
  });

  // Test 3: update profile → 200
  it("should update provider profile and return 200", async () => {
    const token = await registerAndGetToken("provider3@example.com", "PROVIDER");

    // First create the profile
    const created = await request(app)
      .post("/api/providers")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "Old bio", qualification: "Old qual" });

    const providerId = created.body.id;

    // Then update it
    const res = await request(app)
      .put(`/api/providers/${providerId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "Updated bio", qualification: "Updated qual" });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("Updated bio");
    expect(res.body.qualification).toBe("Updated qual");
  });

  // Test 4: unauthenticated update → 401
  it("should return 401 for unauthenticated update", async () => {
    const res = await request(app)
      .put("/api/providers/some-id")
      .send({ bio: "Hacker bio" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No token provided");
  });

  // Test 5: CLIENT cannot create provider profile → 403
  it("should return 403 if CLIENT tries to create provider profile", async () => {
    const token = await registerAndGetToken("client@example.com", "CLIENT");

    const res = await request(app)
      .post("/api/providers")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "I am not a provider" });

    expect(res.status).toBe(403);
  });

  // Test 6: get all providers → 200
  it("should return all providers", async () => {
    const res = await request(app).get("/api/providers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});