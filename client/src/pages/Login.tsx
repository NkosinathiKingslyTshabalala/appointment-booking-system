import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { loginUser, clearError } from "../store/authSlice";
import { colors, input, btn, page } from "../styles/theme";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  useEffect(() => {
    if (user) navigate(user.role === "PROVIDER" ? "/provider/dashboard" : "/dashboard");
  }, [user, navigate]);

  useEffect(() => { return () => { dispatch(clearError()); }; }, [dispatch]);

  return (
    <div style={{ ...page, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: 400, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: "2rem 2rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img src="/logo.png" alt="logo" style={{ height: 44 }} />
        </div>

        <h2 style={{ textAlign: "center", fontWeight: 400, fontSize: 28, margin: "0 0 1.5rem", color: colors.text }}>
          Log in
        </h2>

        {error && <p role="alert" style={{ color: colors.red, textAlign: "center", marginBottom: "1rem", fontSize: 13 }}>{error}</p>}

        <form onSubmit={handleSubmit((data) => dispatch(loginUser(data)))} noValidate>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" style={{ fontSize: 13, color: colors.text }}>Email</label>
            <input id="email" style={{ ...input, marginTop: 4 }} type="email" {...register("email", { required: "Email is required" })} />
            {errors.email && <span role="alert" style={{ color: colors.red, fontSize: 12 }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="password" style={{ fontSize: 13, color: colors.text }}>Password</label>
            <input id="password" style={{ ...input, marginTop: 4 }} type="password" {...register("password", { required: "Password is required" })} />
            {errors.password && <span role="alert" style={{ color: colors.red, fontSize: 12 }}>{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={loading} style={{ ...btn, marginBottom: "0.75rem" }}>
            {loading ? "Logging in..." : "[ Log in ]"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: colors.muted }}>
          [ <Link to="/forgot-password" style={{ color: colors.muted }}>Forgot password link</Link> ]
        </p>

        <hr style={{ border: "none", borderTop: `1px solid ${colors.border}`, margin: "1rem 0" }} />

        <p style={{ textAlign: "center", fontSize: 13, color: colors.muted }}>
          [ Don't have an account? <Link to="/register" style={{ color: colors.muted }}>Register</Link> ]
        </p>
      </div>
    </div>
  );
}