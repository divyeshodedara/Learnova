const prisma = require("../lib/prisma");

const getOverview = async (req, res) => {
  try {
    // You might want to filter by instructor ID if multi-tenant, assuming global admin or course manager for now
    const totalParticipants = await prisma.enrollment.count(); // actually enrollments, distinct users?

    const yetToStart = await prisma.enrollment.count({
      where: { status: "YET_TO_START" },
    });

    const inProgress = await prisma.enrollment.count({
      where: { status: "IN_PROGRESS" },
    });

    const completed = await prisma.enrollment.count({
      where: { status: "COMPLETED" },
    });

    res.json({
      totalParticipants,
      yetToStart,
      inProgress,
      completed,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserProgress = async (req, res) => {
  try {
    const { status, courseId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;

    const progress = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Formatting for frontend table
    const formatted = progress.map((p, index) => ({
      srNo: index + 1,
      courseName: p.course.title,
      participantName: `${p.user.firstName} ${p.user.lastName}`,
      enrolledDate: p.enrolledAt,
      startDate: p.startedAt,
      timeSpent: p.timeSpentSeconds, // Frontend can format to HH:MM
      completionPercentage: p.completionPercent,
      completedDate: p.completedAt,
      status: p.status,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverview,
  getUserProgress,
};