// ===== โหลดโมดูลก่อน =====
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ✅ เปิด CORS ก่อนทุกอย่าง
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ตั้งค่า multer สำหรับอัปโหลดรูปภาพ
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

// ✅ เปิดให้เสิร์ฟไฟล์ใน /uploads แบบสาธารณะ
app.use("/uploads", express.static(uploadDir));

// ✅ Routes
const restaurantRoutes = require("./routes/restaurant");
const mapRoutes = require("./routes/map");
const userRoutes = require("./routes/user");
const bookingRoutes = require("./routes/booking");
const bookingSettingsRoutes = require("./routes/bookingSettingsRoutes");

// ✅ Register routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/booking-settings", bookingSettingsRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("FindDine Backend API is running!");
});

// ===== User Registration =====
app.post("/api/users/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
    });
    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: "Failed to create user" });
  }
});

// ===== User Login =====
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// ===== Helper Functions =====
const toJSONString = (v) => {
  if (v == null) return "[]";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return "[]";
  }
};

const parseMaybeJSON = (s) => {
  if (s == null || s === "") return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

// ===== Restaurant Registration =====
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
      priceRange,
      startingPrice,
      description,
      facilities,
      paymentOptions,
      serviceOptions,
      locationStyles,
      lifestyles,
      openTime,
      closeTime
    } = req.body;

    const existing = await prisma.restaurant.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email นี้ถูกใช้งานแล้ว" });

    const files = req.files || [];
    const photoObjs = files.map((f, i) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
      isPrimary: i === 0,
    }));

    const hashedPassword = await bcrypt.hash(password, 10);

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
        priceRange: priceRange ?? null,
        startingPrice: startingPrice ? parseInt(startingPrice) : null,
        description,
        facilities: toJSONString(parseMaybeJSON(facilities)),
        paymentOptions: toJSONString(parseMaybeJSON(paymentOptions)),
        serviceOptions: toJSONString(parseMaybeJSON(serviceOptions)),
        locationStyles: toJSONString(parseMaybeJSON(locationStyles)),
        lifestyles: toJSONString(parseMaybeJSON(lifestyles)),
        photos: toJSONString(photoObjs),
        openTime,
        closeTime
      },
    });

    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== Restaurant List =====
app.get("/api/restaurants", async (req, res) => {
  const { filter } = req.query;
  const parseJSON = (v) => {
    if (!v) return [];
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  };

  try {
    const whereClause = {};
    if (filter) {
      const contains = (val) => ({ contains: `"${val}"` });
      switch (filter) {
        case "halal":
          whereClause.lifestyles = contains("halal");
          break;
        case "reservation":
          whereClause.serviceOptions = contains("accept_reservation");
          break;
        case "in_city":
          whereClause.locationStyles = contains("in_city");
          break;
        case "sea_view":
          whereClause.locationStyles = contains("sea_view");
          break;
        case "natural":
          whereClause.locationStyles = contains("natural_style");
          break;
      }
    }

    const rows = await prisma.restaurant.findMany({
      where: whereClause,
      orderBy: { id: "asc" },
    });

    const restaurants = rows.map((r) => ({
      ...r,
      facilities: parseJSON(r.facilities),
      paymentOptions: parseJSON(r.paymentOptions),
      serviceOptions: parseJSON(r.serviceOptions),
      locationStyles: parseJSON(r.locationStyles),
      lifestyles: parseJSON(r.lifestyles),
      photos: parseJSON(r.photos),
    }));

    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

// ===== Get Restaurant by ID =====
app.get("/api/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
    });
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

    // ✅ parse ให้เป็น array ทุก field
    const parseJSON = (v) => {
      if (!v) return [];
      try {
        const p = JSON.parse(v);
        return Array.isArray(p) ? p : [];
      } catch {
        return [];
      }
    };

    res.json({
      ...restaurant,
      photos: parseJSON(restaurant.photos),
      facilities: parseJSON(restaurant.facilities),
      paymentOptions: parseJSON(restaurant.paymentOptions),
      serviceOptions: parseJSON(restaurant.serviceOptions),
      locationStyles: parseJSON(restaurant.locationStyles),
      lifestyles: parseJSON(restaurant.lifestyles),
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
});

// ===== Toggle Booking Availability =====
app.put("/api/restaurants/:id/toggle-booking", async (req, res) => {
  const { id } = req.params;
  const { isBookingOpen } = req.body;

  try {
    const restaurant = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: { isBookingOpen },
    });
    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: "Failed to update booking status" });
  }
});



// ===== Search Restaurants =====
app.get("/api/restaurants/search/:query", async (req, res) => {
  const { query } = req.params;
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        OR: [
          { restaurantName: { contains: query } },
          { foodType: { contains: query } },
          { description: { contains: query } },
        ],
      },
    });
    res.json(restaurants);
  } catch (error) {
    console.error("Error searching restaurants:", error);
    res.status(500).json({ error: "Failed to search restaurants" });
  }
});

// ✅ Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// ✅ Start the server (มีแค่ 1 จุดเท่านั้น)
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
