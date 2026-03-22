const express = require("express");
const router = express.Router();
const learnerController = require("../controllers/learner.controller");
const authenticate = require("../middlewares/auth");
const optionalAuth = require("../middlewares/optionalAuth");

router.get("/courses/published", learnerController.getPublishedCourses);
router.get("/courses/:id/detail", optionalAuth, learnerController.getCourseDetail);
router.get("/courses/:id/reviews", learnerController.getCourseReviews);

// Protected routes
router.use(authenticate);

router.post("/enrollments", learnerController.enrollInCourse);
router.get("/enrollments/my", learnerController.getMyEnrollments);
router.get("/enrollments/:id/progress", learnerController.getCourseProgress);
router.post("/courses/:id/reviews", learnerController.addCourseReview);

module.exports = router;
