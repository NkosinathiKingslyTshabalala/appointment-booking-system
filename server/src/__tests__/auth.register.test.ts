import request from "supertest";
import app from "../app";
import prisma from "../config/prisma";

// Clean DB before each test — always test against clean state
beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();
});

// Disconnect after all tests finish
afterAll(async () => {
  await prisma.$disconnect();
});

// ── Test 1: valid registration → 201 ─────────────────────
describe("POST /api/auth/register", () => {
  it("should register a new user and return 201", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "CLIENT",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("john@example.com");
    // Password must never be in the response
    expect(res.body.user).not.toHaveProperty("password");
  });

  // ── Test 2: duplicate email → 400 ──────────────────────
  it("should return 400 for duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "CLIENT",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "john@example.com",
      password: "password456",
      role: "CLIENT",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already in use");
  });

  // ── Test 3: missing fields → 400 (Zod validation) ──────
  it("should return 400 for missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "incomplete@example.com",
      // missing name and password
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  // ── Test 4: short password → 400 ───────────────────────
  it("should return 400 for password shorter than 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});