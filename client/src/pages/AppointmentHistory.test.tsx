import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import AppointmentHistory from "./AppointmentHistory";

vi.mock("../services/clientService", () => ({
  clientService: {
    getAppointments: vi.fn().mockResolvedValue([
      {
        id: "a1",
        clientId: "u1",
        providerId: "p1",
        serviceId: "s1",
        status: "CONFIRMED",
        date: "2026-08-10T09:00:00.000Z",
        createdAt: "2026-07-01T00:00:00.000Z",
        service: { id: "s1", providerId: "p1", name: "Haircut", price: 150, duration: 30 },
        provider: { id: "p1", user: { name: "Alice Smith", email: "alice@example.com" } },
      },
      {
        id: "a2",
        clientId: "u1",
        providerId: "p2",
        serviceId: "s2",
        status: "COMPLETED",
        date: "2026-07-01T10:00:00.000Z",
        createdAt: "2026-06-01T00:00:00.000Z",
        service: { id: "s2", providerId: "p2", name: "Massage", price: 300, duration: 60 },
        provider: { id: "p2", user: { name: "Bob Jones", email: "bob@example.com" } },
      },
    ]),
    cancelAppointment: vi.fn(),
  },
}));

function renderHistory() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AppointmentHistory />
    </QueryClientProvider>
  );
}

describe("AppointmentHistory", () => {
  it("renders upcoming and past sections", async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText("Upcoming")).toBeInTheDocument();
      expect(screen.getByText("Past")).toBeInTheDocument();
    });
  });

  it("renders appointment list correctly", async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
      expect(screen.getByText("Massage")).toBeInTheDocument();
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });
  });

  it("shows status badges", async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByText("CONFIRMED")).toBeInTheDocument();
      expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    });
  });

  it("shows cancel button for upcoming appointments", async () => {
    renderHistory();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
  });
});