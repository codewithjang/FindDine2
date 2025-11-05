const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendMail } = require('../utils/mailer');

router.get('/', bookingController.getAll);
router.get('/restaurant/:restaurantId', bookingController.getByRestaurant);
router.get('/:id', bookingController.getById);

// ✅ POST: ลูกค้าทำการจองโต๊ะ
router.post('/', async (req, res) => {
    try {
        const {
            restaurantId,
            date,
            time,
            guests,
            customerName,
            customerPhone,
            customerEmail,
            specialRequests,
        } = req.body;

        // 1️⃣ ดึงข้อมูลร้านจากฐานข้อมูล
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: Number(restaurantId) },
        });
        if (!restaurant) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลร้านอาหาร' });
        }

        // 2️⃣ บันทึกข้อมูลการจอง
        const booking = await prisma.booking.create({
            data: {
                restaurantId: Number(restaurantId),
                date: new Date(date),
                time,
                guests: Number(guests),
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                specialRequests: specialRequests || null,
            },
        });

        // 3️⃣ ส่งอีเมลแจ้งร้าน
        const subject = `📅 มีการจองใหม่ | ${restaurant.restaurantName}`;
        const html = `
      <div style="font-family:sans-serif;line-height:1.6">
        <h2>📢 มีการจองใหม่!</h2>
        <p><b>ร้าน:</b> ${restaurant.restaurantName}</p>
        <p><b>รหัสการจอง:</b> BK${booking.id}</p>
        <p><b>วันที่:</b> ${date}</p>
        <p><b>เวลา:</b> ${time}</p>
        <p><b>จำนวน:</b> ${guests} คน</p>
        <p><b>ผู้จอง:</b> ${customerName} (${customerPhone})</p>
        ${customerEmail ? `<p><b>อีเมล:</b> ${customerEmail}</p>` : ""}
        ${specialRequests ? `<p><b>คำขอพิเศษ:</b> ${specialRequests}</p>` : ""}
        <hr/>
        <p>
          คลิกเพื่อเข้าสู่ระบบ FindDine ของร้าน:
          <br/>
          <a href="http://localhost:3000/RestaurantLogin"
             style="display:inline-block;padding:10px 16px;background:#ff6a00;color:white;border-radius:8px;text-decoration:none">
             เข้าสู่ระบบร้าน
          </a>
        </p>
      </div>
    `;

        await sendMail({
            to: restaurant.email,
            subject,
            html,
        });

        return res.json({
            success: true,
            bookingId: booking.id,
            message: 'บันทึกการจองและส่งอีเมลแจ้งร้านเรียบร้อยแล้ว',
        });
    } catch (error) {
        console.error('❌ Booking Error:', error);
        res.status(500).json({ error: 'ไม่สามารถจองโต๊ะได้' });
    }
});

router.put('/:id', bookingController.update);
router.delete('/:id', bookingController.delete);

module.exports = router;
