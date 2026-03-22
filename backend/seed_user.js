const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    }
    console.log('User exists and is ADMIN');
    return;
  }
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    }
  });
  console.log('Created admin user');
}

main().catch(console.error).finally(() => prisma.$disconnect());
