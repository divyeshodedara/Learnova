const prisma = require("../lib/prisma");

/**
 * Calculates and updates completion percent for an enrollment
 * @param {string} enrollmentId
 */
const calculateProgress = async (enrollmentId) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            _count: {
              select: { lessons: true, quizzes: true },
            },
          },
        },
      },
    });

    if (!enrollment) return;

    const totalLessons = enrollment.course._count.lessons;
    const totalQuizzes = enrollment.course._count.quizzes;
    const totalItems = totalLessons + totalQuizzes;

    if (totalItems === 0) return;

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        isCompleted: true,
      },
    });

    const completedQuizzes = await prisma.quiz.count({
      where: {
        courseId: enrollment.courseId,
        attempts: {
          some: {
            userId: enrollment.userId,
            status: "COMPLETED",
          },
        },
      },
    });

    const completionPercent = Math.round(((completedLessons + completedQuizzes) / totalItems) * 100);
    let status = enrollment.status;

    if (completionPercent >= 100) {
      status = "COMPLETED";
    } else if (completionPercent > 0) {
      status = "IN_PROGRESS";
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        completionPercent,
        status,
        completedAt: completionPercent >= 100 && !enrollment.completedAt ? new Date() : enrollment.completedAt,
      },
    });
  } catch (error) {
    console.error("Error calculating progress:", error);
  }
};

module.exports = { calculateProgress };
