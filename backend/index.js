import dotenv from "dotenv";
// Load environment variables
dotenv.config();

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health-check route ──────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Learnova API is running 🚀" });
});

// ─── API routes placeholder ──────────────────────────────
// import userRoutes from "./routes/users.js";
// import courseRoutes from "./routes/courses.js";
// app.use("/api/users", userRoutes);
// app.use("/api/courses", courseRoutes);

// ─── 404 handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global error handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
