const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const passwordHash = await bcrypt.hash("Admin@1234", 10);
  const instructorPasswordHash = await bcrypt.hash("Instructor@1234", 10);

  // 1. Seed Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@learnova.com" },
    update: {},
    create: {
      firstName: "Super",
      lastName: "Admin",
      email: "admin@learnova.com",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin seeded: ${admin.email}`);

  // 2. Seed Instructor (for testing)
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@learnova.com" },
    update: {},
    create: {
      firstName: "John",
      lastName: "Instructor",
      email: "instructor@learnova.com",
      passwordHash: instructorPasswordHash,
      role: "INSTRUCTOR",
    },
  });
  console.log(`✅ Instructor seeded: ${instructor.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });