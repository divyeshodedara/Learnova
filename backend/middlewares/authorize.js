const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    next();
  };
};

module.exports = authorize;
