import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UserBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userBookings');
      const arr = raw ? JSON.parse(raw) : [];
      setBookings(arr);

      // fetch latest status for each saved booking (if it exists on server)
      (async () => {
        if (!arr || !arr.length) return;
        const updated = await Promise.all(
          arr.map(async (b) => {
            try {
              if (typeof b.id === 'string' && b.id.startsWith('BK')) {
                const num = parseInt(b.id.replace(/^BK/, ''), 10);
                if (!Number.isNaN(num)) {
                  const res = await axios.get(`http://localhost:3001/api/bookings/${num}`);
                  const remote = res.data;
                  if (remote && remote.status) {
                    return { ...b, status: remote.status };
                  }
                }
              }
            } catch (err) {
              // ignore fetch errors and return local copy
            }
            return b;
          })
        );

        // update state and persist statuses locally
        try {
          setBookings(updated);
          localStorage.setItem('userBookings', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to update local bookings with status', err);
        }
      })();
    } catch (err) {
      console.error('Failed to load userBookings', err);
      setBookings([]);
    }
  }, []);

  const formatDateTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return ts;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>
          <h2 className="text-xl font-bold">ประวัติการจองของฉัน</h2>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">ยังไม่มีการจอง</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-gray-500">รหัสการจอง</div>
                  <div className="font-semibold text-lg text-orange-600">{b.id}</div>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="text-sm text-gray-500">ร้าน</div>
                  <div className="font-medium">{b.restaurantName}</div>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="text-sm text-gray-500">สถานะ</div>
                  <div>
                    {b.status === 'confirmed' ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">ยืนยันแล้ว</span>
                    ) : b.status === 'rejected' ? (
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-sm">ปฏิเสธ</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">รอตอบกลับ</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="text-sm text-gray-500">วันที่</div>
                  <div>{b.bookingDate}</div>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="text-sm text-gray-500">เวลา</div>
                  <div>{b.bookingTime}</div>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="text-sm text-gray-500">จำนวน</div>
                  <div>{b.people} คน</div>
                </div>
                <div className="mt-3 md:mt-0 text-right text-xs text-gray-400">
                  สร้าง: {formatDateTime(b.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
