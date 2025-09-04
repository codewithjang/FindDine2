// Prisma model access for User
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  create: (data) => prisma.user.create({ data }),
  findById: (id) => prisma.user.findUnique({ where: { id } }),
  update: (id, data) => prisma.user.update({ where: { id }, data }),
};
