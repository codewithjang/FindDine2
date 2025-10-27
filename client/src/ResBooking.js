import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    User,
    Phone,
    Mail,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Star,
    MapPin,
    Utensils
} from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

const RestaurantBooking = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const restaurantId = id;

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [bookingData, setBookingData] = useState({
        date: '',
        time: '',
        guests: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        specialRequests: ''
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // ✅ ดึงข้อมูลร้านจาก Backend
    useEffect(() => {
        if (!restaurantId) return;
        setLoading(true);
        axios.get(`http://localhost:3001/api/restaurants/${restaurantId}`)
            .then(res => {
                const r = res.data;
                const parsedPhotos = Array.isArray(r.photos)
                    ? r.photos
                    : (r.photos ? JSON.parse(r.photos) : []);

                setRestaurant({
                    ...r,
                    photos: parsedPhotos,
                    facilities: Array.isArray(r.facilities) ? r.facilities : (r.facilities ? JSON.parse(r.facilities) : []),
                    serviceOptions: Array.isArray(r.serviceOptions) ? r.serviceOptions : (r.serviceOptions ? JSON.parse(r.serviceOptions) : []),
                    bookingPolicy: [
                        "สามารถจองล่วงหน้าได้ 30 วัน",
                        "ยกเลิกการจองได้ก่อน 2 ชั่วโมง",
                        "โต๊ะจะถูกสงวนไว้ 15 นาที หลังเวลานัดหมาย",
                        "กรุณามาถึงตรงเวลาเพื่อความสะดวกของลูกค้าท่านอื่น"
                    ],
                });
                setLoading(false);
            })
    }, [restaurantId]);

    const handleBack = () => navigate("/main_page");

    // ✅ ฟังก์ชันสร้างช่วงเวลา
    const generateTimeSlots = (openTime, closeTime) => {
        if (!openTime || !closeTime) return [];
        const slots = [];
        const start = parseInt(openTime.split(':')[0]);
        const end = parseInt(closeTime.split(':')[0]);

        for (let hour = start; hour < end; hour++) {
            for (let minute of ['00', '30']) {
                slots.push(`${hour.toString().padStart(2, '0')}:${minute}`);
            }
        }
        return slots;
    };

    // ✅ อัปเดตเวลาว่างเมื่อเลือกวันที่
    useEffect(() => {
        if (bookingData.date && restaurant) {
            const mockSlots = generateTimeSlots(restaurant.openTime, restaurant.closeTime)
                .filter(() => Math.random() > 0.3);
            setAvailableSlots(mockSlots);
        }
    }, [bookingData.date, restaurant]);

    const getMinDate = () => new Date().toISOString().split('T')[0];
    const getMaxDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    };

    const handleInputChange = (field, value) => {
        setBookingData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!bookingData.date) newErrors.date = 'กรุณาเลือกวันที่';
        if (!bookingData.time) newErrors.time = 'กรุณาเลือกเวลา';
        if (!bookingData.customerName.trim()) newErrors.customerName = 'กรุณากรอกชื่อ';
        if (!bookingData.customerPhone.trim()) newErrors.customerPhone = 'กรุณากรอกเบอร์โทรศัพท์';
        if (bookingData.customerPhone && !/^[0-9-+\s]+$/.test(bookingData.customerPhone)) {
            newErrors.customerPhone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
        }
        if (bookingData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customerEmail)) {
            newErrors.customerEmail = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        if (restaurant && (bookingData.guests < 1 || bookingData.guests > restaurant.maxCapacity)) {
            newErrors.guests = `จำนวนผู้ใช้บริการต้องอยู่ระหว่าง 1-${restaurant.maxCapacity} คน`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setBookingSuccess(true);
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการจอง');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">กำลังโหลดข้อมูลร้าน...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!restaurant) return null;

    if (bookingSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">จองสำเร็จ!</h2>
                    <p className="text-gray-600 mb-4">รหัสการจอง: <span className="bg-gray-100 px-2 py-1 rounded font-mono">BK{Date.now()}</span></p>
                    <button onClick={handleBack} className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600">กลับหน้าหลัก</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
                    <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-800">
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
                                ? (restaurant.photos[0].photoUrl || restaurant.photos[0].url)
                                : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
                        }
                        alt={restaurant.restaurantName}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.restaurantName}</h3>
                    <p className="text-gray-600 mb-3">{restaurant.foodType}</p>
                    <div className="flex items-center mb-3">
                        {renderStars(restaurant.rating)}
                        <span className="ml-2 text-sm text-gray-500">({restaurant.rating})</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1" />{restaurant.address}</div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{restaurant.phone}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" />เปิด {restaurant.openTime} - {restaurant.closeTime}</div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4" />รองรับสูงสุด {restaurant.maxCapacity} คน</div>
                    </div>

                    <div className="mt-5">
                        <h4 className="font-semibold mb-2">นโยบายการจอง</h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                            {restaurant.bookingPolicy.map((p, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <AlertCircle className="w-3 h-3 mt-0.5" />
                                    {p}
                                </li>
                            ))}
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
                                <label className="block text-sm font-medium mb-2"><Calendar className="w-4 h-4 inline mr-1" /> วันที่</label>
                                <input type="date" min={getMinDate()} max={getMaxDate()} value={bookingData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2"><Clock className="w-4 h-4 inline mr-1" /> เวลา</label>
                                <select value={bookingData.time}
                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    disabled={!bookingData.date}>
                                    <option value="">เลือกเวลา</option>
                                    {availableSlots.map(t => <option key={t} value={t}>{t} น.</option>)}
                                </select>
                            </div>
                        </div>

                        {/* จำนวนคน */}
                        <div>
                            <label className="block text-sm font-medium mb-2"><Users className="w-4 h-4 inline mr-1" /> จำนวนผู้ใช้บริการ</label>
                            <select value={bookingData.guests} onChange={(e) => handleInputChange('guests', parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg">
                                {[...Array(restaurant.maxCapacity)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1} คน</option>
                                ))}
                            </select>
                        </div>

                        {/* ข้อมูลผู้จอง */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">ข้อมูลผู้จอง</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="ชื่อ-นามสกุล" value={bookingData.customerName}
                                    onChange={(e) => handleInputChange('customerName', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                                <input type="tel" placeholder="เบอร์โทรศัพท์" value={bookingData.customerPhone}
                                    onChange={(e) => handleInputChange('customerPhone', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <input type="email" placeholder="อีเมล (ไม่บังคับ)" value={bookingData.customerEmail}
                                onChange={(e) => handleInputChange('customerEmail', e.target.value)} className="w-full mt-3 px-3 py-2 border rounded-lg" />
                        </div>

                        {/* คำขอพิเศษ */}
                        <div>
                            <label className="block text-sm font-medium mb-2"><MessageSquare className="w-4 h-4 inline mr-1" /> คำขอพิเศษ</label>
                            <textarea value={bookingData.specialRequests} onChange={(e) => handleInputChange('specialRequests', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-lg text-white font-medium ${isSubmitting ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}>
                            {isSubmitting ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RestaurantBooking;
