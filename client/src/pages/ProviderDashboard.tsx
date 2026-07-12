import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppDispatch";
import { providerService } from "../services/providerService";
import api from "../services/authService";
import { colors, navbar, navLink, page } from "../styles/theme";

interface Appointment {
  id: string;
  status: string;
  date: string;
  client: { name: string; email: string };
  service: { name: string };
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((s) => s.auth);

  const { data: providers = [] } = useQuery({
    queryKey: ["providers"],
    queryFn: providerService.getProviders,
  });

  const myProfile = providers.find((p) => p.user.id === user?.id);

  const { data: services = [] } = useQuery({
    queryKey: ["services", myProfile?.id],
    queryFn: () => providerService.getServices(myProfile!.id),
    enabled: !!myProfile?.id,
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["provider-appointments"],
    queryFn: async () => {
      const res = await api.get("/appointments");
      return res.data;
    },
  });

  const pending = appointments.filter((a) => a.status === "PENDING");
  const confirmedThisWeek = appointments.filter((a) => a.status === "CONFIRMED");

  const confirmMutation = useMutation({
    mutationFn: (id: string) => api.put(`/appointments/${id}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["provider-appointments"] }),
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => api.put(`/appointments/${id}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["provider-appointments"] }),
  });

  return (
    <div style={{ ...page }}>
      {/* Navbar */}
      <nav style={navbar}>
        <img src="/logo.png" alt="logo" style={{ height: 28 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {[["Dashboard", "/provider/dashboard"], ["Services", "/provider/services"], ["Availability", "/provider/availability"], ["Appointments", "/provider/appointments"], ["Profile", "/provider/profile"]].map(([label, path]) => (
            <button key={label} onClick={() => navigate(path)} style={navLink}>[ {label} ]</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1.5rem" }}>
        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
          {[
            { label: "Pending requests", value: pending.length },
            { label: "Confirmed this week", value: confirmedThisWeek.length },
            { label: "Total services", value: services.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: "1rem", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: colors.muted, margin: "0 0 4px" }}>{label}</p>
              <p style={{ fontSize: 24, margin: 0, color: colors.text }}>[ {value} ]</p>
            </div>
          ))}
        </div>

        {/* Pending requests */}
        <p style={{ fontSize: 13, color: colors.muted, marginBottom: 8 }}>Pending appointment requests</p>
        {pending.length === 0 ? (
          <p style={{ color: colors.light, fontSize: 13 }}>No pending requests.</p>
        ) : pending.map((appt) => (
          <div key={appt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, marginBottom: 6, background: colors.bg }}>
            <span style={{ fontSize: 13 }}>[ {appt.client?.name} — {appt.service?.name} — {new Date(appt.date).toLocaleDateString()} ]</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => confirmMutation.mutate(appt.id)}
                style={{ padding: "4px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, cursor: "pointer", fontSize: 12 }}>
                [ Accept ]
              </button>
              <button onClick={() => declineMutation.mutate(appt.id)}
                style={{ padding: "4px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, cursor: "pointer", fontSize: 12 }}>
                [ Decline ]
              </button>
            </div>
          </div>
        ))}

        {/* My services */}
        <p style={{ fontSize: 13, color: colors.muted, margin: "1.25rem 0 8px" }}>My services</p>
        {services.length === 0 ? (
          <p style={{ color: colors.light, fontSize: 13 }}>No services yet. <button onClick={() => navigate("/provider/services")} style={{ background: "none", border: "none", color: colors.blue, cursor: "pointer", fontSize: 13 }}>Add one</button></p>
        ) : services.map((service) => (
          <div key={service.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, marginBottom: 6, background: colors.bg }}>
            <span style={{ fontSize: 13 }}>[ {service.name} — {service.duration}min — R{service.price} ]</span>
            <button onClick={() => navigate("/provider/services")}
              style={{ padding: "4px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, cursor: "pointer", fontSize: 12 }}>
              [ Edit ]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}