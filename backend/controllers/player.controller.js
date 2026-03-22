const prisma = require("../lib/prisma");
const { calculateProgress } = require("../utils/progressCalculator");
const { awardPoints } = require("../utils/pointsAwarder");

exports.markLessonProgress = async (req, res, next) => {
  try {
    const { id } = req.params; // lessonId
    const userId = req.user.userId;
    const { isCompleted, timeSpentSeconds, enrollmentId } = req.body;

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    let targetEnrollmentId = enrollmentId;
    if (!targetEnrollmentId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: lesson.courseId } },
      });
      if (!enrollment) {
        return res.status(403).json({ success: false, error: "Not enrolled in this course" });
      }
      targetEnrollmentId = enrollment.id;
    }

    const dataToUpdate = {
      isCompleted: isCompleted !== undefined ? isCompleted : true,
      isInProgress: isCompleted ? false : true,
    };

    if (timeSpentSeconds) {
      dataToUpdate.timeSpentSeconds = { increment: timeSpentSeconds };
    }

    if (dataToUpdate.isCompleted) {
      dataToUpdate.completedAt = new Date();
    } else {
      dataToUpdate.startedAt = new Date();
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: targetEnrollmentId, lessonId: id },
      },
      update: dataToUpdate,
      create: {
        enrollmentId: targetEnrollmentId,
        lessonId: id,
        userId: userId,
        isCompleted: dataToUpdate.isCompleted || false,
        isInProgress: dataToUpdate.isInProgress,
        timeSpentSeconds: timeSpentSeconds || 0,
        startedAt: new Date(),
        completedAt: dataToUpdate.isCompleted ? new Date() : null,
      },
    });

    if (dataToUpdate.isCompleted) {
      await calculateProgress(targetEnrollmentId);
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

exports.getLessonForPlayer = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.userId;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, error: "Not enrolled in this course" });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    if (course.accessRule === "ON_INVITATION") {
      const invitation = await prisma.invitation.findFirst({
        where: {
          courseId,
          OR: [{ email: req.user.email }, { invitedUserId: userId }],
        },
      });
      if (!invitation) {
        return res.status(403).json({ success: false, error: "This course requires an invitation. You are not in the attendees list." });
      }
    }

    if (course.accessRule === "ON_PAYMENT") {
      const payment = await prisma.payment.findFirst({
        where: { userId, courseId, status: "SUCCESS" },
      });
      if (!payment) {
        return res.status(403).json({ success: false, error: "Payment required to access this course." });
      }
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        attachments: true,
        quizLesson: {
          include: {
            quiz: {
              include: {
                questions: {
                  orderBy: { order: "asc" },
                  include: {
                    options: {
                      orderBy: { order: "asc" },
                      select: { id: true, text: true, order: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson || lesson.courseId !== courseId) {
      return res.status(404).json({ success: false, error: "Lesson not found in this course" });
    }

    res.json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

exports.startQuizAttempt = async (req, res, next) => {
  try {
    const { id } = req.params; // quizId
    const userId = req.user.userId;

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    const previousAttempts = await prisma.quizAttempt.count({
      where: { quizId: id, userId },
    });

    if (previousAttempts >= 3) {
      return res.status(400).json({ success: false, error: "Maximum 3 attempts allowed" });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: id,
        attemptNumber: previousAttempts + 1,
        status: "IN_PROGRESS",
      },
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

exports.submitQuizAnswer = async (req, res, next) => {
  try {
    const { id } = req.params; // attemptId
    const userId = req.user.userId;
    const { questionId, selectedOptionId } = req.body;

    const attempt = await prisma.quizAttempt.findUnique({ where: { id } });
    if (!attempt || attempt.userId !== userId) {
      return res.status(403).json({ success: false, error: "Invalid attempt" });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({ success: false, error: "Attempt is already completed" });
    }

    const selectedOption = await prisma.questionOption.findUnique({
      where: { id: selectedOptionId },
      include: { question: true },
    });

    if (!selectedOption || selectedOption.questionId !== questionId) {
      return res.status(400).json({ success: false, error: "Invalid option for this question" });
    }

    if (selectedOption.question.quizId !== attempt.quizId) {
      return res.status(400).json({ success: false, error: "Question does not belong to this quiz attempt" });
    }

    const answer = await prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: { attemptId: id, questionId },
      },
      update: {
        selectedOptionId,
        isCorrect: selectedOption.isCorrect,
      },
      create: {
        attemptId: id,
        questionId,
        selectedOptionId,
        isCorrect: selectedOption.isCorrect,
      },
    });

    res.json({ success: true, data: answer });
  } catch (error) {
    next(error);
  }
};

exports.completeQuizAttempt = async (req, res, next) => {
  try {
    const { id } = req.params; // attemptId
    const userId = req.user.userId;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        answers: true,
        quiz: {
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) {
      return res.status(403).json({ success: false, error: "Invalid attempt" });
    }
    if (attempt.status === "COMPLETED") {
      return res.status(400).json({ success: false, error: "Already completed" });
    }

    const totalQuestions = attempt.quiz._count.questions;
    const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
    const scorePercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const completedAttempt = await prisma.quizAttempt.update({
      where: { id },
      data: {
        status: "COMPLETED",
        score: scorePercent,
        completedAt: new Date(),
      },
    });

    await awardPoints(userId, attempt.quizId, attempt.id, attempt.attemptNumber, scorePercent);

    res.json({ success: true, data: completedAttempt });
  } catch (error) {
    next(error);
  }
};
