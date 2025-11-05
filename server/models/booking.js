const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  findAll: () => prisma.booking.findMany(),
  findById: (id) => prisma.booking.findUnique({ where: { id } }),
  findByRestaurantId: (restaurantId) =>
    prisma.booking.findMany({
      where: { restaurantId: Number(restaurantId) },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    }),
  create: (data) => prisma.booking.create({ data }),
  update: (id, data) => prisma.booking.update({ where: { id }, data }),
  delete: (id) => prisma.booking.delete({ where: { id } }),
};
