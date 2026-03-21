const prisma = require("../lib/prisma");
const fs = require("fs");
const path = require("path");

// Load Person 2's badgeCalculator if it exists, otherwise use a fallback
let getBadgeLevel;
try {
  const badgeCalcPath = path.join(__dirname, "badgeCalculator.js");
  if (fs.existsSync(badgeCalcPath)) {
    const imported = require("./badgeCalculator");
    getBadgeLevel = imported.calculateBadge || imported.getBadgeLevel || imported;
  }
} catch (err) {
  // Ignored
}

if (!getBadgeLevel || typeof getBadgeLevel !== 'function') {
  getBadgeLevel = (points) => {
    if (points >= 120) return "MASTER";
    if (points >= 100) return "EXPERT";
    if (points >= 80) return "SPECIALIST";
    if (points >= 60) return "ACHIEVER";
    if (points >= 40) return "EXPLORER";
    if (points >= 20) return "NEWBIE";
    return null;
  };
}

/**
 * Awards points for a quiz attempt based on the attempt number
 */
const awardPoints = async (userId, quizId, attemptId, attemptNumber) => {
  try {
    // Look up reward for this attempt number
    const reward = await prisma.quizReward.findFirst({
      where: {
        quizId,
        attemptNumber,
      },
    });

    if (!reward || reward.points <= 0) return;

    // Award points
    await prisma.pointTransaction.create({
      data: {
        userId,
        points: reward.points,
        reason: `Quiz earned points for attempt ${attemptNumber}`,
        quizAttemptId: attemptId,
      },
    });

    // Update user's total points and badge level
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const newTotalPoints = user.totalPoints + reward.points;
    const calculatedBadge = getBadgeLevel(newTotalPoints);

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
        pointsEarned: reward.points,
      },
    });

  } catch (error) {
    console.error("Error awarding points:", error);
  }
};

module.exports = { awardPoints };
