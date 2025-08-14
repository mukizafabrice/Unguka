export const checkCooperativeAccess = (location = "body") => {
  // 'body' or 'query'
  return (req, res, next) => {
    // req.user should be set by a preceding authentication middleware (e.g., `protect` middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    // Superadmins can bypass cooperative-specific access checks
    if (req.user.role === "superadmin") {
      return next();
    }
   
    const requestedCooperativeId =
      location === "body" ? req.body.cooperativeId : req.query.cooperativeId;

    // Get the cooperativeId from the authenticated user's token (set by auth middleware)
    const userCooperativeId = req.user.cooperativeId;

    // Ensure user has a cooperative ID if they are not a superadmin
    if (!userCooperativeId) {
      return res
        .status(403)
        .json({ message: "Forbidden: User is not assigned to a cooperative." });
    }

    // Compare the requested cooperativeId with the user's cooperativeId
    // Convert to string for reliable comparison (MongoDB ObjectIds might be objects)
    if (String(requestedCooperativeId) !== String(userCooperativeId)) {
      return res
        .status(403)
        .json({
          message:
            "Forbidden: You do not have access to this cooperative's resources.",
        });
    }

    // If authorized, proceed
    next();
  };
};
