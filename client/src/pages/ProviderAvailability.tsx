import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerService } from "../services/providerService";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00",
];

interface Props {
  providerId: string;
}

export default function ProviderAvailability({ providerId }: Props) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ["availability", providerId],
    queryFn: () => providerService.getAvailability(providerId),
    enabled: !!providerId,
  });

  const createMutation = useMutation({
    mutationFn: providerService.createAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", providerId] });
      setSelectedDate("");
      setSelectedSlots([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: providerService.deleteAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", providerId] });
    },
  });

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleAdd = () => {
    if (!selectedDate || selectedSlots.length === 0) return;
    createMutation.mutate({ date: selectedDate, slots: selectedSlots });
  };

  if (isLoading) return <p>Loading availability...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1.5rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>My availability</h2>

      <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f9f9f9", borderRadius: 8 }}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <label>Time slots</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 8, marginBottom: "1rem" }}>
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => toggleSlot(slot)}
              style={{
                padding: "6px 4px",
                background: selectedSlots.includes(slot) ? "#1a1a1a" : "#fff",
                color: selectedSlots.includes(slot) ? "#fff" : "#1a1a1a",
                border: "1px solid #ccc",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {slot}
            </button>
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={!selectedDate || selectedSlots.length === 0 || createMutation.isPending}
          style={{ width: "100%", padding: 10 }}
        >
          {createMutation.isPending ? "Adding..." : "Add availability"}
        </button>
      </div>

      {availability.length === 0 ? (
        <p style={{ color: "#999", textAlign: "center" }}>No availability set yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {availability.map((avail) => (
            <li key={avail.id} style={{ padding: "0.75rem", border: "1px solid #eee", borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{new Date(avail.date).toDateString()}</strong>
                <button
                  onClick={() => deleteMutation.mutate(avail.id)}
                  style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {avail.slots.map((slot) => (
                  <span key={slot} style={{ padding: "2px 8px", background: "#e8f4ff", borderRadius: 4, fontSize: 13 }}>
                    {slot}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}