import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import bgRes2 from '../assets/bg/bgRes2.png';

const RestaurantLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        axios.post('http://localhost:3001/api/restaurants/login', { email, password })
            .then(res => {
                if (res.data.success) {
                    localStorage.setItem('restaurant', JSON.stringify(res.data.restaurant));
                    if (res.data.token) {
                        localStorage.setItem('token', res.data.token);
                    }
                    navigate(`/RestaurantForMainPage/${res.data.restaurant.id}`);
                } else {
                    setError(res.data.message || 'Login failed');
                }
            })
            .catch(err => {
                setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
            });
    };

    const handleGoogleLogin = () => {
        // Add Google OAuth logic here
        console.log('Google login clicked');
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        // Add forgot password logic here
        console.log('Forgot password clicked');
    };

    return (
            <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-black to-gray-800 overflow-hidden">
                <img
                    src={bgRes2}
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

                {/* Welcome text */}
                <p className="text-lg font-regular text-center mb-4">ยินดีต้อนรับกลับมา</p>
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Store className="w-10 h-10 text-orange-500" />
                    </div>
                </div>

                {/* Login form */}
                                <div className="space-y-4">
                                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    <div>
                        <input
                            type="email"
                            placeholder="ที่อยู่อีเมล"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="รหัสผ่าน"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Forgot password */}
                    {/* <div className="mt-4 text-right text-sm text-gray-500">
                        <p>
                            <a
                                href="/"
                                className="text-orange-600 hover:underline"
                                onClick={handleForgotPassword}
                            >
                                ลืมรหัสผ่าน?
                            </a>
                        </p>
                    </div> */}

                    {/* Continue button */}
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                    >
                        เข้าสู่ระบบ
                    </button>
                </div>

                {/* Sign up link */}
                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>
                        ยังไม่มีบัญชี?
                        <a
                            href="/RestaurantRegist"
                            className="text-orange-600 hover:underline ml-1"
                            onClick={() => {
                                // Add navigation logic to registration page
                                console.log('Navigate to registration page');
                            }}
                        >
                            สมัครสมาชิก
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RestaurantLogin;