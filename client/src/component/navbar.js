import React, { useState, useRef, useEffect } from 'react';
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
    e && e.preventDefault && e.preventDefault();
    if (!searchQuery || !searchQuery.trim()) return;
    await performSearch(searchQuery.trim());
  };

  // Performs the search for a given query string, stores results and redirects
  const performSearch = async (query) => {
    if (!query || !query.trim()) return;
    try {
      const res = await fetch(`http://localhost:3001/api/restaurants?search=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      // store results so MainPage can read them immediately
      localStorage.setItem('searchResults', JSON.stringify(data));
      localStorage.setItem('searchQuery', query);

      // redirect to main page with the query (MainPage will consume stored results)
      window.location.href = `/main_page?search=${encodeURIComponent(query)}`;
    } catch (err) {
      console.error('Search error:', err);
      alert('เกิดข้อผิดพลาดในการค้นหา');
    }
  };

  // Autocomplete: fetch suggestions as user types
  const debounceRef = useRef(null);

  // highlight matched substring in suggestion (case-insensitive)
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return (
      <>
        {before}
        <span className="bg-yellow-100 text-yellow-800 px-0.5 rounded">{match}</span>
        {after}
      </>
    );
  };

  // Move exact name matches (case-insensitive) to the front of the suggestion list
  // จัดลำดับผลลัพธ์ โดยให้ชื่อที่ใกล้เคียงกับคำค้นมากที่สุดอยู่บนสุด
  const prioritizeExactMatch = (items, query) => {
    if (!query) return items;

    const q = query.toLowerCase().trim();

    const getScore = (it) => {
      const name = (it.restaurantName || it.name || '').toString().toLowerCase().trim();
      if (!name) return 0;

      // 3 = ตรงทั้งประโยคเป๊ะ ๆ
      if (name === q) return 3;

      // 2 = ขึ้นต้นเหมือนกัน หรือ user พิมพ์เป็น prefix ของชื่อร้าน
      if (name.startsWith(q) || q.startsWith(name)) return 2;

      // 1 = มีคำค้นอยู่ในชื่อร้าน (contains)
      if (name.includes(q)) return 1;

      // 0 = ไม่ค่อยใกล้
      return 0;
    };

    // sort จาก score มาก → น้อย
    return [...items].sort((a, b) => {
      const scoreB = getScore(b);
      const scoreA = getScore(a);

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // ถ้า score เท่ากัน ให้ชื่อสั้นกว่าขึ้นก่อน (มักจะใกล้กับสิ่งที่พิมพ์มากกว่า)
      const nameA = (a.restaurantName || a.name || '').toString().length;
      const nameB = (b.restaurantName || b.name || '').toString().length;
      return nameA - nameB;
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/restaurants?search=${encodeURIComponent(value)}`);
        if (!res.ok) throw new Error('Suggest failed');
        const data = await res.json();
        const prioritized = prioritizeExactMatch(data, value);
        setSuggestions(prioritized.slice(0, 7));
        setShowSuggestions(data.length > 0);
      } catch (err) {
        console.error('Autocomplete error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSuggestionClick = (item) => {
    const restaurantId = item.id;

    // เก็บผลลัพธ์ร้านเดียวใน localStorage
    localStorage.setItem(
      'searchResults',
      JSON.stringify([item])
    );

    window.location.href = `/main_page?restaurantId=${restaurantId}`;
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
                    {suggestions.map((item, idx) => {
                      const restaurantName = item.restaurantName || item.name || '';
                      const isExact = restaurantName.toLowerCase().trim() === searchQuery.toLowerCase().trim();

                      return (
                        <li
                          key={item.id || idx}
                          className={`px-4 py-2 cursor-pointer 
                          hover:bg-orange-100 text-gray-800 
                          ${isExact ? 'bg-orange-50 font-semibold' : ''}`}
                          onMouseDown={() => handleSuggestionClick(item)}
                        >
                          {highlightMatch(restaurantName, searchQuery)}
                        </li>
                      );
                    })}
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
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    autoComplete="off"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  {/* Mobile Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                      {suggestions.map((item, idx) => {
                        const restaurantName = item.restaurantName || item.name || '';
                        const isExact = restaurantName.toLowerCase().trim() === searchQuery.toLowerCase().trim();

                        return (
                          <li
                            key={item.id || idx}
                            className={`px-4 py-2 cursor-pointer 
                            hover:bg-orange-100 text-gray-800 
                            ${isExact ? 'bg-orange-50 font-semibold' : ''}`}
                            onMouseDown={() => handleSuggestionClick(item)}
                          >
                            {highlightMatch(restaurantName, searchQuery)}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* <a href="/reviews" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500">
                รีวิว
              </a> */}
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