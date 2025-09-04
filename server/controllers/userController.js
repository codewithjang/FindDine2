exports.getById = async (req, res) => {
  try {
    const user = await User.findById(Number(req.params.id));
    if (!user) return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.update(Number(req.params.id), req.body);
    res.json({ success: true, user });
  } catch (err) {
    console.error('[UserController][update] error:', err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด', error: err.message });
  }
};
const User = require('../models/user');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'finddine_secret';

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const exist = await User.findByEmail(email);
    if (exist) return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้แล้ว' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, password: hash });

    res.status(201).json({ success: true, user });
  } catch (err) {
    let msg = 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
    if (err && err.message) {
      msg = err.message;
    } else if (typeof err === 'string') {
      msg = err;
    }
    res.status(500).json({ success: false, message: msg });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'ไม่พบอีเมลนี้' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
        // ❌ อย่าส่ง password กลับไปเด็ดขาด
      },
      token
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
      error: err.message
    });
  }
};
