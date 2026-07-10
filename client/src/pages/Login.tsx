import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { loginUser, clearError } from "../store/authSlice";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === "PROVIDER" ? "/provider/dashboard" : "/dashboard");
    }
  }, [user, navigate]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginUser(data));
  };

  return (
    <div style={{ maxWidth: 360, margin: "2rem auto", padding: "2rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <img src="/logo.png" alt="Logo" style={{ height: 48 }} />
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Log in</h2>

      {error && (
        <div role="alert" style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <span role="alert" style={{ color: "red", fontSize: 12 }}>
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, marginBottom: "1rem" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: 13 }}>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <hr />
      <p style={{ textAlign: "center", fontSize: 13 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}