import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import bg from '../assets/bg/bgMainRes.png';
import {
    Bell,
    Calendar,
    Users,
    TrendingUp,
    Star,
    MapPin,
    Phone,
    Mail,
    Wifi,
    Heart,
    CreditCard,
    Clock,
    Eye,
    Edit,
    Camera,
    Settings,
    BarChart3,
    MessageSquare,
    DollarSign,
    Plus,
    Image,
    FileText,
    Send,
    ThumbsUp,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Car,
    Tag,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
export default function RestaurantDashboard() {
    const { id } = useParams();
    const restaurantId = id;
    const [activeTab, setActiveTab] = useState('overview');
    const [showPostModal, setShowPostModal] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [postType, setPostType] = useState('general'); // general, menu, promotion
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Mock data สำหรับโพสต์
    const [posts, setPosts] = useState([
        {
            id: 1,
            content: "โปรโมชั่นพิเศษ! ลด 20% ทุกเมนูซีฟู้ดวันนี้",
            type: "promotion",
            timestamp: "1 ชม. ที่แล้ว",
            isPromoted: true,
            images: [],
            likes: 15,
            comments: 3,
            shares: 2
        },
        {
            id: 2,
            content: "เมนูใหม่! ข้าวผัดปูทะเล",
            type: "menu",
            timestamp: "2 ชม. ที่แล้ว",
            isPromoted: false,
            images: [],
            likes: 8,
            comments: 1,
            shares: 0
        },
        {
            id: 3,
            content: "ขอบคุณลูกค้าทุกท่านที่มาอุดหนุน",
            type: "general",
            timestamp: "3 ชม. ที่แล้ว",
            isPromoted: false,
            images: [],
            likes: 5,
            comments: 0,
            shares: 1
        }
    ]);

    // ฟังก์ชันสร้างโพสต์ใหม่
    const handleCreatePost = () => {
        const newPost = {
            id: posts.length + 1,
            content: postContent,
            type: postType,
            timestamp: "ขณะนี้",
            isPromoted: postType === "promotion",
            images: [], // สามารถเพิ่ม logic สำหรับรูปภาพได้ภายหลัง
            likes: 0,
            comments: 0,
            shares: 0
        };
        setPosts([newPost, ...posts]);
        setShowPostModal(false);
        setPostContent("");
        setPostType("general");
    };
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab2, setActiveTab2] = useState('overview');

    // ดึงข้อมูลร้านอาหารจาก backend ทุกครั้งที่ component mount
    const [restaurant, setRestaurant] = useState(null);
    useEffect(() => {
        if (!restaurantId) {
            console.log('No restaurantId found');
            return;
        }
        console.log('Fetching restaurantId:', restaurantId);
        setLoading(true);
        setError(null);
        axios.get(`http://localhost:3001/api/restaurants/${restaurantId}`)
            .then(res => {
                // Ensure all array fields are always arrays
                const data = res.data;
                const restaurantObj = {
                    ...data,
                    photos: Array.isArray(data.photos) ? data.photos : (data.photos ? JSON.parse(data.photos) : []),
                    lifestyles: Array.isArray(data.lifestyles) ? data.lifestyles : (data.lifestyles ? JSON.parse(data.lifestyles) : []),
                    locationStyles: Array.isArray(data.locationStyles) ? data.locationStyles : (data.locationStyles ? JSON.parse(data.locationStyles) : []),
                    serviceOptions: Array.isArray(data.serviceOptions) ? data.serviceOptions : (data.serviceOptions ? JSON.parse(data.serviceOptions) : []),
                    menuHighlights: Array.isArray(data.menuHighlights) ? data.menuHighlights : (data.menuHighlights ? JSON.parse(data.menuHighlights) : []),
                    reviews: Array.isArray(data.reviews) ? data.reviews : (data.reviews ? JSON.parse(data.reviews) : []),
                    facilities: Array.isArray(data.facilities) ? data.facilities : (data.facilities ? JSON.parse(data.facilities) : []),
                };
                setRestaurant(restaurantObj);
                console.log('Restaurant data from backend:', restaurantObj);
            })
            .catch((err) => {
                console.error('Error fetching restaurant:', err);
                // fallback mock data
                setRestaurant({
                    id: 1,
                    restaurantName: "Pantai Seaview Halal Restaurant",
                    foodType: "thai",
                    priceRange: 101,
                    rating: 4.5,
                    reviewCount: 324,
                    isOpen: true,
                    openTime: "10:00",
                    closeTime: "22:00",
                    phone: "0826416624, 0966514554",
                    address: "322/3,324/2, พระบารมี ป่าตอง กะทู้ ภูเก็ต ภูเก็ต",
                    description: "ร้านอาหารฮาลาล ไม่มีแอลกอฮอล์ มีอาหารหลากหลาย อาหารไทย อาหารซีฟู้ด และอาหารยุโรป รสชาติอร่อย ราคาเหมาะสม บรรยากาศดีมาก ติดทะเล เหมาะสำหรับทุกคน",
                    photos: [{ photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800", isPrimary: true }],
                    lifestyles: [{ lifestyleType: "halal" }],
                    locationStyles: [{ locationType: "sea_view" }],
                    serviceOptions: [{ serviceType: "accept_reservation" }, { serviceType: "wifi" }],
                    menuHighlights: [],
                    reviews: [],
                    facilities: ["wifi_available", "pet_friendly"],
                });
            });
    }, []);

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

    // Facility icon and label mapping
    const getFacilityIcon = (facilityType) => {
        switch (facilityType) {
            case 'wifi_available': return <Wifi className="w-4 h-4" />;
            case 'pet_friendly': return <Heart className="w-4 h-4" />;
            case 'parking': return <Car className="w-4 h-4" />;
            case 'credit_card': return <CreditCard className="w-4 h-4" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    const getFacilityLabel = (facilityType) => {
        switch (facilityType) {
            case 'wifi_available': return 'WiFi ฟรี';
            case 'pet_friendly': return 'นำสัตว์เลี้ยงเข้าได้';
            case 'parking': return 'ที่จอดรถ';
            case 'credit_card': return 'รับบัตรเครดิต';
            default: return facilityType;
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

    // ข้อมูลสถิติ (mock data)
    const stats = [
        { label: 'จองทั้งหมด', value: '12', icon: Calendar, color: 'text-orange-500' },
        { label: 'รีวิวทั้งหมด', value: '8', icon: Star, color: 'text-orange-500' },
        { label: 'ผู้เข้าชมโปรไฟล์', value: '324', icon: Eye, color: 'text-orange-500' },
        { label: 'โพสต์ทั้งหมด', value: '47', icon: MessageSquare, color: 'text-orange-500' }
    ];

    const recentBookings = [
        { id: 1, customer: 'คุณสมชาย', time: '19:00', guests: 4, status: 'confirmed' },
        { id: 2, customer: 'คุณมาลี', time: '20:30', guests: 2, status: 'pending' },
        { id: 3, customer: 'คุณจอห์น', time: '18:00', guests: 6, status: 'confirmed' }
    ];

    const recentReviews = [
        { id: 1, customer: 'คุณสุชาติ', rating: 5, comment: 'อาหารอร่อยมาก บรรยากاศดี วิวทะเลสวย', time: '2 ชม. ที่แล้ว' },
        { id: 2, customer: 'Ms. Sarah', rating: 4, comment: 'Great halal food with amazing sea view!', time: '5 ชม. ที่แล้ว' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
            {/* Header */}
            <header className="bg-white shadow-md w-full relative flex h-[120px] sm:h-[200px] md:h-[240px]">
                <div className="absolute inset-0">
                    <img
                        src={bg}
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 md:opacity-90 z-0"
                    />
                    {/* Content */}
                    <div className="relative flex flex-col justify-center items-start h-full px-4 sm:px-8 md:px-20">
                        <h3 className="text-lg sm:text-xl md:text-3xl font-bold drop-shadow-md text-orange-600">
                            ยินดีต้อนรับ {restaurant ? restaurant.restaurantName : ''}
                        </h3>
                        <p className="text-base md:text-lg opacity-90 drop-shadow-sm">
                            สู่ FindDine Dashboard
                        </p>
                    </div>
                </div>
            </header>
            {/* Navigation Tabs */}
            <nav className="bg-white shadow-md pt-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'ภาพรวม', icon: BarChart3 },
                            { id: 'posts', label: 'โพสต์', icon: FileText },
                            { id: 'bookings', label: 'การจอง', icon: Calendar },
                            { id: 'reviews', label: 'รีวิว', icon: MessageSquare },
                            { id: 'profile', label: 'โปรไฟล์', icon: Edit }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="relative bg-gradient-to-tr from-orange-100 to-orange-200 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-300 overflow-hidden"
                                >
                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -mr-10 -mt-10 opacity-50"></div>
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full -mr-10 -mt-10 opacity-50"></div>

                                    {/* Content */}
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium text-orange-800 mb-2">{stat.label}</p>
                                            <stat.icon className={`w-10 h-10 ${stat.color}`} />
                                        </div>
                                        <p className="text-3xl font-bold text-gray-700">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activities */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Bookings */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">การจองล่าสุด</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentBookings.map((booking) => (
                                            <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{booking.customer}</p>
                                                        <p className="text-sm text-gray-500">{booking.time} • {booking.guests} ท่าน</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Reviews */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">รีวิวล่าสุด</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentReviews.map((review) => (
                                            <div key={review.id} className="py-3 border-b border-gray-100 last:border-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-medium text-gray-900">{review.customer}</p>
                                                    <div className="flex items-center space-x-1">
                                                        {[...Array(review.rating)].map((_, i) => (
                                                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                                                <p className="text-xs text-gray-400">{review.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="space-y-6">
                        {/* Create Post Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">สร้างโพสต์ใหม่</h3>
                                <button
                                    onClick={() => setShowPostModal(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>โพสต์ใหม่</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <FileText className="w-4 h-4" />
                                    <span>โพสต์ทั่วไป</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Image className="w-4 h-4" />
                                    <span>เมนูอาหาร</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Tag className="w-4 h-4" />
                                    <span>โปรโมชั่น</span>
                                </div>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    {/* Post Header */}
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">P</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{restaurant ? restaurant.restaurantName : ''}</h4>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-500">{post.timestamp}</span>
                                                        {post.isPromoted && (
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                                                โปรโมท
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${post.type === 'menu' ? 'bg-blue-100 text-blue-800' :
                                                            post.type === 'promotion' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {post.type === 'menu' ? 'เมนู' : post.type === 'promotion' ? 'โปรโมชั่น' : 'ทั่วไป'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-6 py-4">
                                        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>

                                        {/* Post Images */}
                                        {post.images && post.images.length > 0 && (
                                            <div className="mt-4">
                                                <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' :
                                                    post.images.length === 2 ? 'grid-cols-2' :
                                                        'grid-cols-2'
                                                    }`}>
                                                    {post.images.map((image, index) => (
                                                        <div key={index} className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                                                            <Camera className="w-12 h-12 text-gray-400" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Post Actions */}
                                    <div className="px-6 py-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                            <span>{post.likes} คนถูกใจ</span>
                                            <div className="flex items-center space-x-4">
                                                <span>{post.comments} ความคิดเห็น</span>
                                                <span>{post.shares} แชร์</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-around border-t border-gray-100 pt-3">
                                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>ถูกใจ</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                                <MessageCircle className="w-4 h-4" />
                                                <span>แสดงความคิดเห็น</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                                <Share2 className="w-4 h-4" />
                                                <span>แชร์</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Post Modal */}
                {showPostModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">สร้างโพสต์ใหม่</h3>
                                    <button
                                        onClick={() => setShowPostModal(false)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <span className="sr-only">ปิด</span>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Post Type Selection */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทโพสต์</label>
                                    <div className="flex space-x-4">
                                        {[
                                            { value: 'general', label: 'ทั่วไป', icon: FileText },
                                            { value: 'menu', label: 'เมนูอาหาร', icon: Image },
                                            { value: 'promotion', label: 'โปรโมชั่น', icon: Tag }
                                        ].map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => setPostType(type.value)}
                                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${postType === type.value
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <type.icon className="w-4 h-4" />
                                                <span>{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Post Content */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">เนื้อหาโพสต์</label>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder="เขียนเนื้อหาโพสต์ของคุณ..."
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Media Upload */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพ</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">คลิกเพื่อเพิ่มรูปภาพ หรือลากไฟล์มาวาง</p>
                                        <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowPostModal(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={!postContent.trim()}
                                        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>โพสต์</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <>
                        {restaurant ? (
                            <div className="space-y-6">
                                {/* Restaurant Profile */}
                                <div className="max-w-7xl mx-auto px-4 py-2">
                                    {/* Image Gallery */}
                                    <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
                                        <img
                                            src={restaurant.photos && restaurant.photos[currentImageIndex]?.photoUrl}
                                            alt={restaurant.restaurantName}
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
                                            {restaurant.photos && restaurant.photos.map((_, index) => (
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
                                                            {restaurant.restaurantName}
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
                                                            <span>฿ {restaurant.priceRange}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Special Tags */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {restaurant.lifestyles && restaurant.lifestyles.map((lifestyle, index) => (
                                                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                                            Halal
                                                        </span>
                                                    ))}
                                                    {restaurant.locationStyles && restaurant.locationStyles.map((location, index) => (
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
                                                    {activeTab2 === 'overview' && (
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
                                                    {activeTab2 === 'menu' && (
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">เมนูแนะนำ</h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {restaurant.menuHighlights && restaurant.menuHighlights.map((menu, index) => (
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
                                                    {activeTab2 === 'reviews' && (
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-4">รีวิวจากลูกค้า</h3>
                                                            <div className="space-y-4">
                                                                {restaurant.reviews && restaurant.reviews.map((review) => (
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
                                                    {restaurant.facilities && restaurant.facilities.map((facility, index) => (
                                                        <div key={index} className="flex items-center space-x-3">
                                                            {getFacilityIcon(facility)}
                                                            <span className="text-gray-700">{getFacilityLabel(facility)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">กำลังโหลดข้อมูลร้านอาหาร...</div>
                        )}
                    </>
                )}
            </main>
        </div >
    );
}