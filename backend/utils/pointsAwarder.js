const prisma = require("../lib/prisma");
const { getBadgeLevel } = require("./badgeCalculator");

/**
 * Awards points for a quiz attempt based on the attempt number and score.
 * Points = baseReward × (scorePercent / 100)
 * Badge is calculated as percentage of total achievable points.
 */
const awardPoints = async (userId, quizId, attemptId, attemptNumber, scorePercent = 0) => {
  try {
    // Look up reward for this attempt number
    const reward = await prisma.quizReward.findFirst({
      where: {
        quizId,
        attemptNumber,
      },
    });

    if (!reward || reward.points <= 0) return;

    // Scale points by score percentage
    const earnedPoints = Math.round(reward.points * (scorePercent / 100));
    if (earnedPoints <= 0) return;

    // Award points
    await prisma.pointTransaction.create({
      data: {
        userId,
        points: earnedPoints,
        reason: `Quiz attempt ${attemptNumber}: scored ${Math.round(scorePercent)}% → ${earnedPoints}/${reward.points} pts`,
        quizAttemptId: attemptId,
      },
    });

    // Update user's total points and badge level
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

    // Update the attempt to reflect points earned
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
