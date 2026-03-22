const prisma = require("../lib/prisma");

// Quiz CRUD
const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Get the next lesson order for this course
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });
    const nextOrder = (lastLesson?.order ?? 0) + 1;

    // Create quiz + lesson + quizLesson link in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: { title, description, courseId },
      });
      const lesson = await tx.lesson.create({
        data: {
          courseId,
          title,
          type: 'QUIZ',
          order: nextOrder,
        },
      });
      await tx.quizLesson.create({
        data: { lessonId: lesson.id, quizId: quiz.id },
      });
      return quiz;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error); // Log internal error for debugging
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const listQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        rewards: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const existingQuiz = await prisma.quiz.findUnique({ where: { id } });
    if (!existingQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { title, description },
    });
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingQuiz = await prisma.quiz.findUnique({ where: { id } });
    if (!existingQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Delete linked lesson + quiz in transaction (QuizLesson cascades)
    const quizLesson = await prisma.quizLesson.findUnique({ where: { quizId: id } });
    await prisma.$transaction(async (tx) => {
      await tx.quiz.delete({ where: { id } });
      if (quizLesson) {
        await tx.lesson.delete({ where: { id: quizLesson.lessonId } }).catch(() => {});
      }
    });
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Question CRUD
const addQuestion = async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const { text, order } = req.body;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const question = await prisma.question.create({
      data: {
        text,
        order,
        quizId,
      },
    });
    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, order } = req.body;

    const existingQuestion = await prisma.question.findUnique({ where: { id } });
    if (!existingQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    const question = await prisma.question.update({
      where: { id },
      data: { text, order },
    });
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const existingQuestion = await prisma.question.findUnique({ where: { id } });
    if (!existingQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    await prisma.question.delete({ where: { id } });
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Option CRUD
const addOption = async (req, res) => {
  try {
    const { id: questionId } = req.params;
    const { text, isCorrect, order } = req.body;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const option = await prisma.questionOption.create({
      data: {
        text,
        isCorrect,
        order,
        questionId,
      },
    });
    res.status(201).json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, isCorrect, order } = req.body;

    const existingOption = await prisma.questionOption.findUnique({ where: { id } });
    if (!existingOption) {
      return res.status(404).json({ error: "Option not found" });
    }

    const option = await prisma.questionOption.update({
      where: { id },
      data: { text, isCorrect, order },
    });
    res.json(option);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteOption = async (req, res) => {
  try {
    const { id } = req.params;

    const existingOption = await prisma.questionOption.findUnique({ where: { id } });
    if (!existingOption) {
      return res.status(404).json({ error: "Option not found" });
    }

    await prisma.questionOption.delete({ where: { id } });
    res.json({ message: "Option deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Rewards CRUD
const setRewards = async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const { rewards } = req.body; // Array of { attemptNumber, points }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Use transaction to delete existing and create new or upsert
    // Since attemptNumber + quizId is unique, upsert is best but deleteMany+createMany is simpler for full replacement
    await prisma.$transaction(async (tx) => {
      // Create or update each reward
      for (const reward of rewards) {
        await tx.quizReward.upsert({
          where: {
            quizId_attemptNumber: {
              quizId,
              attemptNumber: reward.attemptNumber,
            },
          },
          update: { points: reward.points },
          create: {
            quizId,
            attemptNumber: reward.attemptNumber,
            points: reward.points,
          },
        });
      }
    });

    const updatedRewards = await prisma.quizReward.findMany({
      where: { quizId },
      orderBy: { attemptNumber: "asc" },
    });
    res.json(updatedRewards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createQuiz,
  listQuizzes,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  editQuestion,
  deleteQuestion,
  addOption,
  editOption,
  deleteOption,
  setRewards,
};