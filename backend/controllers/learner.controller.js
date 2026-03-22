const prisma = require("../lib/prisma");

/**
 * GET /api/courses/published
 * Browse published courses (respects visibility rules)
 */
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

/**
 * GET /api/courses/:id/detail
 * Course detail page (overview, progress, reviews)
 */
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
          where: { type: { not: "QUIZ" } }, // Optional: separate quizzes if necessary
          orderBy: { order: "asc" },
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

    // If user is authenticated, find enrollment and progress
    let enrollment = null;
    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: id } },
      });
    }

    res.json({ success: true, data: { course, enrollment } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/enrollments
 * Enroll in a course checking access rules
 */
exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    // Check existing enrollment
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: "Already enrolled" });
    }

    // Access checks
    if (course.accessRule === "ON_PAYMENT") {
      return res.status(403).json({ success: false, error: "Payment required. Please create an order first." });
    }

    if (course.accessRule === "ON_INVITATION") {
      const invitation = await prisma.invitation.findFirst({
        where: { courseId, OR: [{ email: req.user.email }, { invitedUserId: userId }] },
      });
      if (!invitation || invitation.acceptedAt) {
        return res.status(403).json({ success: false, error: "You need a valid invitation to enroll in this course." });
      }
      
      // Consume the invitation
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date(), invitedUserId: userId },
      });
    }

    // Create enrollment for OPEN or ON_INVITATION (where verified)
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

/**
 * GET /api/enrollments/my
 * My courses page
 */
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

/**
 * GET /api/enrollments/:id/progress
 * Get full progress for a specific course enrollment
 */
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
            _count: { select: { lessons: true, quizzes: true } },
            quizzes: {
              select: {
                id: true,
                attempts: {
                  where: { userId },
                  select: { status: true, score: true }
                }
              }
            }
          }
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

/**
 * GET /api/courses/:id/reviews
 * List reviews and average rating
 */
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

/**
 * POST /api/courses/:id/reviews
 * Add review (one per learner per course). Requires enrollment.
 */
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

    // Upsert review (allows user to update their existing review instead of failing)
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
