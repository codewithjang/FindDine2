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

// Restaurant Registration (Complete 4-step process)
app.post("/api/restaurants/register", async (req, res) => {
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
      photos
    } = req.body;

    // ตรวจสอบ email ซ้ำ
    const existing = await prisma.restaurant.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ message: "Email นี้ถูกใช้งานแล้ว" });
    }

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
        priceRange: priceRange ? parseInt(priceRange) : null,
        startingPrice: startingPrice ? parseInt(startingPrice) : null,
        description,
        facilities: facilities || [],
        paymentOptions: paymentOptions || [],
        serviceOptions: serviceOptions || [],
        locationStyles: locationStyles || [],
        lifestyles: lifestyles || [],
        photos: photos || []
      }
    });

    res.json({ success: true, restaurant });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all restaurants with filters
app.get('/api/restaurants', async (req, res) => {
  const { filter } = req.query;
  try {
    let whereClause = {};

    if (filter) {
      switch (filter) {
        case 'halal':
          whereClause.lifestyles = {
            some: { lifestyleType: 'halal' }
          };
          break;
        case 'popular':
          whereClause.rating = { gte: 4.0 };
          break;
        case 'reservation':
          whereClause.serviceOptions = {
            some: { serviceType: 'accept_reservation' }
          };
          break;
        case 'in_city':
          whereClause.locationStyles = {
            some: { locationType: 'in_city' }
          };
          break;
        case 'sea_view':
          whereClause.locationStyles = {
            some: { locationType: 'sea_view' }
          };
          break;
        case 'natural':
          whereClause.locationStyles = {
            some: { locationType: 'natural_style' }
          };
          break;
      }
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
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