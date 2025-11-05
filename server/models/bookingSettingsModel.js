const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getBookingSettingByRestaurant = async (restaurantId) => {
  return await prisma.bookingsetting.findUnique({
    where: { restaurantId: parseInt(restaurantId) },
  });
};

exports.saveOrUpdateBookingSetting = async (restaurantId, data) => {
  const parsedData = {
    allowBooking: !!data.allowBooking,
    maxGuests: data.maxGuests ? parseInt(data.maxGuests) : null,
    tableCount: data.tableCount ? parseInt(data.tableCount) : null,
    advanceDays: data.advanceDays ? parseInt(data.advanceDays) : null,
    holdMinutes: data.holdMinutes ? parseInt(data.holdMinutes) : null,
    cancelBeforeHr: data.cancelBeforeHr ? parseInt(data.cancelBeforeHr) : null,
    openTime: data.openTime || "10:00",
    closeTime: data.closeTime || "22:00",
    policyNotes: data.policyNotes || "",
  };

  return await prisma.bookingsetting.upsert({
    where: { restaurantId: parseInt(restaurantId) },
    update: parsedData,
    create: {
      restaurantId: parseInt(restaurantId),
      ...parsedData,
    },
  });
};
