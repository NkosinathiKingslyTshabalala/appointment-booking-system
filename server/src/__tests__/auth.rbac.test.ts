import request from "supertest";
import app from "../app";
import prisma from "../config/prisma";

// ── Helpers ──────────────────────────────────────────────
async function registerAndLogin(
  email: string,
  role: "CLIENT" | "PROVIDER" | "ADMIN"
) {
  const reg = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "password123",
    role,
  });
  return reg.body.token as string;
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
describe("Role Based Access Control", () => {

  // CLIENT tries provider-only route → 403
  it("CLIENT cannot create a service (provider only)", async () => {
    const token = await registerAndLogin("client@example.com", "CLIENT");

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Haircut", price: 100, duration: 30 });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Access denied");
  });

  // PROVIDER tries client-only route → 403
  it("PROVIDER cannot book an appointment (client only)", async () => {
    const token = await registerAndLogin("provider@example.com", "PROVIDER");

    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        providerId: "some-id",
        serviceId: "some-id",
        date: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Access denied");
  });

  // No token → 401
  it("unauthenticated user cannot access protected routes", async () => {
    const res = await request(app).post("/api/services").send({
      name: "Haircut",
      price: 100,
      duration: 30,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No token provided");
  });

  // PROVIDER accesses provider route → passes through (not 403)
  it("PROVIDER can access provider routes", async () => {
    const token = await registerAndLogin("provider2@example.com", "PROVIDER");

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Haircut", price: 100, duration: 30 });

    // 404 means it passed auth but provider profile doesn't exist yet — that's fine
    // What matters is it's NOT 401 or 403
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  // CLIENT accesses client route → passes through
  it("CLIENT can access client routes", async () => {
    const token = await registerAndLogin("client2@example.com", "CLIENT");

    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  // ADMIN accesses provider route → passes through
  it("ADMIN can access provider routes", async () => {
    const token = await registerAndLogin("admin@example.com", "ADMIN");

    const res = await request(app)
      .put("/api/providers/some-id")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "test" });

    // 404 or 500 means it passed auth — not 403
    expect(res.status).not.toBe(403);
  });
});