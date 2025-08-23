import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // Import icons from lucide-react

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(formData.identifier, formData.password);

      if (response.success) {
        const role = response.user.role;
        if (role === "superadmin") {
          navigate("/super/dashboard");
        } else if (role === "manager") {
          navigate("/admin/dashboard");
        } else {
          navigate("/member/dashboard");
        }
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
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
          type="text"
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

      <div className="mb-4 password-input-container">
        {" "}
        {/* Apply new container class */}
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          className="form-control rounded-3"
          id="password"
          name="password"
          placeholder="Enter Your Password "
          value={formData.password}
          onChange={handleChange}
          required
        />
        <span
          onClick={handleTogglePassword}
          className="password-toggle-icon" // Apply new icon class
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}{" "}
          {/* Adjust icon size if needed */}
        </span>
      </div>

      <div className="text-end mb-3">
        <Link to="/forgot-password" className="text-decoration-none">
          Forgot Password?
        </Link>
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
