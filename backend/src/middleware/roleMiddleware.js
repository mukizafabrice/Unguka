export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ message: "Not authenticated or user role not found." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message:
            "Forbidden: You do not have permission to access this resource.",
        });
    }
    next();
  };
};
