const Restaurant = require('../models/restaurant');

exports.getAll = async (req, res) => {
  const restaurants = await Restaurant.findAll();
  res.json(restaurants);
};

exports.getById = async (req, res) => {
  const restaurant = await Restaurant.findById(Number(req.params.id));
  if (!restaurant) return res.status(404).json({ error: 'Not found' });
  res.json(restaurant);
};

exports.create = async (req, res) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json(restaurant);
};

exports.update = async (req, res) => {
  const restaurant = await Restaurant.update(Number(req.params.id), req.body);
  res.json(restaurant);
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
