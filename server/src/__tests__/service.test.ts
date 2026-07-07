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
describe("Service CRUD", () => {

  // Test 1: create service → 201
  it("PROVIDER can create a service → 201", async () => {
    const token = await registerAndGetToken("provider@example.com", "PROVIDER");
    await createProviderProfile(token);

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Haircut", price: 150, duration: 30 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Haircut");
    expect(res.body.price).toBe(150);
    expect(res.body.duration).toBe(30);
  });

  // Test 2: CLIENT tries to create service → 403
  it("CLIENT cannot create a service → 403", async () => {
    const token = await registerAndGetToken("client@example.com", "CLIENT");

    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Haircut", price: 150, duration: 30 });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Access denied");
  });

  // Test 3: get all services → 200
  it("anyone can get all services → 200", async () => {
    const res = await request(app).get("/api/services");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test 4: get services by providerId → 200
  it("can filter services by providerId → 200", async () => {
    const token = await registerAndGetToken("provider2@example.com", "PROVIDER");
    const provider = await createProviderProfile(token);

    await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Massage", price: 300, duration: 60 });

    const res = await request(app)
      .get(`/api/services?providerId=${provider.id}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Massage");
  });

  // Test 5: update service → 200
  it("PROVIDER can update their own service → 200", async () => {
    const token = await registerAndGetToken("provider3@example.com", "PROVIDER");
    await createProviderProfile(token);

    const created = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old name", price: 100, duration: 30 });

    const serviceId = created.body.id;

    const res = await request(app)
      .put(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New name", price: 200 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("New name");
    expect(res.body.price).toBe(200);
  });

  // Test 6: delete service → 200
  it("PROVIDER can delete their own service → 200", async () => {
    const token = await registerAndGetToken("provider4@example.com", "PROVIDER");
    await createProviderProfile(token);

    const created = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To delete", price: 100, duration: 30 });

    const serviceId = created.body.id;

    const res = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Service deleted successfully");
  });

  // Test 7: unauthenticated create → 401
  it("unauthenticated user cannot create service → 401", async () => {
    const res = await request(app)
      .post("/api/services")
      .send({ name: "Haircut", price: 150, duration: 30 });

    expect(res.status).toBe(401);
  });

  // Test 8: provider cannot update another provider's service → 403
  it("PROVIDER cannot update another provider's service → 403", async () => {
    const token1 = await registerAndGetToken("provider5@example.com", "PROVIDER");
    await createProviderProfile(token1);

    const created = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token1}`)
      .send({ name: "Haircut", price: 150, duration: 30 });

    const serviceId = created.body.id;

    // Different provider tries to update
    const token2 = await registerAndGetToken("provider6@example.com", "PROVIDER");
    await createProviderProfile(token2);

    const res = await request(app)
      .put(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ name: "Stolen service" });

    expect(res.status).toBe(403);
  });
});