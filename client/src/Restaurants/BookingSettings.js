import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Users, Calendar, Edit3, Save, AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export default function BookingSettings() {
  const { id } = useParams(); // restaurantId
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    allowBooking: true,
    maxGuests: 10,
    tableCount: 10,
    advanceDays: 30,
    holdMinutes: 15,
    cancelBeforeHr: 2,
    openTime: "10:00",
    closeTime: "22:00",
    policyNotes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:3001/api/booking-settings/${id}`)
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(() => console.log("ยังไม่มีการตั้งค่า ใช้ค่า default"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`http://localhost:3001/api/booking-settings/${id}`, settings);
      alert("บันทึกการตั้งค่าเรียบร้อย");
      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Edit3 className="w-6 h-6 text-orange-500" /> ตั้งค่าการจองโต๊ะ
        </h1>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700">เปิดรับการจองโต๊ะ</label>
            <input
              type="checkbox"
              name="allowBooking"
              checked={settings.allowBooking}
              onChange={handleChange}
              className="w-5 h-5 accent-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">เวลาที่เปิดให้จอง</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  name="openTime"
                  value={settings.openTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">เวลาปิดรับจอง</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  name="closeTime"
                  value={settings.closeTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">จำนวนโต๊ะทั้งหมด</label>
              <input
                type="number"
                name="tableCount"
                min="1"
                value={settings.tableCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">จำนวนคนต่อโต๊ะสูงสุด</label>
              <input
                type="number"
                name="maxGuests"
                min="1"
                value={settings.maxGuests}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">จองล่วงหน้า (วัน)</label>
              <input
                type="number"
                name="advanceDays"
                value={settings.advanceDays}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ยกเลิกก่อน (ชม.)</label>
              <input
                type="number"
                name="cancelBeforeHr"
                value={settings.cancelBeforeHr}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">เวลารอ (นาที)</label>
              <input
                type="number"
                name="holdMinutes"
                value={settings.holdMinutes}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">นโยบายเพิ่มเติม</label>
            <textarea
              name="policyNotes"
              rows="3"
              value={settings.policyNotes}
              onChange={handleChange}
              placeholder="เช่น กรุณามาตรงเวลา, งดสูบบุหรี่ในพื้นที่ร้าน ฯลฯ"
              className="w-full px-3 py-2 border rounded-lg"
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 font-medium"
            >
              {saving ? "กำลังบันทึก..." : (<><Save className="w-4 h-4" /> บันทึกการตั้งค่า</>)}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            การตั้งค่านี้จะถูกใช้กับแบบฟอร์มจองโต๊ะของลูกค้า
          </div>
        </div>
      </div>
    </div>
  );
}
