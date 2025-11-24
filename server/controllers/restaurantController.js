const Restaurant = require('../models/restaurant');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapping tables
const foodTypeOptions = [
  { value: "thai", label: "อาหารไทย" },
  { value: "chinese", label: "อาหารจีน" },
  { value: "japanese", label: "อาหารญี่ปุ่น" },
  { value: "korean", label: "อาหารเกาหลี" },
  { value: "vietnamese", label: "อาหารเวียดนาม" },
  { value: "indian", label: "อาหารอินเดีย" },
  { value: "malaysian", label: "อาหารมาเลย์" },
  { value: "indonesian", label: "อาหารอินโดนีเซีย" },
  { value: "filipino", label: "อาหารฟิลิปปินส์" },
  { value: "western", label: "อาหารตะวันตก" },
  { value: "italian", label: "อาหารอิตาเลียน" },
  { value: "french", label: "อาหารฝรั่งเศส" },
  { value: "mexican", label: "อาหารแม็กซิกัน" },
  { value: "middle-eastern", label: "อาหารตะวันออกกลาง" },
  { value: "halal", label: "อาหารฮาลาล" },
  { value: "vegetarian", label: "อาหารมังสวิรัติ" },
  { value: "vegan", label: "อาหารเจ" },
  { value: "fast-food", label: "อาหารจานด่วน" },
  { value: "seafood", label: "อาหารทะเล" },
  { value: "dessert", label: "ของหวาน / เบเกอรี่" },
  { value: "cafe", label: "ร้านกาแฟ" },
  { value: "street-food", label: "อาหารริมทาง" },
  { value: "fusion", label: "อาหารผสมผสาน" },
  { value: "bbq", label: "บาร์บีคิว / ปิ้งย่าง" }
];
const facilitiesOptions = [
  { id: 'parking_space', label: 'ที่จอดรถ' },
  { id: 'wifi_available', label: 'มี Wi-Fi' },
  { id: 'work_space_available', label: 'พื้นที่ทำงาน' },
  { id: 'pet_friendly', label: 'เป็นมิตรกับสัตว์เลี้ยง' },
  { id: 'kids_area', label: 'โซนสำหรับเด็ก' }
];
const paymentOptionsData = [
  { id: 'accepts_bank_payment', label: 'รับชำระผ่านธนาคาร' },
  { id: 'accepts_credit_card', label: 'รับบัตรเครดิต' }
];
const serviceOptionsData = [
  { id: 'accepts_reservation', label: 'รับการจอง' }
];
const locationStylesData = [
  { id: 'in_city', label: 'ในเมือง' },
  { id: 'sea_view', label: 'วิวทะเล' },
  { id: 'natural_style', label: 'สไตล์ธรรมชาติ' }
];
const lifestylesData = [
  { id: 'halal', label: 'ฮาลาล' },
  { id: 'vegan_option', label: 'มังสวิรัติ/วีแกน' }
];

function mapIdsToLabels(arr, options, key = 'id', labelKey = 'label') {
  if (!Array.isArray(arr)) return [];
  return arr.map(id => {
    const found = options.find(opt => opt[key] === id || opt.value === id);
    return found ? found[labelKey] : id;
  });
}

function parseArrayField(field) {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return [];
}

function transformRestaurant(r) {
  return {
    ...r,
    foodTypeLabel: mapIdsToLabels([r.foodType], foodTypeOptions, 'value', 'label')[0],
    facilitiesLabel: mapIdsToLabels(parseArrayField(r.facilities), facilitiesOptions),
    paymentOptionsLabel: mapIdsToLabels(parseArrayField(r.paymentOptions), paymentOptionsData),
    serviceOptionsLabel: mapIdsToLabels(parseArrayField(r.serviceOptions), serviceOptionsData),
    locationStylesLabel: mapIdsToLabels(parseArrayField(r.locationStyles), locationStylesData),
    lifestylesLabel: mapIdsToLabels(parseArrayField(r.lifestyles), lifestylesData),
  };
}


exports.getAll = async (req, res) => {
  const restaurants = await Restaurant.findAll();
  // แปลงข้อมูลทุกตัวก่อนส่งออก
  const transformed = restaurants.map(r => transformRestaurant(r));
  res.json(transformed);
};

