const jwt = require("jsonwebtoken");

/**
 * Optional Auth middleware — clones authenticate logic but doesn't 401 if token is missing
 * Attaches decoded { userId, email, role } to req.user if present
 */
const optionalAuthenticate = (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch {
    // If token is invalid, we still continue but without req.user
    next();
  }
};

module.exports = optionalAuthenticate;
