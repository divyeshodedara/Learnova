const prisma = require("../lib/prisma");

exports.getPublishedCourses = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : null;
    let whereClause = { isPublished: true };

    if (!userId) {
      whereClause.visibility = "EVERYONE";
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
        tags: {
          include: { tag: true },
        },
        _count: {
          select: { enrollments: true, reviews: true, lessons: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

exports.getCourseDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : null;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
        tags: {
          include: { tag: true },
        },
        lessons: {
          orderBy: { order: "asc" },
          include: {
            quizLesson: { include: { quiz: true } },
          },
        },
        quizzes: true,
        _count: {
          select: { enrollments: true, reviews: true, lessons: true },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (!userId && course.visibility === "SIGNED_IN") {
      return res.status(403).json({ success: false, error: "Sign in to view this course" });
    }

    let enrollment = null;
    let hasInvitation = false;
    let hasPaid = false;

    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: id } },
      });

      if (course.accessRule === "ON_INVITATION") {
        const invitation = await prisma.invitation.findFirst({
          where: {
            courseId: id,
            OR: [{ email: req.user.email }, { invitedUserId: userId }],
          },
        });
        hasInvitation = !!invitation;
      }

      if (course.accessRule === "ON_PAYMENT") {
        const payment = await prisma.payment.findFirst({
          where: { userId, courseId: id, status: "SUCCESS" },
        });
        hasPaid = !!payment;
      }
    }

    res.json({ success: true, data: { course, enrollment, hasInvitation, hasPaid } });
  } catch (error) {
    next(error);
  }
};

exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: "Already enrolled" });
    }

    if (course.accessRule === "ON_PAYMENT") {
      return res.status(403).json({ success: false, error: "Payment required. Please create an order first." });
    }

    if (course.accessRule === "ON_INVITATION") {
      const invitation = await prisma.invitation.findFirst({
        where: {
          courseId,
          OR: [{ email: req.user.email }, { invitedUserId: userId }],
        },
      });
      if (!invitation) {
        return res.status(403).json({ success: false, error: "You need an invitation to enroll in this course." });
      }

      if (!invitation.acceptedAt) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: new Date(), invitedUserId: userId },
        });
      }
    }

    const newEnrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "YET_TO_START",
      },
    });

    res.status(201).json({ success: true, data: newEnrollment });
  } catch (error) {
    next(error);
  }
};

exports.getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImageUrl: true,
            _count: { select: { lessons: true } }
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (error) {
    next(error);
  }
};

exports.getCourseProgress = async (req, res, next) => {
  try {
    const { id } = req.params; // Enrollment ID
    const userId = req.user.userId;

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            lessons: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
                duration: true,
                quizLesson: {
                  select: { quizId: true },
                },
              },
            },
            _count: { select: { lessons: true } },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    if (enrollment.userId !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized access" });
    }

    res.json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

exports.getCourseReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: { courseId: id },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      count: reviews.length,
      avgRating: avgRating.toFixed(1),
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

exports.addCourseReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "Provide a valid rating between 1 and 5" });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    });

    if (!enrollment) {
      return res.status(403).json({ success: false, error: "You must be enrolled to review" });
    }

    const review = await prisma.review.upsert({
      where: {
        courseId_userId: { courseId: id, userId },
      },
      update: {
        rating,
        comment,
      },
      create: {
        courseId: id,
        userId,
        rating,
        comment,
      },
    });

    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};
