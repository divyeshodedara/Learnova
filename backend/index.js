const dotenv = require("dotenv");
// Load environment variables
dotenv.config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes.js");
const errorHandler = require("./middlewares/errorHandler.js");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health-check route ──────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Learnova API is running" });
});

// ─── API routes ──────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ─── 404 handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global error handler ────────────────────────────────
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
