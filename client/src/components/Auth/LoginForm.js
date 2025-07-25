import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authService from "../../services/authService";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ phoneNumber: "", password: "" });
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
      // Use formData keys consistently
      const response = await authService.login(
        formData.phoneNumber,
        formData.password
      );

      if (response.success) {
        login(formData.phoneNumber, formData.password);

        const role = response.user.role;
        if (role === "manager") navigate("/admin/dashboard");
        else if (role === "accountant") navigate("/manager/dashboard");
        else navigate("/member/dashboard");
      } else {
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
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
        <label htmlFor="phoneNumber" className="form-label">
          Phone Number
        </label>
        <input
          type="tel"
          className="form-control rounded-3"
          id="phoneNumber"
          name="phoneNumber"
          placeholder="+250*********"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <small className="text-muted">
          Enter your full number with country code
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
        style={{ backgroundColor: "#282c34" }} // button color as you requested before
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
