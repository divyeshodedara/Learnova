const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes.js");
const courseRoutes = require("./routes/course.routes.js");
const lessonRoutes = require("./routes/lesson.routes.js");
const attachmentRoutes = require("./routes/attachment.routes.js");
const tagRoutes = require("./routes/tag.routes.js");
const learnerRoutes = require("./routes/learner.routes.js");
const playerRoutes = require("./routes/player.routes.js");
const paymentRoutes = require("./routes/payment.routes.js");
const adminRoutes = require("./routes/admin.routes.js");
const quizRoutes = require("./routes/quiz.routes.js");
const reportingRoutes = require("./routes/reporting.routes.js");
const invitationRoutes = require("./routes/invitation.routes.js");
const errorHandler = require("./middlewares/errorHandler.js");

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware

const cookieParser = require("cookie-parser");
app.use(cors({ origin: true, credentials: true })); 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Learnova API is running" });
});

app.use("/api/learners", learnerRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/payments", paymentRoutes);


app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", quizRoutes);
app.use("/api/reporting", reportingRoutes);
app.use("/api/invitations", invitationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
