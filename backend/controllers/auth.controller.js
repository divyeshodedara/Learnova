const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma.js");
const { getBadgeLevel, getMaxAchievablePoints, BADGE_TIERS } = require("../utils/badgeCalculator");

const SALT_ROUNDS = 10;

const signToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

const sanitiseUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Email is already registered" });
    }

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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

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

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, error: "Account is disabled" });
    }

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      token,
      user: sanitiseUser(user),
    });
  } catch (err) {
    next(err);
  }
};

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

    const currentBadge = await getBadgeLevel(user.totalPoints, user.id);
    if (currentBadge !== user.badgeLevel) {
      await prisma.user.update({
        where: { id: user.id },
        data: { badgeLevel: currentBadge },
      });
      user.badgeLevel = currentBadge;
    }

    const maxPoints = await getMaxAchievablePoints(user.id);
    const safe = sanitiseUser(user);
    safe.maxAchievablePoints = maxPoints;
    safe.pointsPercent = maxPoints > 0 ? Math.round((user.totalPoints / maxPoints) * 100) : 0;

    const pct = maxPoints > 0 ? (user.totalPoints / maxPoints) * 100 : 0;
    const nextTier = [...BADGE_TIERS].reverse().find((t) => t.pct > pct);
    safe.nextBadge = nextTier ? nextTier.level : null;
    safe.nextBadgePct = nextTier ? nextTier.pct : 100;

    return res.status(200).json({ success: true, user: safe });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, avatarUrl, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: "Current password is required" });
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ success: false, error: "Current password is incorrect" });
      }
      data.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    const updated = await prisma.user.update({ where: { id: userId }, data });
    return res.json({ success: true, user: sanitiseUser(updated) });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, me, updateProfile };
