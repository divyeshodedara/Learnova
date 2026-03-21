const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");

// Quiz Routes
router.post("/courses/:courseId/quizzes", quizController.createQuiz);
router.get("/courses/:courseId/quizzes", quizController.listQuizzes);
router.patch("/quizzes/:id", quizController.updateQuiz);
router.delete("/quizzes/:id", quizController.deleteQuiz);

// Question Routes
router.post("/quizzes/:id/questions", quizController.addQuestion);
router.patch("/questions/:id", quizController.editQuestion);
router.delete("/questions/:id", quizController.deleteQuestion);

// Option Routes
router.post("/questions/:id/options", quizController.addOption);
router.patch("/options/:id", quizController.editOption);
router.delete("/options/:id", quizController.deleteOption);

// Reward Routes
router.put("/quizzes/:id/rewards", quizController.setRewards);

module.exports = router;