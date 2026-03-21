const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const lessonController = require('../controllers/lesson.controller');
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// All course routes protected via authentication
router.use(authenticate);

// Course Routes
router.post('/', courseController.createCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.patch('/:id', courseController.updateCourse);
router.patch('/:id/publish', courseController.togglePublishCourse);
router.delete('/:id', courseController.deleteCourse);

// Course-Lessons Routes (nested per spec)
router.post('/:id/lessons', upload.single('file'), lessonController.addLesson);
router.get('/:id/lessons', lessonController.getLessons);

module.exports = router;
