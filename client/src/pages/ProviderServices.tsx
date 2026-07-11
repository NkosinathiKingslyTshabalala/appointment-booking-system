import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerService } from "../services/providerService";

interface ServiceFormData {
  name: string;
  price: number;
  duration: number;
}

interface Props {
  providerId: string;
}

export default function ProviderServices({ providerId }: Props) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ServiceFormData>();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", providerId],
    queryFn: () => providerService.getServices(providerId),
    enabled: !!providerId,
  });

  const createMutation = useMutation({
    mutationFn: providerService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", providerId] });
      reset();
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: providerService.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", providerId] });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createMutation.mutate({
      name: data.name,
      price: Number(data.price),
      duration: Number(data.duration),
    });
  };

  if (isLoading) return <p>Loading services...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1.5rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>My services</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add service"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f9f9f9", borderRadius: 8 }}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="name">Service name</label>
            <input
              id="name"
              type="text"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <span role="alert" style={{ color: "red", fontSize: 12 }}>{errors.name.message}</span>}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="price">Price (R)</label>
              <input
                id="price"
                type="number"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
                {...register("price", { required: "Price is required", min: { value: 0, message: "Price must be positive" } })}
              />
              {errors.price && <span role="alert" style={{ color: "red", fontSize: 12 }}>{errors.price.message}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="duration">Duration (min)</label>
              <input
                id="duration"
                type="number"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
                {...register("duration", { required: "Duration is required", min: { value: 1, message: "Duration must be positive" } })}
              />
              {errors.duration && <span role="alert" style={{ color: "red", fontSize: 12 }}>{errors.duration.message}</span>}
            </div>
          </div>

          <button type="submit" disabled={createMutation.isPending} style={{ width: "100%", padding: 10 }}>
            {createMutation.isPending ? "Adding..." : "Add service"}
          </button>
        </form>
      )}

      {services.length === 0 ? (
        <p style={{ color: "#999", textAlign: "center" }}>No services yet. Add your first service.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {services.map((service) => (
            <li key={service.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", border: "1px solid #eee", borderRadius: 8, marginBottom: 8 }}>
              <div>
                <strong>{service.name}</strong>
                <span style={{ color: "#666", marginLeft: 12 }}>R{service.price} · {service.duration} min</span>
              </div>
              <button
                onClick={() => deleteMutation.mutate(service.id)}
                disabled={deleteMutation.isPending}
                style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}