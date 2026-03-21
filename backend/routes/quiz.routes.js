const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
const authenticate = require("../middlewares/auth");

// Quiz Routes
router.post("/courses/:courseId/quizzes", authenticate, quizController.createQuiz);
router.get("/courses/:courseId/quizzes", authenticate, quizController.listQuizzes);
router.patch("/quizzes/:id", authenticate, quizController.updateQuiz);
router.delete("/quizzes/:id", authenticate, quizController.deleteQuiz);

// Question Routes
router.post("/quizzes/:id/questions", authenticate, quizController.addQuestion);
router.patch("/questions/:id", authenticate, quizController.editQuestion);
router.delete("/questions/:id", authenticate, quizController.deleteQuestion);

// Option Routes
router.post("/questions/:id/options", authenticate, quizController.addOption);
router.patch("/options/:id", authenticate, quizController.editOption);
router.delete("/options/:id", quizController.deleteOption);

// Reward Routes
router.put("/quizzes/:id/rewards", authenticate, quizController.setRewards);

module.exports = router;