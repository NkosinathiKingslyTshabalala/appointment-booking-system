import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { clientService } from "../services/clientService";
import { providerService } from "../services/providerService";

export default function BookingPage() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const { data: provider, isLoading: loadingProvider } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: () => providerService.getProvider(providerId!),
    enabled: !!providerId,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ["availability", providerId],
    queryFn: () => clientService.getProviderAvailability(providerId!),
    enabled: !!providerId,
  });

  const availableSlots = availability.find(
    (a) => new Date(a.date).toISOString().split("T")[0] === selectedDate
  )?.slots ?? [];

  const bookMutation = useMutation({
    mutationFn: clientService.bookAppointment,
    onSuccess: (data) => {
      setConfirmation(
        `Booking confirmed! Appointment ID: ${data.id}. Status: ${data.status}`
      );
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Booking failed");
    },
  });

  const handleBook = () => {
    if (!selectedServiceId || !selectedDate || !selectedSlot) {
      setError("Please select a service, date and time slot");
      return;
    }
    const dateTime = `${selectedDate}T${selectedSlot}:00.000Z`;
    bookMutation.mutate({
      providerId: providerId!,
      serviceId: selectedServiceId,
      date: dateTime,
    });
  };

  if (loadingProvider) return <p>Loading...</p>;
  if (!provider) return <p>Provider not found</p>;

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: "1.5rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem", background: "none", border: "none", cursor: "pointer", color: "#555" }}>
        ← Back
      </button>

      <h2>Book with {provider.user.name}</h2>
      {provider.bio && <p style={{ color: "#666" }}>{provider.bio}</p>}

      {confirmation && (
        <div role="status" style={{ color: "green", background: "#f0fff4", padding: 12, borderRadius: 8, marginBottom: "1rem" }}>
          {confirmation}
        </div>
      )}

      {error && (
        <div role="alert" style={{ color: "red", background: "#fff0f0", padding: 12, borderRadius: 8, marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {!confirmation && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="service">Select service</label>
            <select
              id="service"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="">-- Choose a service --</option>
              {provider.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · R{s.price} · {s.duration}min
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="date">Select date</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot("");
              }}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          {selectedDate && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label>Available time slots</label>
              {availableSlots.length === 0 ? (
                <p style={{ color: "#999", fontSize: 13 }}>No slots available for this date.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: "6px 12px",
                        background: selectedSlot === slot ? "#1a1a1a" : "#fff",
                        color: selectedSlot === slot ? "#fff" : "#1a1a1a",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={bookMutation.isPending}
            style={{ width: "100%", padding: 10 }}
          >
            {bookMutation.isPending ? "Booking..." : "Confirm booking"}
          </button>
        </>
      )}
    </div>
  );
}