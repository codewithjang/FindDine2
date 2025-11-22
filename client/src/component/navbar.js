import React, { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Search, CircleUserRound, Menu, X } from 'lucide-react';
import { MapPin } from 'lucide-react';
import logo from '../assets/logo/whiteLogo.png';

export default function Navbar() {

  // =====================
  // STATE
  // =====================
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // =====================
  // ROLE DETECTION
  // =====================
  const adminData = localStorage.getItem("admin");
  const userData = localStorage.getItem("user");
  const restaurantData = localStorage.getItem("restaurant");

  const isAdmin = Boolean(adminData);               // admin detected instantly
  const isUserLoggedIn = Boolean(userData);
  const isRestaurantLoggedIn = Boolean(restaurantData);

  const isLoggedIn = isAdmin || isUserLoggedIn || isRestaurantLoggedIn;

  // =====================
  // LOAD USER PROFILE (ONLY FOR NORMAL USER)
  // =====================
  useEffect(() => {
    if (showUserMenu && isUserLoggedIn) {
      setProfileLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      try {
        const userObj = JSON.parse(userStr);
        const userId = userObj.id;

        fetch(`http://localhost:3001/api/users/${userId}`)
          .then(res => res.json())
          .then(data => {
            setUserProfile(data);
            setProfileLoading(false);
          })
          .catch(() => {
            setProfileError("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
            setProfileLoading(false);
          });

      } catch {
        setProfileError("โหลดข้อมูลผู้ใช้ผิดพลาด");
        setProfileLoading(false);
      }
    }
  }, [showUserMenu, isUserLoggedIn]);

  // =====================
  // LOGOUT
  // =====================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("restaurant");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");

    window.location.href = "/";
  };

  // =====================
  // SEARCH SYSTEM
  // =====================
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = await fetch(`http://localhost:3001/api/restaurants?search=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();

    localStorage.setItem("searchResults", JSON.stringify(data));
    localStorage.setItem("searchQuery", searchQuery);

    window.location.href = `/main_page?search=${encodeURIComponent(searchQuery)}`;
  };

  const debounceRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`http://localhost:3001/api/restaurants?search=${encodeURIComponent(value)}`);
      const data = await res.json();

      // ✅ จัดเรียงผลการค้นหาตามความเกี่ยวข้อง
      const query = value.trim().toLowerCase();
      const scored = data.map((restaurant) => {
        const name = (restaurant.restaurantName || '').toLowerCase();
        const type = (restaurant.foodType || '').toLowerCase();
        const desc = (restaurant.description || '').toLowerCase();
        
        let score = 0;
        
        // ✅ Exact match ชื่อร้าน -> ชั้นสูงสุด (100)
        if (name === query) score = 100;
        // ✅ Starts with query ชื่อร้าน -> ชั้น 2 (80)
        else if (name.startsWith(query)) score = 80;
        // ✅ Contains query ชื่อร้าน -> ชั้น 3 (60)
        else if (name.includes(query)) score = 60;
        // ✅ Exact match ประเภท -> ชั้น 4 (50)
        else if (type === query) score = 50;
        // ✅ Starts with query ประเภท -> ชั้น 5 (40)
        else if (type.startsWith(query)) score = 40;
        // ✅ Contains query ประเภท -> ชั้น 6 (30)
        else if (type.includes(query)) score = 30;
        // ✅ Contains query คำอธิบาย -> ชั้น 7 (10)
        else if (desc.includes(query)) score = 10;
        
        return { ...restaurant, score };
      });

      // เรียงลำดับจากคะแนนสูงสุด แล้วเอา 8 อันแรก
      const sorted = scored
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(({ score, ...rest }) => rest); // ลบ score field ออก

      setSuggestions(sorted);
      setShowSuggestions(true);
    }, 300);
  };

  const handleSuggestionClick = (item) => {
    localStorage.setItem("searchResults", JSON.stringify([item]));
    window.location.href = `/main_page?restaurantId=${item.id}`;
  };

  // =====================
  // RENDER NAVBAR
  // =====================
  return (
    <nav className="sticky top-0 bg-orange-600 shadow-xl z-50">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-14">

          {/* LOGO */}
          <div className="flex items-center space-x-6">
            <a
              href={isAdmin ? "/admin/dashboard" : "/main_page"}
              className="flex items-center"
              onClick={e => {
                e.preventDefault();
                if (isAdmin) window.location.href = "/admin/dashboard";
                else window.location.href = "/main_page";
              }}
            >
              <img src={logo} alt="FindDine Logo" className="h-8 w-auto" />
            </a>

            {/* MAP LINK */}
            <Link
              to="/AllRestaurantsMap"
              className="hidden md:flex flex items-center space-x-1 text-white hover:text-orange-200 font-medium transition-colors"
            >
              <MapPin className="h-5 w-5" />
              <span>แผนที่</span>
            </Link>
          </div>

          {/* ===================== */}
          {/* RIGHT SIDE */}
          {/* ===================== */}
          <div className="flex items-center space-x-2">

            {/* แถบค้นหา - ซ่อนสำหรับแอดมิน */}
            {!isAdmin && (
              <div className="hidden md:flex items-center relative">
                <input
                  type="text"
                  placeholder="ค้นหาร้านอาหาร..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

                {showSuggestions && (
                  <ul className="absolute top-full left-0 mt-2 w-64 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto overflow-x-hidden z-50">
                    {suggestions.map((item) => (
                      <li
                        key={item.id}
                        className="px-4 py-2 hover:bg-orange-100 cursor-pointer truncate"
                        onMouseDown={() => handleSuggestionClick(item)}
                      >
                        {item.restaurantName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* USER ICON / MENU */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-white hover:text-orange-200"
              >
                <CircleUserRound className="h-8 w-8" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border rounded-md shadow-lg py-2 z-50">

                  {/* ADMIN MENU */}
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        แดชบอร์ดแอดมิน
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        ออกจากระบบ
                      </button>
                    </>

                  ) : isUserLoggedIn ? (

                    <>
                      <Link
                        to="/UserProfile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        โปรไฟล์
                      </Link>

                      <Link
                        to="/EditProfile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        แก้ไขโปรไฟล์
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        ออกจากระบบ
                      </button>
                    </>

                  ) : isRestaurantLoggedIn ? (

                    <>
                      <Link
                        to={`/RestaurantForMainPage/${JSON.parse(restaurantData).id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        จัดการร้านอาหาร
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        ออกจากระบบ
                      </button>
                    </>

                  ) : (

                    <>
                      <Link
                        to="/UserRegist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        ลงทะเบียนผู้ใช้
                      </Link>

                      <Link
                        to="/UserLogin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        เข้าสู่ระบบผู้ใช้
                      </Link>

                      <hr className="my-1" />

                      <Link
                        to="/RestaurantRegist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        ลงทะเบียนร้านอาหาร
                      </Link>

                      <Link
                        to="/RestaurantLogin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                      >
                        เข้าสู่ระบบร้านอาหาร
                      </Link>
                    </>
                  )}

                </div>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {showMobileMenu && (
          <div className="md:hidden mt-2 bg-gray-50 p-3 rounded-lg">
            <Link to="/AllRestaurantsMap" className="block px-3 py-2 text-gray-700">แผนที่</Link>
          </div>
        )}

      </div>

      {(showUserMenu || showMobileMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => {
          setShowUserMenu(false);
          setShowMobileMenu(false);
        }} />
      )}
    </nav>
  );
}
