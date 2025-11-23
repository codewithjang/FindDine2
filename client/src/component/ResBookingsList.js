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
  const [isLoading, setIsLoading] = useState(false); // ระหว่างส่งอีเมล

  // โหลดข้อมูลการจอง
  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/bookings/restaurant/${restaurantId}`)
      .then((res) => setRows(res.data || []))
      .catch(() => setErr("ไม่สามารถโหลดข้อมูลการจองได้"))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // ส่งอีเมลแจ้งลูกค้า + อัปเดตสถานะ
  const handleNotify = async (status) => {
    if (!selected) return;
    setIsLoading(true);
    try {
      await axios.post("http://localhost:3001/api/bookings/notify", {
        bookingId: selected.id,
        status,
        message: note,
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, status } : r
        )
      );
      alert("✅ ส่งอีเมลแจ้งลูกค้าเรียบร้อยแล้ว!");
      setSelected(null);
      setNote("");
      setNoteType(null);
    } catch (error) {
      console.error(error);
      alert("❌ ส่งอีเมลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-center">กำลังโหลด...</p>;
  if (err) return <p className="text-red-500 text-center">{err}</p>;
  if (!rows.length)
    return <p className="text-gray-500 text-center">ยังไม่มีรายการจอง</p>;

  return (
    <div className="bg-[#fff8f3] border border-gray-200 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-orange-600 mb-4">
        📋 รายการการจองโต๊ะของลูกค้า
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-orange-50 text-gray-700 text-sm uppercase">
            <tr>
              <th className="py-3 px-4">รหัสการจอง</th>
              <th className="py-3 px-4">ชื่อ</th>
              <th className="py-3 px-4">เบอร์โทร</th>
              <th className="py-3 px-4 text-center">จำนวนคน</th>
              <th className="py-3 px-4 text-center">วันที่</th>
              <th className="py-3 px-4 text-center">เวลา</th>
              <th className="py-3 px-4">หมายเหตุ</th>
              <th className="py-3 px-4 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((b) => (
              <tr
                key={b.id}
                className={`transition duration-150 ${b.status !== "pending"
                    ? "bg-gray-100 text-gray-500"
                    : "hover:bg-orange-50"
                  }`}
              >
                <td className="py-3 px-4 font-mono text-sm">{`BK${b.id}`}</td>
                <td className="py-3 px-4 font-medium">{b.customerName}</td>
                <td className="py-3 px-4">{b.customerPhone}</td>
                <td className="py-3 px-4 text-center">{b.guests}</td>
                <td className="py-3 px-4 text-center">
                  {new Date(b.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3 px-4 text-center">{b.time}</td>
                <td className="py-3 px-4">{b.specialRequests?.trim() || "-"}</td>

                {/* ✅ เพิ่มข้อความสถานะในคอลัมน์การจัดการ */}
                <td className="py-3 px-4 text-center">
                  <div className="flex flex-row items-center gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelected(b);
                        setNote("");
                        setNoteType(null);
                      }}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <Edit size={18} />
                    </button>
                    {b.status === "confirmed" && (
                      <span className="text-green-600 text-xs">
                        ✅ยืนยันแล้ว
                      </span>
                    )}
                    {b.status === "rejected" && (
                      <span className="text-red-600 text-xs">
                        ❌ปฏิเสธแล้ว
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 text-sm text-gray-500">
        รวมทั้งหมด {rows.length} รายการ
      </div>

      {/* ✅ Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative border-t-8 border-orange-400">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center rounded-2xl z-50">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-orange-400 border-solid"></div>
                <p className="text-gray-600 mt-3 text-sm font-medium">
                  กำลังส่งอีเมลแจ้งลูกค้า...
                </p>
              </div>
            )}
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

            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
              รายละเอียดการจอง
            </h3>

            {/* ✅ แสดงสถานะใน Modal */}
            {selected.status !== "pending" && (
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 font-medium">
                  คุณได้ทำการ{" "}
                  {selected.status === "confirmed"
                    ? "✅ ตอบรับ"
                    : "❌ ปฏิเสธ"}{" "}
                  การจองนี้เรียบร้อยแล้ว
                </p>
              </div>
            )}

              <div className="space-y-2 bg-orange-50 rounded-lg p-4 mb-4 text-sm text-gray-700">
              <p>
                <b>รหัสการจอง:</b> {`BK${selected.id}`}
              </p>
              <p>
                <b>ชื่อลูกค้า:</b> {selected.customerName}
              </p>
              <p>
                <b>เบอร์โทร:</b> {selected.customerPhone}
              </p>
              <p>
                <b>อีเมล:</b> {selected.customerEmail || "-"}
              </p>
              <p>
                <b>วันที่:</b>{" "}
                {new Date(selected.date).toLocaleDateString("th-TH")}
              </p>
              <p>
                <b>เวลา:</b> {selected.time}
              </p>
              <p>
                <b>จำนวนคน:</b> {selected.guests}
              </p>
              <p>
                <b>คำขอพิเศษ:</b> {selected.specialRequests || "-"}
              </p>
            </div>

            {/* ✅ ถ้ายังไม่ได้ตอบ */}
            {selected.status === "pending" && (
              <>
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

                {noteType === "reject" && (
                  <div className="mt-5">
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

                {noteType === "confirm" && (
                  <div className="mt-5">
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
