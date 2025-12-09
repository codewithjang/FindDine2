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

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!passwordRegex.test(formData.password)) {
            setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และต้องประกอบด้วยตัวอักษรและตัวเลข");
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        try {
            const res = await axios.post('http://localhost:3001/api/users/register', {
                firstName: formData.name,
                lastName: formData.lastname,
                email: formData.email,
                password: formData.password
            });

            if (res.data.success) {
                setMessage('สมัครสมาชิกสำเร็จ!');
                setTimeout(() => navigate('/UserLogin'), 1200);
            } else {
                setError(res.data.message || 'เกิดข้อผิดพลาด');
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 400) setError('อีเมลนี้ถูกใช้แล้ว');
            else setError('เกิดข้อผิดพลาดในการสมัครสมาชิก');
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
            </div>
        </div>
    );
};

export default RegisterForm;