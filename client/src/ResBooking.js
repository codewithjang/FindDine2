import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Phone,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Star,
    MapPin,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const RestaurantBooking = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const restaurantId = id;

    const [restaurant, setRestaurant] = useState(null);
    const [bookingSettings, setBookingSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [bookingData, setBookingData] = useState({
        date: "",
        time: "",
        guests: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        specialRequests: "",
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // ✅ โหลดข้อมูลร้าน + การตั้งค่าการจอง
    useEffect(() => {
        if (!restaurantId) return;
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/api/restaurants/${restaurantId}`);
                const data = Array.isArray(res.data) ? res.data[0] : res.data;

                // --- ฟังก์ชันช่วยจัดการข้อมูล ---
                const toArray = (val) => {
                    if (val == null) return [];
                    let cur = val;
                    if (Array.isArray(cur)) return cur;
                    for (let i = 0; i < 2; i++) {
                        if (Array.isArray(cur)) return cur;
                        if (typeof cur === "string") {
                            try {
                                cur = JSON.parse(cur);
                                continue;
                            } catch {
                                break;
                            }
                        } else break;
                    }
                    if (typeof cur === "string") {
                        const stripped = cur.replace(/^\[|\]$/g, "").replace(/"/g, "");
                        if (stripped.includes(",")) {
                            return stripped.split(",").map((s) => s.trim()).filter(Boolean);
                        }
                        return stripped ? [stripped] : [];
                    }
                    return Array.isArray(cur) ? cur : cur ? [cur] : [];
                };

                const normalizePhotos = (val) => {
                    const arr = toArray(val);
                    return arr
                        .map((item) => {
                            if (typeof item === "string") {
                                return { url: item, isPrimary: false };
                            }
                            if (item && typeof item === "object") {
                                return { url: item.url || item.photoUrl || "", isPrimary: !!item.isPrimary };
                            }
                            return null;
                        })
                        .filter((p) => p && p.url);
                };

                const normalizeArray = (val) => {
                    return toArray(val).map((x) => {
                        if (typeof x === "string") return x;
                        if (x && typeof x === "object") {
                            return (
                                x.facilityType ||
                                x.paymentType ||
                                x.serviceType ||
                                x.locationType ||
                                x.lifestyleType ||
                                x.id ||
                                x.value ||
                                ""
                            );
                        }
                        return "";
                    }).filter(Boolean);
                };

                // ✅ โหลดการตั้งค่าการจอง
                const settingRes = await axios.get(`http://localhost:3001/api/booking-settings/${restaurantId}`);
                const settings = settingRes.data;

                // ✅ ตั้งค่า restaurant แบบ normalize
                const restaurantObj = {
                    ...data,
                    photos: normalizePhotos(data.photos),
                    facilities: normalizeArray(data.facilities),
                    serviceOptions: normalizeArray(data.serviceOptions),
                    lifestyles: normalizeArray(data.lifestyles),
                };

                setRestaurant(restaurantObj);
                setBookingSettings(settings);
            } catch (err) {
                console.error(err);
                setError("ไม่สามารถโหลดข้อมูลร้านหรือการตั้งค่าการจองได้");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [restaurantId]);

    // ✅ ฟังก์ชันสร้างช่วงเวลา (อิงจากเวลาทำการจริง)
    const generateTimeSlots = (openTime, closeTime) => {
        if (!openTime || !closeTime) return [];
        const slots = [];
        const start = parseInt(openTime.split(":")[0]);
        const end = parseInt(closeTime.split(":")[0]);

        for (let hour = start; hour < end; hour++) {
            for (let minute of ["00", "30"]) {
                slots.push(`${hour.toString().padStart(2, "0")}:${minute}`);
            }
        }
        return slots;
    };

    // ✅ สร้างช่วงเวลาเมื่อเลือกวันที่
    useEffect(() => {
        if (bookingData.date && bookingSettings) {
            const slots = generateTimeSlots(
                bookingSettings.openTime,
                bookingSettings.closeTime
            ).filter(() => Math.random() > 0.3);
            setAvailableSlots(slots);
        }
    }, [bookingData.date, bookingSettings]);

    const getMinDate = () => new Date().toISOString().split("T")[0];
    const getMaxDate = () => {
        const d = new Date();
        const advance = bookingSettings?.advanceDays || 30;
        d.setDate(d.getDate() + advance);
        return d.toISOString().split("T")[0];
    };

    const handleInputChange = (field, value) => {
        setBookingData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleBack = () => navigate("/main_page");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setBookingSuccess(true);
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการจอง");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
            />
        ));
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                กำลังโหลดข้อมูลร้าน...
            </div>
        );
    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    if (!restaurant) return null;

    if (bookingSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">จองสำเร็จ!</h2>
                    <p className="text-gray-600 mb-4">
                        รหัสการจอง:{" "}
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                            BK{Date.now()}
                        </span>
                    </p>
                    <button
                        onClick={handleBack}
                        className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        กลับ
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="max-w-4xl mx-auto px-4 py-2 grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Sidebar */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <img
                        src={
                            restaurant.photos?.length > 0
                                ? (restaurant.photos[0].url || restaurant.photos[0].photoUrl)
                                : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
                        }
                        alt={restaurant.restaurantName}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {restaurant.restaurantName}
                    </h3>
                    <p className="text-gray-600 mb-3">{restaurant.foodType}</p>
                    <div className="flex items-center mb-3">
                        {renderStars(restaurant.rating || 4)}
                        <span className="ml-2 text-sm text-gray-500">
                            ({restaurant.rating || 4})
                        </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-1" />
                            {restaurant.address}
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            เปิด {bookingSettings?.openTime || restaurant.openTime || "-"} -{" "}
                            {bookingSettings?.closeTime || restaurant.closeTime || "-"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            รองรับสูงสุด {bookingSettings?.maxGuests || "-"} คน
                        </div>
                    </div>

                    <div className="mt-5">
                        <h4 className="font-semibold mb-2">นโยบายการจอง</h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                            {bookingSettings ? (
                                <>
                                    <li className="flex items-start gap-2">
                                        <AlertCircle className="w-3 h-3 mt-0.5" />
                                        จองล่วงหน้าได้ {bookingSettings.advanceDays} วัน
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertCircle className="w-3 h-3 mt-0.5" />
                                        ยกเลิกก่อน {bookingSettings.cancelBeforeHr} ชั่วโมง
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <AlertCircle className="w-3 h-3 mt-0.5" />
                                        โต๊ะจะถูกสงวนไว้ {bookingSettings.holdMinutes} นาที
                                    </li>
                                    {bookingSettings.policyNotes && (
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="w-3 h-3 mt-0.5" />
                                            {bookingSettings.policyNotes}
                                        </li>
                                    )}
                                </>
                            ) : (
                                <li>ยังไม่มีการตั้งค่าการจองสำหรับร้านนี้</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Form */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-2xl font-bold mb-6">กรอกข้อมูลการจอง</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* วันที่ / เวลา */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" /> วันที่
                                </label>
                                <input
                                    type="date"
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    value={bookingData.date}
                                    onChange={(e) =>
                                        handleInputChange("date", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" /> เวลา
                                </label>
                                <select
                                    value={bookingData.time}
                                    onChange={(e) =>
                                        handleInputChange("time", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                    disabled={!bookingData.date}
                                >
                                    <option value="">เลือกเวลา</option>
                                    {availableSlots.map((t) => (
                                        <option key={t} value={t}>
                                            {t} น.
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* จำนวนคน */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Users className="w-4 h-4 inline mr-1" /> จำนวนผู้ใช้บริการ
                            </label>
                            <select
                                value={bookingData.guests}
                                onChange={(e) =>
                                    handleInputChange("guests", parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                {[...Array(bookingSettings?.maxGuests || 10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1} คน
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ข้อมูลผู้จอง */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">ข้อมูลผู้จอง</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="ชื่อ-นามสกุล"
                                    value={bookingData.customerName}
                                    onChange={(e) =>
                                        handleInputChange("customerName", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                                <input
                                    type="tel"
                                    placeholder="เบอร์โทรศัพท์"
                                    value={bookingData.customerPhone}
                                    onChange={(e) =>
                                        handleInputChange("customerPhone", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="อีเมล (ไม่บังคับ)"
                                value={bookingData.customerEmail}
                                onChange={(e) =>
                                    handleInputChange("customerEmail", e.target.value)
                                }
                                className="w-full mt-3 px-3 py-2 border rounded-lg"
                            />
                        </div>

                        {/* คำขอพิเศษ */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <MessageSquare className="w-4 h-4 inline mr-1" /> คำขอพิเศษ
                            </label>
                            <textarea
                                value={bookingData.specialRequests}
                                onChange={(e) =>
                                    handleInputChange("specialRequests", e.target.value)
                                }
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-lg text-white font-medium ${isSubmitting
                                ? "bg-gray-400"
                                : "bg-orange-500 hover:bg-orange-600"
                                }`}
                        >
                            {isSubmitting ? "กำลังจอง..." : "ยืนยันการจอง"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RestaurantBooking;
