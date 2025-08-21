import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  allowedPermissions = [],
}) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;

  // Role check
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Permission check
  if (
    allowedPermissions.length &&
    !allowedPermissions.some((p) => user.permissions.includes(p))
  ) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default ProtectedRoute;
