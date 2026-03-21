const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authenticate = require("../middlewares/auth");

router.use(authenticate);

router.post("/create-order", paymentController.createOrder);
router.post("/verify", paymentController.verifyPayment);
router.get("/my", paymentController.getMyPayments);

module.exports = router;
