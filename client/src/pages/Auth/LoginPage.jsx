import React from "react";
import LoginForm from "../../components/Auth/LoginForm";
import "../../assets/styles/login.css";

const LoginPage = () => {
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 myform">
      <div className="col-md-4 col-lg-4  shadow p-4 rounded-4 bg-white">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
