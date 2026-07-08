// ── Appointment Status Enum ──────────────────────────────
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ── Valid status transitions ─────────────────────────────
// Defines which transitions are allowed and who can make them
export const STATUS_TRANSITIONS: Record
  AppointmentStatus,
  AppointmentStatus[]
> = {
  [AppointmentStatus.PENDING]: [
    AppointmentStatus.CONFIRMED,  // provider accepts
    AppointmentStatus.CANCELLED,  // client or provider cancels
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.COMPLETED,  // provider marks done
    AppointmentStatus.CANCELLED,  // cancelled before cutoff
  ],
  [AppointmentStatus.COMPLETED]: [], // terminal — no transitions
  [AppointmentStatus.CANCELLED]: [], // terminal — no transitions
};

// ── Who can make each transition ─────────────────────────
export const ROLE_TRANSITIONS: Record
  string,
  Partial<Record<AppointmentStatus, AppointmentStatus[]>>
> = {
  PROVIDER: {
    [AppointmentStatus.PENDING]: [
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.CONFIRMED]: [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
    ],
  },
  CLIENT: {
    [AppointmentStatus.PENDING]: [AppointmentStatus.CANCELLED],
    [AppointmentStatus.CONFIRMED]: [AppointmentStatus.CANCELLED],
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