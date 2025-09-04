// Prisma model access for Booking
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  findAll: () => prisma.booking.findMany(),
  findById: (id) => prisma.booking.findUnique({ where: { id } }),
  create: (data) => prisma.booking.create({ data }),
  update: (id, data) => prisma.booking.update({ where: { id }, data }),
  delete: (id) => prisma.booking.delete({ where: { id } })
};
