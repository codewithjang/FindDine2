const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// ====== เส้นทาง API ======
router.get('/', restaurantController.getAll);
router.get('/:id', restaurantController.getById);
router.post('/', restaurantController.create);

// ✅ ใช้ upload.array('photos', 10) เพื่อรองรับการอัปโหลดรูปตอนแก้ไข
router.put('/:id', upload.array('photos', 10), restaurantController.update);

router.delete('/:id', restaurantController.delete);

// ====== Login route ======
router.post('/login', restaurantController.login);

module.exports = router;
