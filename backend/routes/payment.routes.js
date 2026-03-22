const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.use(authenticate);

router.post("/create-order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);
router.post("/cancel", paymentController.cancelPayment);
router.get("/my", paymentController.getMyPayments);
router.get("/status/:courseId", paymentController.getPaymentStatus);

// Admin-only
router.get("/admin/all", authorize("ADMIN"), paymentController.getAllPayments);

module.exports = router;
