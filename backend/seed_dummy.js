require("dotenv").config();
const prisma = require("./lib/prisma");

async function main() {
  console.log("Seeding database with dummy data for Testing...");

  // 1. Create Instructor
  const instructor = await prisma.user.upsert({
    where: { email: "instructor2@example.com" },
    update: {},
    create: {
      email: "instructor2@example.com",
      passwordHash: "dummyhash123",
      firstName: "Jane",
      lastName: "Doe",
      role: "INSTRUCTOR",
    },
  });
  console.log(`Instructor ID: ${instructor.id}`);

  // 2. Create Course
  const course = await prisma.course.create({
    data: {
      title: "Advanced Backend Testing",
      slug: `backend-testing-${Date.now()}`, // unique slug
      description: "Testing API endpoints",
      createdById: instructor.id,
      isPublished: true,
      visibility: "EVERYONE",
    },
  });
  console.log(`Course ID: ${course.id}`);

  // 3. Create a Quiz (to test adding questions/options to an existing quiz)
  const quiz = await prisma.quiz.create({
    data: {
      title: "Pre-seeded Quiz",
      description: "This quiz was created by the seed script",
      courseId: course.id,
    },
  });
  console.log(`Quiz ID: ${quiz.id}`);

  // 4. Create a Question (to test adding options to an existing question)
  const question = await prisma.question.create({
    data: {
      text: "Pre-seeded Question?",
      order: 1,
      quizId: quiz.id,
    },
  });
  console.log(`Question ID: ${question.id}`);

  console.log("\nCOPY THESE COMMANDS TO TEST (All IDs are pre-filled)\n");

  console.log(`
# 1. List Quizzes
curl -X GET http://localhost:5000/api/courses/${course.id}/quizzes

# 2. Add New Quiz
curl -X POST http://localhost:5000/api/courses/${course.id}/quizzes \\
  -H "Content-Type: application/json" \\
  -d '{"title": "New Quiz via API", "description": "Created via curl"}'

# 3. Update Pre-seeded Quiz
curl -X PATCH http://localhost:5000/api/quizzes/${quiz.id} \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Updated Quiz Title"}'

# 4. Add Question to Pre-seeded Quiz
curl -X POST http://localhost:5000/api/quizzes/${quiz.id}/questions \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Is this a new question?", "order": 2}'

# 5. Add Option to Pre-seeded Question
curl -X POST http://localhost:5000/api/questions/${question.id}/options \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Yes, it is", "isCorrect": true, "order": 1}'

# 6. Set Rewards for Pre-seeded Quiz
curl -X PUT http://localhost:5000/api/quizzes/${quiz.id}/rewards \\
  -H "Content-Type: application/json" \\
  -d '{"rewards": [{"attemptNumber": 1, "points": 50}, {"attemptNumber": 2, "points": 25}]}'

# 7. Get Reporting Overview
curl -X GET http://localhost:5000/api/reporting

# 8. List Invitations
curl -X GET http://localhost:5000/api/courses/${course.id}/invitations
`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });