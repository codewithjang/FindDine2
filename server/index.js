// import express from "express";
// import cors from "cors";
// import bcrypt from "bcrypt";
// import { PrismaClient } from "@prisma/client";
// import 'dotenv/config';

// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ==== uploads setup (วางบน ๆ ไฟล์) ====
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ตั้งค่าชื่อไฟล์ & ตำแหน่งจัดเก็บ
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

// รับเฉพาะไฟล์ภาพ
const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

// ลิมิต: 5MB/ไฟล์, สูงสุด 10 ไฟล์
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

// เปิดให้เสิร์ฟไฟล์ใน /uploads แบบสาธารณะ
app.use("/uploads", express.static(uploadDir));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('FindDine Backend API is running!');
});

const restaurantRoutes = require('./routes/restaurant');
const userRoutes = require('./routes/user');
const bookingRoutes = require('./routes/booking');

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// User Registration
app.post('/api/users/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });
    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// helper: ทำให้เป็น JSON string เสมอ (เพราะ schema เป็น String?)
const toJSONString = (v) => {
  if (v == null) return "[]";
  if (typeof v === "string") return v; // อาจเป็น JSON string อยู่แล้ว
  try { return JSON.stringify(v); } catch { return "[]"; }
};

// parse ฟิลด์ลิสต์ที่ส่งมาเป็นสตริง JSON (เพราะ multipart/form-data ทำให้ body เป็น string)
const parseMaybeJSON = (s) => {
  if (s == null || s === "") return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

// Restaurant Registration (Complete 4-step process)
app.post("/api/restaurants/register", upload.array("photos", 10), async (req, res) => {
  try {
    const {
      restaurantName,
      foodType,
      email,
      password,
      latitude,
      longitude,
      address,
      nearbyPlaces,
      phone,
      priceRange,     // <- schema เป็น String? ไม่ต้อง parseInt
      startingPrice,  // <- Int? ค่อย parse ด้านล่าง
      description,
      facilities,
      paymentOptions,
      serviceOptions,
      locationStyles,
      lifestyles,
    } = req.body;

    // ตรวจ email ซ้ำ
    const existing = await prisma.restaurant.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email นี้ถูกใช้งานแล้ว" });
    }

    // แปลงไฟล์ -> URL ภายในเซิร์ฟเวอร์
    const files = req.files || [];
    const photoObjs = files.map((f, i) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
      isPrimary: i === 0,
    }));

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างร้านอาหาร
    const restaurant = await prisma.restaurant.create({
      data: {
        restaurantName,
        foodType,
        email,
        password: hashedPassword,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        nearbyPlaces,
        phone,

        // ให้ตรง schema
        priceRange: priceRange ?? null,                         // String?
        startingPrice: startingPrice ? parseInt(startingPrice) : null, // Int?
        description,

        // ฟิลด์ลิสต์ทั้งหมด: เก็บเป็น JSON string
        facilities: toJSONString(parseMaybeJSON(facilities)),
        paymentOptions: toJSONString(parseMaybeJSON(paymentOptions)),
        serviceOptions: toJSONString(parseMaybeJSON(serviceOptions)),
        locationStyles: toJSONString(parseMaybeJSON(locationStyles)),
        lifestyles: toJSONString(parseMaybeJSON(lifestyles)),
        photos: toJSONString(photoObjs),
      },
    });

    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// GET /api/restaurants
app.get('/api/restaurants', async (req, res) => {
  const { filter } = req.query;

  // helper
  const parseJSON = (v) => {
    if (!v) return [];
    try { return JSON.parse(v); } catch { return []; }
  };

  try {
    const whereClause = {};

    if (filter) {
      const contains = (val) => ({ contains: `"${val}"` }); // match ใน JSON string

      switch (filter) {
        case 'halal':
          // lifestyles เป็น JSON string เช่น ["halal", ...]
          whereClause.lifestyles = contains('halal');
          break;

        case 'reservation':
          // serviceOptions เป็น JSON string เช่น ["accept_reservation"]
          whereClause.serviceOptions = contains('accept_reservation');
          break;

        case 'in_city':
          whereClause.locationStyles = contains('in_city');
          break;

        case 'sea_view':
          whereClause.locationStyles = contains('sea_view');
          break;

        case 'natural':
          whereClause.locationStyles = contains('natural_style');
          break;

        // หมายเหตุ: popular ใช้ rating >= 4.0 แต่ใน schema ไม่มีฟิลด์ rating
        // ถ้ายังไม่มีคอลัมน์นี้ ให้ตัดเคสนี้ทิ้งหรือคอมเมนต์ไว้ก่อน
        // case 'popular':
        //   whereClause.rating = { gte: 4.0 };
        //   break;
      }
    }

    // ดึงข้อมูล (ไม่มี include เพราะไม่ใช่ relation)
    const rows = await prisma.restaurant.findMany({
      where: whereClause,
      orderBy: { id: 'asc' }, // จะใส่หรือไม่ก็ได้
    });

    // แปลง JSON string -> array ก่อนส่งกลับ
    const restaurants = rows.map(r => ({
      ...r,
      facilities: parseJSON(r.facilities),
      paymentOptions: parseJSON(r.paymentOptions),
      serviceOptions: parseJSON(r.serviceOptions),
      locationStyles: parseJSON(r.locationStyles),
      lifestyles: parseJSON(r.lifestyles),
      photos: parseJSON(r.photos), // สมมติเป็นอาร์เรย์ url หรืออ็อบเจ็กต์
    }));

    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});


// Get a single restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      include: {
        facilities: true,
        paymentOptions: true,
        serviceOptions: true,
        locationStyles: true,
        lifestyles: true,
        photos: true
      }
    });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Search restaurants
app.get('/api/restaurants/search/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { foodType: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: {
        facilities: true,
        paymentOptions: true,
        serviceOptions: true,
        locationStyles: true,
        lifestyles: true,
        photos: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });
    res.json(restaurants);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ error: 'Failed to search restaurants' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});