const express = require("express");
const router = express.Router();
const reportingController = require("../controllers/reporting.controller");
const authenticate = require("../middlewares/auth");

router.get("/", authenticate, reportingController.getOverview);
router.get("/users", authenticate, reportingController.getUserProgress);

module.exports = router;