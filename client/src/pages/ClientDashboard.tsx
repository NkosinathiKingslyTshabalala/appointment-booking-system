import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppDispatch";
import { clientService } from "../services/clientService";
import { colors, navbar, navLink, page } from "../styles/theme";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b", CONFIRMED: "#3b82f6", COMPLETED: "#10b981", CANCELLED: "#ef4444",
};

export default function ClientDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState("");

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: clientService.getAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: clientService.cancelAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const upcoming = appointments.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status)).slice(0, 3);
  const past = appointments.filter((a) => ["COMPLETED", "CANCELLED"].includes(a.status)).slice(0, 3);

  return (
    <div style={{ ...page }}>
      {/* Navbar */}
      <nav style={navbar}>
        <img src="/logo.png" alt="logo" style={{ height: 28 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {[["Dashboard", "/dashboard"], ["Bookings", "/appointments"], ["Notifications", "/notifications"], ["Profile", "/profile"]].map(([label, path]) => (
            <button key={label} onClick={() => navigate(path)} style={navLink}>[ {label} ]</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1.5rem" }}>
        <h2 style={{ fontWeight: 400, fontSize: 26, margin: "0 0 1.25rem", color: colors.text }}>Welcome back</h2>

        {/* Top actions */}
        {/* Widget 2: Quick search */}
<section aria-label="quick search">
  <div style={{ display: "flex", gap: 12, marginBottom: "1.5rem" }}>
    <button onClick={() => navigate("/search")}
      style={{ padding: "8px 14px", border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>
      [ + Book new appointment ]
    </button>
    <input
      type="text"
      placeholder="[ Search providers ]"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/search?q=${search}`)}
      aria-label="Search providers"
      style={{ flex: 1, padding: "8px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, fontSize: 13 }}
    />
  </div>
</section>

        {/* Upcoming appointments */}
        <p style={{ fontSize: 13, color: colors.muted, marginBottom: 8 }}>Upcoming appointments</p>
        <section aria-label="upcoming appointments">
          {isLoading ? <p style={{ color: colors.muted, fontSize: 13 }}>Loading...</p>
            : upcoming.length === 0 ? <p style={{ color: colors.light, fontSize: 13 }}>No upcoming appointments.</p>
            : upcoming.map((appt) => (
              <div key={appt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, marginBottom: 6, background: colors.bg }}>
                <span style={{ fontSize: 13 }}>[ {appt.service.name} — {appt.provider.user.name} ]</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: colors.muted }}>[ {new Date(appt.date).toLocaleDateString()} ]</span>
                  <button onClick={() => cancelMutation.mutate(appt.id)} style={{ fontSize: 11, color: colors.red, background: "none", border: `1px solid ${colors.red}`, borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ))}
        </section>

        {/* Past appointments */}
        <p style={{ fontSize: 13, color: colors.muted, margin: "1.25rem 0 8px" }}>Past appointments</p>
        <section aria-label="recent history">
          {past.length === 0 ? <p style={{ color: colors.light, fontSize: 13 }}>No past appointments.</p>
            : past.map((appt) => (
              <div key={appt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 6, marginBottom: 6, background: colors.bg }}>
                <span style={{ fontSize: 13, color: colors.muted }}>[ {appt.service.name} — {appt.provider.user.name} ]</span>
                <span style={{ fontSize: 12, color: STATUS_COLORS[appt.status] }}>[ {appt.status} ]</span>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}