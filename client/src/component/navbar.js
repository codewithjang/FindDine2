import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Search, CircleUserRound, Menu, X } from 'lucide-react';
import { Star, MapPin } from 'lucide-react';
import logo from '../assets/logo/whiteLogo.png';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <nav className="sticky top-0 bg-orange-600 shadow-xl z-50">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-14">
          {/* Left Side - Logo + Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link to="/main_page" className="flex items-center">
              <img
                src={logo}
                alt="FindDine Logo"
                className="h-8 w-auto"
              />
            </Link>
            {/* รีวิว */}
            <a
              href="/reviews"
              className="flex items-center text-white hover:text-orange-200 font-medium transition-colors"
            >
              <Star className="h-5 w-5 mr-1" />
              <span>รีวิว</span>
            </a>
            {/* แผนที่ */}
            <Link
              to="/AllRestaurantsMap"
              className="flex items-center text-white hover:text-orange-200 font-medium transition-colors"
            >
              <MapPin className="h-5 w-5 mr-1" />
              <span>แผนที่</span>
            </Link>
          </div>
          {/* Right Side - Search and Profile */}
          <div className="flex items-center space-x-2">
            {/* Search Bar */}
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาร้านอาหาร..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors"
              >
                <CircleUserRound className="h-8 w-8 text-white hover:text-orange-200" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border">
                  {isLoggedIn ? (
                    <>
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
              className="md:hidden text-gray-700 hover:text-orange-500"
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
              <a href="/map" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500">
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