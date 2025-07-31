import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth(); // Get both user and loading states

  console.log("--- ProtectedRoute Debug Start ---");
  console.log("1. ProtectedRoute: Current User from AuthContext:", user);
  console.log("2. ProtectedRoute: Auth Loading State:", loading);
  console.log("3. ProtectedRoute: Allowed Roles for this route:", allowedRoles);

  // Check 1: If AuthContext is still loading
  if (loading) {
    console.log("4. ProtectedRoute: AUTHENTICATION IS STILL LOADING. Displaying loader.");
    return <div>Loading authentication...</div>;
  }

  // Check 2: If there's no user (not logged in)
  if (!user) {
    console.log("5. ProtectedRoute: NO USER FOUND (user is null/undefined). Redirecting to login.");
    return <Navigate to="/" replace />;
  }

  console.log("6. ProtectedRoute: User object found. User's role:", user.role);

  // Check 3: If user exists but role is not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`7. ProtectedRoute: User role "${user.role}" IS NOT IN ALLOWED ROLES [${allowedRoles.join(', ')}]. Redirecting to login.`);
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the children
  console.log("8. ProtectedRoute: ACCESS GRANTED. Rendering children (Profile component).");
  return children;
};

export default ProtectedRoute;