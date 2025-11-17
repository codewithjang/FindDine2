import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/bookings');
      let bookingsData = res.data || [];

      // If backend didn't include restaurant relation, fetch restaurants and map names
      const needsRestaurantFill = bookingsData.length > 0 && bookingsData.some(b => !b.restaurant);
      if (needsRestaurantFill) {
        try {
          const rres = await axios.get('http://localhost:3001/api/restaurants');
          const map = {};
          (rres.data || []).forEach(r => { map[r.id] = r.restaurantName; });
          bookingsData = bookingsData.map(b => ({
            ...b,
            restaurant: b.restaurant || { restaurantName: map[b.restaurantId] || 'ไม่ระบุชื่อร้าน' }
          }));
        } catch (e) {
          // ignore and leave restaurant undefined
          console.warn('Could not fetch restaurants to fill names', e);
        }
      }

      setBookings(bookingsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setLoading(false);
    }
  };

  // Group bookings by restaurant name
  const grouped = bookings.reduce((acc, b) => {
    const name = b.restaurant?.restaurantName || 'ไม่ระบุชื่อร้าน';
    if (!acc[name]) acc[name] = [];
    acc[name].push(b);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบการจองนี้หรือไม่?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/bookings/${id}`);
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const matchesSearch = (b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      b.customerName.toLowerCase().includes(q) ||
      (b.customerEmail || '').toLowerCase().includes(q) ||
      (b.restaurant?.restaurantName || '').toLowerCase().includes(q)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="ค้นหาชื่อหรืออีเมลหรือร้าน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="confirmed">ยืนยันแล้ว</option>
          <option value="cancelled">ยกเลิก</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลด...</p>
      ) : (
        <div className="space-y-6">
          {Object.keys(grouped).length === 0 && <p className="text-center text-gray-500">ไม่พบการจอง</p>}
          {Object.entries(grouped).map(([restaurantName, items]) => {
            const filtered = items.filter(b => matchesSearch(b) && (statusFilter === 'all' || b.status === statusFilter));
            if (filtered.length === 0) return null;
            return (
              <div key={restaurantName} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{restaurantName} <span className="text-sm text-gray-500">({filtered.length} รายการ)</span></h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 text-left">
                      <tr>
                        <th className="px-4 py-2 text-sm font-medium">ชื่อลูกค้า</th>
                        <th className="px-4 py-2 text-sm font-medium">วันที่</th>
                        <th className="px-4 py-2 text-sm font-medium">แขก</th>
                        <th className="px-4 py-2 text-sm font-medium">สถานะ</th>
                        <th className="px-4 py-2 text-sm font-medium">เบอร์โทร</th>
                        <th className="px-4 py-2 text-sm font-medium">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{b.customerName}</td>
                          <td className="px-4 py-3">{new Date(b.date).toLocaleDateString('th-TH')}</td>
                          <td className="px-4 py-3">{b.guests} คน</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {b.status === 'confirmed' ? 'ยืนยันแล้ว' : b.status === 'pending' ? 'รอดำเนินการ' : 'ยกเลิก'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{b.customerPhone}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:text-red-800">
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewBookings;
