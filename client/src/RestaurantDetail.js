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
  Waves,
  Heart,
  ChevronLeft,
  ChevronRight,
  Leaf
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import RestaurantMap from './component/RestaurantMap';
import bannerBg from './assets/bg/Banner.png';

// Map payment option label or id to icon component
const getPaymentIcon = (labelOrId) => {
  switch (labelOrId) {
    case 'รับบัตรเครดิต':
    case 'accepts_credit_card':
      return <CreditCard className="w-4 h-4" />;
    case 'รับชำระผ่านธนาคาร':
    case 'accepts_bank_payment':
      return <DollarSign className="w-4 h-4" />;
    default:
      return <DollarSign className="w-4 h-4" />;
  }
};

// Map service option label or id to icon component
const getServiceOptionIcon = (labelOrId) => {
  switch (labelOrId) {
    case 'รับการจอง':
    case 'accepts_reservation':
      return <Calendar className="w-4 h-4" />;
    default:
      return <Users className="w-4 h-4" />;
  }
};

// Map location style label or id to icon component
const getLocationStyleIcon = (labelOrId) => {
  switch (labelOrId) {
    case 'ในเมือง':
    case 'in_city':
      return <MapPin className="w-4 h-4" />;
    case 'วิวทะเล':
    case 'sea_view':
      return <Waves className="w-4 h-4" />;
    case 'สไตล์ธรรมชาติ':
    case 'ธรรมชาติ':
    case 'natural_style':
      return <Leaf className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

// Map lifestyle label or id to icon component
const getLifestyleIcon = (labelOrId) => {
  switch (labelOrId) {
    case 'ฮาลาล':
    case 'halal':
      return <Heart className="w-4 h-4 text-green-600" />;
    case 'มังสวิรัติ/วีแกน':
    case 'vegan_option':
      return <Leaf className="w-4 h-4 text-green-600" />;
    default:
      return <Users className="w-4 h-4" />;
  }
};

// Map facility label or id to icon component
const getFacilityIcon = (labelOrId) => {
  switch (labelOrId) {
    case 'parking_space':
    case 'ที่จอดรถ':
      return <Car className="w-4 h-4" />;
    case 'wifi_available':
    case 'มี Wi-Fi':
      return <Wifi className="w-4 h-4" />;
    case 'work_space_available':
    case 'พื้นที่ทำงาน':
      return <Users className="w-4 h-4" />;
    case 'pet_friendly':
    case 'เป็นมิตรกับสัตว์เลี้ยง':
      return <Heart className="w-4 h-4" />;
    case 'kids_area':
    case 'โซนสำหรับเด็ก':
      return <Users className="w-4 h-4" />;
    default:
      return <Users className="w-4 h-4" />;
  }
};
const facilityLabelTH = (id) => ({
  parking_space: 'ที่จอดรถ',
  wifi_available: 'มี Wi-Fi',
  work_space_available: 'พื้นที่ทำงาน',
  pet_friendly: 'เป็นมิตรกับสัตว์เลี้ยง',
  kids_area: 'โซนสำหรับเด็ก',
}[id] || id);

const paymentLabelTH = (id) => ({
  accepts_bank_payment: 'รับชำระผ่านธนาคาร',
  accepts_credit_card: 'รับบัตรเครดิต',
}[id] || id);

const serviceLabelTH = (id) => ({
  accepts_reservation: 'รับการจอง',
}[id] || id);

const locationStyleLabelTH = (id) => ({
  in_city: 'ในเมือง',
  sea_view: 'วิวทะเล',
  natural_style: 'สไตล์ธรรมชาติ',
}[id] || id);

const lifestyleLabelTH = (id) => ({
  halal: 'ฮาลาล',
  vegan_option: 'มังสวิรัติ/วีแกน',
}[id] || id);

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
    const token = localStorage.getItem('token');
    axios.patch(`http://localhost:3001/api/restaurants/${restaurantId}/view`)
      .then(res => {
        if (res.data?.viewCount !== undefined) {
          setRestaurant(prev => ({ ...(prev || {}), viewCount: res.data.viewCount }));
        }
      })
      .catch(err => {
        console.debug('Failed to increment viewCount', err?.message || err);
      });
    axios
      .get(
        `http://localhost:3001/api/restaurants/${restaurantId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      )
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        // 🧩 ฟังก์ชันปลด JSON ซ้อน (parse สูงสุด 2 รอบ)
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

        // 🧩 normalize รูปภาพ
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

        // 🧩 normalize array id ทั่วไป
        const normalizeArray = (val) => {
          return toArray(val)
            .map((x) => {
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
            })
            .filter(Boolean);
        };

        const restaurantObj = {
          ...data,
          photos: normalizePhotos(data.photos),
          facilities: normalizeArray(data.facilities),
          paymentOptions: normalizeArray(data.paymentOptions),
          serviceOptions: normalizeArray(data.serviceOptions),
          locationStyles: normalizeArray(data.locationStyles),
          lifestyles: normalizeArray(data.lifestyles),
          menuHighlights: normalizeArray(data.menuHighlights),
          reviews: normalizeArray(data.reviews),
        };

        setRestaurant(restaurantObj);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching restaurant:", err);
        setError("ไม่พบข้อมูลร้านอาหาร");
        setLoading(false);
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

  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  //ดึงค่าเฉลี่ยรีวิวหลังจากโหลดข้อมูลร้านเสร็จ
  useEffect(() => {
    if (!restaurant || !restaurantId) return;
    axios
      .get(`http://localhost:3001/api/reviews/${restaurantId}/summary`)
      .then((res) => {
        setRestaurant((prev) => ({
          ...prev,
          rating: res.data.average,
          reviewCount: res.data.count,
        }));
      })
      .catch((err) => console.error("Error fetching review summary:", err));
  }, [restaurantId, restaurant]);

  //อัปเดตเฉลี่ยใหม่เมื่อมีการเพิ่มรีวิว
  useEffect(() => {
    if (reviews.length > 0) {
      axios.get(`http://localhost:3001/api/reviews/${restaurantId}/summary`)
        .then(res => {
          setRestaurant(prev => ({
            ...prev,
            rating: res.data.average,
            reviewCount: res.data.count
          }));
        })
        .catch(err => console.error("Error fetching review summary:", err));
    }
  }, [reviews]);

  //ดึงรีวิวเมื่อเปิดแท็บ reviews
  useEffect(() => {
    if (activeTab === "reviews") {
      axios
        .get(`http://localhost:3001/api/reviews/${restaurantId}`)
        .then((res) => setReviews(res.data))
        .catch((err) => console.error("Error fetching reviews:", err));
    }
  }, [activeTab, restaurantId]);

  // ฟังก์ชันส่งรีวิว
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axios.post("http://localhost:3001/api/reviews", {
        restaurantId,
        name,
        email,
        rating,
        comment,
      });
      setSubmitting(false);
      // อัปเดตหน้าทันที (Realtime)
      setReviews((prev) => [res.data, ...prev]);
      setName("");
      setEmail("");
      setRating(0);
      setComment("");
      setShowReviewForm(false);
    } catch (err) {
      console.error("Error submitting review:", err);
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
        <div
          className="relative h-96 rounded-2xl overflow-hidden mb-6 shadow-lg flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerBg})` }}
        >
          <img
            src={
              restaurant.photos?.[currentImageIndex]?.url ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
            }
            alt={restaurant.restaurantName}
            className="h-full max-w-full object-contain bg-black/5 transition-transform duration-500 ease-in-out shadow-md"
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
          {Array.isArray(restaurant.photos) && restaurant.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {restaurant.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === currentImageIndex
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50'
                    }`}
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
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                      <Clock className="w-4 h-4" />
                      {restaurant.isOpen
                        ? `เปิดอยู่ (${restaurant.openTime} - ${restaurant.closeTime} น.)`
                        : `ปิด (${restaurant.openTime} - ${restaurant.closeTime} น.)`}
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
                {(restaurant.lifestyles || []).map((l, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium flex items-center gap-1"
                  >
                    {getLifestyleIcon(l)}
                    {lifestyleLabelTH(l)}
                  </span>
                ))}

                {(restaurant.locationStyles || []).map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium flex items-center gap-1"
                  >
                    {getLocationStyleIcon(s)}
                    {locationStyleLabelTH(s)}
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
                        <MapPin className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium">ที่อยู่</p>
                          <p className="text-gray-600 text-sm">{restaurant.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium">โทรศัพท์</p>
                          <p className="text-gray-600 text-sm">{restaurant.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="font-medium">เวลาเปิด-ปิด</p>
                          <p className="text-gray-700 text-sm">
                            {restaurant.openTime || '-'} - {restaurant.closeTime || '-'} น.
                          </p>
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
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">รีวิวจากลูกค้า</h3>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                      >
                        เขียนรีวิว
                      </button>
                    </div>

                    {/* ฟอร์มเพิ่มรีวิว */}
                    {showReviewForm && (
                      <form
                        onSubmit={handleSubmitReview}
                        className="bg-gray-50 p-6 rounded-lg shadow-sm"
                      >
                        <div className="flex space-x-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              onClick={() => setRating(star)}
                              className={`w-6 h-6 cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="ชื่อ"
                          className="w-full mb-3 p-2 border rounded"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        <input
                          type="email"
                          placeholder="อีเมล (ไม่บังคับ)"
                          className="w-full mb-3 p-2 border rounded"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <textarea
                          placeholder="เขียนรีวิว..."
                          className="w-full mb-3 p-2 border rounded"
                          rows="3"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`bg-orange-600 text-white py-2 px-4 rounded-lg ${submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-700"}`}
                        >
                          {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
                        </button>
                      </form>
                    )}
                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <p className="text-gray-500 text-center">ยังไม่มีรีวิว</p>
                      ) : (
                        <>
                          {(showAllReviews ? reviews : reviews.slice(0, 2)).map((r) => (
                            <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{r.name}</h4>
                                  {r.email && <p className="text-sm text-gray-500">{r.email}</p>}
                                  <p className="text-sm text-gray-500">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < r.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700">{r.comment}</p>
                            </div>
                          ))}

                          {/* ปุ่มแสดง/ซ่อนรีวิวเพิ่มเติม */}
                          {reviews.length > 2 && (
                            <div className="text-center mt-4">
                              <button
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="text-orange-600 font-medium hover:underline"
                              >
                                {showAllReviews ? "ซ่อนรีวิว" : "ดูรีวิวทั้งหมด"}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">สิ่งอำนวยความสะดวก</h3>
              <div className="space-y-3">
                {(restaurant.facilities || []).map((f, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    {getFacilityIcon(f)}
                    <span className="text-gray-700">{facilityLabelTH(f)}</span>
                  </div>
                ))}
                {(restaurant.paymentOptions || []).map((p, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    {getPaymentIcon(p)}
                    <span className="text-gray-700">{paymentLabelTH(p)}</span>
                  </div>
                ))}
                {(restaurant.serviceOptions || []).map((s, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    {getServiceOptionIcon(s)}
                    <span className="text-gray-700">{serviceLabelTH(s)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Actions */}
            {Array.isArray(restaurant.serviceOptions) && restaurant.serviceOptions.includes('accepts_reservation') && (
              <div>
                {restaurant.isBookingOpen ? (
                  <Link
                    to={`/ResBooking/${restaurantId}`}
                    className="block w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-800 transition-colors font-medium text-center"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    จองโต๊ะ
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed font-medium text-center"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    ปิดการจองในขณะนี้
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;