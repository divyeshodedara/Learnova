const { Router } = require("express");
const { z } = require("zod");
const validate = require("../middlewares/validate.js");
const authenticate = require("../middlewares/auth.js");
const { signup, login, me } = require("../controllers/auth.controller.js");

const router = Router();

// ─── Schemas ─────────────────────────────────────────────

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Routes ──────────────────────────────────────────────

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

module.exports = router;
