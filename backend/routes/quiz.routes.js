const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
const authenticate = require("../middlewares/auth");

router.post("/courses/:courseId/quizzes", authenticate, quizController.createQuiz);
router.get("/courses/:courseId/quizzes", authenticate, quizController.listQuizzes);
router.patch("/quizzes/:id", authenticate, quizController.updateQuiz);
router.delete("/quizzes/:id", authenticate, quizController.deleteQuiz);

router.post("/quizzes/:id/questions", authenticate, quizController.addQuestion);
router.patch("/questions/:id", authenticate, quizController.editQuestion);
router.delete("/questions/:id", authenticate, quizController.deleteQuestion);

router.post("/questions/:id/options", authenticate, quizController.addOption);
router.patch("/options/:id", authenticate, quizController.editOption);
router.delete("/options/:id", quizController.deleteOption);

router.put("/quizzes/:id/rewards", authenticate, quizController.setRewards);

module.exports = router;