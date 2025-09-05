import React, { useState } from 'react';
import {
    ArrowLeft,
    Star,
    Clock,
    MapPin,
    Phone,
    DollarSign,
    Users,
    Wifi,
    Car,
    CreditCard,
    Calendar,
    X,
    Check,
    Minus
} from 'lucide-react';
import bg from './assets/bg/bgCompare.png';

const RestaurantCompare = ({ compareRestaurants, allRestaurants, onBack, onRemoveFromCompare }) => {
    // ใช้ข้อมูลจาก MainPage และเพิ่มข้อมูลเพิ่มเติมสำหรับการเปรียบเทียบ
    const mockAdditionalData = {
        1: {
            reviewCount: 124,
            openTime: "10:00",
            closeTime: "21:00",
            phone: "095 257 9562",
            address: "ถนนเหมืองเจ้าฟ้า Kathu, Kathu District, Phuket 83120",
            serviceOptions: [
                { serviceType: "accept_reservation" },
                { serviceType: "wifi" },
            ],
            popularDishes: ["ข้าวหมกไก่ทอด", "ข้าวมันไก่ทอด", "ข้าวไก่คั่วพริกเกลือ"],
            distance: 700
        },
        2: {
            reviewCount: 324,
            openTime: "10:00",
            closeTime: "22:00",
            phone: "077-123456",
            address: "123 หาดบางนางรม ต.ตะกั่วป่า อ.ตะกั่วป่า จ.พังงา 82110",
            serviceOptions: [
                { serviceType: "accept_reservation" },
                { serviceType: "wifi" },
                { serviceType: "parking" },
                { serviceType: "credit_card" }
            ],
            popularDishes: ["ปลากะพงนึ่งมะนาว", "กุ้งเผาเกลือ", "ปูผัดผงกะหรี่"],
            distance: 2.5
        },
        3: {
            reviewCount: 189,
            openTime: "11:00",
            closeTime: "21:00",
            phone: "077-789012",
            address: "456 ถ.เพชรเกษม ต.ตะกั่วป่า อ.ตะกั่วป่า จ.พังงา 82110",
            serviceOptions: [
                { serviceType: "parking" },
                { serviceType: "wifi" }
            ],
            popularDishes: ["ผัดไทย", "ต้มยำกุ้ง", "แกงเขียวหวานไก่"],
            distance: 1.2
        },
        4: {
            reviewCount: 156,
            openTime: "08:00",
            closeTime: "20:00",
            phone: "077-345678",
            address: "789 หาดบางสัก ต.ตะกั่วป่า อ.ตะกั่วป่า จ.พังงา 82110",
            serviceOptions: [
                { serviceType: "wifi" },
                { serviceType: "credit_card" }
            ],
            popularDishes: ["เค้กช็อกโกแลต", "กาแฟอเมริกาโน", "พาสต้าครีม"],
            distance: 3.8
        }
    };

    // รวมข้อมูลจาก MainPage กับข้อมูลเพิ่มเติม และกรองเฉพาะร้านที่เลือกเปรียบเทียบ
    const restaurants = allRestaurants
        .filter(restaurant => compareRestaurants.includes(restaurant.id))
        .map(restaurant => ({
            ...restaurant,
            ...mockAdditionalData[restaurant.id]
        }));

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
            />
        ));
    };

    const hasService = (restaurant, serviceType) => {
        return restaurant.serviceOptions.some(service => service.serviceType === serviceType);
    };

    const getLifestyleLabel = (lifestyleType) => {
        switch (lifestyleType) {
            case 'halal': return 'Halal';
            case 'vegetarian': return 'มังสวิรัติ';
            default: return lifestyleType;
        }
    };

    const getLocationLabel = (locationType) => {
        switch (locationType) {
            case 'sea_view': return 'วิวทะเล';
            case 'natural_style': return 'ธรรมชาติ';
            case 'in_city': return 'ในเมือง';
            default: return locationType;
        }
    };

    if (!compareRestaurants || compareRestaurants.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่มีร้านที่เลือกเปรียบเทียบ</h2>
                    <button
                        onClick={onBack}
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        กลับไปหน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="w-full relative flex flex-col h-[120px] sm:h-[200px] md:h-[240px]">
                <img
                    src={bg}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 md:opacity-80 z-0"
                />
                <div className="relative flex items-center justify-start flex-grow px-4 sm:px-8 md:px-40">
                    <h1 className="text-xl text-orange-600 sm:text-2xl md:text-4xl font-bold drop-shadow-md">
                        เปรียบเทียบร้านอาหาร
                    </h1>
                </div>
            </div>


            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Comparison Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Restaurant Headers */}
                            <thead>
                                <tr className="border-b">
                                    <td className="p-4 font-medium text-gray-600 w-48">รายการเปรียบเทียบ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center relative min-w-80">
                                            <button
                                                onClick={() => onRemoveFromCompare(restaurant.id)}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <h3 className="font-bold text-lg text-gray-800">{restaurant.name}</h3>
                                            <p className="text-gray-600 text-sm">{restaurant.foodType}</p>
                                        </td>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {/* Rating */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">คะแนนรีวิว</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="flex">{renderStars(restaurant.rating)}</div>
                                                <span className="font-medium">{restaurant.rating}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">({restaurant.reviewCount} รีวิว)</p>
                                        </td>
                                    ))}
                                </tr>

                                {/* Price Range */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ช่วงราคา</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-1 text-orange-600 font-medium">
                                                {/* <DollarSign className="w-4 h-4" /> */}
                                                <span>฿ {restaurant.priceRangeMin} - {restaurant.priceRangeMax}</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Status */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">สถานะ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${restaurant.isOpen
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                <Clock className="w-3 h-3 mr-1" />
                                                {restaurant.isOpen ? 'เปิดอยู่' : 'ปิดแล้ว'}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {restaurant.openTime} - {restaurant.closeTime} น.
                                            </p>
                                        </td>
                                    ))}
                                </tr>

                                {/* Distance */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ระยะทาง</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">{restaurant.distance} กม.</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Contact */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">โทรศัพท์</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">{restaurant.phone}</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Services Section Header */}
                                <tr>
                                    <td colSpan={restaurants.length + 1} className="pt-8 pb-2 pl-4 bg-gray-50">
                                        <h3 className="font-semibold text-lg text-gray-800">บริการและสิ่งอำนวยความสะดวก</h3>
                                    </td>
                                </tr>

                                {/* Reservation */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">รับจองโต๊ะ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {hasService(restaurant, 'accept_reservation') ? (
                                                <div className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="ml-2 text-green-700 font-medium">มี</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <X className="w-5 h-5 text-red-500" />
                                                    <span className="ml-2 text-red-700">ไม่มี</span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* WiFi */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">WiFi ฟรี</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {hasService(restaurant, 'wifi') ? (
                                                <div className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="ml-2 text-green-700 font-medium">มี</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <X className="w-5 h-5 text-red-500" />
                                                    <span className="ml-2 text-red-700">ไม่มี</span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Parking */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ที่จอดรถ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {hasService(restaurant, 'parking') ? (
                                                <div className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="ml-2 text-green-700 font-medium">มี</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <X className="w-5 h-5 text-red-500" />
                                                    <span className="ml-2 text-red-700">ไม่มี</span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Credit Card */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">รับบัตรเครดิต</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {hasService(restaurant, 'credit_card') ? (
                                                <div className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="ml-2 text-green-700 font-medium">มี</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <X className="w-5 h-5 text-red-500" />
                                                    <span className="ml-2 text-red-700">ไม่มี</span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Lifestyle Section Header */}
                                <tr>
                                    <td colSpan={restaurants.length + 1} className="pt-8 pb-2 pl-4 bg-gray-50">
                                        <h3 className="font-semibold text-lg text-gray-800">ไลฟ์สไตล์และบรรยากาศ</h3>
                                    </td>
                                </tr>

                                {/* Lifestyle */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ไลฟ์สไตล์</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {restaurant.lifestyles.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {restaurant.lifestyles.map((lifestyle, index) => (
                                                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            {getLifestyleLabel(lifestyle.lifestyleType)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Location Style */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">บรรยากาศ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {restaurant.locationStyles.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {restaurant.locationStyles.map((location, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {getLocationLabel(location.locationType)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Popular Dishes */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">เมนูแนะนำ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4">
                                            <div className="text-sm space-y-1">
                                                {restaurant.popularDishes.map((dish, index) => (
                                                    <div key={index} className="bg-gray-50 px-2 py-1 rounded text-center">
                                                        {dish}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Address */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ที่อยู่</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4">
                                            <p className="text-sm text-gray-600 text-center">
                                                {restaurant.address}
                                            </p>
                                        </td>
                                    ))}
                                </tr>

                                {/*Detail*/}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">หน้าร้าน</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center align-middle">
                                            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                                                ดูหน้าร้าน {restaurant.name}
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">สรุปการเปรียบเทียบ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">คะแนนสูงสุด</h4>
                            <p className="text-green-700">
                                {restaurants.find(r => r.rating === Math.max(...restaurants.map(r => r.rating)))?.name}
                                <span className="block text-sm">({Math.max(...restaurants.map(r => r.rating))} ดาว)</span>
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">ราคาประหยัด</h4>
                            <p className="text-blue-700">
                                {restaurants.find(r => r.priceRangeMin === Math.min(...restaurants.map(r => r.priceRangeMin)))?.name}
                                <span className="block text-sm">(เริ่มต้น ฿{Math.min(...restaurants.map(r => r.priceRangeMin))})</span>
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-800 mb-2">ใกล้ที่สุด</h4>
                            <p className="text-purple-700">
                                {restaurants.find(r => r.distance === Math.min(...restaurants.map(r => r.distance)))?.name}
                                <span className="block text-sm">({Math.min(...restaurants.map(r => r.distance))} กม.)</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCompare;