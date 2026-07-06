import request from "supertest";
import app from "../app";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

// Register a user before each test to log in with
beforeEach(async () => {
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  // Pre-register a user to test login against
  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    role: "CLIENT",
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {

  // ── Test 1: correct credentials → 200 + cookie ─────────
  it("should login with correct credentials and set cookie", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user.email).toBe("test@example.com");

    // Password must never appear in response
    expect(res.body.user).not.toHaveProperty("password");

    // Cookie must be set
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toContain("token=");
    expect(res.headers["set-cookie"][0]).toContain("HttpOnly");
  });

  // ── Test 2: wrong password → 401 ───────────────────────
  it("should return 401 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // ── Test 3: wrong email → 401 ──────────────────────────
  it("should return 401 for non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // ── Test 4: missing fields → 400 (Zod validation) ──────
  it("should return 400 for missing email and password", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});