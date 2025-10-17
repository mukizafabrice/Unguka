import React from "react";
import LoginForm from "../../components/Auth/LoginForm";
import "../../assets/styles/login.css";

const LoginPage = () => {
  return (
    <div className="login-page-wrapper">
      <div className="login-hero d-none d-lg-flex">
        <div
          className="login-hero-art"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/icon.jpg)` }}
        />
        <div className="login-hero-content">
          <div className="brand">
            <div className="brand-mark">C</div>
            <div className="brand-text">
              <h1>Coopra</h1>
              <p>Cooperative Management Platform</p>
            </div>
          </div>

          <h2 className="hero-title">
            Empower your cooperative with clarity and control
          </h2>
          <p className="hero-subtitle">
            Streamline operations, track finances, and collaborate across
            members and managers in one secure platform.
          </p>

          <ul className="hero-highlights">
            <li>Real-time analytics and reporting</li>
            <li>Transparent fees, loans, and payments</li>
            <li>Member-first experience</li>
          </ul>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-panel-card">
          <LoginForm />
        </div>
        <div className="login-footer">
          <span>© {new Date().getFullYear()} Coopra. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
