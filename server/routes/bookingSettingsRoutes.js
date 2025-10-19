const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookingSettingsController");

// ดึงข้อมูลการตั้งค่าการจองของร้าน
router.get("/:restaurantId", controller.getBookingSetting);

// สร้างหรืออัปเดตการตั้งค่าการจอง
router.post("/:restaurantId", controller.saveBookingSetting);

module.exports = router;
