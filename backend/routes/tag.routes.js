const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const authenticate = require('../middlewares/auth');

router.use(authenticate);

// Tag Routes
router.get('/', tagController.getTags);
router.post('/', tagController.createTag);

module.exports = router;
