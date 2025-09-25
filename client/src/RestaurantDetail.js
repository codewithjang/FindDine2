import React, { useState, useEffect } from 'react';
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
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import RestaurantMap from './component/RestaurantMap';

const RestaurantDetail = (props) => {
  const { id } = useParams();
  const restaurantId = id;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // ดึงข้อมูลร้านอาหารจาก backend ตาม restaurantId
  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    axios.get(`http://localhost:3001/api/restaurants/${restaurantId}`)
      .then(res => {
        const r = res.data;
        setRestaurant({
          ...r,
          photos: Array.isArray(r.photos) ? r.photos : (r.photos ? JSON.parse(r.photos) : []),
          lifestyles: Array.isArray(r.lifestyles) ? r.lifestyles : (r.lifestyles ? JSON.parse(r.lifestyles) : []),
          locationStyles: Array.isArray(r.locationStyles) ? r.locationStyles : (r.locationStyles ? JSON.parse(r.locationStyles) : []),
          serviceOptions: Array.isArray(r.serviceOptions) ? r.serviceOptions : (r.serviceOptions ? JSON.parse(r.serviceOptions) : []),
          facilities: Array.isArray(r.facilities) ? r.facilities : (r.facilities ? JSON.parse(r.facilities) : []),
          paymentOptions: Array.isArray(r.paymentOptions) ? r.paymentOptions : (r.paymentOptions ? JSON.parse(r.paymentOptions) : []),
          menuHighlights: Array.isArray(r.menuHighlights) ? r.menuHighlights : (r.menuHighlights ? JSON.parse(r.menuHighlights) : []),
          reviews: Array.isArray(r.reviews) ? r.reviews : (r.reviews ? JSON.parse(r.reviews) : []),
        });
        setLoading(false);
      })
      .catch((err) => {
        setRestaurant(null);
        setLoading(false);
        setError('ไม่พบข้อมูลร้านอาหาร');
        console.error('RestaurantDetail: API error', err);
      });
  }, [restaurantId]);

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

  const nextImage = () => {
    if (!restaurant || !restaurant.photos || restaurant.photos.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === restaurant.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!restaurant || !restaurant.photos || restaurant.photos.length === 0) return;
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

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        ไม่พบรหัสร้านอาหาร (URL param ไม่ถูกต้อง)
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        กำลังโหลดข้อมูลร้านอาหาร...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        ไม่พบข้อมูลร้านอาหาร
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
          <img
            src={restaurant.photos && restaurant.photos.length > 0 ? (restaurant.photos[0].photoUrl || restaurant.photos[0].url) : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
            alt={restaurant.restaurantName}
            className="w-full h-full object-cover"
          />

          {/* Navigation Arrows */}
          {restaurant.photos && restaurant.photos.length > 1 && (
            <>
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
            </>
          )}

          {/* Image Indicators */}
          {restaurant.photos && restaurant.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {restaurant.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Restaurant Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.restaurantName}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3">{restaurant.foodType}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(restaurant.rating)}
                      <span className="font-medium">{restaurant.rating}</span>
                      <span className="text-gray-500">({restaurant.reviewCount} รีวิว)</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <Clock className="w-4 h-4 inline mr-1" />
                      {restaurant.isOpen ? `เปิดอยู่ • ปิด ${restaurant.closeTime} น.` : 'ปิดแล้ว'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-orange-600 text-lg font-bold">
                    <span>฿ {restaurant.priceRange}</span>
                  </div>
                </div>
              </div>

              {/* Special Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.lifestyles && restaurant.lifestyles.includes && restaurant.lifestyles.includes('halal') && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    Halal
                  </span>
                )}
                {restaurant.locationStyles && restaurant.locationStyles.map && restaurant.locationStyles.map((location, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                    {location === 'sea_view' ? 'วิวทะเล' : location === 'in_city' ? 'ในเมือง' : location === 'natural_style' ? 'ธรรมชาติ' : location}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>

              {/* แผนที่ร้านอาหาร */}
              {restaurant.latitude && restaurant.longitude && (
                <div className="my-6">
                  <RestaurantMap
                    latitude={Number(restaurant.latitude)}
                    longitude={Number(restaurant.longitude)}
                    name={restaurant.restaurantName}
                  />
                </div>
              )}
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
                      {restaurant.menuHighlights && restaurant.menuHighlights.map && restaurant.menuHighlights.map((menu, index) => (
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
                      {restaurant.reviews && restaurant.reviews.map && restaurant.reviews.map((review, idx) => (
                        <div key={review.id || idx} className="border-b pb-4">
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
                {restaurant.serviceOptions && restaurant.serviceOptions.map && restaurant.serviceOptions.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {getServiceIcon(service)}
                    <span className="text-gray-700">{getServiceLabel(service)}</span>
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
                  to="/ResBooking"
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