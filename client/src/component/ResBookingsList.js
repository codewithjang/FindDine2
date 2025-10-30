import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";

const ResBookingsList = () => {
  const mockBookings = [
    {
      id: 1,
      customerName: "สมชาย ใจดี",
      phone: "0812345678",
      guests: 4,
      date: "2025-11-01",
      time: "18:00",
      note: "อยากได้โต๊ะริมหน้าต่าง",
      status: "รอการยืนยัน",
    },
    {
      id: 2,
      customerName: "Jane Doe",
      phone: "0999999999",
      guests: 2,
      date: "2025-11-02",
      time: "19:30",
      note: "-",
      status: "ยืนยันแล้ว",
    },
    {
      id: 3,
      customerName: "อาเหม็ด บินฮาซัน",
      phone: "0822222222",
      guests: 6,
      date: "2025-11-03",
      time: "20:00",
      note: "ลูกค้าวีไอพี",
      status: "ยกเลิก",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "ยืนยันแล้ว":
        return "bg-green-100 text-green-700";
      case "ยกเลิก":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-[#fff8f3] border border-gray-200 rounded-2xl p-6 shadow-lg">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          📋 รายการการจองโต๊ะของลูกค้า
        </h2>
      </div>

      {/* Table Section */}
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
              <th className="py-3 px-4 font-medium text-center">สถานะ</th>
              <th className="py-3 px-4 font-medium text-center">การจัดการ</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {mockBookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-orange-50 transition duration-150"
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {booking.customerName}
                </td>
                <td className="py-3 px-4 text-gray-600">{booking.phone}</td>
                <td className="py-3 px-4 text-center text-gray-600">
                  {booking.guests}
                </td>
                <td className="py-3 px-4 text-center text-gray-600">
                  {booking.date}
                </td>
                <td className="py-3 px-4 text-center text-gray-600">
                  {booking.time}
                </td>
                <td className="py-3 px-4 text-gray-600">{booking.note}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
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

      {/* Footer Summary */}
      <div className="flex justify-end mt-4 text-sm text-gray-500">
        รวมทั้งหมด {mockBookings.length} รายการ
      </div>
    </div>
  );
};

export default ResBookingsList;
