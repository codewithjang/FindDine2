const express = require('express');
const axios = require('axios');
const router = express.Router();

// ✅ Proxy สำหรับเรียก Nominatim
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'ต้องระบุคำค้นหาอย่างน้อย 2 ตัวอักษร' });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&countrycodes=th`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'FindDineApp/1.0 (contact: youremail@example.com)'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ Nominatim proxy error:', error.message);
    res.status(500).json({ error: 'ไม่สามารถเรียกข้อมูลจาก Nominatim ได้' });
  }
});

module.exports = router;
