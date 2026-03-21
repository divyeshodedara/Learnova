const prisma = require("../lib/prisma");
const paypal = require("../lib/paypal");
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * POST /api/payments/create-order
 * Create PayPal order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.accessRule !== "ON_PAYMENT" || !course.price) {
      return res.status(400).json({ success: false, error: "Invalid course or not paid" });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: "Already enrolled" });
    }

    // Create PayPal order request
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD', // Change as appropriate
          value: Number(course.price).toFixed(2)
        }
      }]
    });

    // Execute order creation
    const order = await paypal.client().execute(request);

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        provider: "PAYPAL",
        status: "PENDING",
        amount: course.price,
        currency: "USD",
        providerOrderId: order.result.id,
      },
    });

    res.status(201).json({ 
        success: true, 
        orderId: order.result.id, 
        paymentId: payment.id, 
        amount: course.price 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Capture PayPal Order and create Enrollment
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { paypal_order_id, courseId } = req.body;
    const userId = req.user.userId;

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        providerOrderId: paypal_order_id,
        userId,
        courseId,
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found" });
    }

    if (payment.status === "SUCCESS") {
         return res.status(400).json({ success: false, error: "Payment already captured" });
    }

    // Capture the PayPal Order
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypal_order_id);
    request.requestBody({});
    
    let captureResult;
    try {
        captureResult = await paypal.client().execute(request);
    } catch (err) {
        return res.status(400).json({ success: false, error: "PayPal capture failed", details: err.message });
    }

    if (captureResult.result.status !== "COMPLETED") {
        return res.status(400).json({ success: false, error: "Payment not completed on PayPal" });
    }

    const captureId = captureResult.result.purchase_units[0].payments.captures[0].id;

    // Process inside transaction to be safe
    const [updatedPayment, enrollment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          providerPaymentId: captureId, // Save the capture ID
        },
      }),
      prisma.enrollment.create({
        data: {
          userId,
          courseId,
          status: "YET_TO_START",
        },
      })
    ]);

    // Finally associate payment with new enrollment (because optional 1:1 relation usually applies at FK level)
    await prisma.payment.update({
        where: { id: payment.id },
        data: { enrollmentId: enrollment.id }
    });

    res.json({ success: true, data: { enrollment, payment: updatedPayment } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/my
 * List user's payment history
 */
exports.getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        course: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};
