import React, { useState } from 'react';
import { Link } from "react-router-dom";
import bgFood from './assets/bg/bgFood.png';
import { FaUser } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // handle change input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // clear state ก่อนทุกครั้ง
    setError('');
    setMessage('');

    if (!formData.email || !formData.password) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    try {
      console.log('[Login] Sending request with:', formData);

      const res = await axios.post('http://localhost:3001/api/users/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('[Login] Backend response:', res);
      console.log('[Login] res.data:', res.data);
      console.log('[Login] res.data.user:', res.data.user);

      if (res.status === 200 && res.data) {
        setMessage('เข้าสู่ระบบสำเร็จ!');
        // เก็บ token / user ใน localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        console.log('[UserLogin] localStorage user set:', localStorage.getItem('user'));

        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          navigate('/main_page');
        }, 1200);
      } else {
        setError(res.data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      console.error('[Login] Exception:', err);
      console.error('[Login] Error response:', err.response);

      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };


  const handleGoogleLogin = () => {
    console.log('เข้าสู่ระบบด้วย Google');
    setMessage('กำลังเข้าสู่ระบบด้วย Google...');
  };

  const handleForgotPassword = () => {
    console.log('ลืมรหัสผ่าน');
    setMessage('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden">
      <img
        src={bgFood}
        alt="Background"
        className="absolute inset-0 opacity-80 z-0"
      />
      <div className="relative w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        {/* Close button */}
        <Link
          to="/main_page"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </Link>

        <p className="text-lg font-regular text-center mb-4">ยินดีต้อนรับกลับมา</p>
        <div className="flex justify-center mb-4">
          <div className="lg:w-18 lg:h-18 w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
            <FaUser className="text-orange-500 text-2xl" />
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
            <p className="text-md font-semibold text-orange-500">กำลังโหลดร้านอาหาร...</p>
          </div>
        )}

          {/* ฟอร์มเข้าสู่ระบบ */ }
          < div className="space-y-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="ที่อยู่อีเมล"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="รหัสผ่าน"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="mt-4 text-right text-sm text-gray-500">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-orange-600 hover:underline"
          >
            ลืมรหัสผ่าน?
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          ดำเนินการต่อ
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>ยังไม่มีบัญชี? <a href="" className="text-orange-600 hover:underline">สมัครสมาชิก</a></p>
      </div>

      {/* ปุ่ม Google Login */}
      <button
        onClick={handleGoogleLogin}
        className="w-full mt-5 border-2 border-gray-400 rounded-3xl px-4 py-3 shadow-lg hover:bg-gray-100 active:bg-gray-300 transition-all flex items-center justify-center gap-2 text-sm"
      >
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          version="1.1"
          x="0px"
          y="0px"
          className="w-5 h-5"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
        c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
        c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
        C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
        c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
        c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        </svg>
        <span>เข้าสู่ระบบด้วย Google</span>
      </button>
    </div>
      
    </div >
  );
};

export default LoginForm;