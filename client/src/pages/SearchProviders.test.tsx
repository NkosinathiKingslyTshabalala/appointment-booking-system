import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import SearchProviders from "./SearchProviders";

vi.mock("../services/clientService", () => ({
  clientService: {
    getProviders: vi.fn().mockResolvedValue([
      {
        id: "p1",
        userId: "u1",
        bio: "Hair specialist",
        qualification: "NVQ Level 3",
        user: { id: "u1", name: "Alice Smith", email: "alice@example.com" },
        services: [
          { id: "s1", providerId: "p1", name: "Haircut", price: 150, duration: 30 },
        ],
      },
      {
        id: "p2",
        userId: "u2",
        bio: "Massage therapist",
        qualification: "Diploma",
        user: { id: "u2", name: "Bob Jones", email: "bob@example.com" },
        services: [
          { id: "s2", providerId: "p2", name: "Massage", price: 300, duration: 60 },
        ],
      },
    ]),
  },
}));

function renderSearch() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SearchProviders />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("SearchProviders", () => {
  it("renders provider list", async () => {
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    });
  });

  it("filters providers by search term", async () => {
    renderSearch();
    const user = userEvent.setup();

    await waitFor(() => screen.getByLabelText(/search providers/i));
    await user.type(screen.getByLabelText(/search providers/i), "Alice");

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
    });
  });

  it("shows Book now button for each provider", async () => {
    renderSearch();
    await waitFor(() => {
      const bookButtons = screen.getAllByRole("button", { name: /book now/i });
      expect(bookButtons).toHaveLength(2);
    });
  });
});