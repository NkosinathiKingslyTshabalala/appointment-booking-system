import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import BookingPage from "./BookingPage";

vi.mock("../services/providerService", () => ({
  providerService: {
    getProvider: vi.fn().mockResolvedValue({
      id: "p1",
      userId: "u1",
      bio: "Hair specialist",
      qualification: "NVQ Level 3",
      user: { id: "u1", name: "Alice Smith", email: "alice@example.com" },
      services: [
        { id: "s1", providerId: "p1", name: "Haircut", price: 150, duration: 30 },
      ],
    }),
  },
}));

vi.mock("../services/clientService", () => ({
  clientService: {
    getProviderAvailability: vi.fn().mockResolvedValue([]),
    bookAppointment: vi.fn().mockResolvedValue({
      id: "a1",
      status: "PENDING",
    }),
  },
}));

function renderBooking() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/book/p1"]}>
        <Routes>
          <Route path="/book/:providerId" element={<BookingPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("BookingPage", () => {
  it("renders provider name and service selector", async () => {
    renderBooking();
    await waitFor(() => {
      expect(screen.getByText(/book with alice smith/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/select service/i)).toBeInTheDocument();
    });
  });

  it("renders date picker", async () => {
    renderBooking();
    await waitFor(() => {
      expect(screen.getByLabelText(/select date/i)).toBeInTheDocument();
    });
  });

  it("renders confirm booking button", async () => {
    renderBooking();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /confirm booking/i })
      ).toBeInTheDocument();
    });
  });
});