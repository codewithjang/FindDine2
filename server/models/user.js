// Prisma model access for User
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  findByEmail: (email) =>
    prisma.user.findUnique({ where: { email } }),

  // ⭐ แก้ตรงนี้ : ใส่ createdAt, updatedAt เอง
  create: (data) =>
    prisma.user.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),   // <== Prisma ต้องการฟิลด์นี้
      },
    }),

  findById: (id) =>
    prisma.user.findUnique({ where: { id } }),

  update: (id, data) =>
    prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),   // ⭐ ควรอัปเดตเวลาเมื่อแก้ไข
      },
    }),
};
