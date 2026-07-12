import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { registerUser, clearError } from "../store/authSlice";
import { colors, input, btn, page } from "../styles/theme";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "PROVIDER";
}

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>({ defaultValues: { role: "CLIENT" } });

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
          Create account
        </h2>

        {error && <p role="alert" style={{ color: colors.red, textAlign: "center", fontSize: 13 }}>{error}</p>}

        <form onSubmit={handleSubmit((data) => dispatch(registerUser(data)))} noValidate>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: 13, color: colors.text }}>Full name</label>
            <input style={{ ...input, marginTop: 4 }} type="text" {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })} />
            {errors.name && <span role="alert" style={{ color: colors.red, fontSize: 12 }}>{errors.name.message}</span>}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: 13, color: colors.text }}>Email</label>
            <input style={{ ...input, marginTop: 4 }} type="email" {...register("email", { required: "Email is required" })} />
            {errors.email && <span role="alert" style={{ color: colors.red, fontSize: 12 }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: 13, color: colors.text }}>Password</label>
            <input style={{ ...input, marginTop: 4 }} type="password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })} />
            {errors.password && <span role="alert" style={{ color: colors.red, fontSize: 12 }}>{errors.password.message}</span>}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: 13, color: colors.text }}>I am a</label>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {(["CLIENT", "PROVIDER"] as const).map((role) => (
                <button key={role} type="button"
                  onClick={() => { setSelectedRole(role); setValue("role", role); }}
                  style={{ ...btn, flex: 1, background: selectedRole === role ? colors.card : colors.bg }}>
                  [ {role === "CLIENT" ? "Client" : "Provider"} ]
                </button>
              ))}
            </div>
            <input type="hidden" {...register("role")} />
          </div>

          <button type="submit" disabled={loading} style={{ ...btn, marginBottom: "1rem" }}>
            {loading ? "Creating..." : "[ Create account ]"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: colors.muted }}>
          [ Already have an account? <Link to="/login" style={{ color: colors.muted }}>Log in</Link> ]
        </p>
      </div>
    </div>
  );
}