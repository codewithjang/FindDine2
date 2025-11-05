import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Eye } from "lucide-react";

export default function ResBookingsList({ restaurantId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/bookings/restaurant/${restaurantId}`)
      .then((res) => setRows(res.data || []))
      .catch((e) => {
        console.error("fetch bookings error:", e);
        setErr("ไม่สามารถโหลดข้อมูลการจองได้");
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) return <p className="text-gray-500 text-center">กำลังโหลด...</p>;
  if (err) return <p className="text-red-500 text-center">{err}</p>;
  if (!rows.length)
    return <p className="text-gray-500 text-center">ยังไม่มีรายการจอง</p>;

  const getStatusStyle = (status) =>
    status === "ยืนยันแล้ว"
      ? "bg-green-100 text-green-700"
      : status === "ยกเลิก"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-[#fff8f3] border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">📋 รายการการจองโต๊ะของลูกค้า</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-orange-50 text-gray-700 text-sm uppercase">
            <tr>
              <th className="py-3 px-4 font-medium">ชื่อลูกค้า</th>
              <th className="py-3 px-4 font-medium">เบอร์โทร</th>
              <th className="py-3 px-4 font-medium text-center">จำนวนคน</th>
              <th className="py-3 px-4 font-medium text-center">วันที่</th>
              <th className="py-3 px-4 font-medium text-center">เวลา</th>
              <th className="py-3 px-4 font-medium">หมายเหตุ</th>
              <th className="py-3 px-4 font-medium text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((b) => (
              <tr key={b.id} className="hover:bg-orange-50 transition duration-150">
                <td className="py-3 px-4 font-medium text-gray-800">{b.customerName}</td>
                <td className="py-3 px-4 text-gray-600">{b.customerPhone}</td>
                <td className="py-3 px-4 text-center text-gray-600">{b.guests}</td>
                <td className="py-3 px-4 text-center text-gray-600">
                  {new Date(b.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3 px-4 text-center text-gray-600">{b.time}</td>
                <td className="py-3 px-4 text-gray-600">
                  {b.specialRequests && b.specialRequests.trim() ? b.specialRequests : "-"}
                </td>
                <td className="py-3 px-4 text-center flex justify-center gap-3">
                  <button className="text-orange-500 hover:text-orange-600">
                    <Eye size={18} />
                  </button>
                  <button className="text-blue-500 hover:text-blue-600">
                    <Edit size={18} />
                  </button>
                  <button className="text-red-500 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 text-sm text-gray-500">
        รวมทั้งหมด {rows.length} รายการ
      </div>
    </div>
  );
}
