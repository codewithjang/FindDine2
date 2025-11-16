import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import bgFood from '../assets/bg/bgFood.png';
import { FaShieldAlt } from "react-icons/fa";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/api/admin/login", {
        email,
        password
      });

      if (res.data.success) {
        setMessage('เข้าสู่ระบบสำเร็จ!');
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigate("/admin/dashboard");
        }, 1200);
      } else {
        setError(res.data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden px-4">
      <img
        src={bgFood}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-70 z-0"
      />
      <div className="relative w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        {/* Close button */}
        <Link
          to="/main_page"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </Link>

        <p className="text-lg font-regular text-center mb-4">เข้าสู่ระบบผู้ดูแลระบบ</p>
        <div className="flex justify-center mb-4">
          <div className="lg:w-18 lg:h-18 w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
            <FaShieldAlt className="text-orange-500 text-2xl" />
          </div>
        </div>

        {/* แสดงข้อความแจ้งเตือน */}
        {error && (
          <div className="text-center text-sm text-red-500 mb-4 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="text-center text-sm text-green-500 mb-4 bg-green-50 p-3 rounded">
            {message}
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent border-solid rounded-full animate-spin"></div>
            <p className="text-md font-semibold text-orange-500">กำลังโหลด...</p>
          </div>
        )}

        {/* ฟอร์มเข้าสู่ระบบ */}
        <div className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="ที่อยู่อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            เข้าสู่ระบบ
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>กลับไปยัง <Link to="/main_page" className="text-orange-600 hover:underline">หน้าแรก</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
