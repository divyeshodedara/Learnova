const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

// Attachment Routes
router.delete('/:id', lessonController.deleteAttachment);

module.exports = router;
