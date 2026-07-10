import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { registerUser, clearError } from "../store/authSlice";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "PROVIDER";
}

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({ defaultValues: { role: "CLIENT" } });

  useEffect(() => {
    if (user) {
      navigate(user.role === "PROVIDER" ? "/provider/dashboard" : "/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    dispatch(registerUser(data));
  };

  return (
    <div style={{ maxWidth: 360, margin: "2rem auto", padding: "2rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <img src="/logo.png" alt="Logo" style={{ height: 48 }} />
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Create account</h2>

      {error && (
        <div role="alert" style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
            })}
          />
          {errors.name && (
            <span role="alert" style={{ color: "red", fontSize: 12 }}>
              {errors.name.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
            })}
          />
          {errors.email && (
            <span role="alert" style={{ color: "red", fontSize: 12 }}>
              {errors.email.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
          />
          {errors.password && (
            <span role="alert" style={{ color: "red", fontSize: 12 }}>
              {errors.password.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label>I am a</label>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {(["CLIENT", "PROVIDER"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSelectedRole(role);
                  setValue("role", role);
                }}
                style={{
                  flex: 1,
                  padding: 8,
                  background: selectedRole === role ? "#1a1a1a" : "#fff",
                  color: selectedRole === role ? "#fff" : "#1a1a1a",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {role === "CLIENT" ? "Client" : "Provider"}
              </button>
            ))}
          </div>
          <input type="hidden" {...register("role")} />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, marginBottom: "1rem" }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}