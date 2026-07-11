import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import ProviderAvailability from "./ProviderAvailability";

vi.mock("../services/providerService", () => ({
  providerService: {
    getAvailability: vi.fn().mockResolvedValue([
      {
        id: "a1",
        providerId: "p1",
        date: "2026-08-10T00:00:00.000Z",
        slots: ["09:00", "10:00"],
      },
    ]),
    createAvailability: vi.fn().mockResolvedValue({}),
    deleteAvailability: vi.fn().mockResolvedValue(undefined),
  },
}));

function renderAvailability() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProviderAvailability providerId="p1" />
    </QueryClientProvider>
  );
}

describe("ProviderAvailability", () => {
  it("renders existing availability slots", async () => {
  renderAvailability();
  await waitFor(() => {
    // Use getAllByText since slots appear in both the selector and the list
    const slots09 = screen.getAllByText("09:00");
    const slots10 = screen.getAllByText("10:00");
    expect(slots09.length).toBeGreaterThan(0);
    expect(slots10.length).toBeGreaterThan(0);
  });
  });

  it("toggles slot selection when clicked", async () => {
    renderAvailability();
    const user = userEvent.setup();
    await waitFor(() => screen.getByRole("button", { name: "08:00" }));

    const slotButton = screen.getByRole("button", { name: "08:00" });
    await user.click(slotButton);

    expect(slotButton).toHaveStyle({ background: "rgb(26, 26, 26)" });
  });

  it("shows remove button for each availability record", async () => {
    renderAvailability();
    await waitFor(() => {
      expect(screen.getByText(/remove/i)).toBeInTheDocument();
    });
  });
});