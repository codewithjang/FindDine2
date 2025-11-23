const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ====== กำหนดโฟลเดอร์สำหรับเก็บรูป ======
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ====== ตั้งค่า multer สำหรับอัปโหลดรูป ======
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'), false);
  }
});

const parseJSON = (v) => {
  if (!v) return [];
  try {
    let x = typeof v === "string" ? JSON.parse(v) : v;
    // กรณีเป็น string ซ้อนอีกชั้น เช่น "\"[{\\\"url\\\":...}]\""
    if (typeof x === "string") x = JSON.parse(x);
    return Array.isArray(x) ? x : [];
  } catch {
    return [];
  }
};

// ====== เส้นทาง API ======
router.get('/', async (req, res) => {
  try {
    const { filter } = req.query;
    const whereClause = {};
    if (filter) {
      const contains = (val) => ({ contains: `"${val}"` });
      switch (filter) {
        case 'halal': whereClause.lifestyles = contains('halal'); break;
        case 'reservation': whereClause.serviceOptions = contains('accept_reservation'); break;
        case 'in_city': whereClause.locationStyles = contains('in_city'); break;
        case 'sea_view': whereClause.locationStyles = contains('sea_view'); break;
        case 'natural': whereClause.locationStyles = contains('natural_style'); break;
        default: break;
      }
    }

    // ดึงร้าน + คะแนนรีวิว (ใช้ชื่อ relation ตาม schema: review)
    const rows = await prisma.restaurant.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      include: {
        review: { select: { rating: true } }
      }
    });

    // คำนวณค่าเฉลี่ย + จำนวน และ parse ฟิลด์ JSON
    const results = rows.map(r => {
      const ratings = (r.review || []).map(rv => rv.rating);
      const avg = ratings.length ? ratings.reduce((s, v) => s + v, 0) / ratings.length : 0;
      return {
        ...r,
        rating: Number(avg.toFixed(1)),
        reviewCount: ratings.length,
        facilities: parseJSON(r.facilities),
        paymentOptions: parseJSON(r.paymentOptions),
        serviceOptions: parseJSON(r.serviceOptions),
        locationStyles: parseJSON(r.locationStyles),
        lifestyles: parseJSON(r.lifestyles),
        photos: parseJSON(r.photos),
      };
    });

    res.json(results);
  } catch (e) {
    console.error('get /api/restaurants error:', e);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

router.get('/:id', restaurantController.getById);
router.post('/', restaurantController.create);

// ✅ ใช้ upload.array('photos', 10) เพื่อรองรับการอัปโหลดรูปตอนแก้ไข
router.put('/:id', upload.array('photos', 10), restaurantController.update);

router.delete('/:id', restaurantController.delete);

// เพิ่ม view count เมื่อผู้ใช้เปิดดูรายละเอียดร้าน (ไม่ต้องตรวจสอบ user)
router.patch('/:id/view', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const updated = await prisma.restaurant.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { id: true, viewCount: true }
    });

    return res.json({ success: true, viewCount: updated.viewCount });
  } catch (err) {
    console.error('PATCH /api/restaurants/:id/view error', err);
    return res.status(500).json({ error: 'Failed to increment viewCount' });
  }
});

// ====== Login route ======
router.post('/login', restaurantController.login);

module.exports = router;
