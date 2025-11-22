import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye, Plus, Search, Filter, AlertCircle } from "lucide-react";
import bg from '../assets/bg/admin_banner.png';
import AdminAddRestaurantForm from './AdminAddRestaurantForm';
import ViewBookings from './ViewBookings';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem("admin"));
    const [activeTab, setActiveTab] = useState("dashboard");

    // Check if user is admin, redirect if not
    useEffect(() => {
        if (!admin || !localStorage.getItem("token")?.startsWith("admin-token-")) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="w-full relative flex flex-col h-[80px] sm:h-[140px] md:h-[180px]">
                <img
                    src={bg}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 md:opacity-90 z-0"
                />
                <div className="relative flex flex-col justify-center items-start flex-grow px-4 sm:px-8 md:px-20">
                    <h1 className="text-3xl font-bold drop-shadow-md mb-2">Admin Dashboard</h1>
                    <p className="text-lg text-gray-500 font-semibold drop-shadow-md">สวัสดี {admin?.name || admin?.email}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: "dashboard", label: "📊 แดชบอร์ด" },
                            { id: "users", label: "👥 จัดการผู้ใช้" },
                            { id: "bookings", label: "📅 ดูการจอง" },
                            { id: "add-restaurant", label: "➕ เพิ่มร้านอาหาร" },
                            { id: "restaurants", label: "🍽️ จัดการร้านอาหาร" },
                            { id: "reviews", label: "⭐ จัดการรีวิว" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-4 font-medium border-b-2 whitespace-nowrap transition ${activeTab === tab.id
                                    ? "border-orange-600 text-orange-600"
                                    : "border-transparent text-gray-600 hover:text-orange-600"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === "dashboard" && <DashboardOverview />}
                {activeTab === "users" && <ManageUsers />}
                {activeTab === "bookings" && <ViewBookings />}
                {activeTab === "add-restaurant" && <AddRestaurant />}
                {activeTab === "restaurants" && <ManageRestaurants />}
                {activeTab === "reviews" && <ManageReviews />}
            </div>
        </div>
    );
};

