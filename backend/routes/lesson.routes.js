const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const authenticate = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authenticate);

router.patch('/:id', upload.single('file'), lessonController.editLesson);
router.delete('/:id', lessonController.deleteLesson);

router.post('/:id/attachments', upload.single('file'), lessonController.addAttachment);

module.exports = router;
