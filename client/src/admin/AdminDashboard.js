import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Eye, Plus, Search, Filter, AlertCircle } from "lucide-react";
import bg from '../assets/bg/admin_banner.png';

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

// ===== View Bookings =====
const ViewBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get("http://localhost:3001/api/bookings");
            setBookings(res.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setLoading(false);
        }
    };

    const filtered = bookings.filter(b => {
        const matchSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) ||
            b.customerEmail?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-4">
            <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
                <input
                    type="text"
                    placeholder="ค้นหาชื่อหรืออีเมล..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value="all">สถานะทั้งหมด</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="confirmed">ยืนยันแล้ว</option>
                    <option value="cancelled">ยกเลิก</option>
                </select>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">กำลังโหลด...</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">ชื่อลูกค้า</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">วันที่</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">จำนวนแขก</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">สถานะ</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">เบอร์โทร</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{booking.customerName}</td>
                                    <td className="px-6 py-4">{new Date(booking.date).toLocaleDateString("th-TH")}</td>
                                    <td className="px-6 py-4">{booking.guests} คน</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                                            booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                "bg-red-100 text-red-800"
                                            }`}>
                                            {booking.status === "confirmed" ? "ยืนยันแล้ว" :
                                                booking.status === "pending" ? "รอดำเนินการ" : "ยกเลิก"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{booking.customerPhone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className="p-6 text-center text-gray-500">ไม่พบการจอง</p>}
                </div>
            )}
        </div>
    );
};

// ===== Add Restaurant =====
const AddRestaurant = () => {
    const [formData, setFormData] = useState({
        restaurantName: "",
        foodType: "",
        email: "",
        password: "",
        address: "",
        phone: "",
        latitude: "",
        longitude: "",
        priceRange: "",
        startingPrice: "",
        description: "",
        openTime: "",
        closeTime: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await axios.post("http://localhost:3001/api/restaurants/register", formData);
            setMessage("เพิ่มร้านอาหารสำเร็จ!");
            setFormData({
                restaurantName: "",
                foodType: "",
                email: "",
                password: "",
                address: "",
                phone: "",
                latitude: "",
                longitude: "",
                priceRange: "",
                startingPrice: "",
                description: "",
                openTime: "",
                closeTime: ""
            });
        } catch (err) {
            setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl">
            {message && <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">{message}</div>}
            {error && <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
                <input name="restaurantName" placeholder="ชื่อร้านอาหาร" value={formData.restaurantName} onChange={handleChange} required className="col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="foodType" placeholder="ประเภทอาหาร" value={formData.foodType} onChange={handleChange} required className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="email" type="email" placeholder="อีเมล" value={formData.email} onChange={handleChange} required className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="password" type="password" placeholder="รหัสผ่าน" value={formData.password} onChange={handleChange} required className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="phone" placeholder="เบอร์โทร" value={formData.phone} onChange={handleChange} required className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="address" placeholder="ที่อยู่" value={formData.address} onChange={handleChange} required className="col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="latitude" type="number" placeholder="ละติจูด" value={formData.latitude} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" step="0.00001" />
                <input name="longitude" type="number" placeholder="ลองจิจูด" value={formData.longitude} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" step="0.00001" />
                <input name="openTime" type="time" placeholder="เวลาเปิด" value={formData.openTime} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="closeTime" type="time" placeholder="เวลาปิด" value={formData.closeTime} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="priceRange" placeholder="ช่วงราคา (เช่น 100-500)" value={formData.priceRange} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <input name="startingPrice" type="number" placeholder="ราคาเริ่มต้น" value={formData.startingPrice} onChange={handleChange} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <textarea name="description" placeholder="คำอธิบาย" value={formData.description} onChange={handleChange} className="col-span-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" rows="3" />
            </div>

            <button type="submit" disabled={loading} className="mt-6 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50">
                {loading ? "กำลังเพิ่ม..." : "เพิ่มร้านอาหาร"}
            </button>
        </form>
    );
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
    // สมมุติเก็บ adminId ใน createdByAdminId หรือ adminEmail
    const canEditRestaurant = (restaurant) => {
        // สำหรับตอนนี้: admin ที่มี email ตรงกับ email ของร้านสามารถแก้ไขได้
        // หรือถ้าร้านมีฟิลด์ createdByAdminId ให้ใช้นั้น
        return restaurant.createdByAdminId === admin?.id || restaurant.adminEmail === admin?.email;
    };

    const startEdit = (restaurant) => {
        if (!canEditRestaurant(restaurant)) {
            setEditError("คุณไม่มีสิทธิ์แก้ไขร้านนี้ เนื่องจากร้านนี้ไม่ได้ถูกเพิ่มโดยคุณ");
            setTimeout(() => setEditError(""), 3000);
            return;
        }
        setEditingId(restaurant.id);
        setEditFormData({ ...restaurant });
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
        try {
            await axios.put(`http://localhost:3001/api/restaurants/${editFormData.id}`, editFormData);
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
                    {filtered.map(restaurant => (
                        <div key={restaurant.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                            {editingId === restaurant.id ? (
                                // ฟอร์มแก้ไข
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">แก้ไขข้อมูลร้าน</h3>
                                    <input
                                        type="text"
                                        name="restaurantName"
                                        placeholder="ชื่อร้าน"
                                        value={editFormData?.restaurantName || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        name="foodType"
                                        placeholder="ประเภทอาหาร"
                                        value={editFormData?.foodType || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="เบอร์โทร"
                                        value={editFormData?.phone || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="ที่อยู่"
                                        value={editFormData?.address || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                    <input
                                        type="time"
                                        name="openTime"
                                        value={editFormData?.openTime || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                    <input
                                        type="time"
                                        name="closeTime"
                                        value={editFormData?.closeTime || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="คำอธิบาย"
                                        value={editFormData?.description || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-1 border rounded text-sm"
                                        rows="2"
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={saveEdit}
                                            className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                        >
                                            บันทึก
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="flex-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                                        >
                                            ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // การแสดงปกติ
                                <>
                                    <h3 className="font-semibold text-lg mb-2">{restaurant.restaurantName}</h3>
                                    <p className="text-sm text-gray-600 mb-1">อีเมล: {restaurant.email}</p>
                                    <p className="text-sm text-gray-600 mb-1">ประเภท: {restaurant.foodType}</p>
                                    <p className="text-sm text-gray-600 mb-4">โทร: {restaurant.phone}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => viewRestaurant(restaurant.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                                        >
                                            <Eye className="w-4 h-4" /> ดู
                                        </button>
                                        <button
                                            onClick={() => startEdit(restaurant)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition text-sm"
                                        >
                                            <Edit2 className="w-4 h-4" /> แก้ไข
                                        </button>
                                        <button
                                            onClick={() => deleteRestaurant(restaurant.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" /> ลบ
                                        </button>
                                    </div>
                                </>
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
            setReviews(res.data || []);
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
