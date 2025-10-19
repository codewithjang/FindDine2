import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Search, CircleUserRound, Menu, X } from 'lucide-react';
import { Star, MapPin } from 'lucide-react';
import logo from '../assets/logo/whiteLogo.png';

export default function Navbar() {
  // All useState at the top
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  // Fetch user profile when showUserMenu opens and user is logged in
  React.useEffect(() => {
    if (showUserMenu && isLoggedIn) {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          const userId = userObj.id;
          fetch(`http://localhost:3001/api/users/${userId}`)
            .then(res => {
              if (!res.ok) throw new Error('Failed to fetch user profile');
              return res.json();
            })
            .then(data => {
              setUserProfile(data);
              setProfileLoading(false);
            })
            .catch(err => {
              setProfileError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
              setProfileLoading(false);
            });
        }
      } catch {
        setProfileError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        setProfileLoading(false);
      }
    }
  }, [showUserMenu, isLoggedIn]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const res = await fetch(`http://localhost:3001/api/restaurants?search=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        localStorage.setItem('searchResults', JSON.stringify(data));
        window.location.href = `/main_page?search=${encodeURIComponent(searchQuery)}`;
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการค้นหา');
      }
    }
  };

  // Autocomplete: fetch suggestions as user types
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/restaurants?search=${encodeURIComponent(value)}`);
      if (!res.ok) throw new Error('Suggest failed');
      const data = await res.json();
      // Show only top 5 suggestions by name
      setSuggestions(data.slice(0, 5));
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <nav className="sticky top-0 bg-orange-600 shadow-xl z-50">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-14">
          {/* Left Side - Logo + Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <a
              href="/main_page"
              className="flex items-center"
              onClick={e => {
                e.preventDefault();
                window.location.href = '/main_page';
              }}
            >
              <img
                src={logo}
                alt="FindDine Logo"
                className="h-8 w-auto"
              />
            </a>
            {/* รีวิว */}
            <Link
              to="/reviews"
              className="hidden md:flex flex items-center space-x-1 text-white hover:text-orange-200 font-medium transition-colors"
            >
              <Star className="h-5 w-5" />
              <span>รีวิว</span>
            </Link>

            {/* แผนที่ */}
            <Link
              to="/AllRestaurantsMap"
              className="hidden md:flex flex items-center space-x-1 text-white hover:text-orange-200 font-medium transition-colors"
            >
              <MapPin className="h-5 w-5" />
              <span>แผนที่</span>
            </Link>
          </div>
          {/* Right Side - Search and Profile */}
          <div className="flex items-center space-x-2">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาร้านอาหาร..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoComplete="off"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                    {suggestions.map((item, idx) => (
                      <li
                        key={item.id || idx}
                        className="px-4 py-2 cursor-pointer hover:bg-orange-100 text-gray-800"
                        onMouseDown={() => handleSuggestionClick(item.restaurantName || item.name || '')}
                      >
                        {item.restaurantName || item.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 text-white hover:text-orange-500 transition-colors"
              >
                <CircleUserRound className="h-8 w-8 text-white hover:text-orange-200" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-2 z-50 border">
                  {isLoggedIn ? (
                    <>
                      <Link
                        to="/UserProfile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 border-b mb-1"
                        onClick={() => setShowUserMenu(false)}
                      >
                        โปรไฟล์
                      </Link>
                      <Link
                        to="/EditProfile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        แก้ไขโปรไฟล์
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                      >ออกจากระบบ</button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/UserRegist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ลงทะเบียนผู้ใช้
                      </Link>
                      <Link
                        to="/UserLogin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        เข้าสู่ระบบผู้ใช้
                      </Link>
                      <hr className="my-1" />
                      <Link
                        to="/RestaurantRegist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ลงทะเบียนร้านอาหาร
                      </Link>
                      <Link
                        to="/RestaurantLogin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                        onClick={() => setShowUserMenu(false)}
                      >เข้าสู่ระบบร้านอาหาร</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white hover:text-orange-500"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {/* Mobile Search */}
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาร้านอาหาร..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <a href="/reviews" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500">
                รีวิว
              </a>
              <a href="/AllRestaurantsMap" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500">
                แผนที่
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for closing menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </nav>
  );
}