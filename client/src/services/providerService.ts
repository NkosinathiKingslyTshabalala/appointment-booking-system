import api from "./authService";

export interface Provider {
  id: string;
  userId: string;
  bio: string | null;
  qualification: string | null;
  user: { id: string; name: string; email: string };
  services: Service[];
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  price: number;
  duration: number;
}

export interface Availability {
  id: string;
  providerId: string;
  date: string;
  slots: string[];
}

export const providerService = {
  // Provider profile
  getProviders: async (): Promise<Provider[]> => {
    const res = await api.get<Provider[]>("/providers");
    return res.data;
  },

  getProvider: async (id: string): Promise<Provider> => {
    const res = await api.get<Provider>(`/providers/${id}`);
    return res.data;
  },

  createProfile: async (data: {
    bio: string;
    qualification: string;
  }): Promise<Provider> => {
    const res = await api.post<Provider>("/providers", data);
    return res.data;
  },

  updateProfile: async (
    id: string,
    data: { bio: string; qualification: string }
  ): Promise<Provider> => {
    const res = await api.put<Provider>(`/providers/${id}`, data);
    return res.data;
  },

  // Services
  getServices: async (providerId: string): Promise<Service[]> => {
    const res = await api.get<Service[]>(
      `/services?providerId=${providerId}`
    );
    return res.data;
  },

  createService: async (data: {
    name: string;
    price: number;
    duration: number;
  }): Promise<Service> => {
    const res = await api.post<Service>("/services", data);
    return res.data;
  },

  updateService: async (
    id: string,
    data: { name: string; price: number; duration: number }
  ): Promise<Service> => {
    const res = await api.put<Service>(`/services/${id}`, data);
    return res.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },

  // Availability
  getAvailability: async (providerId: string): Promise<Availability[]> => {
    const res = await api.get<Availability[]>(
      `/availability/${providerId}`
    );
    return res.data;
  },

  createAvailability: async (data: {
    date: string;
    slots: string[];
  }): Promise<Availability> => {
    const res = await api.post<Availability>("/availability", data);
    return res.data;
  },

  deleteAvailability: async (id: string): Promise<void> => {
    await api.delete(`/availability/${id}`);
  },
};