exports.getById = async (req, res) => {
  console.log("HIT getById:", req.params.id);

  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        booking: true,
        review: true
      }
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Not found' });
    }

    // ---- Calculate stats ----
    const ratings = restaurant.review.map(r => r.rating);
    const avgRating = ratings.length
      ? ratings.reduce((sum, v) => sum + v, 0) / ratings.length
      : 0;

    // ---- Parse array fields ----
    const parse = (v) => {
      if (!v) return [];
      try { return JSON.parse(v); } catch { return []; }
    };

    // ---- Transform data for frontend ----
    const transformed = {
      ...restaurant,
      rating: Number(avgRating.toFixed(1)),
      reviewCount: ratings.length,
      bookingCount: restaurant.booking.length,

      facilities: parse(restaurant.facilities),
      paymentOptions: parse(restaurant.paymentOptions),
      serviceOptions: parse(restaurant.serviceOptions),
      locationStyles: parse(restaurant.locationStyles),
      lifestyles: parse(restaurant.lifestyles),
      photos: parse(restaurant.photos),

      // labels
      ...transformRestaurant(restaurant)
    };

    console.log("FINAL RESPONSE:", transformed);

    res.json(transformed);

  } catch (err) {
    console.error("getById error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};

function safeParseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

exports.create = async (req, res) => {
  try {
    const body = req.body;

    const cleanData = {
      ...body,
      facilities: safeParseArray(body.facilities),
      paymentOptions: safeParseArray(body.paymentOptions),
      serviceOptions: safeParseArray(body.serviceOptions),
      locationStyles: safeParseArray(body.locationStyles),
      lifestyles: safeParseArray(body.lifestyles),
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      startingPrice: body.startingPrice ? parseInt(body.startingPrice, 10) : null,
    };

    const restaurant = await Restaurant.create(cleanData);
    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    console.error("❌ Create restaurant error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    let data = req.body;
    const files = req.files || [];

    // โหลดข้อมูลร้านปัจจุบันจากฐานข้อมูลเพื่อใช้เป็นค่าเริ่มต้นสำหรับรูปถ้า client ไม่ได้ส่ง
    const existingRestaurant = await Restaurant.findById(id);
    const existingPhotosFromDb = existingRestaurant ? parseArrayField(existingRestaurant.photos) : [];

    // ลบคีย์ที่ไม่จำเป็น
    const invalidKeys = [
      'id', 'createdAt', 'updatedAt',
      'foodTypeLabel', 'facilitiesLabel',
      'paymentOptionsLabel', 'serviceOptionsLabel',
      'locationStylesLabel', 'lifestylesLabel',
      // remove calculated or related fields that should not be passed to Prisma
      'review', 'rating', 'reviewCount'
    ];
    invalidKeys.forEach(k => delete data[k]);

    // แปลงค่าตัวเลข
    if (data.startingPrice) data.startingPrice = parseInt(data.startingPrice, 10);
    if (data.latitude) data.latitude = parseFloat(data.latitude);
    if (data.longitude) data.longitude = parseFloat(data.longitude);

    // ===== รูปภาพ: หาก client ส่งฟิลด์ 'photos' ให้ใช้ค่านั้น (แม้จะเป็น [])
    // ===== หาก client ไม่ได้ส่ง 'photos' แต่มีไฟล์อัปโหลดใหม่ ให้เอา existing photos จาก DB แล้วต่อด้วยรูปใหม่
    // ===== หากไม่มีทั้งสองอย่าง อย่าแก้ไขฟิลด์ photos เลย (เพื่อไม่ให้ลบรูปโดยไม่ตั้งใจ)
    const parseArray = (v) => {
      if (!v) return [];
      try { return JSON.parse(v); } catch { return []; }
    };

    const hasPhotosFieldInRequest = Object.prototype.hasOwnProperty.call(data, 'photos');
    const oldPhotos = hasPhotosFieldInRequest ? parseArray(data.photos) : existingPhotosFromDb;

    // เพิ่มรูปใหม่ที่อัปโหลดเข้ามา
    const newPhotos = files.map((f, i) => ({
      url: `${req.protocol}://${req.get('host')}/uploads/${f.filename}`,
      isPrimary: oldPhotos.length === 0 && i === 0
    }));

    if (hasPhotosFieldInRequest || newPhotos.length > 0) {
      const mergedPhotos = [...oldPhotos, ...newPhotos];
      data.photos = JSON.stringify(mergedPhotos);
    } else {
      // ถ้าไม่มีการเปลี่ยนแปลงรูป ให้ลบคีย์ออกจาก data เพื่อไม่ให้ไปเขียนทับใน DB
      delete data.photos;
    }

    // ✅ stringify fields อื่น ๆ ที่เป็น array
    const jsonFields = ['facilities', 'paymentOptions', 'serviceOptions', 'locationStyles', 'lifestyles'];
    jsonFields.forEach(field => {
      if (data[field] && typeof data[field] !== 'string') {
        data[field] = JSON.stringify(data[field]);
      }
    });

    if (data.password) {
      // ถ้ามีรหัสผ่านใหม่ → hash แล้วอัปเดต
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      // ถ้าไม่มี → เอา key ออกจาก payload เพื่อไม่ทับค่าเดิม
      delete data.password;
    }

    const restaurant = await Restaurant.update(id, data);
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    console.error('❌ update restaurant error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.delete = async (req, res) => {
  await Restaurant.delete(Number(req.params.id));
  res.status(204).end();
};

// Login function
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'finddine_secret';

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const restaurant = await require('../models/restaurant').findByEmail(email);
    if (!restaurant) return res.status(401).json({ success: false, message: 'ไม่พบอีเมลนี้' });
    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
    // สร้าง JWT token
    const token = jwt.sign({ id: restaurant.id, email: restaurant.email }, SECRET, { expiresIn: '7d' });
    res.json({ success: true, restaurant, token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};
