export const colors = {
  bg: "#f1efe8",
  card: "#ffffff",
  border: "#d8d6cd",
  text: "#1a1a1a",
  muted: "#73726c",
  light: "#a3a299",
  primary: "#1a1a1a",
  blue: "#3b82f6",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
};

export const card: React.CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: "1.5rem",
};

export const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  fontSize: 14,
  background: colors.card,
  boxSizing: "border-box",
};

export const btn: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  fontSize: 14,
  cursor: "pointer",
  color: colors.text,
};

export const navbar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.75rem 1.5rem",
  borderBottom: `1px solid ${colors.border}`,
  background: colors.bg,
};

export const navLink: React.CSSProperties = {
  fontSize: 13,
  color: colors.text,
  textDecoration: "none",
  cursor: "pointer",
  background: "none",
  border: "none",
  padding: "4px 8px",
};

export const page: React.CSSProperties = {
  minHeight: "100vh",
  background: colors.bg,
};