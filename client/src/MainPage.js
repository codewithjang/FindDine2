import React, { useState, useEffect } from 'react';
import bg from './assets/bgMain.png';
import {
  MoonStar,
  Calendar,
  MapPin,
  Waves,
  Trees,
  Plus,
  Star,
  Clock,
  DollarSign,
  GitCompare
} from 'lucide-react';
import { Link } from "react-router-dom";
import RestaurantCompare from './RestaurantCompare';

// Mock data for demonstration (ในระบบจริงจะดึงจาก API)
const mockRestaurants = [
  {
    id: 1,
    name: "ร้านอาหารทะเลสด",
    foodTypes: [{ foodType: "seafood" }], // ← array
    priceRangeMin: 150,
    priceRangeMax: 500,
    rating: 4.5,
    isOpen: true,
    distance: 800, // หน่วยเมตร
    photos: [
      {
        photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
        isPrimary: true,
      },
    ],
    lifestyles: [{ lifestyleType: "halal" }],
    locationStyles: [{ locationType: "sea_view" }],
    serviceOptions: [{ serviceType: "accept_reservation" }],
    facilities: [{ facilityType: "parking_space" }, { facilityType: "wifi_available" }],
    paymentOptions: [{ paymentType: "accepts_bank_payment" }, { paymentType: "accepts_credit_card" }],
  },
  {
    id: 2,
    name: "บ้านสวนอาหารไทย",
    foodTypes: [{ foodType: "thai" }],
    priceRangeMin: 80,
    priceRangeMax: 300,
    rating: 4.3,
    isOpen: true,
    distance: 1500,
    photos: [
      {
        photoUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400",
        isPrimary: true,
      },
    ],
    lifestyles: [],
    locationStyles: [{ locationType: "natural_style" }],
    serviceOptions: [],
    facilities: [{ facilityType: "kids_area" }],
    paymentOptions: [{ paymentType: "accepts_bank_payment" }],
  },
  {
    id: 3,
    name: "Urban Café & Bistro",
    foodTypes: [{ foodType: "cafe" }, { foodType: "dessert" }],
    priceRangeMin: 120,
    priceRangeMax: 400,
    rating: 4.7,
    isOpen: false,
    distance: 500,
    photos: [
      {
        photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
        isPrimary: true,
      },
    ],
    lifestyles: [],
    locationStyles: [{ locationType: "in_city" }],
    serviceOptions: [{ serviceType: "accept_reservation" }],
    facilities: [{ facilityType: "wifi_available" }, { facilityType: "work_space_available" }],
    paymentOptions: [{ paymentType: "accepts_credit_card" }],
  },
];


