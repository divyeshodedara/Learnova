const prisma = require("../lib/prisma");
const { getBadgeLevelSync, getMaxAchievablePoints } = require("../utils/badgeCalculator");

const getOverview = async (req, res) => {
  try {
    const totalParticipants = await prisma.enrollment.count();

    const yetToStart = await prisma.enrollment.count({
      where: { status: "YET_TO_START" },
    });

    const inProgress = await prisma.enrollment.count({
      where: { status: "IN_PROGRESS" },
    });

    const completed = await prisma.enrollment.count({
      where: { status: "COMPLETED" },
    });

    const totalQuizAttempts = await prisma.quizAttempt.count({
      where: { status: "COMPLETED" },
    });

    const avgResult = await prisma.quizAttempt.aggregate({
      _avg: { score: true },
      where: { status: "COMPLETED" },
    });

    res.json({
      success: true,
      data: {
        totalParticipants,
        yetToStart,
        inProgress,
        completed,
        totalQuizAttempts,
        avgQuizScore: Math.round(avgResult._avg.score ?? 0),
      },
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
            totalPoints: true,
            badgeLevel: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            quizzes: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // For each enrollment, fetch quiz attempts for that user+course
    const formatted = await Promise.all(
      progress.map(async (p, index) => {
        // Recalculate badge scoped to this user's enrolled courses
        const userMaxPoints = await getMaxAchievablePoints(p.user.id);
        const recalcBadge = getBadgeLevelSync(p.user.totalPoints, userMaxPoints);
        if (recalcBadge !== p.user.badgeLevel) {
          await prisma.user.update({ where: { id: p.user.id }, data: { badgeLevel: recalcBadge } });
          p.user.badgeLevel = recalcBadge;
        }

        const quizIds = p.course.quizzes.map((q) => q.id);

        // Per-course max: sum of attempt-1 rewards for quizzes in THIS course only
        let courseMaxPoints = 0;
        if (quizIds.length > 0) {
          const courseRewards = await prisma.quizReward.findMany({
            where: { attemptNumber: 1, quizId: { in: quizIds } },
            select: { points: true },
          });
          courseMaxPoints = courseRewards.reduce((s, r) => s + r.points, 0);
        }

        let quizScores = [];
        let courseEarnedPoints = 0;
        if (quizIds.length > 0) {
          const attempts = await prisma.quizAttempt.findMany({
            where: {
              userId: p.user.id,
              quizId: { in: quizIds },
              status: "COMPLETED",
            },
            select: {
              quizId: true,
              score: true,
              attemptNumber: true,
              pointsEarned: true,
            },
            orderBy: { score: "desc" },
          });

          // Group by quiz: best score per quiz
          const quizMap = {};
          for (const a of attempts) {
            if (!quizMap[a.quizId] || a.score > quizMap[a.quizId].bestScore) {
              quizMap[a.quizId] = {
                bestScore: a.score,
                attempts: 0,
                totalPoints: 0,
              };
            }
            quizMap[a.quizId].attempts++;
            quizMap[a.quizId].totalPoints += a.pointsEarned;
          }

          quizScores = p.course.quizzes.map((q) => ({
            quizTitle: q.title,
            bestScore: quizMap[q.id]?.bestScore ?? null,
            attempts: quizMap[q.id]?.attempts ?? 0,
            pointsEarned: quizMap[q.id]?.totalPoints ?? 0,
          }));

          // Sum earned points for THIS course
          courseEarnedPoints = quizScores.reduce((s, q) => s + q.pointsEarned, 0);
        }

        return {
          id: p.id,
          srNo: index + 1,
          course: { id: p.course.id, title: p.course.title },
          user: p.user,
          enrolledAt: p.enrolledAt,
          startedAt: p.startedAt,
          timeSpentSeconds: p.timeSpentSeconds,
          completionPct: p.completionPercent,
          completedAt: p.completedAt,
          status: p.status,
          quizScores,
          courseEarnedPoints,
          courseMaxPoints,
          coursePointsPercent: courseMaxPoints > 0 ? Math.round((courseEarnedPoints / courseMaxPoints) * 100) : 0,
          maxAchievablePoints: userMaxPoints,
          pointsPercent: userMaxPoints > 0 ? Math.round((p.user.totalPoints / userMaxPoints) * 100) : 0,
        };
      })
    );

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverview,
  getUserProgress,
};