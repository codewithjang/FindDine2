const bookingModel = require("../models/bookingSettingsModel");

// ✅ ดึงข้อมูลการตั้งค่าการจอง
exports.getBookingSetting = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const setting = await bookingModel.getBookingSettingByRestaurant(restaurantId);
    if (!setting) {
      return res.json(null); // ยังไม่มี record
    }
    res.json(setting);
  } catch (error) {
    console.error("Error getBookingSetting:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// ✅ สร้างหรืออัปเดตการตั้งค่า
exports.saveBookingSetting = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const data = req.body;

    const updated = await bookingModel.saveOrUpdateBookingSetting(restaurantId, data);

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error saveBookingSetting:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
  }
};
