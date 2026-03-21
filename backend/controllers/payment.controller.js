const prisma = require("../lib/prisma");
const razorpay = require("../lib/razorpay");
const crypto = require("crypto");

/**
 * POST /api/payments/create-order
 * Create Razorpay order
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

    if (!razorpay) {
      return res.status(500).json({ success: false, error: "Razorpay instance is not configured on the server." });
    }

    const amountInPaise = Math.round(Number(course.price) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId}`,
    };

    const order = await razorpay.orders.create(options);

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        provider: "RAZORPAY",
        status: "PENDING",
        amount: course.price,
        currency: "INR",
        providerOrderId: order.id,
      },
    });

    res.status(201).json({ success: true, orderId: order.id, paymentId: payment.id, amount: options.amount });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Verify Razorpay signature and create Enrollment
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = req.user.userId;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: "Razorpay secret not available" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        providerOrderId: razorpay_order_id,
        userId,
        courseId,
      },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found" });
    }

    // Process inside transaction to be safe
    const [updatedPayment, enrollment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          providerPaymentId: razorpay_payment_id,
          providerSignature: razorpay_signature,
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
