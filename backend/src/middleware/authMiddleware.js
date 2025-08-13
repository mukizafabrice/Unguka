import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes and verify JWT
export const protect = async (req, res, next) => {
  let token;

  // Check for the token in the headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user from the token payload to the request object
      // This allows you to access req.user in your controllers
      req.user = await User.findById(decoded.id).select("-password");

      // Check if the user was found
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to authorize users based on role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied, you do not have the required role" });
    }
    next();
  };
};
