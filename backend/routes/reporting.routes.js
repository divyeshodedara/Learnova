const express = require("express");
const router = express.Router();
const reportingController = require("../controllers/reporting.controller");

router.get("/reporting", reportingController.getOverview);
router.get("/reporting/users", reportingController.getUserProgress);

module.exports = router;