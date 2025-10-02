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
                    <div className="mt-4 text-right text-sm text-gray-500">
                        <p>
                            <a
                                href="/"
                                className="text-orange-600 hover:underline"
                                onClick={handleForgotPassword}
                            >
                                ลืมรหัสผ่าน?
                            </a>
                        </p>
                    </div>

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
                            href="/"
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

                {/* Google login button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full mt-5 border-2 border-gray-400 rounded-3xl px-4 py-2.5 shadow-md transition-all hover:bg-gray-100 active:bg-gray-300 hover:scale-95 cursor-pointer flex justify-center items-center gap-2"
                >
                    <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        version="1.1"
                        x="0px"
                        y="0px"
                        className="text-lg -mb-0.5"
                        viewBox="0 0 48 48"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
              c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
              c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                        <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
              C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        />
                        <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
              c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        />
                        <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
              c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                    </svg>
                    <span>เข้าสู่ระบบด้วย Google</span>
                </button>
            </div>
        </div>
    );
};

export default RestaurantLogin;