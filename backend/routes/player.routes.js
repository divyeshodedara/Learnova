const express = require("express");
const router = express.Router();
const playerController = require("../controllers/player.controller");
const authenticate = require("../middlewares/auth");

router.use(authenticate);

router.patch("/progress/lesson/:id", playerController.markLessonProgress);
router.get("/player/:courseId/:lessonId", playerController.getLessonForPlayer);

router.post("/quizzes/:id/attempt", playerController.startQuizAttempt);
router.post("/attempts/:id/answer", playerController.submitQuizAnswer);
router.post("/attempts/:id/complete", playerController.completeQuizAttempt);

module.exports = router;
