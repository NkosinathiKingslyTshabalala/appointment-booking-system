import api from "./authService";
import type { Provider, Service, Availability } from "./providerService";

export interface Appointment {
  id: string;
  clientId: string;
  providerId: string;
  serviceId: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  date: string;
  createdAt: string;
  service: Service;
  provider: {
    id: string;
    user: { name: string; email: string };
  };
}

export const clientService = {
  // Search providers
  getProviders: async (): Promise<Provider[]> => {
    const res = await api.get<Provider[]>("/providers");
    return res.data;
  },

  getProviderAvailability: async (
    providerId: string
  ): Promise<Availability[]> => {
    const res = await api.get<Availability[]>(`/availability/${providerId}`);
    return res.data;
  },

  // Booking
  bookAppointment: async (data: {
    providerId: string;
    serviceId: string;
    date: string;
  }): Promise<Appointment> => {
    const res = await api.post<Appointment>("/appointments", data);
    return res.data;
  },

  // Appointment history
  getAppointments: async (): Promise<Appointment[]> => {
    const res = await api.get<Appointment[]>("/appointments");
    return res.data;
  },

  cancelAppointment: async (id: string): Promise<void> => {
    await api.put(`/appointments/${id}/cancel`);
  },
};