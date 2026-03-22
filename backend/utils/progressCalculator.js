const prisma = require("../lib/prisma");

const calculateProgress = async (enrollmentId) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    });

    if (!enrollment) return;

    const totalLessons = enrollment.course._count.lessons;
    if (totalLessons === 0) return;

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        isCompleted: true,
      },
    });

    const completionPercent = (completedLessons / totalLessons) * 100;
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