// ===== Dashboard Overview =====
const DashboardOverview = () => {
    const [stats, setStats] = useState({ users: 0, restaurants: 0, bookings: 0, reviews: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, restaurantsRes, bookingsRes, reviewsRes] = await Promise.all([
                    axios.get("http://localhost:3001/api/users"),
                    axios.get("http://localhost:3001/api/restaurants"),
                    axios.get("http://localhost:3001/api/bookings"),
                    axios.get("http://localhost:3001/api/reviews")
                ]);
                setStats({
                    users: usersRes.data?.length || 0,
                    restaurants: restaurantsRes.data?.length || 0,
                    bookings: bookingsRes.data?.length || 0,
                    reviews: reviewsRes.data?.length || 0
                });
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: "ผู้ใช้ทั้งหมด", value: stats.users, color: "bg-blue-100 text-blue-700" },
                { label: "ร้านอาหารทั้งหมด", value: stats.restaurants, color: "bg-green-100 text-green-700" },
                { label: "การจองทั้งหมด", value: stats.bookings, color: "bg-yellow-100 text-yellow-700" },
                { label: "รีวิวทั้งหมด", value: stats.reviews, color: "bg-purple-100 text-purple-700" }
            ].map((stat, idx) => (
                <div key={idx} className={`p-6 rounded-lg shadow ${stat.color}`}>
                    <p className="text-sm font-medium opacity-80">{stat.label}</p>
                    <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

// ===== Manage Users =====
const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/users");
            setUsers(res.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users:", err);
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("คุณต้องการลบผู้ใช้นี้หรือไม่?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            alert("ลบผู้ใช้สำเร็จ");
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการลบผู้ใช้");
        }
    };

    const filtered = users.filter(u =>
        (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center bg-white p-4 rounded-lg shadow">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="ค้นหาผู้ใช้..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {loading ? (
                <p className="text-center text-gray-500">กำลังโหลด...</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">ชื่อ</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">อีเมล</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">สร้างเมื่อ</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(user.createdAt).toLocaleDateString("th-TH")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="text-red-600 hover:text-red-800 transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className="p-6 text-center text-gray-500">ไม่พบผู้ใช้</p>}
                </div>
            )}
        </div>
    );
};

// ViewBookings moved to its own component `ViewBookings.js`

// ===== Add Restaurant =====
const AddRestaurant = () => {
    return <AdminAddRestaurantForm />;
};

// ===== Manage Restaurants =====
const ManageRestaurants = () => {
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem("admin"));
    const [restaurants, setRestaurants] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState(null);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/restaurants");
            setRestaurants(res.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching restaurants:", err);
            setLoading(false);
        }
    };

    const deleteRestaurant = async (id) => {
        if (!window.confirm("คุณต้องการลบร้านอาหารนี้หรือไม่?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/restaurants/${id}`);
            setRestaurants(restaurants.filter(r => r.id !== id));
            alert("ลบร้านอาหารสำเร็จ");
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการลบ");
        }
    };

    // ตรวจสอบว่า admin เป็นคนเพิ่มร้านนี้หรือไม่
    // เฉพาะแอดมินที่เพิ่มร้านเอง เท่านั้นที่สามารถแก้ไขได้
    const canEditRestaurant = (restaurant) => {
        // ร้านต้องมี createdByAdminId และต้องตรงกับ admin ปัจจุบัน
        return restaurant.createdByAdminId === String(admin?.id);
    };

    const startEdit = (restaurant) => {
        if (!canEditRestaurant(restaurant)) {
            setEditError("คุณไม่มีสิทธิ์แก้ไขร้านนี้ เนื่องจากร้านนี้ไม่ได้ถูกเพิ่มโดยคุณ");
            setTimeout(() => setEditError(""), 3000);
            return;
        }

        // 🔥 ลบ photos ออก ไม่ต้องให้ไปอยู่ใน editFormData
        const { photos, ...cleanRestaurant } = restaurant;

        setEditingId(restaurant.id);
        setEditFormData(cleanRestaurant);
        setEditError("");
        setEditSuccess("");
    };


    const cancelEdit = () => {
        setEditingId(null);
        setEditFormData(null);
        setEditError("");
        setEditSuccess("");
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const saveEdit = async () => {
        if (!editFormData) return;

        // 🔥 ลบ photos ออกจาก data ก่อนส่ง PUT
        const dataToSend = { ...editFormData };
        delete dataToSend.photos;
        try {
            await axios.put(
                `http://localhost:3001/api/restaurants/${editFormData.id}`,
                dataToSend
            );
            setRestaurants(restaurants.map(r => r.id === editFormData.id ? editFormData : r));
            setEditSuccess("แก้ไขข้อมูลสำเร็จ!");
            setTimeout(() => {
                setEditingId(null);
                setEditFormData(null);
                setEditSuccess("");
            }, 2000);
        } catch (err) {
            setEditError("เกิดข้อผิดพลาดในการแก้ไข: " + (err.response?.data?.message || err.message));
        }
    };

    const viewRestaurant = (restaurantId) => {
        navigate(`/RestaurantDetail/${restaurantId}`);
    };

    const filtered = restaurants.filter(r =>
        r.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center bg-white p-4 rounded-lg shadow">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="ค้นหาร้านอาหาร..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {editError && (
                <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
                    {editError}
                </div>
            )}

            {editSuccess && (
                <div className="p-4 bg-green-100 text-green-800 rounded-lg border border-green-300">
                    {editSuccess}
                </div>
            )}

            {loading ? (
                <p className="text-center text-gray-500">กำลังโหลด...</p>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            className="bg-[#FFF7ED] border border-orange-100 rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                        >
                            {editingId === restaurant.id ? (
                                // ===== ฟอร์มแก้ไข =====
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-orange-600">แก้ไขข้อมูลร้าน</h3>

                                    <input
                                        type="text"
                                        name="restaurantName"
                                        placeholder="ชื่อร้าน"
                                        value={editFormData?.restaurantName || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    />

                                    <input
                                        type="text"
                                        name="foodType"
                                        placeholder="ประเภทอาหาร"
                                        value={editFormData?.foodType || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    />

                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="เบอร์โทร"
                                        value={editFormData?.phone || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    />

                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="ที่อยู่"
                                        value={editFormData?.address || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    />

                                    <div className="flex gap-3">
                                        <input
                                            type="time"
                                            name="openTime"
                                            value={editFormData?.openTime || ""}
                                            onChange={handleEditChange}
                                            className="w-1/2 px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                        />
                                        <input
                                            type="time"
                                            name="closeTime"
                                            value={editFormData?.closeTime || ""}
                                            onChange={handleEditChange}
                                            className="w-1/2 px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                        />
                                    </div>

                                    <textarea
                                        name="description"
                                        placeholder="คำอธิบาย"
                                        value={editFormData?.description || ""}
                                        onChange={handleEditChange}
                                        rows="2"
                                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400"
                                    />

                                    {/* ปุ่ม */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={saveEdit}
                                            className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                                        >
                                            บันทึก
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // ===== UI แสดงผลปกติ =====
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {restaurant.restaurantName}
                                        </h3>

                                        <div className="text-xs px-2 py-1 bg-orange-200 text-orange-700 rounded-md">
                                            {restaurant.foodType || "ไม่ระบุ"}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mt-1">
                                        📧 {restaurant.email}
                                    </p>

                                    <p className="text-sm text-gray-600">📞 {restaurant.phone}</p>

                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {restaurant.address}
                                    </p>

                                    {/* Badge แทนจากรูปตัวอย่าง */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="text-xs bg-white border border-orange-200 px-2 py-1 rounded-full text-orange-700">
                                            เปิด {restaurant.openTime} - {restaurant.closeTime}
                                        </span>
                                    </div>

                                    {/* ปุ่ม */}
                                    <div className="flex gap-2 mt-5">
                                        <button
                                            onClick={() => viewRestaurant(restaurant.id)}
                                            className="flex-1 py-2 rounded-lg bg-orange-100 text-orange-700 font-medium hover:bg-orange-200 transition shadow-sm"
                                        >
                                            ดูข้อมูล
                                        </button>

                                        <button
                                            onClick={() => startEdit(restaurant)}
                                            className="flex-1 py-2 rounded-lg bg-orange-200 text-orange-800 font-medium hover:bg-orange-400 transition shadow-sm"
                                        >
                                            แก้ไข
                                        </button>

                                        <button
                                            onClick={() => deleteRestaurant(restaurant.id)}
                                            className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition shadow-sm"
                                        >
                                            ลบ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {filtered.length === 0 && <p className="text-center text-gray-500">ไม่พบร้านอาหาร</p>}
        </div>
    );
};

// ===== Manage Reviews =====
const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/reviews");
            let reviewsData = res.data || [];

            // If backend didn't include restaurant relation, fetch restaurants and map names
            const needsRestaurantFill = reviewsData.length > 0 && reviewsData.some(r => !r.restaurant);
            if (needsRestaurantFill) {
              try {
                const rres = await axios.get("http://localhost:3001/api/restaurants");
                const map = {};
                (rres.data || []).forEach(rest => { map[rest.id] = rest.restaurantName; });
                reviewsData = reviewsData.map(r => ({
                  ...r,
                  restaurant: r.restaurant || { restaurantName: map[r.restaurantId] || "ไม่ระบุชื่อร้าน" }
                }));
              } catch (e) {
                console.warn("Could not fetch restaurants to fill names", e);
              }
            }

            setReviews(reviewsData);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setLoading(false);
        }
    };

    const deleteReview = async (id) => {
        if (!window.confirm("คุณต้องการลบรีวิวนี้หรือไม่?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/reviews/${id}`);
            setReviews(reviews.filter(r => r.id !== id));
            alert("ลบรีวิวสำเร็จ");
        } catch (err) {
            alert("เกิดข้อผิดพลาดในการลบ");
        }
    };

    const filtered = reviews.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center bg-white p-4 rounded-lg shadow">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="ค้นหารีวิว..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>

            {loading ? (
                <p className="text-center text-gray-500">กำลังโหลด...</p>
            ) : (
                <div className="space-y-4">
                    {filtered.map(review => (
                        <div key={review.id} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold">{review.name}</p>
                                    <p className="text-sm text-gray-600">🏪 {review.restaurant?.restaurantName || "ไม่ระบุชื่อร้าน"}</p>
                                    <p className="text-sm text-gray-600">⭐ {review.rating}/5</p>
                                </div>
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="text-red-600 hover:text-red-800 transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString("th-TH")}</p>
                        </div>
                    ))}
                </div>
            )}
            {filtered.length === 0 && <p className="text-center text-gray-500">ไม่พบรีวิว</p>}
        </div>
    );
};

export default AdminDashboard;
