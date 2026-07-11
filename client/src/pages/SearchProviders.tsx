import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { clientService } from "../services/clientService";

export default function SearchProviders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: clientService.getProviders,
  });

  const filtered = providers.filter((p) =>
    p.user.name.toLowerCase().includes(search.toLowerCase()) ||
    p.services.some((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (isLoading) return <p>Loading providers...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: "1.5rem" }}>
      <h2>Find a provider</h2>

      <input
        type="text"
        placeholder="Search by name or service..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: "1.5rem", fontSize: 15 }}
        aria-label="Search providers"
      />

      {filtered.length === 0 ? (
        <p style={{ color: "#999", textAlign: "center" }}>
          No providers found.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((provider) => (
            <li
              key={provider.id}
              style={{
                padding: "1rem",
                border: "1px solid #eee",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{provider.user.name}</strong>
                  {provider.bio && (
                    <p style={{ color: "#666", margin: "4px 0", fontSize: 14 }}>
                      {provider.bio}
                    </p>
                  )}
                  {provider.qualification && (
                    <p style={{ color: "#999", margin: "2px 0", fontSize: 13 }}>
                      {provider.qualification}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/book/${provider.id}`)}
                  style={{ padding: "8px 16px", whiteSpace: "nowrap" }}
                >
                  Book now
                </button>
              </div>

              {provider.services.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {provider.services.map((service) => (
                    <span
                      key={service.id}
                      style={{
                        padding: "3px 10px",
                        background: "#f0f4ff",
                        borderRadius: 20,
                        fontSize: 12,
                        color: "#444",
                      }}
                    >
                      {service.name} · R{service.price} · {service.duration}min
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}