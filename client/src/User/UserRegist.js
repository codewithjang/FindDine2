import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import bgFood from '../assets/bg/bgFood.png';
import axios from 'axios';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [redirect, setRedirect] = useState(false);
    const navigate = require('react-router-dom').useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[Register] Submit clicked', formData);

        if (formData.password !== formData.confirm_password) {
            setError('รหัสผ่านไม่ตรงกัน');
            console.log('[Register] Passwords do not match');
            return;
        }

        try {
            console.log('[Register] Sending request to backend...');
            const res = await axios.post('http://localhost:3001/api/users/register', {
                firstName: formData.name,
                lastName: formData.lastname,
                email: formData.email,
                password: formData.password
            });
            console.log('[Register] Backend response:', res.data);
            if (res.data.success) {
                setMessage('สมัครสมาชิกสำเร็จ!');
                console.log('[Register] Success, redirecting to /UserLogin');
                setTimeout(() => {
                    navigate('/UserLogin');
                }, 1200);
            } else {
                if (res.data.message === 'อีเมลนี้ถูกใช้แล้ว') {
                    setError('อีเมลนี้ถูกใช้แล้ว');
                } else {
                    setError(res.data.message || 'เกิดข้อผิดพลาด');
                }
                console.log('[Register] Error from backend:', res.data.message);
            }
        } catch (err) {
            console.log('[Register] Exception:', err);

            const status = err.response?.status;   // <-- ดูจาก HTTP status code
            const msg = err.response?.data?.message;

            if (status === 400) {
                // กรณี email ซ้ำ
                setError('อีเมลนี้ถูกใช้แล้ว');
            } else if (status === 500) {
                // server error
                setError('เกิดข้อผิดพลาดที่ฝั่งเซิร์ฟเวอร์');
            } else {
                // fallback ใช้ข้อความจาก backend ถ้ามี
                setError(msg || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
            }
        }
    };

    const handleGoogleLogin = () => {
        console.log('เข้าสู่ระบบด้วย Google');
        // จำลองการเข้าสู่ระบบด้วย Google
        setMessage('กำลังเข้าสู่ระบบด้วย Google...');
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden">
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
                <p className="text-lg font-regular text-center mb-4">สร้างบัญชีผู้ใช้</p>
                <div className="flex justify-center mb-4">
                    <div className="lg:w-18 lg:h-18 w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-orange-500 text-2xl" />
                    </div>
                </div>

                {/* แสดงข้อความแจ้งเตือน */}
                {error && (
                    <div className="text-center text-sm text-red-500 mb-2">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="text-center text-sm text-green-500 mb-2">
                        {message}
                    </div>
                )}

                {/* ฟอร์ม */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="ชื่อ"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                        <input
                            type="text"
                            name="lastname"
                            placeholder="นามสกุล"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="ที่อยู่อีเมล"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
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
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="confirm_password"
                            placeholder="ยืนยันรหัสผ่าน"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        ดำเนินการต่อ
                    </button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>มีบัญชีแล้ว? <a href="/" className="text-orange-600 hover:underline">เข้าสู่ระบบ</a></p>
                </div>

                {/* ปุ่ม Google Login */}
                {/* <button
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
                    <span>สมัครสมาชิกด้วย Google</span>
                </button> */}
            </div>
        </div>
    );
};

export default RegisterForm;