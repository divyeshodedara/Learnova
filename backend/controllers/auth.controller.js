const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma.js");

const SALT_ROUNDS = 10;

/**
 * Helper — sign a JWT with the standard payload.
 */
const signToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

/**
 * Helper — strip sensitive fields before sending a user object.
 */
const sanitiseUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

// ─── POST /api/auth/signup ───────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Email is already registered" });
    }

    // Hash password & create user
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash, role: "LEARNER" },
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: sanitiseUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Generic message — never reveal whether email or password was wrong
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    // Active check
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, error: "Account is disabled" });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: sanitiseUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me (protected) ────────────────────────
const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, user: sanitiseUser(user) });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, me };
