import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { clientService } from "../services/clientService";
import { providerService } from "../services/providerService";
import { colors, navbar, page } from "../styles/theme";

export default function BookingPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: () => providerService.getProvider(providerId!),
    enabled: !!providerId,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ["availability", providerId],
    queryFn: () => clientService.getProviderAvailability(providerId!),
    enabled: !!providerId,
  });

  const selectedService = provider?.services.find((s) => s.id === selectedServiceId);

  const availableSlots = availability.find(
    (a) => new Date(a.date).toISOString().split("T")[0] === selectedDate
  )?.slots ?? [];

  const bookMutation = useMutation({
    mutationFn: clientService.bookAppointment,
    onSuccess: (data) => { setConfirmation(`Booking confirmed! Status: ${data.status}`); setError(""); },
    onError: (err: any) => setError(err.response?.data?.message || "Booking failed"),
  });

  const handleBook = () => {
    if (!selectedServiceId || !selectedDate || !selectedSlot) { setError("Please select a service, date and time slot"); return; }
    bookMutation.mutate({ providerId: providerId!, serviceId: selectedServiceId, date: `${selectedDate}T${selectedSlot}:00.000Z` });
  };

  if (isLoading) return <p>Loading...</p>;
  if (!provider) return <p>Provider not found</p>;

  return (
    <div style={{ ...page }}>
      {/* Navbar */}
      <nav style={navbar}>
        <img src="/logo.png" alt="logo" style={{ height: 28 }} />
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: colors.text }}>
          [ Back to provider profile ]
        </button>
      </nav>

      <div style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1.5rem" }}>
        <h2 style={{ fontWeight: 400, fontSize: 28, margin: "0 0 4px" }}>Book an appointment</h2>
        <p style={{ fontSize: 13, color: colors.muted, margin: "0 0 1.5rem" }}>
          [ {provider.user.name} — {provider.qualification || "Business name"} ]
        </p>

        {confirmation && <div role="status" style={{ color: colors.green, background: "#f0fff4", padding: 12, borderRadius: 8, marginBottom: "1rem", fontSize: 13 }}>{confirmation}</div>}
        {error && <div role="alert" style={{ color: colors.red, background: "#fff0f0", padding: 12, borderRadius: 8, marginBottom: "1rem", fontSize: 13 }}>{error}</div>}

        {!confirmation && <>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: 13, color: colors.text }}>Service</label>
            <select
              id="service"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              aria-label="Select service"
              style={{ width: "100%", padding: "10px 12px", marginTop: 4, border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, fontSize: 13 }}
            >
              <option value="">[ Select a service ]</option>
              {provider.services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · R{s.price} · {s.duration}min</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: 13, color: colors.text }}>Date</label>
            <input id="date" type="date" value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
              aria-label="Select date"
              style={{ width: "100%", padding: "10px 12px", marginTop: 4, border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          {selectedDate && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: 13, color: colors.text }}>Available time slots</label>
              {availableSlots.length === 0
                ? <p style={{ color: colors.light, fontSize: 13 }}>No slots available.</p>
                : <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {availableSlots.map((slot) => (
                    <button key={slot} type="button" onClick={() => setSelectedSlot(slot)}
                      style={{ padding: "8px 14px", border: `1px solid ${colors.border}`, borderRadius: 6, background: selectedSlot === slot ? colors.text : colors.bg, color: selectedSlot === slot ? "#fff" : colors.text, cursor: "pointer", fontSize: 13 }}>
                      [ {slot} ]
                    </button>
                  ))}
                </div>
              }
            </div>
          )}

          {/* Summary */}
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: colors.muted, marginBottom: 4 }}>
              <span>[ {selectedService?.name || "Service"} ]</span>
              <span>[ {selectedService ? `${selectedService.duration}min` : "Duration"} ]</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: colors.text }}>
              <span>[ Total ]</span>
              <span>[ {selectedService ? `R${selectedService.price}` : "Price"} ]</span>
            </div>
          </div>

          <button onClick={handleBook} disabled={bookMutation.isPending}
            style={{ width: "100%", padding: "12px 0", border: `1px solid ${colors.border}`, borderRadius: 6, background: colors.bg, cursor: "pointer", fontSize: 14 }}>
            {bookMutation.isPending ? "Booking..." : "[ Confirm booking ]"}
          </button>
        </>}
      </div>
    </div>
  );
}