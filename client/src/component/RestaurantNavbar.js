import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { FaBell, FaUserCircle, FaSignOutAlt, FaEdit } from "react-icons/fa";
import logo from '../assets/logo/whiteLogo.png';

function RestaurantNavbar() {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Get restaurant id from localStorage
  let restaurantId = '';
  try {
    const restaurantData = localStorage.getItem('restaurant');
    if (restaurantData) {
      const parsed = JSON.parse(restaurantData);
      restaurantId = parsed.id || '';
    }
  } catch (e) {
    restaurantId = '';
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-orange-600 text-white flex justify-between items-center px-8 py-3 shadow-md relative">
      {/* Logo */}
      <Link to={`/RestaurantForMainPage/${restaurantId}`} className="flex items-center">
        <img src={logo} alt="FindDine Logo" className="h-8 w-auto" />
      </Link>

      {/* Right side: Notification + Profile */}
      <div className="flex items-center space-x-6 relative">
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center hover:text-gray-200 focus:outline-none"
          >
            <FaUserCircle size={24} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50">
              <Link
                to={`/RestaurantForEdit/${restaurantId}`}
                className="flex items-center px-4 py-2 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                <FaEdit className="mr-2" /> แก้ไขโปรไฟล์
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
              >
                <FaSignOutAlt className="mr-2" /> ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default RestaurantNavbar;
