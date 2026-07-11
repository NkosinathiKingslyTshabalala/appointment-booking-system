import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import ProviderServices from "./ProviderServices";

vi.mock("../services/providerService", () => ({
  providerService: {
    getServices: vi.fn().mockResolvedValue([
      { id: "s1", providerId: "p1", name: "Haircut", price: 150, duration: 30 },
      { id: "s2", providerId: "p1", name: "Massage", price: 300, duration: 60 },
    ]),
    createService: vi.fn(),
    deleteService: vi.fn().mockResolvedValue(undefined),
  },
}));

function renderServices() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProviderServices providerId="p1" />
    </QueryClientProvider>
  );
}

describe("ProviderServices", () => {
  it("renders service list correctly", async () => {
    renderServices();
    await waitFor(() => {
      expect(screen.getByText("Haircut")).toBeInTheDocument();
      expect(screen.getByText("Massage")).toBeInTheDocument();
    });
  });

  it("shows add service form when button clicked", async () => {
    renderServices();
    const user = userEvent.setup();
    await waitFor(() => screen.getByRole("button", { name: /add service/i }));
    await user.click(screen.getByRole("button", { name: /\+ add service/i }));
    expect(screen.getByLabelText(/service name/i)).toBeInTheDocument();
  });
});