export default function MainPage() {
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [activeFilters, setActiveFilters] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [currentView, setCurrentView] = useState('main'); // 'main', 'detail', 'compare'
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [distance, setDistance] = useState(1000); // ค่า default 1 กม.
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const filters = [
    { id: 'halal', label: 'ฮาลาล', icon: MoonStar },
    { id: 'popular', label: 'ยอดฮิต', icon: Star },
    { id: 'reservation', label: 'จองโต๊ะ', icon: Calendar },
    { id: 'in_city', label: 'ในเมือง', icon: MapPin },
    { id: 'sea_view', label: 'ใกล้ทะเล', icon: Waves },
    { id: 'natural', label: 'ธรรมชาติ', icon: Trees },
    { id: 'more', label: 'เพิ่มเติม', icon: Plus }
  ];

  const handleFilterClick = (filterId) => {
    if (filterId === "more") {
      setShowMoreFilters(true);
      return;
    }
    if (filterId === 'all') {
      setActiveFilters([]);
      setRestaurants(mockRestaurants);
      return;
    }
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter(f => f !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
  };

  useEffect(() => {
    if (activeFilters.length === 0) {
      setRestaurants(mockRestaurants);
      return;
    }
    const filtered = mockRestaurants.filter(restaurant => {
      return activeFilters.every(filterId => {
        switch (filterId) {
          case 'halal':
            return restaurant.lifestyles.some(l => l.lifestyleType === 'halal');
          case 'popular':
            return restaurant.rating >= 4.5;
          case 'reservation':
            return restaurant.serviceOptions.some(s => s.serviceType === 'accept_reservation');
          case 'in_city':
            return restaurant.locationStyles.some(l => l.locationType === 'in_city');
          case 'sea_view':
            return restaurant.locationStyles.some(l => l.locationType === 'sea_view');
          case 'natural':
            return restaurant.locationStyles.some(l => l.locationType === 'natural_style');
          default:
            return true;
        }
      });
    });
    setRestaurants(filtered);
  }, [activeFilters]);

  const applyMoreFilters = () => {
    const filtered = mockRestaurants.filter((restaurant) => {
      let match = true;

      // ระยะทาง
      if (distance && restaurant.distance > distance) match = false;

      // ประเภทอาหาร
      if (selectedFoodTypes.length > 0) {
        match =
          match &&
          restaurant.foodTypes.some((f) => selectedFoodTypes.includes(f.foodType));
      }

      // สิ่งอำนวยความสะดวก
      if (selectedFacilities.length > 0) {
        match =
          match &&
          restaurant.facilities.some((f) =>
            selectedFacilities.includes(f.facilityType)
          );
      }

      // การชำระเงิน
      if (selectedPayments.length > 0) {
        match =
          match &&
          restaurant.paymentOptions.some((p) =>
            selectedPayments.includes(p.paymentType)
          );
      }

      return match;
    });

    setRestaurants(filtered);
    setShowMoreFilters(false);
  };

  // ตัวเลือกเพิ่มเติม
  const foodTypeOptions = [
    { value: "thai", label: "อาหารไทย" },
    { value: "bbq", label: "บาร์บีคิว / ปิ้งย่าง" },
    { value: "seafood", label: "อาหารทะเล" },
    { value: "cafe", label: "ร้านกาแฟ" },
    { value: "dessert", label: "ของหวาน / เบเกอรี่" },
    { value: "chinese", label: "อาหารจีน" },
    { value: "japanese", label: "อาหารญี่ปุ่น" },
    { value: "korean", label: "อาหารเกาหลี" },
    { value: "vietnamese", label: "อาหารเวียดนาม" },
    { value: "indian", label: "อาหารอินเดีย" },
    { value: "malaysian", label: "อาหารมาเลย์" },
    { value: "indonesian", label: "อาหารอินโดนีเซีย" },
    { value: "filipino", label: "อาหารฟิลิปปินส์" },
    { value: "western", label: "อาหารตะวันตก" },
    { value: "italian", label: "อาหารอิตาเลียน" },
    { value: "french", label: "อาหารฝรั่งเศส" },
    { value: "mexican", label: "อาหารแม็กซิกัน" },
    { value: "middle-eastern", label: "อาหารตะวันออกกลาง" },
  ];

  const facilitiesOptions = [
    { id: "parking_space", label: "ที่จอดรถ" },
    { id: "wifi_available", label: "มี Wi-Fi" },
    { id: "work_space_available", label: "พื้นที่ทำงาน" },
    { id: "pet_friendly", label: "เป็นมิตรกับสัตว์เลี้ยง" },
    { id: "kids_area", label: "โซนสำหรับเด็ก" },
  ];

  const paymentOptionsData = [
    { id: "accepts_bank_payment", label: "รับชำระผ่านธนาคาร" },
    { id: "accepts_credit_card", label: "รับบัตรเครดิต" },
  ];

  const handleCompare = (restaurantId) => {
    if (compareList.includes(restaurantId)) {
      setCompareList(compareList.filter(id => id !== restaurantId));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, restaurantId]);
    } else {
      alert('สามารถเปรียบเทียบได้สูงสุด 3 ร้านเท่านั้น');
    }
  };

  const handleRemoveFromCompare = (restaurantId) => {
    setCompareList(compareList.filter(id => id !== restaurantId));
  };

  const handleViewCompare = () => {
    if (compareList.length === 0) {
      alert('กรุณาเลือกร้านที่ต้องการเปรียบเทียบก่อน');
      return;
    }
    setCurrentView('compare');
  };

  if (currentView === 'compare') {
    return (
      <RestaurantCompare
        compareRestaurants={compareList}
        allRestaurants={mockRestaurants}
        onRemoveFromCompare={handleRemoveFromCompare}
      />
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header Section */}
      <div className="w-full relative flex flex-col h-[120px] sm:h-[200px] md:h-[240px]">
        {/* Background image */}
        <img
          src={bg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 md:opacity-90 z-0"
        />

        {/* Content */}
        <div className="relative flex flex-col justify-center items-start flex-grow px-4 sm:px-8 md:px-20">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4 drop-shadow-md">
            ค้นหาร้านอาหารที่ใช่
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 drop-shadow-sm">
            เปรียบเทียบและเลือกร้านอาหารที่ตรงใจคุณ
          </p>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Buttons */}
        <div className="flex justify-center flex-wrap gap-3 mb-4">
          <button
            onClick={() => handleFilterClick("all")}
            className={`px-3 py-1.5 rounded-full font-medium text-sm transition-all ${activeFilters.length === 0
              ? "bg-orange-500 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
              }`}
          >
            ทั้งหมด
          </button>

          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full font-medium text-sm transition-all ${activeFilters.includes(filter.id)
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
                  }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}

          {activeFilters.length >= 2 && (
            <button
              onClick={() => setActiveFilters([])}
              className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-700 ml-2"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Modal เพิ่มเติม */}
        {showMoreFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white shadow-xl w-[90%] max-w-lg flex flex-col">
              {/* Header */}
              <div className="p-4 border-b bg-orange-600 flex justify-center">
                <h2 className="text-lg font-bold text-white">ตัวกรองเพิ่มเติม</h2>
              </div>

              {/* เนื้อหาที่เลื่อนได้ */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* ระยะทาง */}
                <div>
                  <label className="block font-semibold mb-2">ระยะทาง</label>
                  <div className="flex gap-3">
                    {/* ปุ่ม "ใกล้ฉัน" */}
                    <button
                      type="button"
                      onClick={() => setDistance(500)} // สมมติว่า "ใกล้ฉัน" = ไม่เกิน 500 เมตร
                      className={`flex-1 px-4 py-2 rounded-lg border font-medium transition ${distance === 500
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                        }`}
                    >
                      ใกล้ฉัน
                    </button>

                    {/* Select เลือกระยะทาง */}
                    <select
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="flex-1 border rounded-lg px-3 py-2"
                    >
                      <option value={500}>ไม่เกิน 500 เมตร</option>
                      <option value={1000}>ไม่เกิน 1 กิโลเมตร</option>
                      <option value={2000}>ไม่เกิน 2 กิโลเมตร</option>
                      <option value={5000}>ไม่เกิน 5 กิโลเมตร</option>
                      <option value={10000}>ไม่เกิน 10 กิโลเมตร</option>
                    </select>
                  </div>
                </div>

                {/* ประเภทอาหาร */}
                <div>
                  <label className="block font-semibold mb-1">ประเภทอาหาร</label>
                  <div className="grid grid-cols-2 gap-2">
                    {foodTypeOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={selectedFoodTypes.includes(opt.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFoodTypes([...selectedFoodTypes, opt.value]);
                            } else {
                              setSelectedFoodTypes(
                                selectedFoodTypes.filter((v) => v !== opt.value)
                              );
                            }
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* สิ่งอำนวยความสะดวก */}
                <div>
                  <label className="block font-semibold mb-1">สิ่งอำนวยความสะดวก</label>
                  <div className="grid grid-cols-2 gap-2">
                    {facilitiesOptions.map((opt) => (
                      <label key={opt.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={opt.id}
                          checked={selectedFacilities.includes(opt.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFacilities([...selectedFacilities, opt.id]);
                            } else {
                              setSelectedFacilities(
                                selectedFacilities.filter((v) => v !== opt.id)
                              );
                            }
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* การชำระเงิน */}
                <div>
                  <label className="block font-semibold mb-1">การชำระเงิน</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentOptionsData.map((opt) => (
                      <label key={opt.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={opt.id}
                          checked={selectedPayments.includes(opt.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayments([...selectedPayments, opt.id]);
                            } else {
                              setSelectedPayments(
                                selectedPayments.filter((v) => v !== opt.id)
                              );
                            }
                          }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ปุ่ม action */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowMoreFilters(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={applyMoreFilters}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                  >
                    ใช้ตัวกรอง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Compare Bar */}
        {compareList.length > 0 && (
          <div className="mb-6 p-4 bg-orange-100 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  เลือกเปรียบเทียบแล้ว {compareList.length} ร้าน
                </span>
                <div className="flex space-x-2">
                  {compareList.map(id => {
                    const restaurant = mockRestaurants.find(r => r.id === id);
                    return (
                      <span key={id} className="px-2 py-1 bg-orange-200 text-orange-800 text-sm rounded-full">
                        {restaurant?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleViewCompare}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                เปรียบเทียบ
              </button>
            </div>
          </div>
        )}

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Restaurant Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={restaurant.photos[0]?.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${restaurant.isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {restaurant.isOpen ? 'เปิดอยู่' : 'ปิดแล้ว'}
                  </span>
                </div>
                {/* Special Tags */}
                <div className="absolute top-3 right-3 flex flex-col space-y-1">
                  {restaurant.lifestyles.some(l => l.lifestyleType === 'halal') && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      Halal
                    </span>
                  )}
                  {restaurant.serviceOptions.some(s => s.serviceType === 'accept_reservation') && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      จองได้
                    </span>
                  )}
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {renderStars(restaurant.rating)}
                    <span className="text-sm text-gray-600 ml-1">
                      ({restaurant.rating})
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{restaurant.foodType}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-orange-600">
                    {/* <DollarSign className="w-4 h-4" /> */}
                    <span className="font-medium">
                      ฿ {restaurant.priceRangeMin} - {restaurant.priceRangeMax}
                    </span>
                  </div>
                </div>

                {/* Location Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {restaurant.locationStyles.map((location, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {location.locationType === 'in_city' && 'ในเมือง'}
                      {location.locationType === 'sea_view' && 'วิวทะเล'}
                      {location.locationType === 'natural_style' && 'ธรรมชาติ'}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link to={`/RestaurantDetail/${restaurant.id}`} className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                    ดูรายละเอียด
                  </Link>
                  <button
                    onClick={() => handleCompare(restaurant.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${compareList.includes(restaurant.id)
                      ? 'bg-orange-100 text-orange-600 border-2 border-orange-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <GitCompare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              ไม่พบร้านอาหารที่ตรงกับเงื่อนไข
            </h3>
            <p className="text-gray-500">
              ลองเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น
            </p>
          </div>
        )}
      </div>
    </div>
  );
}