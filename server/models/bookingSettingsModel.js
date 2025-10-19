const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getBookingSettingByRestaurant = async (restaurantId) => {
  return await prisma.bookingSetting.findUnique({
    where: { restaurantId: parseInt(restaurantId) },
  });
};

exports.saveOrUpdateBookingSetting = async (restaurantId, data) => {
  // ✅ แปลงค่าที่ควรเป็นตัวเลขก่อนส่งเข้า Prisma
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

  return await prisma.bookingSetting.upsert({
    where: { restaurantId: parseInt(restaurantId) },
    update: parsedData,
    create: {
      restaurantId: parseInt(restaurantId),
      ...parsedData,
    },
  });
};
