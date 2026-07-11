import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientService } from "../services/clientService";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
};

export default function AppointmentHistory() {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: clientService.getAppointments,
  });

  const cancelMutation = useMutation({
    mutationFn: clientService.cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  if (isLoading) return <p>Loading appointments...</p>;

  const upcoming = appointments.filter((a) =>
    ["PENDING", "CONFIRMED"].includes(a.status)
  );
  const past = appointments.filter((a) =>
    ["COMPLETED", "CANCELLED"].includes(a.status)
  );

  const AppointmentCard = ({ appt }: { appt: (typeof appointments)[0] }) => (
    <li
      key={appt.id}
      style={{
        padding: "1rem",
        border: "1px solid #eee",
        borderRadius: 8,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <strong>{appt.service.name}</strong>
          <p style={{ margin: "2px 0", color: "#666", fontSize: 13 }}>
            {appt.provider.user.name}
          </p>
          <p style={{ margin: "2px 0", color: "#888", fontSize: 13 }}>
            {new Date(appt.date).toLocaleString()}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 12,
              background: STATUS_COLORS[appt.status] + "22",
              color: STATUS_COLORS[appt.status],
              fontWeight: 600,
            }}
          >
            {appt.status}
          </span>
          {["PENDING", "CONFIRMED"].includes(appt.status) && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => cancelMutation.mutate(appt.id)}
                disabled={cancelMutation.isPending}
                style={{
                  color: "red",
                  background: "none",
                  border: "1px solid red",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "1.5rem" }}>
      <h2>My appointments</h2>

      <h3 style={{ marginBottom: 8 }}>Upcoming</h3>
      {upcoming.length === 0 ? (
        <p style={{ color: "#999" }}>No upcoming appointments.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {upcoming.map((appt) => <AppointmentCard key={appt.id} appt={appt} />)}
        </ul>
      )}

      <h3 style={{ marginTop: "1.5rem", marginBottom: 8 }}>Past</h3>
      {past.length === 0 ? (
        <p style={{ color: "#999" }}>No past appointments.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {past.map((appt) => <AppointmentCard key={appt.id} appt={appt} />)}
        </ul>
      )}
    </div>
  );
}