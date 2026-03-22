const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const lessonController = require('../controllers/lesson.controller');
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authenticate);

router.post('/', courseController.createCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.patch('/:id', courseController.updateCourse);
router.patch('/:id/publish', courseController.togglePublishCourse);
router.delete('/:id', courseController.deleteCourse);

router.post('/:id/lessons', upload.single('file'), lessonController.addLesson);
router.get('/:id/lessons', lessonController.getLessons);

module.exports = router;
