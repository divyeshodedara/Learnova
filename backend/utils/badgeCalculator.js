const prisma = require("../lib/prisma");

const BADGE_TIERS = [
  { pct: 95, level: "MASTER" },
  { pct: 80, level: "EXPERT" },
  { pct: 65, level: "SPECIALIST" },
  { pct: 50, level: "ACHIEVER" },
  { pct: 30, level: "EXPLORER" },
  { pct: 15, level: "NEWBIE" },
];

const getMaxAchievablePoints = async (userId) => {
  if (userId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);
    if (courseIds.length === 0) return 0;

    const rewards = await prisma.quizReward.findMany({
      where: {
        attemptNumber: 1,
        quiz: { courseId: { in: courseIds } },
      },
      select: { points: true },
    });
    return rewards.reduce((sum, r) => sum + r.points, 0);
  }

  const rewards = await prisma.quizReward.findMany({
    where: { attemptNumber: 1 },
    select: { points: true },
  });
  return rewards.reduce((sum, r) => sum + r.points, 0);
};

const getBadgeLevel = async (earnedPoints, userId) => {
  const maxPoints = await getMaxAchievablePoints(userId);

  if (maxPoints <= 0) {
    if (earnedPoints >= 120) return "MASTER";
    if (earnedPoints >= 100) return "EXPERT";
    if (earnedPoints >= 80) return "SPECIALIST";
    if (earnedPoints >= 60) return "ACHIEVER";
    if (earnedPoints >= 40) return "EXPLORER";
    if (earnedPoints >= 20) return "NEWBIE";
    return null;
  }

  const pct = (earnedPoints / maxPoints) * 100;

  for (const tier of BADGE_TIERS) {
    if (pct >= tier.pct) return tier.level;
  }
  return null;
};

const getBadgeLevelSync = (earnedPoints, maxPoints) => {
  if (!maxPoints || maxPoints <= 0) {
    if (earnedPoints >= 120) return "MASTER";
    if (earnedPoints >= 100) return "EXPERT";
    if (earnedPoints >= 80) return "SPECIALIST";
    if (earnedPoints >= 60) return "ACHIEVER";
    if (earnedPoints >= 40) return "EXPLORER";
    if (earnedPoints >= 20) return "NEWBIE";
    return null;
  }
  const pct = (earnedPoints / maxPoints) * 100;
  for (const tier of BADGE_TIERS) {
    if (pct >= tier.pct) return tier.level;
  }
  return null;
};

module.exports = { getBadgeLevel, getBadgeLevelSync, getMaxAchievablePoints, BADGE_TIERS };