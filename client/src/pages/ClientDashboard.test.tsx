import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import authReducer from "../store/authSlice";
import ClientDashboard from "./ClientDashboard";

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

function renderDashboard() {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: { id: "u1", name: "Nkosinathi Tshabalala", email: "nkosinathi@example.com", role: "CLIENT" },
        token: "fake-token",
        loading: false,
        error: null,
      },
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ClientDashboard />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

describe("ClientDashboard", () => {
it("renders welcome message with user first name", async () => {
  renderDashboard();
  await waitFor(() => {
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});

it("renders upcoming appointments widget", async () => {
  renderDashboard();
  await waitFor(() => {
    expect(screen.getByRole("region", { name: /upcoming appointments/i })).toBeInTheDocument();
    expect(screen.getByText(/haircut/i)).toBeInTheDocument();
    expect(screen.getByText(/alice smith/i)).toBeInTheDocument();
  });
});

it("renders quick search widget", async () => {
  renderDashboard();
  await waitFor(() => {
    expect(screen.getByRole("region", { name: /quick search/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search providers/i)).toBeInTheDocument();
  });
});

it("renders recent history widget", async () => {
  renderDashboard();
  await waitFor(() => {
    expect(screen.getByRole("region", { name: /recent history/i })).toBeInTheDocument();
    expect(screen.getByText(/massage/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });
});

  it("shows cancel button for upcoming appointments", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
  });
});
