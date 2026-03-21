const express = require("express");
const router = express.Router();
const reportingController = require("../controllers/reporting.controller");
const authenticate = require("../middlewares/auth");

router.get("/reporting", authenticate, reportingController.getOverview);
router.get("/reporting/users", authenticate, reportingController.getUserProgress);

module.exports = router;