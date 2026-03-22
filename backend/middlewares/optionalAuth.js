const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = optionalAuth;
