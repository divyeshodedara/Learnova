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
const cookieParser = require("cookie-parser");

app.use(cors({ origin: true, credentials: true })); // usually needed for cookies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health-check route ──────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Learnova API is running" });
});

// ─── API routes ──────────────────────────────────────────
const courseRoutes = require("./routes/course.routes.js");
const lessonRoutes = require("./routes/lesson.routes.js");
const attachmentRoutes = require("./routes/attachment.routes.js");
const tagRoutes = require("./routes/tag.routes.js");

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/tags", tagRoutes);

app.use("/api/admin", require("./routes/admin.routes.js"));

// Person 2 Routes
app.use("/api", require("./routes/quiz.routes.js"));
app.use("/api", require("./routes/reporting.routes.js"));
app.use("/api", require("./routes/invitation.routes.js"));

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
