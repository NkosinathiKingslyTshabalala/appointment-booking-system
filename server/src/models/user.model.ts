import { z } from "zod";

// ── Roles Enum ──────────────────────────────────────────
export enum Role {
  CLIENT = "CLIENT",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

// ── User Interface ───────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
}

// ── Validation Schemas ───────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(Role).optional().default(Role.CLIENT),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

// ── Inferred Types ───────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;