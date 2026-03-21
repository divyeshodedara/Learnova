/**
 * Factory function to create role-based authorization middleware
 * Usage: authorize("ADMIN", "INSTRUCTOR")
 * Must be used AFTER authenticate middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if req.user exists (set by authenticate middleware) and has a valid role
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    next();
  };
};

module.exports = authorize;
