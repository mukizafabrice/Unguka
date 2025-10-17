import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="coopra-form">
      <div className="form-header">
        <div className="brand-inline">
          <div className="brand-mark sm">C</div>
          <div className="brand-name">Coopra</div>
        </div>
        <h2 className="title">Welcome back</h2>
        <p className="subtitle">Sign in to your cooperative workspace</p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="identifier" className="form-label">
          Phone number or email
        </label>
        <input
          type="text"
          className="form-control input-elevated"
          id="identifier"
          name="identifier"
          placeholder="Your phone number or email"
          value={formData.identifier}
          onChange={handleChange}
          required
        />
        <small className="hint">Use your registered contact details</small>
      </div>

      <div className="form-group password-input-container">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          className="form-control input-elevated"
          id="password"
          name="password"
          placeholder="Your secure password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <span onClick={handleTogglePassword} className="password-toggle-icon">
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </span>
        <small className="hint">Keep your credentials private</small>
      </div>

      <div className="form-aux">
        <div />
        <Link to="/forgot-password" className="link">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="btn w-100 text-white login-button"
        disabled={loading}
      >
        <LogIn size={18} style={{ marginRight: 8 }} />
        {loading ? "Logging in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
