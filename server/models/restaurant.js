// Prisma model access for Restaurant
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  findAll: () => prisma.restaurant.findMany(),
  findById: (id) => prisma.restaurant.findUnique({ where: { id } }),
  create: (data) => prisma.restaurant.create({ data }),
  update: (id, data) => prisma.restaurant.update({ where: { id }, data }),
  delete: (id) => prisma.restaurant.delete({ where: { id } })
  ,
  findByEmail: (email) => prisma.restaurant.findUnique({ where: { email } })
};
