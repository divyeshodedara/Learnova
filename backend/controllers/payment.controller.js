const prisma = require("../lib/prisma");
const paypal = require("../lib/paypal");
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');


exports.createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.accessRule !== "ON_PAYMENT" || !course.price) {
      return res.status(400).json({ success: false, error: "Invalid course or not paid" });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: "Already enrolled" });
    }

    const existingSuccess = await prisma.payment.findFirst({
      where: { userId, courseId, status: "SUCCESS" },
    });
    if (existingSuccess) {
      return res.status(400).json({ success: false, error: "Payment already completed" });
    }


    const existingPending = await prisma.payment.findFirst({
      where: { userId, courseId, status: "PENDING" },
    });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        error: "A pending payment already exists. Cancel it first to create a new one.",
        pendingPaymentId: existingPending.id,
      });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: Number(course.price).toFixed(2)
        }
      }]
    });

    const order = await paypal.client().execute(request);

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

exports.verifyPayment = async (req, res, next) => {
  try {
    const { paypal_order_id, courseId } = req.body;
    const userId = req.user.userId;

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

    const { enrollment, updatedPayment } = await prisma.$transaction(async (tx) => {
      const newEnrollment = await tx.enrollment.create({
        data: {
          userId,
          courseId,
          status: "YET_TO_START",
        },
      });

      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          providerPaymentId: captureId,
          enrollmentId: newEnrollment.id,
        },
      });

      return { enrollment: newEnrollment, updatedPayment: updated };
    });

    res.json({ success: true, data: { enrollment, payment: updatedPayment } });
  } catch (error) {
    next(error);
  }
};


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

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: { userId, courseId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.cancelPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const userId = req.user.userId;

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({ success: false, error: "Only pending payments can be cancelled" });
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED", failureReason: "Cancelled by user" },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, userId: filterUserId, courseId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (filterUserId) where.userId = filterUserId;
    if (courseId) where.courseId = courseId;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        course: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};
