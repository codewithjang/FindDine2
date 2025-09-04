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
  Share,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RestaurantDetail = ({ restaurantId, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - ในระบบจริงจะดึงจาก API ตาม restaurantId
  const restaurant = {
    id: 1,
    name: "ร้านอาหารทะเลสด",
    foodType: "อาหารทะเล",
    priceRangeMin: 150,
    priceRangeMax: 500,
    rating: 4.5,
    reviewCount: 324,
    isOpen: true,
    openTime: "10:00",
    closeTime: "22:00",
    phone: "077-123456",
    address: "123 หาดบางนางรม ต.ตะกั่วป่า อ.ตะกั่วป่า จ.พังงา 82110",
    description: "ร้านอาหารทะเลสดใหม่ วิวทะเลสวยงาม บรรยากาศดี เหมาะสำหรับครอบครัวและคู่รัก ปลาทุกตัวจับสดใหม่ทุกวัน",
    photos: [
      { photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", isPrimary: true },
      { photoUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800" },
      { photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800" },
      { photoUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800" }
    ],
    lifestyles: [{ lifestyleType: "halal" }],
    locationStyles: [{ locationType: "sea_view" }],
    serviceOptions: [
      { serviceType: "accept_reservation" },
      { serviceType: "wifi" },
      { serviceType: "parking" },
      { serviceType: "credit_card" }
    ],
    menuHighlights: [
      { name: "ปลากะพงนึ่งมะนาว", price: 280, image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300" },
      { name: "กุ้งเผาเกลือ", price: 350, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300" },
      { name: "ปูผัดผงกะหรี่", price: 420, image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=300" },
      { name: "ยำทะเลรวม", price: 180, image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300" }
    ],
    reviews: [
      {
        id: 1,
        userName: "สมชาย ใจดี",
        rating: 5,
        comment: "อาหารอร่อยมาก บรรยากาศดี วิวสวย แนะนำเลยครับ",
        date: "2024-01-15",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
      },
      {
        id: 2,
        userName: "แสงดาว รักทะเล",
        rating: 4,
        comment: "ปลาสดมาก แต่รอนานหน่อย โดยรวมดีครับ",
        date: "2024-01-10",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
      }
    ]
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
      />
    ));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === restaurant.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? restaurant.photos.length - 1 : prev - 1
    );
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'accept_reservation': return <Calendar className="w-4 h-4" />;
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'credit_card': return <CreditCard className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getServiceLabel = (serviceType) => {
    switch (serviceType) {
      case 'accept_reservation': return 'รับจองโต๊ะ';
      case 'wifi': return 'WiFi ฟรี';
      case 'parking': return 'ที่จอดรถ';
      case 'credit_card': return 'รับบัตรเครดิต';
      default: return serviceType;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
          <img
            src={restaurant.photos[currentImageIndex]?.photoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Image Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {restaurant.photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Restaurant Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">{restaurant.foodType}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(restaurant.rating)}
                      <span className="font-medium">{restaurant.rating}</span>
                      <span className="text-gray-500">({restaurant.reviewCount} รีวิว)</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {restaurant.isOpen ? `เปิดอยู่ • ปิด ${restaurant.closeTime} น.` : 'ปิดแล้ว'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-orange-600 text-lg font-bold">
                    {/* <DollarSign className="w-5 h-5" /> */}
                    <span>฿ {restaurant.priceRangeMin} - {restaurant.priceRangeMax}</span>
                  </div>
                </div>
              </div>

              {/* Special Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.lifestyles.map((lifestyle, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    Halal
                  </span>
                ))}
                {restaurant.locationStyles.map((location, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    วิวทะเล
                  </span>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="border-b">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'ภาพรวม' },
                    { id: 'menu', label: 'เมนูแนะนำ' },
                    { id: 'reviews', label: 'รีวิว' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 font-medium border-b-2 ${activeTab === tab.id
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">ข้อมูลร้าน</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">ที่อยู่</p>
                          <p className="text-gray-600 text-sm">{restaurant.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">โทรศัพท์</p>
                          <p className="text-gray-600 text-sm">{restaurant.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">เวลาเปิด-ปิด</p>
                          <p className="text-gray-600 text-sm">{restaurant.openTime} - {restaurant.closeTime} น.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'menu' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">เมนูแนะนำ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {restaurant.menuHighlights.map((menu, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <img
                            src={menu.image}
                            alt={menu.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{menu.name}</h4>
                            <p className="text-orange-600 font-semibold">฿{menu.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">รีวิวจากลูกค้า</h3>
                    <div className="space-y-4">
                      {restaurant.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={review.avatar}
                              alt={review.userName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{review.userName}</h4>
                                <div className="flex">{renderStars(review.rating)}</div>
                                <span className="text-gray-500 text-sm">{review.date}</span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">สิ่งอำนวยความสะดวก</h3>
              <div className="space-y-3">
                {restaurant.serviceOptions.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {getServiceIcon(service.serviceType)}
                    <span className="text-gray-700">{getServiceLabel(service.serviceType)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">ติดต่อร้าน</h3>
              <div className="space-y-3">
                <button className="w-full bg-orange-300 text-white py-3 rounded-lg hover:bg-orange-400 transition-colors font-medium">
                  <Phone className="w-4 h-4 inline mr-2" />
                  โทรหาร้าน
                </button>

                <button className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  ส่งข้อความ
                </button>

                <Link
                  to="/RestaurantBooking"
                  className="block w-full bg-orange-700 text-white py-3 rounded-lg hover:bg-orange-800 transition-colors font-medium text-center"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  จองโต๊ะ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;