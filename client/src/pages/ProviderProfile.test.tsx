import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice";
import ProviderProfile from "./ProviderProfile";
import { vi } from "vitest";

vi.mock("../services/providerService", () => ({
  providerService: {
    getProviders: vi.fn().mockResolvedValue([]),
    createProfile: vi.fn().mockResolvedValue({
      id: "p1",
      userId: "u1",
      bio: "Test bio",
      qualification: "Test qual",
      user: { id: "u1", name: "Test", email: "test@example.com" },
      services: [],
    }),
    updateProfile: vi.fn(),
  },
}));

function renderProfile() {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: { id: "u1", name: "Test", email: "test@example.com", role: "PROVIDER" },
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
          <ProviderProfile />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

describe("ProviderProfile", () => {
  it("renders profile form with bio and qualification fields", async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qualification/i)).toBeInTheDocument();
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    renderProfile();
    const user = userEvent.setup();

    await waitFor(() => screen.getByRole("button", { name: /create profile/i }));
    await user.click(screen.getByRole("button", { name: /create profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/bio is required/i)).toBeInTheDocument();
      expect(screen.getByText(/qualification is required/i)).toBeInTheDocument();
    });
  });

it("submits profile form with valid data", async () => {
  const { providerService } = await import("../services/providerService");
  renderProfile();
  const user = userEvent.setup();

  await waitFor(() => screen.getByLabelText(/bio/i));
  await user.type(screen.getByLabelText(/bio/i), "My bio");
  await user.type(screen.getByLabelText(/qualification/i), "My qual");
  await user.click(screen.getByRole("button", { name: /create profile/i }));

  await waitFor(() => {
    expect(providerService.createProfile).toHaveBeenCalled();
    const firstCallArg = (providerService.createProfile as any).mock.calls[0][0];
    expect(firstCallArg).toEqual({ bio: "My bio", qualification: "My qual" });
  });
});
});