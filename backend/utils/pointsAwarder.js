const prisma = require("../lib/prisma");
const { getBadgeLevel } = require("./badgeCalculator");

const awardPoints = async (userId, quizId, attemptId, attemptNumber, scorePercent = 0) => {
  try {
    const reward = await prisma.quizReward.findFirst({
      where: {
        quizId,
        attemptNumber,
      },
    });

    if (!reward || reward.points <= 0) return;

    const earnedPoints = Math.round(reward.points * (scorePercent / 100));
    if (earnedPoints <= 0) return;

    await prisma.pointTransaction.create({
      data: {
        userId,
        points: earnedPoints,
        reason: `Quiz attempt ${attemptNumber}: scored ${Math.round(scorePercent)}% → ${earnedPoints}/${reward.points} pts`,
        quizAttemptId: attemptId,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const newTotalPoints = user.totalPoints + earnedPoints;
    const calculatedBadge = await getBadgeLevel(newTotalPoints, userId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: newTotalPoints,
        badgeLevel: calculatedBadge || user.badgeLevel,
      },
    });

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        pointsEarned: earnedPoints,
      },
    });

  } catch (error) {
    console.error("Error awarding points:", error);
  }
};

module.exports = { awardPoints };
