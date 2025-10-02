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
import { useNavigate } from "react-router-dom";

const RestaurantBooking = ({ restaurantId}) => {
    const navigate = useNavigate();
    const handleBack = () => {
        navigate("/main_page"); // หรือ "/" ถ้า MainPage คือ root
    };
    // States สำหรับฟอร์มจองโต๊ะ
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
    const onBack = () => {
        navigate("/main_page"); // สมมติว่าหน้า MainPage อยู่ที่ path "/main_page"
    };


    // Mock data - ในระบบจริงจะดึงจาก API ตาม restaurantId
    const restaurant = {
        id: 1,
        name: "ร้านอาหารทะเลสด",
        foodType: "อาหารทะเล",
        rating: 4.5,
        photos: [{ photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400", isPrimary: true }],
        address: "123 หาดบางนางรม ต.ตะกั่วป่า อ.ตะกั่วป่า จ.พังงา 82110",
        phone: "077-123456",
        openTime: "10:00",
        closeTime: "22:00",
        maxCapacity: 8,
        bookingPolicy: [
            "สามารถจองล่วงหน้าได้ 30 วัน",
            "ยกเลิกการจองได้ก่อน 2 ชั่วโมง",
            "โต๊ะจะถูกสงวนไว้ 15 นาที หลังเวลานัดหมาย",
            "กรุณามาถึงตรงเวลาเพื่อความสะดวกของลูกค้าท่านอื่น"
        ]
    };

    // สร้างช่วงเวลาที่เปิดให้จอง
    const generateTimeSlots = () => {
        const slots = [];
        const start = parseInt(restaurant.openTime.split(':')[0]);
        const end = parseInt(restaurant.closeTime.split(':')[0]);

        for (let hour = start; hour < end - 1; hour++) {
            for (let minute of ['00', '30']) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
                slots.push(timeString);
            }
        }
        return slots;
    };

    // ตรวจสอบวันที่ที่สามารถจองได้
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    // จำลองการตรวจสอบ slot ว่าง
    useEffect(() => {
        if (bookingData.date) {
            // Mock API call - ในระบบจริงจะเรียก API เพื่อเช็ค availability
            const mockAvailableSlots = generateTimeSlots().filter(() => Math.random() > 0.3);
            setAvailableSlots(mockAvailableSlots);
        }
    }, [bookingData.date]);

    const handleInputChange = (field, value) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
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
        if (bookingData.guests < 1 || bookingData.guests > restaurant.maxCapacity) {
            newErrors.guests = `จำนวนผู้ใช้บริการต้องอยู่ระหว่าง 1-${restaurant.maxCapacity} คน`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Mock API call - ในระบบจริงจะส่งข้อมูลไป backend
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Booking Data:', {
                restaurantId: restaurant.id,
                ...bookingData
            });

            setBookingSuccess(true);
        } catch (error) {
            console.error('Booking failed:', error);
            alert('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
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

    // แสดงหน้าจองสำเร็จ
    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">จองสำเร็จ!</h2>
                    <p className="text-gray-600 mb-6">
                        การจองของคุณได้รับการยืนยันแล้ว<br />
                        รหัสการจอง: <span className="font-mono bg-gray-100 px-2 py-1 rounded">BK{Date.now()}</span>
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold mb-2">รายละเอียดการจอง</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">ร้าน:</span> {restaurant.name}</p>
                            <p><span className="font-medium">วันที่:</span> {new Date(bookingData.date).toLocaleDateString('th-TH')}</p>
                            <p><span className="font-medium">เวลา:</span> {bookingData.time} น.</p>
                            <p><span className="font-medium">จำนวน:</span> {bookingData.guests} คน</p>
                            <p><span className="font-medium">ชื่อ:</span> {bookingData.customerName}</p>
                            <p><span className="font-medium">โทร:</span> {bookingData.customerPhone}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onBack}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                        >
                            กลับหน้าหลัก
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            พิมพ์ใบจอง
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>กลับ</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Restaurant Info Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <img
                                src={restaurant.photos[0]?.photoUrl}
                                alt={restaurant.name}
                                className="w-full h-32 object-cover rounded-lg mb-4"
                            />

                            <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                            <p className="text-gray-600 mb-3">{restaurant.foodType}</p>

                            <div className="flex items-center space-x-1 mb-4">
                                {renderStars(restaurant.rating)}
                                <span className="text-sm text-gray-600 ml-1">({restaurant.rating})</span>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start space-x-2">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{restaurant.address}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span>{restaurant.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span>เปิด {restaurant.openTime} - {restaurant.closeTime} น.</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 flex-shrink-0" />
                                    <span>รองรับได้สูงสุด {restaurant.maxCapacity} คน</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="font-semibold mb-3">นโยบายการจอง</h4>
                                <ul className="space-y-2 text-xs text-gray-600">
                                    {restaurant.bookingPolicy.map((policy, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            <span>{policy}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">กรอกข้อมูลการจอง</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Date and Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            วันที่
                                        </label>
                                        <input
                                            type="date"
                                            value={bookingData.date}
                                            min={getMinDate()}
                                            max={getMaxDate()}
                                            onChange={(e) => handleInputChange('date', e.target.value)}
                                            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            เวลา
                                        </label>
                                        <select
                                            value={bookingData.time}
                                            onChange={(e) => handleInputChange('time', e.target.value)}
                                            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.time ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            disabled={!bookingData.date}
                                        >
                                            <option value="">เลือกเวลา</option>
                                            {availableSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot} น.</option>
                                            ))}
                                        </select>
                                        {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                                        {bookingData.date && availableSlots.length === 0 && (
                                            <p className="text-amber-600 text-sm mt-1">ไม่มีเวลาว่างในวันที่เลือก</p>
                                        )}
                                    </div>
                                </div>

                                {/* Number of Guests */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        จำนวนผู้ใช้บริการ
                                    </label>
                                    <select
                                        value={bookingData.guests}
                                        onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                                        className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.guests ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        {[...Array(restaurant.maxCapacity)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1} คน
                                            </option>
                                        ))}
                                    </select>
                                    {errors.guests && <p className="text-red-500 text-sm mt-1">{errors.guests}</p>}
                                </div>

                                {/* Customer Information */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อมูลผู้จอง</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User className="w-4 h-4 inline mr-1" />
                                                ชื่อ-นามสกุล *
                                            </label>
                                            <input
                                                type="text"
                                                value={bookingData.customerName}
                                                onChange={(e) => handleInputChange('customerName', e.target.value)}
                                                placeholder="กรอกชื่อ-นามสกุล"
                                                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.customerName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone className="w-4 h-4 inline mr-1" />
                                                เบอร์โทรศัพท์ *
                                            </label>
                                            <input
                                                type="tel"
                                                value={bookingData.customerPhone}
                                                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                                                placeholder="08X-XXX-XXXX"
                                                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.customerPhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            {errors.customerPhone && <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            อีเมล (ไม่บังคับ)
                                        </label>
                                        <input
                                            type="email"
                                            value={bookingData.customerEmail}
                                            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                            placeholder="example@email.com"
                                            className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${errors.customerEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>}
                                    </div>
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MessageSquare className="w-4 h-4 inline mr-1" />
                                        คำขอพิเศษ (ไม่บังคับ)
                                    </label>
                                    <textarea
                                        value={bookingData.specialRequests}
                                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                                        placeholder="เช่น ขอโต๊ะริมหน้าต่าง, อาหารไม่เผ็ด, มีผู้สูงอายุร่วมด้วย..."
                                        rows={3}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6 border-t">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 ${isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-200'
                                            } text-white`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>กำลังจอง...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-2">
                                                <Utensils className="w-5 h-5" />
                                                <span>ยืนยันการจอง</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantBooking;