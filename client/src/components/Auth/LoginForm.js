import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from the context

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call the login function from AuthContext directly
      const response = await login(formData.identifier, formData.password);

      if (response.success) {
        // Redirect based on the user's role
        const role = response.user.role;
        if (role === "superadmin") {
          navigate("/super/dashboard");
        } else if (role === "manager") {
          navigate("/admin/dashboard");
        } else {
          // Default for "member" or other roles
          navigate("/member/dashboard");
        }
      } else {
        // The error message is already set by the AuthContext's login function
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      // Fallback for unexpected errors
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: "#282c34" }}>
          Welcome Back
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
          Sign in to access your account
        </p>
        <hr className="mt-3" />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="identifier" className="form-label">
          Phone Number or Email
        </label>
        <input
          type="text" // Use type="text" for a generic input
          className="form-control rounded-3"
          id="identifier"
          name="identifier"
          placeholder="Enter phone number or email"
          value={formData.identifier}
          onChange={handleChange}
          required
        />
        <small className="text-muted">
          Use your registered phone number or email
        </small>
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          className="form-control rounded-3"
          id="password"
          name="password"
          placeholder="********"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className="btn w-100 text-white login-button"
        disabled={loading}
        style={{ backgroundColor: "#282c34" }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
