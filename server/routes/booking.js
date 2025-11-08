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
        <h2>📢 มีการจองใหม่! <b>รหัสการจอง:</b> BK${booking.id}</h2>
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

// ✅ อีเมลแจ้งลูกค้าเมื่อร้านตอบรับหรือปฏิเสธ
// ✅ อีเมลแจ้งลูกค้าเมื่อร้านตอบรับหรือปฏิเสธ
router.post('/notify', async (req, res) => {
    try {
        const { bookingId, status, message } = req.body;

        // ดึงข้อมูลการจอง
        const booking = await prisma.booking.findUnique({
            where: { id: Number(bookingId) },
        });

        if (!booking || !booking.customerEmail)
            return res.status(404).json({ error: 'ไม่พบข้อมูลอีเมลลูกค้า' });

        // ✅ ดึงชื่อร้านจาก restaurantId
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: booking.restaurantId },
            select: { restaurantName: true },
        });

        // สร้างเนื้อหาอีเมล
        const subject =
            status === 'confirmed'
                ? `✅ การจองของคุณได้รับการยืนยันแล้วจาก ${restaurant?.restaurantName || 'ร้านอาหาร'}`
                : `❌ การจองของคุณถูกปฏิเสธโดย ${restaurant?.restaurantName || 'ร้านอาหาร'}`;

        const html = `
      <div style="font-family:sans-serif;line-height:1.6">
        <h2>${subject}</h2>
        <p>เรียนคุณ ${booking.customerName},</p>
        <p>
          ร้าน <b>${restaurant?.restaurantName || 'อาหารของคุณ'}</b> ได้ทำการ
          <b>${status === 'confirmed' ? 'ยืนยัน' : 'ปฏิเสธ'}</b>
          การจองของคุณแล้ว
        </p>
        <p><b>วันเวลา:</b> ${booking.date.toLocaleDateString()} ${booking.time}</p>
        <p><b>จำนวนคน:</b> ${booking.guests}</p>
        <p><b>รายละเอียดเพิ่มเติมจากร้าน:</b></p>
        <blockquote>${message || '-'}</blockquote>
        <hr/>
        <p>ขอบคุณที่ใช้บริการ FindDine 💛</p>
      </div>
    `;

        // ✅ อัปเดตสถานะการจองในฐานข้อมูล
        await prisma.booking.update({
            where: { id: Number(bookingId) },
            data: { status },
        });

        // ส่งอีเมล
        await sendMail({
            to: booking.customerEmail,
            subject,
            html,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('❌ sendMail Error:', error);
        res.status(500).json({ error: 'ส่งอีเมลไม่สำเร็จ' });
    }
});

router.put('/:id', bookingController.update);
router.delete('/:id', bookingController.delete);

module.exports = router;
