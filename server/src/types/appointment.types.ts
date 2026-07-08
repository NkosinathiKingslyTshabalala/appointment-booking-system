// ── Appointment Status Enum ──────────────────────────────
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ── Valid status transitions ─────────────────────────────
export const STATUS_TRANSITIONS: { [key: string]: AppointmentStatus[] } = {
  PENDING: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  CONFIRMED: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

// ── Who can make each transition ─────────────────────────
export const ROLE_TRANSITIONS: { [role: string]: { [status: string]: AppointmentStatus[] } } = {
  PROVIDER: {
    PENDING: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
    CONFIRMED: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
  },
  CLIENT: {
    PENDING: [AppointmentStatus.CANCELLED],
    CONFIRMED: [AppointmentStatus.CANCELLED],
  },
};

// ── Helper: check if a transition is valid ───────────────
export function isValidTransition(
  currentStatus: AppointmentStatus,
  newStatus: AppointmentStatus,
  role: string
): boolean {
  const allowedForRole = ROLE_TRANSITIONS[role]?.[currentStatus] ?? [];
  return allowedForRole.includes(newStatus);
}

// ── Appointment interface ────────────────────────────────
export interface Appointment {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  status: AppointmentStatus;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}