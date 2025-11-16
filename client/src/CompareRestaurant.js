import React, { useState } from 'react';
import {
    Star,
    Clock,
    MapPin,
    Phone,
    X,
    Check,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import bg from './assets/bg/bgCompare.png';
import RestaurantMap from './component/RestaurantMap';

const RestaurantCompare = ({ compareRestaurants, allRestaurants, onBack, onRemoveFromCompare }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    
    // เลือกร้านจาก allRestaurants ที่ตรงกับ compareRestaurants
    const restaurants = allRestaurants.filter(r => compareRestaurants.includes(r.id));

    // ดึงตำแหน่งผู้ใช้จาก Geolocation API
    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log("ไม่สามารถเข้าถึงตำแหน่งผู้ใช้:", error);
                }
            );
        }
    }, []);

    // ฟังก์ชันคำนวณระยะทางโดยใช้สูตร Haversine
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // รัศมีของโลก (กิโลเมตร)
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // ระยะทางเป็นกิโลเมตร
        
        return distance.toFixed(2);
    };

    // ฟังก์ชันดึงระยะทางของร้านอาหาร
    const getRestaurantDistance = (restaurant) => {
        if (!userLocation || !restaurant.latitude || !restaurant.longitude) {
            return "-";
        }
        
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            Number(restaurant.latitude),
            Number(restaurant.longitude)
        );
        
        return `${distance} km`;
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    const hasService = (restaurant, serviceType) => {
        return Array.isArray(restaurant.serviceOptions) && restaurant.serviceOptions.includes(serviceType);
    };

    const hasFacilities = (restaurant, facilityType) => {
        return Array.isArray(restaurant.facilities) && restaurant.facilities.includes(facilityType);
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

    const nextImage = (restaurantId) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        if (!restaurant || !restaurant.photos || restaurant.photos.length === 0) return;
        
        const current = currentImageIndex[restaurantId] || 0;
        setCurrentImageIndex({
            ...currentImageIndex,
            [restaurantId]: current === restaurant.photos.length - 1 ? 0 : current + 1
        });
    };

    const prevImage = (restaurantId) => {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        if (!restaurant || !restaurant.photos || restaurant.photos.length === 0) return;
        
        const current = currentImageIndex[restaurantId] || 0;
        setCurrentImageIndex({
            ...currentImageIndex,
            [restaurantId]: current === 0 ? restaurant.photos.length - 1 : current - 1
        });
    };

    // ฟังก์ชันปลด JSON ซ้อน
    const toArray = (val) => {
        if (val == null) return [];
        let cur = val;

        if (Array.isArray(cur)) return cur;

        for (let i = 0; i < 2; i++) {
            if (Array.isArray(cur)) return cur;
            if (typeof cur === "string") {
                try {
                    const parsed = JSON.parse(cur);
                    cur = parsed;
                    continue;
                } catch {
                    break;
                }
            } else {
                break;
            }
        }

        if (typeof cur === "string") {
            const trimmed = cur.trim();
            const stripped = trimmed.replace(/^\[|\]$/g, "").replace(/"/g, "");
            if (stripped.includes(",")) {
                return stripped.split(",").map((s) => s.trim()).filter(Boolean);
            }
            return trimmed ? [trimmed] : [];
        }

        return Array.isArray(cur) ? cur : cur ? [cur] : [];
    };

    // Normalize รูปภาพ
    const normalizePhotos = (val) => {
        const arr = toArray(val);
        return arr
            .map((item) => {
                if (typeof item === "string") {
                    return { url: item, isPrimary: false };
                }
                if (item && typeof item === "object") {
                    return {
                        url: item.url || item.photoUrl || "",
                        isPrimary: !!item.isPrimary,
                    };
                }
                return null;
            })
            .filter((p) => p && p.url);
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
        <div className="min-h-screen bg-orange-50">
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
                                            <h3 className="font-bold text-lg text-gray-800">{restaurant.restaurantName}</h3>
                                        </td>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {/* Restaurant Photos */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">รูปภาพ</td>
                                    {restaurants.map((restaurant) => {
                                        const photos = normalizePhotos(restaurant.photos);
                                        const currentIdx = currentImageIndex[restaurant.id] || 0;
                                        const currentPhoto = photos?.[currentIdx];
                                        
                                        return (
                                            <td key={restaurant.id} className="p-4 text-center">
                                                {photos && photos.length > 0 ? (
                                                    <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group">
                                                        <img
                                                            src={currentPhoto?.url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"}
                                                            alt={restaurant.restaurantName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        {/* Navigation Arrows */}
                                                        {photos.length > 1 && (
                                                            <>
                                                                <button
                                                                    onClick={() => prevImage(restaurant.id)}
                                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => nextImage(restaurant.id)}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 opacity-0 group-hover:opacity-100 transition"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                                {/* Image Indicators */}
                                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                                                                    {photos.map((_, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            onClick={() => setCurrentImageIndex({ ...currentImageIndex, [restaurant.id]: idx })}
                                                                            className={`w-2 h-2 rounded-full ${idx === currentIdx ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <span className="text-gray-400">ไม่มีรูปภาพ</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ประเภทอาหาร</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <span className="font-medium">{restaurant.foodType ?? "-"}</span>
                                        </td>
                                    ))}
                                </tr>
                                {/* Rating */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">คะแนนรีวิว</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="flex">{renderStars(restaurant.rating)}</div>
                                                <span className="font-medium">{restaurant.rating ?? "-"}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                ({restaurant.reviewCount ?? "-"} รีวิว)
                                            </p>
                                        </td>
                                    ))}
                                </tr>

                                {/* Price Range */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ช่วงราคา</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            <div className="flex items-center justify-center space-x-1 text-orange-600 font-medium">
                                                <span>
                                                    ฿ {restaurant.priceRange ?? "-"}
                                                </span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Status */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">เวลาเปิด - ปิด</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {/* <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${restaurant.isOpen
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                <Clock className="w-3 h-3 mr-1" />
                                                {restaurant.isOpen ? 'เปิดอยู่' : 'ปิดแล้ว'}
                                            </span> */}
                                            <p className="text-sm text-gray-500 mt-1">
                                                {restaurant.openTime ?? "-"} - {restaurant.closeTime ?? "-"} น.
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
                                                <span className="font-medium">
                                                    {getRestaurantDistance(restaurant)}
                                                </span>
                                            </div>
                                            {!userLocation && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    (กำหนดตำแหน่ง)
                                                </p>
                                            )}
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
                                                <span className="text-sm">{restaurant.phone ?? "-"}</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* Services */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">รับจองโต๊ะ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {hasService(restaurant, 'accepts_reservation') ? (
                                                <div className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="ml-2 text-green-700 font-medium">มี</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">WiFi ฟรี</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {hasFacilities(restaurant, 'wifi_available') ? (
                                                <div className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="ml-2 text-green-700 font-medium">มี</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ที่จอดรถ</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {hasFacilities(restaurant, 'parking_space') ? (
                                                <div className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <span className="ml-2 text-green-700 font-medium">มี</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Lifestyle */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ไลฟ์สไตล์</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4 text-center">
                                            {restaurant.lifestyles?.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {restaurant.lifestyles.map((lifestyle, index) => (
                                                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                            {getLifestyleLabel(lifestyle)}
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
                                            {restaurant.locationStyles?.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {restaurant.locationStyles.map((location, index) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {getLocationLabel(location)}
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
                                            {restaurant.popularDishes?.length > 0 ? (
                                                <div className="text-sm space-y-1">
                                                    {restaurant.popularDishes.map((dish, index) => (
                                                        <div key={index} className="bg-gray-50 px-2 py-1 rounded text-center">
                                                            {dish}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Address */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">ที่อยู่</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4">
                                            <p className="text-sm text-gray-600 text-center">
                                                {restaurant.address ?? "-"}
                                            </p>
                                        </td>
                                    ))}
                                </tr>

                                {/* Map */}
                                <tr>
                                    <td className="p-4 font-medium text-gray-700 bg-gray-50">แผนที่</td>
                                    {restaurants.map((restaurant) => (
                                        <td key={restaurant.id} className="p-4">
                                            {restaurant.latitude && restaurant.longitude ? (
                                                <div className="rounded-lg overflow-hidden h-64">
                                                    <RestaurantMap
                                                        latitude={Number(restaurant.latitude)}
                                                        longitude={Number(restaurant.longitude)}
                                                        name={restaurant.restaurantName}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-64 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <span className="text-gray-400">ไม่มีข้อมูลตำแหน่ง</span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCompare;
