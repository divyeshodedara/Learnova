// =============================================================================
// Learnova — Comprehensive Database Seed Script
// Seeds ALL models with 15 realistic examples each
// Run:  node prisma/seed.js   (or  npx prisma db seed)
// =============================================================================

require("dotenv").config();
const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const hash = (pw) => bcrypt.hashSync(pw, 10);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log("🌱  Seeding Learnova database …\n");

  // =========================================================================
  // 1. USERS  (15) — 1 Admin, 4 Instructors, 10 Learners
  // =========================================================================
  const usersData = [
    { email: "admin@learnova.com", firstName: "System", lastName: "Admin", role: "ADMIN" },
    { email: "jane.doe@learnova.com", firstName: "Jane", lastName: "Doe", role: "INSTRUCTOR" },
    { email: "mark.smith@learnova.com", firstName: "Mark", lastName: "Smith", role: "INSTRUCTOR" },
    { email: "priya.patel@learnova.com", firstName: "Priya", lastName: "Patel", role: "INSTRUCTOR" },
    { email: "carlos.garcia@learnova.com", firstName: "Carlos", lastName: "Garcia", role: "INSTRUCTOR" },
    { email: "alice.johnson@learnova.com", firstName: "Alice", lastName: "Johnson", role: "LEARNER" },
    { email: "bob.williams@learnova.com", firstName: "Bob", lastName: "Williams", role: "LEARNER" },
    { email: "charlie.brown@learnova.com", firstName: "Charlie", lastName: "Brown", role: "LEARNER" },
    { email: "diana.kumar@learnova.com", firstName: "Diana", lastName: "Kumar", role: "LEARNER" },
    { email: "ethan.lee@learnova.com", firstName: "Ethan", lastName: "Lee", role: "LEARNER" },
    { email: "fiona.chen@learnova.com", firstName: "Fiona", lastName: "Chen", role: "LEARNER" },
    { email: "george.taylor@learnova.com", firstName: "George", lastName: "Taylor", role: "LEARNER" },
    { email: "hannah.wilson@learnova.com", firstName: "Hannah", lastName: "Wilson", role: "LEARNER" },
    { email: "ivan.petrov@learnova.com", firstName: "Ivan", lastName: "Petrov", role: "LEARNER" },
    { email: "julia.martinez@learnova.com", firstName: "Julia", lastName: "Martinez", role: "LEARNER" },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash: hash("Password@123"),
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      },
    });
    users.push(user);
  }
  console.log(`✅  Users seeded: ${users.length}`);

  const admin = users[0];
  const instructors = users.slice(1, 5);
  const learners = users.slice(5);

  // =========================================================================
  // 2. TAGS  (15)
  // =========================================================================
  const tagNames = [
    "JavaScript", "Python", "React", "Node.js", "Machine Learning",
    "Data Science", "Web Development", "Mobile Development", "DevOps", "Cloud Computing",
    "Cybersecurity", "UI/UX Design", "Blockchain", "Artificial Intelligence", "Database Management",
  ];

  const tags = [];
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags.push(tag);
  }
  console.log(`✅  Tags seeded: ${tags.length}`);

  // =========================================================================
  // 3. COURSES  (15)
  // =========================================================================
  const coursesData = [
    { title: "JavaScript Fundamentals", desc: "Master the core concepts of JavaScript from scratch.", shortDesc: "Learn JS basics", instructor: 0, visibility: "EVERYONE", access: "OPEN", published: true },
    { title: "Advanced React Patterns", desc: "Deep dive into compound components, render props, and hooks.", shortDesc: "Advanced React", instructor: 0, visibility: "EVERYONE", access: "OPEN", published: true },
    { title: "Node.js Backend Development", desc: "Build scalable REST APIs with Express and Node.js.", shortDesc: "Backend with Node", instructor: 1, visibility: "EVERYONE", access: "ON_PAYMENT", price: 29.99, published: true },
    { title: "Python for Data Science", desc: "Learn Python fundamentals with a data science focus.", shortDesc: "Python & Data", instructor: 2, visibility: "EVERYONE", access: "OPEN", published: true },
    { title: "Machine Learning A-Z", desc: "Comprehensive ML course covering supervised and unsupervised learning.", shortDesc: "Complete ML guide", instructor: 2, visibility: "SIGNED_IN", access: "ON_PAYMENT", price: 49.99, published: true },
    { title: "DevOps with Docker & Kubernetes", desc: "Containerize and orchestrate your applications.", shortDesc: "Docker & K8s", instructor: 3, visibility: "EVERYONE", access: "ON_PAYMENT", price: 39.99, published: true },
    { title: "UI/UX Design Principles", desc: "Design beautiful and usable digital experiences.", shortDesc: "Design essentials", instructor: 0, visibility: "EVERYONE", access: "OPEN", published: true },
    { title: "Cybersecurity Essentials", desc: "Learn to protect systems, networks, and programs from digital attacks.", shortDesc: "Security basics", instructor: 3, visibility: "SIGNED_IN", access: "ON_INVITATION", published: true },
    { title: "Cloud Computing with AWS", desc: "Master EC2, S3, Lambda and other core AWS services.", shortDesc: "AWS from scratch", instructor: 1, visibility: "EVERYONE", access: "ON_PAYMENT", price: 59.99, published: true },
    { title: "Blockchain Development", desc: "Build decentralized applications with Solidity and Ethereum.", shortDesc: "Web3 development", instructor: 3, visibility: "SIGNED_IN", access: "ON_PAYMENT", price: 44.99, published: true },
    { title: "Mobile App Development with React Native", desc: "Build cross-platform mobile apps using React Native.", shortDesc: "React Native apps", instructor: 0, visibility: "EVERYONE", access: "OPEN", published: true },
    { title: "SQL and Database Management", desc: "Master relational databases, queries, and optimization.", shortDesc: "SQL mastery", instructor: 1, visibility: "EVERYONE", access: "OPEN", published: true },
    { title: "TypeScript Masterclass", desc: "Level-up your JavaScript with static typing and advanced TS patterns.", shortDesc: "TypeScript deep dive", instructor: 0, visibility: "EVERYONE", access: "OPEN", published: true },
    { title: "AI-Powered Web Apps", desc: "Integrate ChatGPT and other AI APIs into your web applications.", shortDesc: "AI integration", instructor: 2, visibility: "SIGNED_IN", access: "ON_PAYMENT", price: 34.99, published: false },
    { title: "GraphQL API Design", desc: "Design and build efficient GraphQL APIs for modern front-ends.", shortDesc: "GraphQL essentials", instructor: 1, visibility: "EVERYONE", access: "OPEN", published: false },
  ];

  const courses = [];
  for (const c of coursesData) {
    const slug = slugify(c.title) + "-" + Date.now().toString(36);
    const course = await prisma.course.create({
      data: {
        title: c.title,
        slug,
        description: c.desc,
        shortDesc: c.shortDesc,
        isPublished: c.published,
        publishedAt: c.published ? new Date() : null,
        visibility: c.visibility,
        accessRule: c.access,
        price: c.price || null,
        createdById: instructors[c.instructor].id,
        adminId: admin.id,
      },
    });
    courses.push(course);
  }
  console.log(`✅  Courses seeded: ${courses.length}`);

  // =========================================================================
  // 4. COURSE TAGS  (15 associations)
  // =========================================================================
  const courseTagPairs = [
    [0, 0], [0, 6], // JS Fundamentals → JavaScript, Web Dev
    [1, 2], [1, 6], // Advanced React → React, Web Dev
    [2, 3], [2, 6], // Node Backend → Node.js, Web Dev
    [3, 1], [3, 5], // Python DS → Python, Data Science
    [4, 4], [4, 13], // ML A-Z → ML, AI
    [5, 8], [5, 9], // DevOps → DevOps, Cloud
    [6, 11],        // UI/UX → UI/UX Design
    [7, 10],        // Cybersecurity → Cybersecurity
    [8, 9],         // Cloud AWS → Cloud
  ];

  for (const [ci, ti] of courseTagPairs) {
    await prisma.courseTag.upsert({
      where: { courseId_tagId: { courseId: courses[ci].id, tagId: tags[ti].id } },
      update: {},
      create: { courseId: courses[ci].id, tagId: tags[ti].id },
    });
  }
  console.log(`✅  CourseTags seeded: ${courseTagPairs.length}`);

  // =========================================================================
  // 5. LESSONS  (15 — spread across the first 5 courses, 3 per course)
  // =========================================================================
  const lessonsData = [
    // Course 0 – JS Fundamentals
    { courseIdx: 0, title: "Variables and Data Types", type: "VIDEO", order: 1, duration: 900, videoUrl: "https://www.youtube.com/embed/demo1" },
    { courseIdx: 0, title: "Functions and Scope", type: "VIDEO", order: 2, duration: 1200, videoUrl: "https://www.youtube.com/embed/demo2" },
    { courseIdx: 0, title: "JS Cheat Sheet", type: "DOCUMENT", order: 3, fileUrl: "https://res.cloudinary.com/demo/image/upload/js-cheatsheet.pdf" },
    // Course 1 – Advanced React
    { courseIdx: 1, title: "Compound Components Pattern", type: "VIDEO", order: 1, duration: 1500, videoUrl: "https://www.youtube.com/embed/demo3" },
    { courseIdx: 1, title: "Custom Hooks Deep Dive", type: "VIDEO", order: 2, duration: 1100, videoUrl: "https://www.youtube.com/embed/demo4" },
    { courseIdx: 1, title: "React Architecture Diagram", type: "IMAGE", order: 3, fileUrl: "https://res.cloudinary.com/demo/image/upload/react-arch.png" },
    // Course 2 – Node Backend
    { courseIdx: 2, title: "Setting up Express", type: "VIDEO", order: 1, duration: 800, videoUrl: "https://www.youtube.com/embed/demo5" },
    { courseIdx: 2, title: "REST API Best Practices", type: "DOCUMENT", order: 2, fileUrl: "https://res.cloudinary.com/demo/image/upload/rest-api.pdf" },
    { courseIdx: 2, title: "Authentication & JWT", type: "VIDEO", order: 3, duration: 1800, videoUrl: "https://www.youtube.com/embed/demo6" },
    // Course 3 – Python DS
    { courseIdx: 3, title: "Python Basics Refresher", type: "VIDEO", order: 1, duration: 600, videoUrl: "https://www.youtube.com/embed/demo7" },
    { courseIdx: 3, title: "NumPy and Pandas", type: "VIDEO", order: 2, duration: 1400, videoUrl: "https://www.youtube.com/embed/demo8" },
    { courseIdx: 3, title: "Data Visualization with Matplotlib", type: "DOCUMENT", order: 3, fileUrl: "https://res.cloudinary.com/demo/image/upload/matplotlib-guide.pdf" },
    // Course 4 – ML A-Z
    { courseIdx: 4, title: "Intro to Machine Learning", type: "VIDEO", order: 1, duration: 1000, videoUrl: "https://www.youtube.com/embed/demo9" },
    { courseIdx: 4, title: "Supervised Learning Algorithms", type: "VIDEO", order: 2, duration: 2000, videoUrl: "https://www.youtube.com/embed/demo10" },
    { courseIdx: 4, title: "ML Pipeline Diagram", type: "IMAGE", order: 3, fileUrl: "https://res.cloudinary.com/demo/image/upload/ml-pipeline.png" },
  ];

  const lessons = [];
  for (const l of lessonsData) {
    const lesson = await prisma.lesson.create({
      data: {
        courseId: courses[l.courseIdx].id,
        title: l.title,
        type: l.type,
        order: l.order,
        duration: l.duration || null,
        videoUrl: l.videoUrl || null,
        fileUrl: l.fileUrl || null,
        description: `Lesson covering ${l.title.toLowerCase()}.`,
      },
    });
    lessons.push(lesson);
  }
  console.log(`✅  Lessons seeded: ${lessons.length}`);

  // =========================================================================
  // 6. LESSON ATTACHMENTS  (15)
  // =========================================================================
  const attachmentsData = [
    { lessonIdx: 0, type: "LINK", label: "MDN Variables Guide", linkUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types" },
    { lessonIdx: 0, type: "FILE", label: "Variables Slides", fileUrl: "https://res.cloudinary.com/demo/raw/upload/slides-vars.pptx" },
    { lessonIdx: 1, type: "LINK", label: "MDN Functions Reference", linkUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions" },
    { lessonIdx: 2, type: "FILE", label: "JS Cheat Sheet PDF", fileUrl: "https://res.cloudinary.com/demo/raw/upload/js-cheat.pdf" },
    { lessonIdx: 3, type: "LINK", label: "React Compound Components Blog", linkUrl: "https://kentcdodds.com/blog/compound-components" },
    { lessonIdx: 4, type: "FILE", label: "Custom Hooks Examples", fileUrl: "https://res.cloudinary.com/demo/raw/upload/hooks-examples.zip" },
    { lessonIdx: 5, type: "LINK", label: "React Docs — Architecture", linkUrl: "https://react.dev/learn" },
    { lessonIdx: 6, type: "FILE", label: "Express Starter Template", fileUrl: "https://res.cloudinary.com/demo/raw/upload/express-starter.zip" },
    { lessonIdx: 7, type: "LINK", label: "REST API Design Guidelines", linkUrl: "https://restfulapi.net/" },
    { lessonIdx: 8, type: "LINK", label: "JWT.io Debugger", linkUrl: "https://jwt.io/" },
    { lessonIdx: 9, type: "FILE", label: "Python Install Guide", fileUrl: "https://res.cloudinary.com/demo/raw/upload/python-install.pdf" },
    { lessonIdx: 10, type: "LINK", label: "Pandas Documentation", linkUrl: "https://pandas.pydata.org/docs/" },
    { lessonIdx: 11, type: "FILE", label: "Matplotlib Cheat Sheet", fileUrl: "https://res.cloudinary.com/demo/raw/upload/matplotlib-cheat.pdf" },
    { lessonIdx: 12, type: "LINK", label: "ML Glossary", linkUrl: "https://ml-cheatsheet.readthedocs.io/" },
    { lessonIdx: 13, type: "FILE", label: "SVM Algorithm Notes", fileUrl: "https://res.cloudinary.com/demo/raw/upload/svm-notes.pdf" },
  ];

  for (const a of attachmentsData) {
    await prisma.lessonAttachment.create({
      data: {
        lessonId: lessons[a.lessonIdx].id,
        type: a.type,
        label: a.label,
        linkUrl: a.linkUrl || null,
        fileUrl: a.fileUrl || null,
      },
    });
  }
  console.log(`✅  LessonAttachments seeded: ${attachmentsData.length}`);

  // =========================================================================
  // 7. QUIZZES  (15 — spread across first 5 courses, 3 per course)
  // =========================================================================
  const quizzesData = [
    { courseIdx: 0, title: "JS Variables Quiz", desc: "Test your knowledge of JS variables and types." },
    { courseIdx: 0, title: "Functions & Scope Quiz", desc: "How well do you understand functions?" },
    { courseIdx: 0, title: "JS Fundamentals Final", desc: "Final assessment for JS Fundamentals." },
    { courseIdx: 1, title: "Compound Components Check", desc: "Quick check on compound components." },
    { courseIdx: 1, title: "Hooks Mastery Quiz", desc: "Are you a hooks master?" },
    { courseIdx: 1, title: "React Patterns Final", desc: "Final assessment for React patterns." },
    { courseIdx: 2, title: "Express Basics Quiz", desc: "Test your Express.js knowledge." },
    { courseIdx: 2, title: "REST API Quiz", desc: "Validate REST API design skills." },
    { courseIdx: 2, title: "Auth & Security Quiz", desc: "Assessment on JWT and authentication." },
    { courseIdx: 3, title: "Python Basics Quiz", desc: "Basic Python syntax and concepts." },
    { courseIdx: 3, title: "NumPy & Pandas Quiz", desc: "Data manipulation assessment." },
    { courseIdx: 3, title: "Data Viz Quiz", desc: "Matplotlib and visualization quiz." },
    { courseIdx: 4, title: "ML Concepts Quiz", desc: "Core ML terminology and concepts." },
    { courseIdx: 4, title: "Supervised Learning Quiz", desc: "Test supervised learning understanding." },
    { courseIdx: 4, title: "ML Final Assessment", desc: "Comprehensive ML final exam." },
  ];

  const quizzes = [];
  for (const q of quizzesData) {
    const quiz = await prisma.quiz.create({
      data: {
        courseId: courses[q.courseIdx].id,
        title: q.title,
        description: q.desc,
      },
    });
    quizzes.push(quiz);
  }
  console.log(`✅  Quizzes seeded: ${quizzes.length}`);

  // =========================================================================
  // 8. QUIZ LESSONS  (link QUIZ-type lessons to quizzes) — 15 bridges
  //    We create 15 QUIZ-type lessons first, then bridge them
  // =========================================================================
  const quizLessonEntries = [];
  for (let i = 0; i < 15; i++) {
    const courseIdx = Math.floor(i / 3);
    const quizLesson = await prisma.lesson.create({
      data: {
        courseId: courses[courseIdx].id,
        title: `${quizzesData[i].title} — Lesson`,
        type: "QUIZ",
        order: 10 + (i % 3),
        description: `Interactive quiz lesson: ${quizzesData[i].title}`,
      },
    });
    const bridge = await prisma.quizLesson.create({
      data: {
        lessonId: quizLesson.id,
        quizId: quizzes[i].id,
      },
    });
    quizLessonEntries.push(bridge);
  }
  console.log(`✅  QuizLessons bridged: ${quizLessonEntries.length}`);

  // =========================================================================
  // 9. QUIZ REWARDS  (15 — one per quiz, attempt #1 reward)
  // =========================================================================
  const quizRewards = [];
  const rewardPoints = [50, 40, 100, 45, 55, 90, 50, 60, 80, 35, 45, 50, 70, 65, 120];
  for (let i = 0; i < 15; i++) {
    const reward = await prisma.quizReward.create({
      data: {
        quizId: quizzes[i].id,
        attemptNumber: 1,
        points: rewardPoints[i],
      },
    });
    quizRewards.push(reward);
  }
  console.log(`✅  QuizRewards seeded: ${quizRewards.length}`);

  // =========================================================================
  // 10. QUESTIONS  (15 — one per quiz)
  // =========================================================================
  const questionsData = [
    { quizIdx: 0, text: "Which keyword declares a block-scoped variable in JavaScript?", order: 1 },
    { quizIdx: 1, text: "What is a closure in JavaScript?", order: 1 },
    { quizIdx: 2, text: "Which method converts a JSON string to a JavaScript object?", order: 1 },
    { quizIdx: 3, text: "What is the purpose of the children prop in React?", order: 1 },
    { quizIdx: 4, text: "Which hook replaces componentDidMount in functional components?", order: 1 },
    { quizIdx: 5, text: "What does React.memo do?", order: 1 },
    { quizIdx: 6, text: "Which Express method handles GET requests?", order: 1 },
    { quizIdx: 7, text: "What does REST stand for?", order: 1 },
    { quizIdx: 8, text: "What is the standard HTTP status code for 'Unauthorized'?", order: 1 },
    { quizIdx: 9, text: "What is the output of print(type(3.14)) in Python?", order: 1 },
    { quizIdx: 10, text: "Which Pandas method reads a CSV file?", order: 1 },
    { quizIdx: 11, text: "Which Matplotlib function creates a line chart?", order: 1 },
    { quizIdx: 12, text: "What is the difference between supervised and unsupervised learning?", order: 1 },
    { quizIdx: 13, text: "Which algorithm is used for classification by finding the best hyperplane?", order: 1 },
    { quizIdx: 14, text: "What is overfitting in machine learning?", order: 1 },
  ];

  const questions = [];
  for (const q of questionsData) {
    const question = await prisma.question.create({
      data: {
        quizId: quizzes[q.quizIdx].id,
        text: q.text,
        order: q.order,
      },
    });
    questions.push(question);
  }
  console.log(`✅  Questions seeded: ${questions.length}`);

  // =========================================================================
  // 11. QUESTION OPTIONS  (15 questions × 4 options = 60, but we store 15
  //     correct options for referencing; 4 options per question)
  // =========================================================================
  const optionsPerQuestion = [
    // Q0: let keyword
    [
      { text: "var", isCorrect: false },
      { text: "let", isCorrect: true },
      { text: "const is not block-scoped", isCorrect: false },
      { text: "function", isCorrect: false },
    ],
    // Q1: closure
    [
      { text: "A function with access to its outer scope", isCorrect: true },
      { text: "A built-in JS object", isCorrect: false },
      { text: "A CSS feature", isCorrect: false },
      { text: "A type of loop", isCorrect: false },
    ],
    // Q2: JSON parse
    [
      { text: "JSON.stringify()", isCorrect: false },
      { text: "JSON.parse()", isCorrect: true },
      { text: "JSON.decode()", isCorrect: false },
      { text: "JSON.toObject()", isCorrect: false },
    ],
    // Q3: children prop
    [
      { text: "To pass CSS styles", isCorrect: false },
      { text: "To render child components between tags", isCorrect: true },
      { text: "To define state", isCorrect: false },
      { text: "To create event handlers", isCorrect: false },
    ],
    // Q4: useEffect
    [
      { text: "useState", isCorrect: false },
      { text: "useEffect", isCorrect: true },
      { text: "useContext", isCorrect: false },
      { text: "useReducer", isCorrect: false },
    ],
    // Q5: React.memo
    [
      { text: "Memoizes a component to prevent unnecessary re-renders", isCorrect: true },
      { text: "Creates a new state variable", isCorrect: false },
      { text: "Replaces Redux", isCorrect: false },
      { text: "Handles routing", isCorrect: false },
    ],
    // Q6: app.get
    [
      { text: "app.post()", isCorrect: false },
      { text: "app.get()", isCorrect: true },
      { text: "app.fetch()", isCorrect: false },
      { text: "app.read()", isCorrect: false },
    ],
    // Q7: REST
    [
      { text: "Remote Execution of Stateless Transfers", isCorrect: false },
      { text: "Representational State Transfer", isCorrect: true },
      { text: "Real-time Event Streaming Technology", isCorrect: false },
      { text: "Resource Entity State Table", isCorrect: false },
    ],
    // Q8: 401
    [
      { text: "400", isCorrect: false },
      { text: "403", isCorrect: false },
      { text: "401", isCorrect: true },
      { text: "404", isCorrect: false },
    ],
    // Q9: float type
    [
      { text: "<class 'int'>", isCorrect: false },
      { text: "<class 'float'>", isCorrect: true },
      { text: "<class 'str'>", isCorrect: false },
      { text: "<class 'double'>", isCorrect: false },
    ],
    // Q10: pd.read_csv
    [
      { text: "pd.open_csv()", isCorrect: false },
      { text: "pd.read_csv()", isCorrect: true },
      { text: "pd.load_csv()", isCorrect: false },
      { text: "pd.import_csv()", isCorrect: false },
    ],
    // Q11: plt.plot
    [
      { text: "plt.bar()", isCorrect: false },
      { text: "plt.scatter()", isCorrect: false },
      { text: "plt.plot()", isCorrect: true },
      { text: "plt.hist()", isCorrect: false },
    ],
    // Q12: supervised vs unsupervised
    [
      { text: "Supervised uses labeled data; unsupervised does not", isCorrect: true },
      { text: "They are the same thing", isCorrect: false },
      { text: "Unsupervised always outperforms supervised", isCorrect: false },
      { text: "Supervised is only for images", isCorrect: false },
    ],
    // Q13: SVM
    [
      { text: "K-Means", isCorrect: false },
      { text: "SVM (Support Vector Machine)", isCorrect: true },
      { text: "DBSCAN", isCorrect: false },
      { text: "Apriori", isCorrect: false },
    ],
    // Q14: overfitting
    [
      { text: "Model performs well on training data but poorly on new data", isCorrect: true },
      { text: "Model is too simple", isCorrect: false },
      { text: "Model has too few parameters", isCorrect: false },
      { text: "Model always predicts the same output", isCorrect: false },
    ],
  ];

  const allOptions = []; // allOptions[questionIdx] = array of created options
  for (let qi = 0; qi < 15; qi++) {
    const qOptions = [];
    for (let oi = 0; oi < optionsPerQuestion[qi].length; oi++) {
      const opt = await prisma.questionOption.create({
        data: {
          questionId: questions[qi].id,
          text: optionsPerQuestion[qi][oi].text,
          isCorrect: optionsPerQuestion[qi][oi].isCorrect,
          order: oi + 1,
        },
      });
      qOptions.push(opt);
    }
    allOptions.push(qOptions);
  }
  console.log(`✅  QuestionOptions seeded: ${allOptions.flat().length}`);

  // =========================================================================
  // 12. ENROLLMENTS  (15 — spread learners across courses)
  // =========================================================================
  const enrollmentsData = [
    { learnerIdx: 0, courseIdx: 0, status: "COMPLETED", pct: 100 },
    { learnerIdx: 0, courseIdx: 1, status: "IN_PROGRESS", pct: 60 },
    { learnerIdx: 1, courseIdx: 0, status: "IN_PROGRESS", pct: 40 },
    { learnerIdx: 1, courseIdx: 2, status: "YET_TO_START", pct: 0 },
    { learnerIdx: 2, courseIdx: 3, status: "COMPLETED", pct: 100 },
    { learnerIdx: 2, courseIdx: 4, status: "IN_PROGRESS", pct: 75 },
    { learnerIdx: 3, courseIdx: 0, status: "IN_PROGRESS", pct: 20 },
    { learnerIdx: 3, courseIdx: 5, status: "YET_TO_START", pct: 0 },
    { learnerIdx: 4, courseIdx: 1, status: "COMPLETED", pct: 100 },
    { learnerIdx: 5, courseIdx: 2, status: "IN_PROGRESS", pct: 50 },
    { learnerIdx: 6, courseIdx: 3, status: "IN_PROGRESS", pct: 30 },
    { learnerIdx: 7, courseIdx: 4, status: "YET_TO_START", pct: 0 },
    { learnerIdx: 8, courseIdx: 0, status: "COMPLETED", pct: 100 },
    { learnerIdx: 9, courseIdx: 6, status: "IN_PROGRESS", pct: 55 },
    { learnerIdx: 0, courseIdx: 3, status: "IN_PROGRESS", pct: 35 },
  ];

  const enrollments = [];
  for (const e of enrollmentsData) {
    const enroll = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: learners[e.learnerIdx].id,
          courseId: courses[e.courseIdx].id,
        },
      },
      update: {},
      create: {
        userId: learners[e.learnerIdx].id,
        courseId: courses[e.courseIdx].id,
        status: e.status,
        completionPercent: e.pct,
        startedAt: e.status !== "YET_TO_START" ? new Date() : null,
        completedAt: e.status === "COMPLETED" ? new Date() : null,
      },
    });
    enrollments.push(enroll);
  }
  console.log(`✅  Enrollments seeded: ${enrollments.length}`);

  // =========================================================================
  // 13. LESSON PROGRESS  (15 — for enrolled learners on course 0 lessons)
  // =========================================================================
  // Learners 0, 1, 3, 8 are enrolled in course 0 (indices 0, 2, 6, 12 in enrollments)
  const course0Enrollments = [enrollments[0], enrollments[2], enrollments[6], enrollments[12]];
  const course0Lessons = lessons.slice(0, 3); // first 3 lessons belong to course 0

  const progressEntries = [];
  let progressCount = 0;
  for (const enr of course0Enrollments) {
    for (const les of course0Lessons) {
      if (progressCount >= 15) break;
      const isComplete = progressCount % 3 === 0;
      const prog = await prisma.lessonProgress.create({
        data: {
          enrollmentId: enr.id,
          lessonId: les.id,
          userId: enr.userId,
          isCompleted: isComplete,
          isInProgress: !isComplete,
          timeSpentSeconds: Math.floor(Math.random() * 600) + 60,
          startedAt: new Date(),
          completedAt: isComplete ? new Date() : null,
        },
      });
      progressEntries.push(prog);
      progressCount++;
    }
  }
  // Fill remaining if < 15
  const course1Lessons = lessons.slice(3, 6);
  const course1Enrollments = [enrollments[1], enrollments[8]]; // learners enrolled in course 1
  for (const enr of course1Enrollments) {
    for (const les of course1Lessons) {
      if (progressCount >= 15) break;
      const prog = await prisma.lessonProgress.create({
        data: {
          enrollmentId: enr.id,
          lessonId: les.id,
          userId: enr.userId,
          isCompleted: false,
          isInProgress: true,
          timeSpentSeconds: Math.floor(Math.random() * 400) + 30,
          startedAt: new Date(),
        },
      });
      progressEntries.push(prog);
      progressCount++;
    }
  }
  console.log(`✅  LessonProgress seeded: ${progressEntries.length}`);

  // =========================================================================
  // 14. QUIZ ATTEMPTS  (15)
  // =========================================================================
  const attemptsData = [
    { learnerIdx: 0, quizIdx: 0, attemptNum: 1, status: "COMPLETED", score: 100, points: 50 },
    { learnerIdx: 0, quizIdx: 1, attemptNum: 1, status: "COMPLETED", score: 80, points: 40 },
    { learnerIdx: 0, quizIdx: 2, attemptNum: 1, status: "COMPLETED", score: 90, points: 100 },
    { learnerIdx: 1, quizIdx: 0, attemptNum: 1, status: "COMPLETED", score: 60, points: 50 },
    { learnerIdx: 1, quizIdx: 0, attemptNum: 2, status: "IN_PROGRESS", score: null, points: 0 },
    { learnerIdx: 2, quizIdx: 9, attemptNum: 1, status: "COMPLETED", score: 100, points: 35 },
    { learnerIdx: 2, quizIdx: 10, attemptNum: 1, status: "COMPLETED", score: 75, points: 45 },
    { learnerIdx: 3, quizIdx: 0, attemptNum: 1, status: "IN_PROGRESS", score: null, points: 0 },
    { learnerIdx: 4, quizIdx: 3, attemptNum: 1, status: "COMPLETED", score: 100, points: 45 },
    { learnerIdx: 4, quizIdx: 4, attemptNum: 1, status: "COMPLETED", score: 85, points: 55 },
    { learnerIdx: 5, quizIdx: 6, attemptNum: 1, status: "COMPLETED", score: 70, points: 50 },
    { learnerIdx: 6, quizIdx: 9, attemptNum: 1, status: "IN_PROGRESS", score: null, points: 0 },
    { learnerIdx: 7, quizIdx: 12, attemptNum: 1, status: "COMPLETED", score: 50, points: 70 },
    { learnerIdx: 8, quizIdx: 0, attemptNum: 1, status: "COMPLETED", score: 100, points: 50 },
    { learnerIdx: 9, quizIdx: 0, attemptNum: 1, status: "COMPLETED", score: 75, points: 50 },
  ];

  const attempts = [];
  for (const a of attemptsData) {
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: learners[a.learnerIdx].id,
        quizId: quizzes[a.quizIdx].id,
        attemptNumber: a.attemptNum,
        status: a.status,
        score: a.score,
        pointsEarned: a.points,
        completedAt: a.status === "COMPLETED" ? new Date() : null,
      },
    });
    attempts.push(attempt);
  }
  console.log(`✅  QuizAttempts seeded: ${attempts.length}`);

  // =========================================================================
  // 15. ATTEMPT ANSWERS  (15 — one answer per completed attempt)
  // =========================================================================
  const completedAttempts = attemptsData
    .map((a, i) => ({ ...a, idx: i }))
    .filter((a) => a.status === "COMPLETED");

  let answerCount = 0;
  for (const a of completedAttempts) {
    if (answerCount >= 15) break;
    const qIdx = a.quizIdx; // question index matches quiz index (1 question per quiz)
    const correctOption = allOptions[qIdx].find((o) => o.isCorrect);
    const wrongOption = allOptions[qIdx].find((o) => !o.isCorrect);
    const isRight = a.score >= 80;

    await prisma.attemptAnswer.create({
      data: {
        attemptId: attempts[a.idx].id,
        questionId: questions[qIdx].id,
        selectedOptionId: isRight ? correctOption.id : wrongOption.id,
        isCorrect: isRight,
      },
    });
    answerCount++;
  }
  console.log(`✅  AttemptAnswers seeded: ${answerCount}`);

  // =========================================================================
  // 16. POINT TRANSACTIONS  (15)
  // =========================================================================
  const pointTxData = [
    { learnerIdx: 0, points: 50, reason: "Quiz 'JS Variables Quiz' — attempt 1" },
    { learnerIdx: 0, points: 40, reason: "Quiz 'Functions & Scope Quiz' — attempt 1" },
    { learnerIdx: 0, points: 100, reason: "Quiz 'JS Fundamentals Final' — attempt 1" },
    { learnerIdx: 1, points: 50, reason: "Quiz 'JS Variables Quiz' — attempt 1" },
    { learnerIdx: 2, points: 35, reason: "Quiz 'Python Basics Quiz' — attempt 1" },
    { learnerIdx: 2, points: 45, reason: "Quiz 'NumPy & Pandas Quiz' — attempt 1" },
    { learnerIdx: 4, points: 45, reason: "Quiz 'Compound Components Check' — attempt 1" },
    { learnerIdx: 4, points: 55, reason: "Quiz 'Hooks Mastery Quiz' — attempt 1" },
    { learnerIdx: 5, points: 50, reason: "Quiz 'Express Basics Quiz' — attempt 1" },
    { learnerIdx: 7, points: 70, reason: "Quiz 'ML Concepts Quiz' — attempt 1" },
    { learnerIdx: 8, points: 50, reason: "Quiz 'JS Variables Quiz' — attempt 1" },
    { learnerIdx: 9, points: 50, reason: "Quiz 'JS Variables Quiz' — attempt 1" },
    { learnerIdx: 0, points: 10, reason: "Bonus — completed JS Fundamentals course" },
    { learnerIdx: 2, points: 10, reason: "Bonus — completed Python DS course" },
    { learnerIdx: 4, points: 10, reason: "Bonus — completed Advanced React course" },
  ];

  for (const tx of pointTxData) {
    await prisma.pointTransaction.create({
      data: {
        userId: learners[tx.learnerIdx].id,
        points: tx.points,
        reason: tx.reason,
      },
    });
  }
  console.log(`✅  PointTransactions seeded: ${pointTxData.length}`);

  // Update totalPoints on users
  const pointsByUser = {};
  for (const tx of pointTxData) {
    const uid = learners[tx.learnerIdx].id;
    pointsByUser[uid] = (pointsByUser[uid] || 0) + tx.points;
  }
  for (const [uid, total] of Object.entries(pointsByUser)) {
    let badge = null;
    if (total >= 120) badge = "MASTER";
    else if (total >= 100) badge = "EXPERT";
    else if (total >= 80) badge = "ACHIEVER";
    else if (total >= 60) badge = "SPECIALIST";
    else if (total >= 40) badge = "EXPLORER";
    else if (total >= 20) badge = "NEWBIE";

    await prisma.user.update({
      where: { id: uid },
      data: { totalPoints: total, badgeLevel: badge },
    });
  }
  console.log(`✅  User totalPoints & badges updated`);

  // =========================================================================
  // 17. PAYMENTS  (15 — for paid courses)
  // =========================================================================
  const paymentsData = [
    { learnerIdx: 1, courseIdx: 2, status: "SUCCESS", amount: 29.99, provider: "PAYPAL" },
    { learnerIdx: 2, courseIdx: 4, status: "SUCCESS", amount: 49.99, provider: "PAYPAL" },
    { learnerIdx: 3, courseIdx: 5, status: "PENDING", amount: 39.99, provider: "RAZORPAY" },
    { learnerIdx: 5, courseIdx: 2, status: "SUCCESS", amount: 29.99, provider: "RAZORPAY" },
    { learnerIdx: 7, courseIdx: 4, status: "PENDING", amount: 49.99, provider: "PAYPAL" },
    { learnerIdx: 0, courseIdx: 8, status: "SUCCESS", amount: 59.99, provider: "PAYPAL" },
    { learnerIdx: 1, courseIdx: 8, status: "FAILED", amount: 59.99, provider: "RAZORPAY", failureReason: "Insufficient funds" },
    { learnerIdx: 2, courseIdx: 9, status: "SUCCESS", amount: 44.99, provider: "PAYPAL" },
    { learnerIdx: 3, courseIdx: 9, status: "SUCCESS", amount: 44.99, provider: "RAZORPAY" },
    { learnerIdx: 4, courseIdx: 5, status: "SUCCESS", amount: 39.99, provider: "PAYPAL" },
    { learnerIdx: 5, courseIdx: 4, status: "REFUNDED", amount: 49.99, provider: "PAYPAL", refundedAt: new Date() },
    { learnerIdx: 6, courseIdx: 2, status: "SUCCESS", amount: 29.99, provider: "RAZORPAY" },
    { learnerIdx: 8, courseIdx: 8, status: "SUCCESS", amount: 59.99, provider: "PAYPAL" },
    { learnerIdx: 9, courseIdx: 5, status: "PENDING", amount: 39.99, provider: "RAZORPAY" },
    { learnerIdx: 0, courseIdx: 9, status: "SUCCESS", amount: 44.99, provider: "PAYPAL" },
  ];

  for (const p of paymentsData) {
    await prisma.payment.create({
      data: {
        userId: learners[p.learnerIdx].id,
        courseId: courses[p.courseIdx].id,
        provider: p.provider,
        status: p.status,
        amount: p.amount,
        currency: "USD",
        providerOrderId: `ORD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        providerPaymentId: p.status === "SUCCESS" ? `PAY-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` : null,
        failureReason: p.failureReason || null,
        refundedAt: p.refundedAt || null,
      },
    });
  }
  console.log(`✅  Payments seeded: ${paymentsData.length}`);

  // =========================================================================
  // 18. REVIEWS  (15 — various learners reviewing courses)
  // =========================================================================
  const reviewsData = [
    { learnerIdx: 0, courseIdx: 0, rating: 5, comment: "Excellent course! Really helped me understand JS basics." },
    { learnerIdx: 1, courseIdx: 0, rating: 4, comment: "Good content, but could use more exercises." },
    { learnerIdx: 8, courseIdx: 0, rating: 5, comment: "Best beginner JS course I've taken!" },
    { learnerIdx: 0, courseIdx: 1, rating: 4, comment: "Great deep dive into React patterns." },
    { learnerIdx: 4, courseIdx: 1, rating: 5, comment: "Compound components section was amazing!" },
    { learnerIdx: 1, courseIdx: 2, rating: 3, comment: "Decent course, but some parts were too fast." },
    { learnerIdx: 5, courseIdx: 2, rating: 4, comment: "Solid Node.js course with practical examples." },
    { learnerIdx: 2, courseIdx: 3, rating: 5, comment: "Perfect intro to Python for data science." },
    { learnerIdx: 6, courseIdx: 3, rating: 4, comment: "Very well structured course." },
    { learnerIdx: 2, courseIdx: 4, rating: 4, comment: "Comprehensive ML coverage, would recommend." },
    { learnerIdx: 3, courseIdx: 5, rating: 3, comment: "Good overview but needs more hands-on labs." },
    { learnerIdx: 9, courseIdx: 6, rating: 5, comment: "Changed how I think about UI design!" },
    { learnerIdx: 3, courseIdx: 0, rating: 4, comment: "Clear explanations, great for beginners." },
    { learnerIdx: 0, courseIdx: 3, rating: 5, comment: "Loved the Pandas section, very practical." },
    { learnerIdx: 7, courseIdx: 4, rating: 3, comment: "Some concepts could be explained more clearly." },
  ];

  for (const r of reviewsData) {
    await prisma.review.upsert({
      where: {
        courseId_userId: {
          courseId: courses[r.courseIdx].id,
          userId: learners[r.learnerIdx].id,
        },
      },
      update: {},
      create: {
        courseId: courses[r.courseIdx].id,
        userId: learners[r.learnerIdx].id,
        rating: r.rating,
        comment: r.comment,
      },
    });
  }
  console.log(`✅  Reviews seeded: ${reviewsData.length}`);

  // =========================================================================
  // 19. INVITATIONS  (15 — invitations to various courses)
  // =========================================================================
  const invitationsData = [
    { courseIdx: 7, email: "alice.johnson@learnova.com", inviterIdx: 3, learnerIdx: 0, accepted: true },
    { courseIdx: 7, email: "bob.williams@learnova.com", inviterIdx: 3, learnerIdx: 1, accepted: false },
    { courseIdx: 7, email: "charlie.brown@learnova.com", inviterIdx: 3, learnerIdx: 2, accepted: true },
    { courseIdx: 7, email: "diana.kumar@learnova.com", inviterIdx: 3, learnerIdx: 3, accepted: false },
    { courseIdx: 7, email: "ethan.lee@learnova.com", inviterIdx: 3, learnerIdx: 4, accepted: true },
    { courseIdx: 7, email: "newuser1@example.com", inviterIdx: 3, learnerIdx: null, accepted: false },
    { courseIdx: 7, email: "newuser2@example.com", inviterIdx: 3, learnerIdx: null, accepted: false },
    { courseIdx: 0, email: "external1@example.com", inviterIdx: 0, learnerIdx: null, accepted: false },
    { courseIdx: 0, email: "external2@example.com", inviterIdx: 0, learnerIdx: null, accepted: false },
    { courseIdx: 1, email: "fiona.chen@learnova.com", inviterIdx: 0, learnerIdx: 5, accepted: true },
    { courseIdx: 2, email: "george.taylor@learnova.com", inviterIdx: 1, learnerIdx: 6, accepted: false },
    { courseIdx: 3, email: "hannah.wilson@learnova.com", inviterIdx: 2, learnerIdx: 7, accepted: false },
    { courseIdx: 4, email: "ivan.petrov@learnova.com", inviterIdx: 2, learnerIdx: 8, accepted: true },
    { courseIdx: 5, email: "julia.martinez@learnova.com", inviterIdx: 3, learnerIdx: 9, accepted: false },
    { courseIdx: 6, email: "external3@example.com", inviterIdx: 0, learnerIdx: null, accepted: false },
  ];

  for (const inv of invitationsData) {
    await prisma.invitation.upsert({
      where: {
        courseId_email: {
          courseId: courses[inv.courseIdx].id,
          email: inv.email,
        },
      },
      update: {},
      create: {
        courseId: courses[inv.courseIdx].id,
        email: inv.email,
        invitedById: instructors[inv.inviterIdx].id,
        invitedUserId: inv.learnerIdx !== null ? learners[inv.learnerIdx].id : null,
        acceptedAt: inv.accepted ? new Date() : null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });
  }
  console.log(`✅  Invitations seeded: ${invitationsData.length}`);

  // =========================================================================
  console.log("\n🎉  All seeding complete!\n");
  console.log("Summary:");
  console.log("  • 15 Users (1 Admin, 4 Instructors, 10 Learners)");
  console.log("  • 15 Tags");
  console.log("  • 15 Courses");
  console.log("  • 15 CourseTags");
  console.log("  • 15 Lessons (+ 15 Quiz-type Lessons)");
  console.log("  • 15 LessonAttachments");
  console.log("  • 15 Quizzes");
  console.log("  • 15 QuizLessons");
  console.log("  • 15 QuizRewards");
  console.log("  • 15 Questions (60 QuestionOptions)");
  console.log("  • 15 Enrollments");
  console.log("  • 15 LessonProgress");
  console.log("  • 15 QuizAttempts");
  console.log("  • 15 AttemptAnswers");
  console.log("  • 15 PointTransactions");
  console.log("  • 15 Payments");
  console.log("  • 15 Reviews");
  console.log("  • 15 Invitations");
  console.log("\n  Default password for all users: Password@123");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });