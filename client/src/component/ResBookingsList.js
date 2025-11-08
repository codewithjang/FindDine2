import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, XCircle, CheckCircle } from "lucide-react";

export default function ResBookingsList({ restaurantId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState(null);

  // ✅ โหลดข้อมูลการจองทั้งหมดของร้าน
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

  // ✅ ฟังก์ชันส่งอีเมลแจ้งลูกค้า
  const handleNotify = async (status) => {
    if (!selected) return;
    try {
      await axios.post("http://localhost:3001/api/bookings/notify", {
        bookingId: selected.id,
        status,
        message: note,
      });
      alert("✅ ส่งอีเมลแจ้งลูกค้าเรียบร้อยแล้ว!");
      setSelected(null);
      setNote("");
      setNoteType(null);
    } catch (error) {
      console.error(error);
      alert("❌ ส่งอีเมลไม่สำเร็จ");
    }
  };

  // ✅ แสดงสถานะโหลดหรือ error
  if (loading) return <p className="text-gray-500 text-center">กำลังโหลด...</p>;
  if (err) return <p className="text-red-500 text-center">{err}</p>;
  if (!rows.length)
    return <p className="text-gray-500 text-center">ยังไม่มีรายการจอง</p>;

  return (
    <div className="bg-[#fff8f3] border border-gray-200 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        📋 รายการการจองโต๊ะของลูกค้า
      </h2>

      {/* ตารางรายการจอง */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-orange-50 text-gray-700 text-sm uppercase">
            <tr>
              <th className="py-3 px-4">ชื่อ</th>
              <th className="py-3 px-4">เบอร์โทร</th>
              <th className="py-3 px-4 text-center">จำนวนคน</th>
              <th className="py-3 px-4 text-center">วันที่</th>
              <th className="py-3 px-4 text-center">เวลา</th>
              <th className="py-3 px-4">หมายเหตุ</th>
              <th className="py-3 px-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-orange-50 transition duration-150"
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {b.customerName}
                </td>
                <td className="py-3 px-4 text-gray-600">{b.customerPhone}</td>
                <td className="py-3 px-4 text-center text-gray-600">
                  {b.guests}
                </td>
                <td className="py-3 px-4 text-center text-gray-600">
                  {new Date(b.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3 px-4 text-center text-gray-600">{b.time}</td>
                <td className="py-3 px-4 text-gray-600">
                  {b.specialRequests?.trim() || "-"}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => {
                      setSelected(b);
                      setNote("");
                      setNoteType(null);
                    }}
                    className="text-blue-500 hover:text-orange-700"
                  >
                    <Edit size={18} />
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

      {/* ✅ Modal แสดงรายละเอียดการจอง */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative border-t-8 border-orange-400 animate-fadeIn">
            {/* ปุ่มปิด */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSelected(null);
                setNote("");
                setNoteType(null);
              }}
            >
              ✕
            </button>

            {/* หัวข้อ */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              รายละเอียดการจอง
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              ตรวจสอบข้อมูลลูกค้าก่อนดำเนินการ
            </p>

            {/* ข้อมูลลูกค้า */}
            <div className="space-y-2 bg-orange-50 rounded-lg p-4 mb-4 text-sm text-gray-700">
              <p><b>ชื่อลูกค้า:</b> {selected.customerName}</p>
              <p><b>เบอร์โทร:</b> {selected.customerPhone}</p>
              <p><b>อีเมล:</b> {selected.customerEmail || "-"}</p>
              <p><b>วันที่:</b> {new Date(selected.date).toLocaleDateString("th-TH")}</p>
              <p><b>เวลา:</b> {selected.time}</p>
              <p><b>จำนวนคน:</b> {selected.guests}</p>
              <p><b>คำขอพิเศษ:</b> {selected.specialRequests || "-"}</p>
            </div>

            {/* ปุ่มเลือกสถานะ */}
            {!noteType && (
              <div className="flex justify-center gap-4 mt-3">
                <button
                  onClick={() => setNoteType("reject")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition"
                >
                  <XCircle size={18} />
                  ปฏิเสธการจอง
                </button>
                <button
                  onClick={() => setNoteType("confirm")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition"
                >
                  <CheckCircle size={18} />
                  ตอบรับการจอง
                </button>
              </div>
            )}

            {/* ปฏิเสธ */}
            {noteType === "reject" && (
              <div className="mt-5 animate-slideUp">
                <label className="block text-sm font-medium text-red-700 mb-1">
                  เหตุผลที่ปฏิเสธ
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ที่นั่งเต็ม / ร้านปิดช่วงเวลานั้น"
                  className="w-full border border-red-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-300"
                  rows={3}
                ></textarea>
                <button
                  onClick={() => handleNotify("rejected")}
                  className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  ส่งอีเมลแจ้งลูกค้า
                </button>
              </div>
            )}

            {/* ยืนยัน */}
            {noteType === "confirm" && (
              <div className="mt-5 animate-slideUp">
                <label className="block text-sm font-medium text-green-700 mb-1">
                  หมายเหตุเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น โปรดมาถึงก่อนเวลา 10 นาที / กรุณายืนยันอีกครั้งก่อน 1 ชม."
                  className="w-full border border-green-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-300"
                  rows={3}
                ></textarea>
                <button
                  onClick={() => handleNotify("confirmed")}
                  className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  ส่งอีเมลแจ้งลูกค้า
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
