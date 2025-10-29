const Restaurant = require('../models/restaurant');


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
  const restaurant = await Restaurant.findById(Number(req.params.id));
  if (!restaurant) return res.status(404).json({ error: 'Not found' });
  const transformed = transformRestaurant(restaurant);
  console.log('transformed restaurant:', transformed);
  res.json(transformed);
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

    // ✅ ลบ field ที่ Prisma ไม่รู้จัก
    const invalidKeys = [
      'id', 'createdAt', 'updatedAt',
      'foodTypeLabel', 'facilitiesLabel',
      'paymentOptionsLabel', 'serviceOptionsLabel',
      'locationStylesLabel', 'lifestylesLabel'
    ];
    invalidKeys.forEach(k => delete data[k]);

    // ✅ แปลงค่าที่ควรเป็นตัวเลข
    if (data.startingPrice) data.startingPrice = parseInt(data.startingPrice, 10);
    if (data.latitude) data.latitude = parseFloat(data.latitude);
    if (data.longitude) data.longitude = parseFloat(data.longitude);

    const restaurant = await Restaurant.update(id, data);
    res.status(200).json(restaurant);

  } catch (error) {
    console.error('❌ update restaurant error:', error);
    res.status(500).json({ error: error.message });
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
